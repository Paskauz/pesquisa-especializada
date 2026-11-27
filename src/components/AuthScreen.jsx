import { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  GraduationCap,
  Key,
  Lock,
  LogIn,
  Mail,
  Mic,
  Search,
  Send,
  User
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

function Field({ icon, ...inputProps }) {
  return (
    <div className="field">
      {icon}
      <input {...inputProps} />
    </div>
  );
}

export default function AuthScreen() {
  const {
    authTab,
    setAuthTab,
    signIn,
    signUp,
    forgotPassword,
    userType,
    selectUserType,
    clearUserType,
    setAuthError
  } = useApp();
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    identifier: '',
    password: '',
    name: '',
    email: ''
  });

  const update = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
    setError('');
  };

  // Executa a operação de autenticação e mostra erros do Firebase no formulário.
  const run = (validate, action) => async (event) => {
    event.preventDefault();
    const problem = validate();
    if (problem) return setError(problem);
    try {
      await action();
    } catch (err) {
      setError(err.message);
    }
  };

  const submitLogin = run(
    () => (!form.identifier.trim() || !form.password.trim() ? 'Preencha e-mail e senha para entrar.' : ''),
    () => signIn(form.identifier, form.password)
  );

  const submitSignup = run(
    () => (!form.name.trim() || !form.email.trim() || !form.password.trim() ? 'Preencha nome, e-mail e senha para criar a conta.' : ''),
    () => signUp(form.name, form.email, form.password)
  );

  const submitForgot = run(
    () => (!form.email.trim() ? 'Informe o e-mail cadastrado.' : ''),
    () => forgotPassword(form.email)
  );

  // Tipos de usuário que ainda não possuem login habilitado.
  const submitUnavailable = (event) => {
    event.preventDefault();
    setError('Esse método de login ainda é inviável.');
  };

  // Seleciona o tipo de usuário e avança para o formulário de login.
  const chooseType = (type) => {
    setError('');
    selectUserType(type);
  };

  const TYPE_COLORS = {
    visitante: { color: '#10b981', bg: '#ecfdf5' },
    estudante: { color: '#3b82f6', bg: '#eff6ff' },
    palestrante: { color: '#a855f7', bg: '#faf5ff' }
  };

  const TYPE_ICONS = {
    visitante: <User size={24} />,
    estudante: <GraduationCap size={24} />,
    palestrante: <Mic size={24} />
  };

  const TYPES = [
    {
      id: 'visitante',
      label: 'Visitante',
      description: 'Usuário comum sem vínculo institucional',
      placeholder: 'E-mail',
      action: 'E-mail e senha'
    },
    {
      id: 'estudante',
      label: 'Estudante',
      description: 'Acesso via matrícula institucional',
      placeholder: 'Matrícula institucional',
      action: 'Matrícula e senha'
    },
    {
      id: 'palestrante',
      label: 'Palestrante',
      description: 'Acesso para palestrantes e convidados',
      placeholder: 'E-mail',
      action: 'E-mail e senha'
    }
  ];

  // Quando nenhum tipo foi selecionado, mostra a tela de escolha.
  if (!userType) {
    return (
      <div className="auth-page">
        <div className="brand">
          <Search />
          <span>Busca especializada</span>
        </div>

        <section className="auth-card">
          <div className="screen-header">
            <h1 className="gradient-text">Escolha seu perfil</h1>
            <p>Selecione quem você é para continuar</p>
          </div>

          <div className="type-grid">
            {TYPES.map((type) => {
              const conf = TYPE_COLORS[type.id] ?? TYPE_COLORS.visitante;
              const icon = TYPE_ICONS[type.id] ?? TYPE_ICONS.visitante;
              return (
                <button
                  key={type.id}
                  type="button"
                  className={`type-card ${type.id === 'visitante' ? 'is-active' : ''}`}
                  style={{ borderColor: conf.color }}
                  onClick={() => chooseType(type.id)}
                >
                  <div className="type-icon" style={{ color: conf.color, background: conf.bg }}>
                    {icon}
                  </div>
                  <h3>{type.label}</h3>
                  <p className="type-desc">{type.description}</p>
                  <span className="type-arrow" style={{ color: conf.color }}>
                    {type.action} <ArrowRight size={14} />
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    );
  }

  const isUnavailable = userType === 'estudante' || userType === 'palestrante';
  const conf = userType ? TYPE_COLORS[userType] : TYPE_COLORS.visitante;
  const backLabel = 'Voltar à escolha de perfil';
  const titleByType = {
    visitante: 'Entrar',
    estudante: 'Entrar como Estudante',
    palestrante: 'Entrar como Palestrante'
  };
  const subtitleByType = {
    visitante: 'Acesse sua conta para continuar',
    estudante: 'Informe sua matrícula institucional e senha',
    palestrante: 'Informe seu e-mail e senha de acesso'
  };
  const placeholderByType = {
    visitante: 'E-mail',
    estudante: 'Matrícula institucional',
    palestrante: 'E-mail'
  };

  return (
    <div className="auth-page">
      <div className="brand">
        <Search />
        <span>Busca especializada</span>
      </div>

      <section className="auth-card">
        <button
          type="button"
          className="back-btn"
          onClick={clearUserType}
          title="Voltar à escolha de perfil"
        >
          <ArrowLeft size={14} /> {backLabel}
        </button>

        {authTab === 'login' && (
          <form className="auth-form" onSubmit={isUnavailable ? submitUnavailable : submitLogin}>
            <div className="screen-header">
              <h1 className="gradient-text">{titleByType[userType]}</h1>
              <p>{subtitleByType[userType]}</p>
            </div>
            <Field
              icon={<Mail />}
              type="email"
              placeholder={placeholderByType[userType]}
              value={form.identifier}
              onChange={update('identifier')}
            />
            <Field
              icon={<Lock />}
              type="password"
              placeholder="Senha"
              value={form.password}
              onChange={update('password')}
            />
            {error && <p className="form-error">{error}</p>}
            <button type="submit" className="btn btn-primary" disabled={isUnavailable}>
              <LogIn size={16} /> {isUnavailable ? 'Método indisponível' : 'Entrar'}
            </button>
            {isUnavailable && (
              <p className="form-error" style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                <span style={{ fontSize: 16 }}>⚠</span>
                Esta forma de acesso ainda não está disponível para {userType}s.
              </p>
            )}
            {!isUnavailable && (
              <>
                <button type="button" className="link-btn" onClick={() => setAuthTab('forgot')}>
                  Esqueceu a senha?
                </button>
                <p className="footnote">
                  Não tem conta?{' '}
                  <button type="button" className="link-btn" onClick={() => setAuthTab('signup')}>
                    Criar conta
                  </button>
                </p>
              </>
            )}
          </form>
        )}

        {!isUnavailable && authTab === 'signup' && (
          <form className="auth-form" onSubmit={submitSignup}>
            <div className="screen-header">
              <h1 className="gradient-text">Criar conta</h1>
              <p>Junte-se à busca especializada da Unifor</p>
            </div>
            <Field icon={<User />} type="text" placeholder="Nome completo" value={form.name} onChange={update('name')} />
            <Field icon={<Mail />} type="email" placeholder="E-mail" value={form.email} onChange={update('email')} />
            <Field icon={<Lock />} type="password" placeholder="Criar senha" value={form.password} onChange={update('password')} />
            {error && <p className="form-error">{error}</p>}
            <button type="submit" className="btn btn-primary">
              <User size={16} /> Criar minha conta
            </button>
            <p className="footnote">
              Já tem conta?{' '}
              <button type="button" className="link-btn" onClick={() => setAuthTab('login')}>
                Entrar
              </button>
            </p>
          </form>
        )}

        {!isUnavailable && authTab === 'forgot' && (
          <form className="auth-form" onSubmit={submitForgot}>
            <div className="icon-circle">
              <Key size={20} />
            </div>
            <div className="screen-header">
              <h1 className="gradient-text">Esqueceu a senha?</h1>
              <p>Informe seu e-mail para receber o link de redefinição</p>
            </div>
            <Field
              icon={<Mail />}
              type="email"
              placeholder="E-mail cadastrado"
              value={form.email}
              onChange={update('email')}
            />
            {error && <p className="form-error">{error}</p>}
            <button type="submit" className="btn btn-primary">
              <Send size={16} /> Enviar link de redefinição
            </button>
            <button type="button" className="link-btn" onClick={() => setAuthTab('login')}>
              Voltar para o login
            </button>
          </form>
        )}

      </section>
    </div>
  );
}
