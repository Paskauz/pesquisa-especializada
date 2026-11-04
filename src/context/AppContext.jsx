import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api.js';

const AppContext = createContext(null);
const EMPTY_CATALOG = { areas: [], termosPopulares: [], recursos: [], eventos: [] };

export function AppProvider({ children }) {
  const [booting, setBooting] = useState(true); // checando a sessão no servidor
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

  const isLogged = Boolean(user);
  const notify = (message) => setToast(message);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(''), 2800);
    return () => clearTimeout(timer);
  }, [toast]);

  const loadCatalog = async () => {
    try {
      setCatalog(await api('/catalogo'));
    } catch (err) {
      notify(err.message);
    }
  };

  const enter = (usuario) => {
    setUser(usuario);
    setScreen('home');
    loadCatalog();
  };

  // Ao abrir o app, pergunta ao servidor se já existe sessão (cookie).
  useEffect(() => {
    api('/me')
      .then(({ usuario }) => enter(usuario))
      .catch(() => {})
      .finally(() => setBooting(false));
  }, []);

  const signIn = async (identificador, senha) => {
    const { usuario } = await api('/auth/login', { method: 'POST', body: { identificador, senha } });
    enter(usuario);
  };

  const signUp = async (nome, email, senha) => {
    const { usuario } = await api('/auth/signup', { method: 'POST', body: { nome, email, senha } });
    enter(usuario);
    notify('Conta criada com sucesso.');
  };

  const forgotPassword = async (email) => {
    const { mensagem } = await api('/auth/forgot', { method: 'POST', body: { email } });
    notify(mensagem);
    setAuthTab('login');
  };

  const logout = async () => {
    await api('/auth/logout', { method: 'POST' }).catch(() => {});
    setUser(null);
    setScreen('login');
    setAuthTab('login');
    setActiveQuery('');
    setSearchQuery('');
    setSearchResults([]);
    notify('Você saiu da conta.');
  };

  const goHome = () => {
    setActiveQuery('');
    setScreen('home');
  };

  // filter: { fonte, label } — usado pelos cards de Acesso Rápido.
  const runSearch = async (term = searchQuery, filter = null) => {
    const query = term.trim();
    setSearchQuery(query);
    setScreen('home');
    if (!query && !filter) {
      setActiveQuery('');
      setSearchResults([]);
      notify('Digite um termo para pesquisar.');
      return;
    }
    setActiveQuery(query || filter.label);
    setSearching(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (filter?.fonte) params.set('fonte', filter.fonte);
      const { documentos } = await api(`/documentos?${params}`);
      setSearchResults(documentos);
    } catch (err) {
      setSearchResults([]);
      notify(err.message);
    } finally {
      setSearching(false);
    }
  };

  const toggleInterest = (interest) => {
    setUser((prev) => {
      const selected = prev.interests.includes(interest)
        ? prev.interests.filter((item) => item !== interest)
        : [...prev.interests, interest];
      return { ...prev, interests: selected };
    });
  };

  const saveProfile = async () => {
    try {
      const { usuario } = await api('/me', { method: 'PUT', body: user });
      setUser(usuario);
      notify('Alterações salvas.');
    } catch (err) {
      notify(err.message);
    }
  };

  // Descarta edições não salvas recarregando o perfil do servidor.
  const reloadUser = async () => {
    try {
      const { usuario } = await api('/me');
      setUser(usuario);
    } catch {
      /* mantém o estado atual */
    }
  };

  const value = {
    booting, screen, setScreen, authTab, setAuthTab,
    user, setUser, isLogged, catalog,
    signIn, signUp, forgotPassword, logout, goHome,
    toggleInterest, saveProfile, reloadUser,
    searchQuery, setSearchQuery, activeQuery, runSearch, searchResults, searching,
    toast, notify, profileSection, setProfileSection
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp deve ser usado dentro de AppProvider');
  return ctx;
}
