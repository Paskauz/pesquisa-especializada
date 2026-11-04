const MESSAGES = {
  'auth/invalid-email': 'E-mail inválido.',
  'auth/missing-password': 'Informe a senha.',
  'auth/weak-password': 'A senha precisa ter pelo menos 6 caracteres.',
  'auth/email-already-in-use': 'Este e-mail já está cadastrado. Tente entrar.',
  'auth/invalid-credential': 'E-mail ou senha incorretos.',
  'auth/user-not-found': 'E-mail ou senha incorretos.',
  'auth/wrong-password': 'E-mail ou senha incorretos.',
  'auth/user-disabled': 'Esta conta foi desativada.',
  'auth/too-many-requests': 'Muitas tentativas. Aguarde um pouco e tente de novo.',
  'auth/network-request-failed': 'Sem conexão com o servidor. Verifique sua internet.',
  'auth/popup-closed-by-user': 'Login com Google cancelado.',
  'auth/cancelled-popup-request': 'Login com Google cancelado.',
  'auth/popup-blocked': 'O navegador bloqueou a janela do Google. Libere pop-ups e tente de novo.'
};

// Erros do Firebase têm .code; erros da nossa API já trazem a mensagem pronta.
export function friendlyError(err) {
  if (err?.code && MESSAGES[err.code]) return new Error(MESSAGES[err.code]);
  if (err?.code?.startsWith('auth/')) return new Error('Não foi possível autenticar. Tente novamente.');
  return err instanceof Error ? err : new Error('Erro inesperado. Tente novamente.');
}
