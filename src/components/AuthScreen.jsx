import { useState } from 'react';
import {
  CreditCard,
  Key,
  Lock,
  LogIn,
  Mail,
  Search,
  Send,
  User
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

// Usuário criado pelo seed do banco (server/seed.mysql.sql).
const DEMO = { email: 'gabriel@edu.unifor.br', password: '123456', matricula: '2110482' };

function Field({ icon, ...inputProps }) {
  return (
    <div className="field">
      {icon}
      <input {...inputProps} />
    </div>
  );
}

export default function AuthScreen() {
  const { authTab, setAuthTab, signIn, signUp, forgotPassword } = useApp();
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    identifier: DEMO.email,
    password: DEMO.password,
    name: '',
    email: '',
    matricula: DEMO.matricula
  });

  const update = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
    setError('');
  };

  // Executa a chamada à API e mostra o erro do servidor no formulário.
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
    () => (!form.identifier.trim() || !form.password.trim() ? 'Preencha e-mail/usuário e senha para entrar.' : ''),
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

  const submitMatricula = run(
    () => (!form.matricula.trim() || !form.password.trim() ? 'Informe matrícula e senha institucional.' : ''),
    () => signIn(form.matricula, form.password)
  );

  return (
    <div className="auth-page">
      <div className="brand">
        <Search />
        <span>Busca especializada</span>
      </div>

      <section className="auth-card">
        {authTab === 'login' && (
          <form className="auth-form" onSubmit={submitLogin}>
            <div className="screen-header">
              <h1>Entrar</h1>
              <p>Acesse sua conta para continuar</p>
            </div>
            <Field
              icon={<Mail />}
              type="text"
              placeholder="E-mail ou usuário"
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
            <button type="submit" className="btn btn-primary">
              <LogIn size={16} /> Entrar
            </button>
            <button type="button" className="link-btn" onClick={() => setAuthTab('forgot')}>
              Esqueceu a senha?
            </button>
            <div className="divider">ou</div>
            <button type="button" className="btn btn-secondary" onClick={() => setAuthTab('matricula')}>
              <CreditCard size={16} /> Entrar com matrícula Unifor
            </button>
            <p className="footnote">
              Não tem conta?{' '}
              <button type="button" className="link-btn" onClick={() => setAuthTab('signup')}>
                Criar conta
              </button>
            </p>
          </form>
        )}

        {authTab === 'signup' && (
          <form className="auth-form" onSubmit={submitSignup}>
            <div className="screen-header">
              <h1>Criar conta</h1>
              <p>Preencha os dados para se cadastrar</p>
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

        {authTab === 'forgot' && (
          <form className="auth-form" onSubmit={submitForgot}>
            <div className="icon-circle">
              <Key size={20} />
            </div>
            <div className="screen-header">
              <h1>Esqueceu a senha?</h1>
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

        {authTab === 'matricula' && (
          <form className="auth-form" onSubmit={submitMatricula}>
            <div className="icon-circle">
              <CreditCard size={20} />
            </div>
            <div className="screen-header">
              <h1>Entrar com matrícula Unifor</h1>
              <p>Use sua matrícula e senha institucional</p>
            </div>
            <Field
              icon={<CreditCard />}
              type="text"
              placeholder="Matrícula Unifor"
              value={form.matricula}
              onChange={update('matricula')}
            />
            <Field
              icon={<Lock />}
              type="password"
              placeholder="Senha"
              value={form.password}
              onChange={update('password')}
            />
            {error && <p className="form-error">{error}</p>}
            <button type="submit" className="btn btn-primary">
              <LogIn size={16} /> Entrar
            </button>
            <button type="button" className="link-btn" onClick={() => setAuthTab('login')}>
              Voltar para o login
            </button>
          </form>
        )}
      </section>

      <p className="demo-hint">
        Demo: use {DEMO.email} / {DEMO.password} (usuário criado pelo seed do banco).
      </p>
    </div>
  );
}
