import { useApp } from './context/AppContext.jsx';
import AuthScreen from './components/AuthScreen.jsx';
import HomeScreen from './components/HomeScreen.jsx';
import ProfileScreen from './components/ProfileScreen.jsx';
import { firebaseReady } from './firebase.js';

export default function App() {
  const { screen, isLogged, toast, booting } = useApp();

  if (!firebaseReady) {
    return (
      <div className="auth-page">
        <section className="auth-card">
          <div className="screen-header">
            <h1>Configure o Firebase</h1>
            <p>
              Para usar o sistema, configure as variáveis VITE_FIREBASE_* no arquivo .env
              e habilite Authentication com e-mail/senha e o Cloud Firestore.
            </p>
          </div>
        </section>
      </div>
    );
  }

  if (booting) return <div className="auth-page"><p>Conectando ao Firebase…</p></div>;

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
