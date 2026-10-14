import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { DEMO_USER, DOCUMENTS } from '../data/mockData.js';

const STORAGE_KEY = 'busca-especializada-demo';
const AppContext = createContext(null);

function initialsFrom(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AppProvider({ children }) {
  const saved = loadSession();

  // Tela atual da demo: login | home | profile
  const [screen, setScreen] = useState(saved?.isLogged ? 'home' : 'login');
  const [authTab, setAuthTab] = useState('login');
  const [user, setUser] = useState(saved?.user ?? { ...DEMO_USER });
  const [isLogged, setIsLogged] = useState(Boolean(saved?.isLogged));
  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [toast, setToast] = useState('');
  const [profileSection, setProfileSection] = useState('pessoal');

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ isLogged, user })
    );
  }, [isLogged, user]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(''), 2800);
    return () => clearTimeout(timer);
  }, [toast]);

  const notify = (message) => setToast(message);

  // Login da demo: marca o usuário como autenticado e guarda no navegador.
  const login = (payload = {}) => {
    const nextUser = {
      ...user,
      ...payload,
      initials: initialsFrom(payload.name || user.name)
    };
    setUser(nextUser);
    setIsLogged(true);
    setScreen('home');
    notify('Sessão iniciada (demo, sem backend).');
  };

  const logout = () => {
    setIsLogged(false);
    setScreen('login');
    setAuthTab('login');
    setActiveQuery('');
    setSearchQuery('');
    notify('Você saiu da conta.');
  };

  const goHome = () => {
    setActiveQuery('');
    setScreen('home');
  };

  const runSearch = (term = searchQuery) => {
    const query = term.trim();
    setSearchQuery(query);
    setActiveQuery(query);
    setScreen('home');
    if (!query) {
      notify('Digite um termo para pesquisar.');
      return;
    }
    notify(`Buscando por "${query}" nos dados de demonstração.`);
  };

  const searchResults = useMemo(() => {
    if (!activeQuery) return [];
    const q = activeQuery.toLowerCase();
    return DOCUMENTS.filter((doc) =>
      [doc.title, doc.author, doc.area, doc.type, doc.source].join(' ').toLowerCase().includes(q)
    );
  }, [activeQuery]);

  const toggleInterest = (interest) => {
    setUser((prev) => {
      const selected = prev.interests.includes(interest)
        ? prev.interests.filter((item) => item !== interest)
        : [...prev.interests, interest];
      return { ...prev, interests: selected };
    });
  };

  const value = {
    screen,
    setScreen,
    authTab,
    setAuthTab,
    user,
    setUser,
    isLogged,
    login,
    logout,
    goHome,
    toggleInterest,
    searchQuery,
    setSearchQuery,
    activeQuery,
    runSearch,
    searchResults,
    toast,
    notify,
    profileSection,
    setProfileSection
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp deve ser usado dentro de AppProvider');
  }
  return ctx;
}
