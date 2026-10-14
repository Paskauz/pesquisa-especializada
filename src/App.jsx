import { useApp } from './context/AppContext.jsx';
import AuthScreen from './components/AuthScreen.jsx';
import HomeScreen from './components/HomeScreen.jsx';
import ProfileScreen from './components/ProfileScreen.jsx';

export default function App() {
  const { screen, isLogged, toast } = useApp();

  // Sem backend: só mostra início/perfil se existir sessão local.
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
