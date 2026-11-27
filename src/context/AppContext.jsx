import { createContext, useContext, useEffect, useState } from 'react';
import {
  OAuthProvider,
  SAMLAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile
} from 'firebase/auth';
import {
  getUserProfile,
  loadCatalog,
  recordSearch,
  saveUserProfile,
  searchDocuments
} from '../firebaseData.js';
import { auth, firebaseReady, firebaseSsoReady, ssoProtocol, ssoProviderId } from '../firebase.js';
import { friendlyError } from '../lib/firebaseErrors.js';
import {
  validateCredentials,
  validateEmail,
  validateSearchTerm,
  validateSignupInput
} from '../lib/validation.js';

const AppContext = createContext(null);
const EMPTY_CATALOG = { areas: [], termosPopulares: [], recursos: [], eventos: [] };

export function AppProvider({ children }) {
  const [booting, setBooting] = useState(true);
  const [screen, setScreen] = useState('login');
  const [authTab, setAuthTab] = useState('login');
  const [user, setUser] = useState(null);
  const [catalog, setCatalog] = useState(EMPTY_CATALOG);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [toast, setToast] = useState('');
  const [profileSection, setProfileSection] = useState('pessoal');
  const [userType, setUserTypeState] = useState<'visitante' | 'estudante' | 'palestrante' | null>(null);
  const [authError, setAuthError] = useState('');

  const isLogged = Boolean(user);
  const notify = (message) => setToast(message);

  const selectUserType = (type) => {
    setUserTypeState(type);
    setAuthTab('login');
    setAuthError('');
  };

  const clearUserType = () => {
    setUserTypeState(null);
    setAuthTab('login');
    setAuthError('');
  };

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(''), 2800);
    return () => clearTimeout(timer);
  }, [toast]);

  const loadUserCatalog = async () => {
    try {
      setCatalog(await loadCatalog());
    } catch (err) {
      notify(friendlyError(err).message);
    }
  };

  const enter = async (profile) => {
    setUser(profile);
    setScreen('home');
    await loadUserCatalog();
  };

  useEffect(() => {
    if (!firebaseReady || !auth) {
      setBooting(false);
      return undefined;
    }

    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setBooting(false);
        return;
      }

      try {
        const profile = await getUserProfile(firebaseUser);
        await enter(profile);
      } catch (err) {
        setUser(null);
        notify(friendlyError(err).message);
      } finally {
        setBooting(false);
      }
    });
  }, []);

  const signIn = async (email, password) => {
    try {
      const credentials = validateCredentials(email, password);
      const { user: firebaseUser } = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
      const profile = await getUserProfile(firebaseUser);
      await enter(profile);
    } catch (err) {
      throw friendlyError(err);
    }
  };

  const signUp = async (name, email, password) => {
    try {
      const input = validateSignupInput(name, email, password);
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, input.email, input.password);
      await updateProfile(firebaseUser, { displayName: input.name });
      const profile = await getUserProfile(firebaseUser);
      await enter(profile);
      notify('Conta criada com sucesso.');
    } catch (err) {
      throw friendlyError(err);
    }
  };

  const forgotPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, validateEmail(email));
      notify('Se o e-mail estiver cadastrado, você receberá um link de redefinição.');
      setAuthTab('login');
    } catch (err) {
      throw friendlyError(err);
    }
  };

  const signInInstitutional = async () => {
    if (!firebaseSsoReady) {
      throw new Error('O SSO institucional ainda não foi configurado pela TI da Unifor.');
    }
    try {
      const provider = ssoProtocol === 'saml'
        ? new SAMLAuthProvider(ssoProviderId)
        : new OAuthProvider(ssoProviderId);
      const { user: firebaseUser } = await signInWithPopup(auth, provider);
      const profile = await getUserProfile(firebaseUser);
      await enter(profile);
    } catch (err) {
      throw friendlyError(err);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setScreen('login');
      setAuthTab('login');
      setActiveQuery('');
      setSearchQuery('');
      setSearchResults([]);
      setCatalog(EMPTY_CATALOG);
      notify('Você saiu da conta.');
    } catch (err) {
      notify(friendlyError(err).message);
    }
  };

  const goHome = () => {
    setActiveQuery('');
    setScreen('home');
  };

  const runSearch = async (term = searchQuery, filter = null) => {
    let queryText;
    try {
      queryText = validateSearchTerm(term);
    } catch (err) {
      notify(friendlyError(err).message);
      return;
    }
    setSearchQuery(queryText);
    setScreen('home');
    if (!queryText && !filter) {
      setActiveQuery('');
      setSearchResults([]);
      notify('Digite um termo para pesquisar.');
      return;
    }
    setActiveQuery(queryText || filter.label);
    setSearching(true);
    try {
      const documents = await searchDocuments(queryText || filter?.query || '', filter?.fonte || '');
      setSearchResults(documents);
      if (queryText && auth.currentUser) {
        recordSearch(auth.currentUser.uid, queryText, documents.length)
          .catch((err) => notify(friendlyError(err).message));
      }
    } catch (err) {
      setSearchResults([]);
      notify(friendlyError(err).message);
    } finally {
      setSearching(false);
    }
  };

  const toggleInterest = (interest) => {
    setUser((previous) => {
      if (!previous) return previous;
      const interests = previous.interests.includes(interest)
        ? previous.interests.filter((item) => item !== interest)
        : [...previous.interests, interest];
      return { ...previous, interests };
    });
  };

  const saveProfile = async () => {
    try {
      const profile = await saveUserProfile(auth.currentUser, user);
      setUser(profile);
      notify('Alterações salvas.');
    } catch (err) {
      notify(friendlyError(err).message);
    }
  };

  const reloadUser = async () => {
    if (!auth.currentUser) return;
    try {
      setUser(await getUserProfile(auth.currentUser));
    } catch (err) {
      notify(friendlyError(err).message);
    }
  };

  const value = {
    booting, screen, setScreen, authTab, setAuthTab,
    user, setUser, isLogged, catalog,
    signIn, signUp, forgotPassword, signInInstitutional, logout, goHome,
    toggleInterest, saveProfile, reloadUser,
    searchQuery, setSearchQuery, activeQuery, runSearch, searchResults, searching,
    toast, notify, profileSection, setProfileSection,
    userType, selectUserType, clearUserType, authError, setAuthError
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp deve ser usado dentro de AppProvider');
  return context;
}
