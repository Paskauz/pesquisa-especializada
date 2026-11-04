import {
  Bell,
  Camera,
  Check,
  CreditCard,
  GraduationCap,
  LogOut,
  Mail,
  Plus,
  Sliders,
  User
} from 'lucide-react';
import Header from './Header.jsx';
import { useApp } from '../context/AppContext.jsx';

export default function ProfileScreen() {
  const {
    user,
    setUser,
    logout,
    notify,
    setScreen,
    profileSection,
    setProfileSection,
    toggleInterest,
    saveProfile,
    reloadUser,
    catalog
  } = useApp();

  const cancel = () => {
    reloadUser(); // descarta o que não foi salvo
    setScreen('home');
  };

  const showPessoal = profileSection === 'pessoal';
  const showPrefs = profileSection === 'preferencias' || profileSection === 'pessoal';
  const showNotes = profileSection === 'notificacoes' || profileSection === 'pessoal';

  return (
    <div className="app-shell">
      <Header />
      <main className="profile-main">
        <div className="profile-grid">
          <aside className="profile-summary">
            <div className="avatar-wrap">
              <div className="avatar avatar--lg">{user.initials}</div>
              <button
                type="button"
                className="camera-btn"
                title="Alterar foto"
                onClick={() => notify('Upload de foto fica para uma etapa futura com backend.')}
              >
                <Camera size={14} />
              </button>
            </div>
            <h2>{user.name}</h2>
            <p style={{ fontSize: 12, color: '#6b7280' }}>Matrícula Unifor</p>
            <span className="status-pill">
              <span className="live" /> Aluno Ativo
            </span>

            <div className="profile-menu">
              <button
                type="button"
                className={profileSection === 'pessoal' ? 'is-active' : ''}
                onClick={() => setProfileSection('pessoal')}
              >
                <User size={16} /> Informações Pessoais
              </button>
              <button
                type="button"
                className={profileSection === 'preferencias' ? 'is-active' : ''}
                onClick={() => setProfileSection('preferencias')}
              >
                <Sliders size={16} /> Preferências de Busca
              </button>
              <button
                type="button"
                className={profileSection === 'notificacoes' ? 'is-active' : ''}
                onClick={() => setProfileSection('notificacoes')}
              >
                <Bell size={16} /> Notificações
              </button>
              <button type="button" className="is-danger" onClick={logout}>
                <LogOut size={16} /> Sair da Conta
              </button>
            </div>
          </aside>

          <div className="profile-stack">
            {showPessoal && (
              <section className="profile-panel">
                <div className="panel-head">
                  <div>
                    <h3>Informações do Usuário</h3>
                    <p>Atualize seus dados pessoais e de contato acadêmico</p>
                  </div>
                  <CreditCard size={20} />
                </div>
                <form
                  className="form-grid"
                  onSubmit={(event) => {
                    event.preventDefault();
                    saveProfile();
                  }}
                >
                  <div className="labeled-field span-2">
                    <label htmlFor="name">Nome completo</label>
                    <div className="field">
                      <User />
                      <input
                        id="name"
                        value={user.name}
                        onChange={(event) => setUser({ ...user, name: event.target.value })}
                      />
                    </div>
                  </div>
                  <div className="labeled-field">
                    <label htmlFor="email">E-mail cadastrado</label>
                    <div className="field">
                      <Mail />
                      <input
                        id="email"
                        type="email"
                        value={user.email}
                        onChange={(event) => setUser({ ...user, email: event.target.value })}
                      />
                    </div>
                  </div>
                  <div className="labeled-field">
                    <label htmlFor="matricula">Matrícula Unifor</label>
                    <div className="field field--disabled">
                      <CreditCard />
                      <input id="matricula" value={user.matricula} disabled />
                    </div>
                  </div>
                  <div className="labeled-field span-2">
                    <label htmlFor="course">Curso / Centro Acadêmico</label>
                    <div className="field">
                      <GraduationCap />
                      <input
                        id="course"
                        value={user.course}
                        onChange={(event) => setUser({ ...user, course: event.target.value })}
                      />
                    </div>
                  </div>
                </form>
              </section>
            )}

            {(showPrefs || showNotes) && (
              <section className="profile-panel">
                <div className="panel-head">
                  <div>
                    <h3>Preferências do Sistema</h3>
                    <p>Personalize os resultados da sua busca especializada</p>
                  </div>
                  <Sliders size={20} />
                </div>

                {showPrefs && (
                  <div>
                    <label className="labeled-field" style={{ marginBottom: 12 }}>
                      Áreas de Interesse Principal
                    </label>
                    <div className="tags">
                      {catalog.areas.map((interest) => {
                        const selected = user.interests.includes(interest);
                        return (
                          <button
                            key={interest}
                            type="button"
                            className={`interest ${selected ? 'is-on' : ''}`}
                            onClick={() => toggleInterest(interest)}
                          >
                            {selected ? <Check size={12} /> : <Plus size={12} />}
                            {interest}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {showNotes && (
                  <>
                    <div className="toggle-row">
                      <div>
                        <h4>Notificações por E-mail</h4>
                        <p>Receba novos artigos e pesquisas no seu e-mail</p>
                      </div>
                      <button
                        type="button"
                        className={`switch ${user.notificationsEmail ? 'is-on' : ''}`}
                        onClick={() =>
                          setUser((prev) => ({ ...prev, notificationsEmail: !prev.notificationsEmail }))
                        }
                        aria-pressed={user.notificationsEmail}
                      >
                        <span />
                      </button>
                    </div>
                    <div className="toggle-row">
                      <div>
                        <h4>Alertas de Novos Documentos</h4>
                        <p>Avisar quando houver novos materiais na sua área</p>
                      </div>
                      <button
                        type="button"
                        className={`switch ${user.notificationsDocAlerts ? 'is-on' : ''}`}
                        onClick={() =>
                          setUser((prev) => ({
                            ...prev,
                            notificationsDocAlerts: !prev.notificationsDocAlerts
                          }))
                        }
                        aria-pressed={user.notificationsDocAlerts}
                      >
                        <span />
                      </button>
                    </div>
                  </>
                )}

                <div className="panel-actions">
                  <button type="button" className="btn btn-ghost" onClick={cancel}>
                    Cancelar
                  </button>
                  <button type="button" className="btn btn-primary" onClick={saveProfile}>
                    Salvar Alterações
                  </button>
                </div>
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
