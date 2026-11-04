import { useApp } from './context/AppContext.jsx';
import AuthScreen from './components/AuthScreen.jsx';
import HomeScreen from './components/HomeScreen.jsx';
import ProfileScreen from './components/ProfileScreen.jsx';

export default function App() {
  const { screen, isLogged, toast, booting } = useApp();

  if (booting) return null;

  // Início/perfil só aparecem com sessão válida no servidor.
  const current = isLogged ? screen : 'login';

  return (
    <>
      {current === 'home' && <HomeScreen />}
      {current === 'profile' && <ProfileScreen />}
      {current === 'login' && <AuthScreen />}
      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
