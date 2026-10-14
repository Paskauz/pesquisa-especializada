import { Bell, Search } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

export default function Header() {
  const { screen, setScreen, user, runSearch, searchQuery, activeQuery, goHome } = useApp();

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <button className="brand" type="button" onClick={goHome}>
          <Search />
          <span>Busca especializada</span>
        </button>

        <nav className="main-nav" aria-label="Principal">
          <button
            type="button"
            className={`nav-link ${screen === 'home' && !activeQuery ? 'is-active' : ''}`}
            onClick={goHome}
          >
            Início
          </button>
          <button
            type="button"
            className={`nav-link ${screen === 'home' && Boolean(activeQuery) ? 'is-active' : ''}`}
            onClick={() => runSearch(searchQuery || 'Inteligência Artificial')}
          >
            Pesquisar
          </button>
          <button
            type="button"
            className={`nav-link ${screen === 'profile' ? 'is-active' : ''}`}
            onClick={() => setScreen('profile')}
          >
            Meu Perfil
          </button>
        </nav>

        <div className="user-nav">
          <button className="icon-btn" type="button" title="Notificações">
            <Bell size={18} />
            <span className="dot" />
          </button>
          <button
            type="button"
            className="avatar"
            title="Acessar perfil"
            onClick={() => setScreen('profile')}
          >
            {user.initials}
          </button>
        </div>
      </div>
    </header>
  );
}
