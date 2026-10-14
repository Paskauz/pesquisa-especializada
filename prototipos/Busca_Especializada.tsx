import React, { useState } from 'react';
import { 
  Search, Bell, BookOpen, FileText, Users, Award, 
  Calendar, MapPin, ArrowRight, User, Mail, CreditCard, 
  GraduationCap, Sliders, Check, Plus, LogOut, Camera, 
  Key, Send, LogIn, Lock
} from 'lucide-react';

export default function App() {
  // Navigation state: 'login', 'home', or 'profile'
  const [currentScreen, setCurrentScreen] = useState('login');
  
  // Auth sub-tabs state for login screen
  const [authTab, setAuthTab] = useState('login');

  // User state
  const [user, setUser] = useState({
    name: 'Gabriel Silva',
    email: 'gabriel@edu.unifor.br',
    matricula: '2110482',
    course: 'Ciência da Computação - CCT',
    initials: 'GS',
    isLogged: false,
    notificationsEmail: true,
    notificationsDocAlerts: true,
    interests: ['Inteligência Artificial', 'Engenharia de Software']
  });

  // Search input state
  const [searchQuery, setSearchQuery] = useState('');
  const [availableInterests, setAvailableInterests] = useState([
    'Biotecnologia', 'Direito Constitucional', 'Medicina', 'Robótica'
  ]);

  // Handlers
  const handleLogin = (e) => {
    if (e) e.preventDefault();
    setUser(prev => ({ ...prev, isLogged: true }));
    setCurrentScreen('home');
  };

  const handleLogout = () => {
    setUser(prev => ({ ...prev, isLogged: false }));
    setCurrentScreen('login');
    setAuthTab('login');
  };

  const toggleInterest = (interest) => {
    if (user.interests.includes(interest)) {
      setUser(prev => ({
        ...prev,
        interests: prev.interests.filter(i => i !== interest)
      }));
      setAvailableInterests(prev => [...prev, interest]);
    } else {
      setUser(prev => ({
        ...prev,
        interests: [...prev.interests, interest]
      }));
      setAvailableInterests(prev => prev.filter(i => i !== interest));
    }
  };

  const renderHeader = () => (
    <header className="bg-white border-b border-gray-200/80 px-6 py-4 sticky top-0 z-50 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div 
          className="flex items-center gap-3 cursor-pointer select-none"
          onClick={() => setCurrentScreen('home')}
        >
          <Search className="w-7 h-7 text-[#5243ed]" />
          <span className="text-xl font-bold text-gray-900 tracking-tight">
            Busca especializada
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex items-center gap-8">
          <button
            onClick={() => setCurrentScreen('home')}
            className={`text-sm font-semibold transition-colors pb-1 border-b-2 ${
              currentScreen === 'home'
                ? 'text-[#5243ed] border-[#5243ed]'
                : 'text-gray-500 border-transparent hover:text-gray-900'
            }`}
          >
            Início
          </button>
          <button
            onClick={() => setCurrentScreen('home')}
            className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors pb-1 border-b-2 border-transparent"
          >
            Pesquisar
          </button>
          <button
            onClick={() => setCurrentScreen('profile')}
            className={`text-sm font-semibold transition-colors pb-1 border-b-2 ${
              currentScreen === 'profile'
                ? 'text-[#5243ed] border-[#5243ed]'
                : 'text-gray-500 border-transparent hover:text-gray-900'
            }`}
          >
            Meu Perfil
          </button>
        </nav>

        {/* User Actions */}
        <div className="flex items-center gap-4">
          <button 
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors relative"
            title="Notificações"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-600 rounded-full"></span>
          </button>
          
          <div 
            onClick={() => setCurrentScreen('profile')}
            className="w-9 h-9 rounded-full bg-indigo-100 text-[#5243ed] border-2 border-[#5243ed] flex items-center justify-center font-bold text-xs cursor-pointer hover:scale-105 transition-transform"
            title="Acessar Perfil"
          >
            {user.initials}
          </div>
        </div>
      </div>
    </header>
  );

  const renderAuthScreen = () => (
    <div className="min-h-screen bg-[#f4f5f8] flex flex-col items-center justify-center p-4 py-12">
      {/* Brand Header */}
      <div className="flex items-center gap-2.5 mb-6">
        <Search className="w-7 h-7 text-[#5243ed] stroke-[2.5]" />
        <span className="text-2xl font-bold text-gray-900 tracking-tight">
          Busca especializada
        </span>
      </div>

      {/* Auth Card Box */}
      <div className="w-full max-w-[380px] bg-white border border-gray-200/80 rounded-2xl p-7 shadow-sm transition-all">
        
        {/* TELA 1: LOGIN */}
        {authTab === 'login' && (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="text-center mb-1">
              <h1 className="text-lg font-bold text-gray-900">Entrar</h1>
              <p className="text-xs text-gray-500 mt-0.5">Acesse sua conta para continuar</p>
            </div>

            <div className="flex items-center gap-2.5 border border-gray-200 bg-[#fafafb] rounded-lg px-3 h-11 focus-within:border-[#5243ed] focus-within:ring-1 focus-within:ring-[#5243ed] transition-all">
              <Mail className="w-4 h-4 text-gray-400 shrink-0" />
              <input 
                type="text" 
                placeholder="E-mail ou usuário" 
                defaultValue="gabriel@edu.unifor.br"
                className="w-full bg-transparent text-sm outline-none text-gray-900 placeholder-gray-400"
                required
              />
            </div>

            <div className="flex items-center gap-2.5 border border-gray-200 bg-[#fafafb] rounded-lg px-3 h-11 focus-within:border-[#5243ed] focus-within:ring-1 focus-within:ring-[#5243ed] transition-all">
              <Lock className="w-4 h-4 text-gray-400 shrink-0" />
              <input 
                type="password" 
                placeholder="Senha" 
                defaultValue="123456"
                className="w-full bg-transparent text-sm outline-none text-gray-900 placeholder-gray-400"
                required
              />
            </div>

            <button 
              type="submit" 
              className="h-11 bg-[#5243ed] hover:bg-[#4335c9] text-white font-semibold text-sm rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <LogIn className="w-4 h-4" />
              Entrar
            </button>

            <button 
              type="button" 
              onClick={() => setAuthTab('forgot')}
              className="text-xs font-semibold text-[#5243ed] hover:underline text-center"
            >
              Esqueceu a senha?
            </button>

            <div className="flex items-center gap-3 my-1">
              <div className="h-px bg-gray-200 flex-1"></div>
              <span className="text-xs text-gray-400">ou</span>
              <div className="h-px bg-gray-200 flex-1"></div>
            </div>

            <button 
              type="button" 
              onClick={() => setAuthTab('matricula')}
              className="h-11 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold text-sm rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <CreditCard className="w-4 h-4 text-gray-500" />
              Entrar com matrícula Unifor
            </button>

            <p className="text-xs text-center text-gray-500 mt-2">
              Não tem conta?{' '}
              <button 
                type="button" 
                onClick={() => setAuthTab('signup')}
                className="font-semibold text-[#5243ed] hover:underline"
              >
                Criar conta
              </button>
            </p>
          </form>
        )}

        {/* TELA 2: CRIAR CONTA */}
        {authTab === 'signup' && (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="text-center mb-1">
              <h1 className="text-lg font-bold text-gray-900">Criar conta</h1>
              <p className="text-xs text-gray-500 mt-0.5">Preencha os dados para se cadastrar</p>
            </div>

            <div className="flex items-center gap-2.5 border border-gray-200 bg-[#fafafb] rounded-lg px-3 h-11 focus-within:border-[#5243ed] focus-within:ring-1 focus-within:ring-[#5243ed] transition-all">
              <User className="w-4 h-4 text-gray-400 shrink-0" />
              <input 
                type="text" 
                placeholder="Nome completo" 
                defaultValue="Gabriel Silva"
                className="w-full bg-transparent text-sm outline-none text-gray-900 placeholder-gray-400"
                required
              />
            </div>

            <div className="flex items-center gap-2.5 border border-gray-200 bg-[#fafafb] rounded-lg px-3 h-11 focus-within:border-[#5243ed] focus-within:ring-1 focus-within:ring-[#5243ed] transition-all">
              <Mail className="w-4 h-4 text-gray-400 shrink-0" />
              <input 
                type="email" 
                placeholder="E-mail" 
                defaultValue="gabriel@edu.unifor.br"
                className="w-full bg-transparent text-sm outline-none text-gray-900 placeholder-gray-400"
                required
              />
            </div>

            <div className="flex items-center gap-2.5 border border-gray-200 bg-[#fafafb] rounded-lg px-3 h-11 focus-within:border-[#5243ed] focus-within:ring-1 focus-within:ring-[#5243ed] transition-all">
              <Lock className="w-4 h-4 text-gray-400 shrink-0" />
              <input 
                type="password" 
                placeholder="Criar senha" 
                className="w-full bg-transparent text-sm outline-none text-gray-900 placeholder-gray-400"
                required
              />
            </div>

            <button 
              type="submit" 
              className="h-11 bg-[#5243ed] hover:bg-[#4335c9] text-white font-semibold text-sm rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <User className="w-4 h-4" />
              Criar minha conta
            </button>

            <p className="text-xs text-center text-gray-500 mt-2">
              Já tem conta?{' '}
              <button 
                type="button" 
                onClick={() => setAuthTab('login')}
                className="font-semibold text-[#5243ed] hover:underline"
              >
                Entrar
              </button>
            </p>
          </form>
        )}

        {/* TELA 3: ESQUECEU A SENHA */}
        {authTab === 'forgot' && (
          <form onSubmit={(e) => { e.preventDefault(); setAuthTab('login'); alert('Link enviado para o seu e-mail!'); }} className="flex flex-col gap-4">
            <div className="w-11 h-11 rounded-full bg-indigo-50 flex items-center justify-center mx-auto text-[#5243ed]">
              <Key className="w-5 h-5" />
            </div>

            <div className="text-center mb-1">
              <h1 className="text-lg font-bold text-gray-900">Esqueceu a senha?</h1>
              <p className="text-xs text-gray-500 mt-0.5">Informe seu e-mail para receber o link de redefinição</p>
            </div>

            <div className="flex items-center gap-2.5 border border-gray-200 bg-[#fafafb] rounded-lg px-3 h-11 focus-within:border-[#5243ed] focus-within:ring-1 focus-within:ring-[#5243ed] transition-all">
              <Mail className="w-4 h-4 text-gray-400 shrink-0" />
              <input 
                type="email" 
                placeholder="E-mail cadastrado" 
                className="w-full bg-transparent text-sm outline-none text-gray-900 placeholder-gray-400"
                required
              />
            </div>

            <button 
              type="submit" 
              className="h-11 bg-[#5243ed] hover:bg-[#4335c9] text-white font-semibold text-sm rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <Send className="w-4 h-4" />
              Enviar link de redefinição
            </button>

            <button 
              type="button" 
              onClick={() => setAuthTab('login')}
              className="text-xs font-semibold text-[#5243ed] hover:underline text-center mt-1"
            >
              Voltar para o login
            </button>
          </form>
        )}

        {/* TELA 4: ENTRAR COM MATRÍCULA UNIFOR */}
        {authTab === 'matricula' && (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="w-11 h-11 rounded-full bg-indigo-50 flex items-center justify-center mx-auto text-[#5243ed]">
              <CreditCard className="w-5 h-5" />
            </div>

            <div className="text-center mb-1">
              <h1 className="text-lg font-bold text-gray-900">Entrar com matrícula Unifor</h1>
              <p className="text-xs text-gray-500 mt-0.5">Use sua matrícula e senha institucional</p>
            </div>

            <div className="flex items-center gap-2.5 border border-gray-200 bg-[#fafafb] rounded-lg px-3 h-11 focus-within:border-[#5243ed] focus-within:ring-1 focus-within:ring-[#5243ed] transition-all">
              <CreditCard className="w-4 h-4 text-gray-400 shrink-0" />
              <input 
                type="text" 
                placeholder="Matrícula Unifor" 
                defaultValue="2110482"
                className="w-full bg-transparent text-sm outline-none text-gray-900 placeholder-gray-400"
                required
              />
            </div>

            <div className="flex items-center gap-2.5 border border-gray-200 bg-[#fafafb] rounded-lg px-3 h-11 focus-within:border-[#5243ed] focus-within:ring-1 focus-within:ring-[#5243ed] transition-all">
              <Lock className="w-4 h-4 text-gray-400 shrink-0" />
              <input 
                type="password" 
                placeholder="Senha" 
                defaultValue="123456"
                className="w-full bg-transparent text-sm outline-none text-gray-900 placeholder-gray-400"
                required
              />
            </div>

            <button 
              type="submit" 
              className="h-11 bg-[#5243ed] hover:bg-[#4335c9] text-white font-semibold text-sm rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <LogIn className="w-4 h-4" />
              Entrar
            </button>

            <button 
              type="button" 
              onClick={() => setAuthTab('login')}
              className="text-xs font-semibold text-[#5243ed] hover:underline text-center mt-1"
            >
              Voltar para o login
            </button>
          </form>
        )}

      </div>
    </div>
  );

  const renderHomeScreen = () => (
    <div className="min-h-screen bg-[#f4f5f8] text-gray-800 flex flex-col">
      {renderHeader()}

      {/* Main Grid Container */}
      <main className="max-w-7xl w-full mx-auto p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
        
        {/* Left / Center Column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Hero Search Box */}
          <section className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              O que você quer pesquisar hoje?
            </h1>
            <p className="text-gray-500 text-sm mb-6">
              Acesse teses, artigos de iniciação científica, acervos e monitorias da Unifor em um só lugar.
            </p>

            <div className="flex items-center gap-3 bg-[#f9fafb] border border-gray-300 rounded-xl px-4 py-1.5 focus-within:border-[#5243ed] focus-within:ring-1 focus-within:ring-[#5243ed] transition-all">
              <Search className="w-5 h-5 text-gray-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Digite palavras-chave, título de artigo ou nome do professor..."
                className="w-full bg-transparent py-2.5 text-sm outline-none text-gray-900 placeholder-gray-400"
              />
              <button 
                onClick={() => searchQuery && alert(`Buscando por: "${searchQuery}"`)}
                className="bg-[#5243ed] hover:bg-[#4335c9] text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shrink-0 shadow-sm"
              >
                Buscar
              </button>
            </div>

            {/* Tags Populares */}
            <div className="flex items-center flex-wrap gap-2 mt-5">
              <span className="text-xs font-medium text-gray-500">Populares:</span>
              {['Direito Constitucional', 'Inteligência Artificial', 'Engenharia de Software', 'Medicina'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSearchQuery(tag)}
                  className="bg-gray-100 hover:bg-indigo-50 hover:text-[#5243ed] text-gray-600 px-3 py-1 rounded-full text-xs font-medium transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </section>

          {/* Quick Access Section */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Acesso Rápido</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#5243ed] flex items-center justify-center">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-base">Acervo da Biblioteca</h3>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed mb-4">
                    Consulte livros físicos, e-books e revistas científicas disponíveis na Biblioteca Unifor.
                  </p>
                </div>
                <a href="#acervo" onClick={(e) => e.preventDefault()} className="text-[#5243ed] font-semibold text-xs flex items-center gap-1 hover:underline">
                  Acessar acervo <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#5243ed] flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-base">Trabalhos Acadêmicos</h3>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed mb-4">
                    Repositório de TCCs, dissertações de mestrado e teses de doutorado publicadas.
                  </p>
                </div>
                <a href="#repositorio" onClick={(e) => e.preventDefault()} className="text-[#5243ed] font-semibold text-xs flex items-center gap-1 hover:underline">
                  Explorar repositório <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#5243ed] flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-base">Programas de Monitoria</h3>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed mb-4">
                    Encontre horários e monitores das disciplinas do seu curso de graduação.
                  </p>
                </div>
                <a href="#monitores" onClick={(e) => e.preventDefault()} className="text-[#5243ed] font-semibold text-xs flex items-center gap-1 hover:underline">
                  Ver monitores <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#5243ed] flex items-center justify-center">
                      <Award className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-base">Iniciação Científica</h3>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed mb-4">
                    Projetos de pesquisa ativos com editais abertos para bolsas de estudo voluntárias ou remuneradas.
                  </p>
                </div>
                <a href="#editais" onClick={(e) => e.preventDefault()} className="text-[#5243ed] font-semibold text-xs flex items-center gap-1 hover:underline">
                  Ver editais <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>

            </div>
          </section>

        </div>

        {/* Sidebar Column: Agenda Unifor */}
        <aside className="flex flex-col gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-gray-900 text-base">Agenda Unifor</h3>
              <Calendar className="w-5 h-5 text-[#5243ed]" />
            </div>
            <p className="text-xs text-gray-500 mb-5">Principais eventos acadêmicos e culturais</p>

            <div className="flex flex-col gap-4">
              
              <div className="flex gap-4 pb-4 border-b border-gray-100">
                <div className="bg-indigo-50 text-[#5243ed] rounded-xl px-3 py-2 text-center min-w-[54px] h-fit">
                  <span className="block font-bold text-lg leading-tight">18</span>
                  <span className="text-[10px] font-bold uppercase tracking-wide">OUT</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 leading-snug">Mundo Unifor 2024</h4>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-gray-400" /> Teatro Celina Queiroz
                  </p>
                  <span className="inline-block bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full mt-2">
                    Científico
                  </span>
                </div>
              </div>

              <div className="flex gap-4 pb-4 border-b border-gray-100">
                <div className="bg-indigo-50 text-[#5243ed] rounded-xl px-3 py-2 text-center min-w-[54px] h-fit">
                  <span className="block font-bold text-lg leading-tight">22</span>
                  <span className="text-[10px] font-bold uppercase tracking-wide">OUT</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 leading-snug">Encontros Científicos</h4>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-gray-400" /> Blocos de Pós-Graduação
                  </p>
                  <span className="inline-block bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full mt-2">
                    Pesquisa
                  </span>
                </div>
              </div>

              <div className="flex gap-4 pb-4 border-b border-gray-100">
                <div className="bg-indigo-50 text-[#5243ed] rounded-xl px-3 py-2 text-center min-w-[54px] h-fit">
                  <span className="block font-bold text-lg leading-tight">05</span>
                  <span className="text-[10px] font-bold uppercase tracking-wide">NOV</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 leading-snug">Exposição Espaço Cultural</h4>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-gray-400" /> Espaço Cultural Unifor
                  </p>
                  <span className="inline-block bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full mt-2">
                    Cultura
                  </span>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="bg-indigo-50 text-[#5243ed] rounded-xl px-3 py-2 text-center min-w-[54px] h-fit">
                  <span className="block font-bold text-lg leading-tight">12</span>
                  <span className="text-[10px] font-bold uppercase tracking-wide">NOV</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 leading-snug">Feira de Carreiras & Estágios</h4>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-gray-400" /> Centro de Convivência
                  </p>
                  <span className="inline-block bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full mt-2">
                    Carreira
                  </span>
                </div>
              </div>

            </div>
          </div>
        </aside>

      </main>
    </div>
  );

  const renderProfileScreen = () => (
    <div className="min-h-screen bg-[#f4f5f8] text-gray-800 flex flex-col">
      {renderHeader()}

      <main className="max-w-5xl w-full mx-auto p-4 md:p-6 my-4 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Left Column: Avatar & Summary */}
          <div className="md:col-span-1 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center h-fit">
            
            {/* Avatar */}
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-full bg-indigo-50 border-2 border-indigo-100 flex items-center justify-center text-[#5243ed] text-3xl font-bold shadow-inner">
                {user.initials}
              </div>
              <button 
                className="absolute bottom-0 right-0 bg-[#5243ed] text-white w-8 h-8 rounded-full flex items-center justify-center shadow hover:bg-indigo-700 transition-colors" 
                title="Alterar Foto"
                onClick={() => alert('Recurso para alterar foto selecionado.')}
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <h2 className="text-lg font-bold text-gray-900">{user.name}</h2>
            <p className="text-xs text-gray-500 mb-3">Matrícula Unifor</p>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Aluno Ativo
            </span>

            {/* Sidebar Navigation inside Profile */}
            <div className="w-full space-y-1 text-left">
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-indigo-50 text-[#5243ed] font-medium text-sm">
                <User className="w-4 h-4" />
                Informações Pessoais
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 font-medium text-sm transition-colors">
                <Sliders className="w-4 h-4" />
                Preferências de Busca
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 font-medium text-sm transition-colors">
                <Bell className="w-4 h-4" />
                Notificações
              </button>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 font-medium text-sm transition-colors mt-4"
              >
                <LogOut className="w-4 h-4" />
                Sair da Conta
              </button>
            </div>
          </div>

          {/* Right Column: User Forms & Preferences */}
          <div className="md:col-span-2 space-y-6">

            {/* User Info Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Informações do Usuário</h3>
                  <p className="text-xs text-gray-500">Atualize seus dados pessoais e de contato acadêmico</p>
                </div>
                <CreditCard className="w-5 h-5 text-[#5243ed]" />
              </div>

              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Informações atualizadas com sucesso!'); }}>
                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Nome completo</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <User className="w-4 h-4" />
                    </span>
                    <input 
                      type="text" 
                      value={user.name} 
                      onChange={(e) => setUser({ ...user, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#f9fafb] border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#5243ed] focus:ring-1 focus:ring-[#5243ed]"
                    />
                  </div>
                </div>

                {/* Grid: Email & Matricula */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">E-mail cadastrado</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Mail className="w-4 h-4" />
                      </span>
                      <input 
                        type="email" 
                        value={user.email} 
                        onChange={(e) => setUser({ ...user, email: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#f9fafb] border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#5243ed] focus:ring-1 focus:ring-[#5243ed]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Matrícula Unifor</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <CreditCard className="w-4 h-4" />
                      </span>
                      <input 
                        type="text" 
                        value={user.matricula} 
                        disabled 
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                {/* Course */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Curso / Centro Acadêmico</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <GraduationCap className="w-4 h-4" />
                    </span>
                    <input 
                      type="text" 
                      value={user.course} 
                      onChange={(e) => setUser({ ...user, course: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#f9fafb] border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#5243ed] focus:ring-1 focus:ring-[#5243ed]"
                    />
                  </div>
                </div>
              </form>
            </div>

            {/* System Preferences */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Preferências do Sistema</h3>
                  <p className="text-xs text-gray-500">Personalize os resultados da sua busca especializada</p>
                </div>
                <Sliders className="w-5 h-5 text-[#5243ed]" />
              </div>

              <div className="space-y-5">
                {/* Interests Tags */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Áreas de Interesse Principal</label>
                  <div className="flex flex-wrap gap-2">
                    {/* Selected Tags */}
                    {user.interests.map((interest) => (
                      <span 
                        key={interest}
                        onClick={() => toggleInterest(interest)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 text-[#5243ed] border border-indigo-200 cursor-pointer hover:bg-indigo-100 transition-colors"
                      >
                        <Check className="w-3 h-3" /> {interest}
                      </span>
                    ))}

                    {/* Unselected Tags */}
                    {availableInterests.map((interest) => (
                      <span 
                        key={interest}
                        onClick={() => toggleInterest(interest)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 cursor-pointer transition-colors"
                      >
                        <Plus className="w-3 h-3" /> {interest}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Notification Toggles */}
                <div className="pt-3 border-t border-gray-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-gray-800">Notificações por E-mail</p>
                      <p className="text-[11px] text-gray-500">Receba novos artigos e pesquisas no seu e-mail</p>
                    </div>
                    <button 
                      onClick={() => setUser(prev => ({ ...prev, notificationsEmail: !prev.notificationsEmail }))}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                        user.notificationsEmail ? 'bg-[#5243ed]' : 'bg-gray-200'
                      }`}
                    >
                      <span 
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ease-in-out my-0.5 ${
                          user.notificationsEmail ? 'translate-x-4' : 'translate-x-0.5'
                        }`} 
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-gray-800">Alertas de Novos Documentos</p>
                      <p className="text-[11px] text-gray-500">Avisar quando houver novos materiais na sua área</p>
                    </div>
                    <button 
                      onClick={() => setUser(prev => ({ ...prev, notificationsDocAlerts: !prev.notificationsDocAlerts }))}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                        user.notificationsDocAlerts ? 'bg-[#5243ed]' : 'bg-gray-200'
                      }`}
                    >
                      <span 
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ease-in-out my-0.5 ${
                          user.notificationsDocAlerts ? 'translate-x-4' : 'translate-x-0.5'
                        }`} 
                      />
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                  <button 
                    type="button" 
                    onClick={() => setCurrentScreen('home')}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="button" 
                    onClick={() => alert('Alterações salvas com sucesso!')}
                    className="px-5 py-2 rounded-xl bg-[#5243ed] hover:bg-indigo-700 text-white text-xs font-semibold shadow transition-colors flex items-center gap-2"
                  >
                    Salvar Alterações
                  </button>
                </div>

              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );

  switch (currentScreen) {
    case 'home':
      return renderHomeScreen();
    case 'profile':
      return renderProfileScreen();
    case 'login':
    default:
      return renderAuthScreen();
  }
}