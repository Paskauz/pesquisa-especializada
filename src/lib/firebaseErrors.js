import { ValidationError } from './validation.js';

const MESSAGES = {
  'auth/invalid-email': 'E-mail inválido.',
  'auth/missing-password': 'Informe a senha.',
  'auth/weak-password': 'A senha precisa ter pelo menos 6 caracteres.',
  'auth/operation-not-allowed': 'Habilite o acesso por e-mail e senha no Firebase Authentication.',
  'auth/email-already-in-use': 'Este e-mail já está cadastrado. Tente entrar.',
  'auth/account-exists-with-different-credential': 'Esta conta já está vinculada a outro método de login.',
  'auth/credential-already-in-use': 'Esta credencial institucional já está vinculada a outra conta.',
  'auth/tenant-id-mismatch': 'O provedor SSO não pertence a este projeto Firebase.',
  'auth/web-storage-unsupported': 'O navegador bloqueou o armazenamento necessário para o login institucional.',
  'auth/requires-recent-login': 'Entre novamente antes de alterar seu e-mail.',
  'auth/invalid-credential': 'E-mail ou senha incorretos.',
  'auth/user-not-found': 'E-mail ou senha incorretos.',
  'auth/wrong-password': 'E-mail ou senha incorretos.',
  'auth/user-disabled': 'Esta conta foi desativada.',
  'auth/too-many-requests': 'Muitas tentativas. Aguarde um pouco e tente de novo.',
  'auth/network-request-failed': 'Sem conexão com o servidor. Verifique sua internet.',
  'auth/unauthorized-domain': 'Este domínio não está autorizado nas configurações do Firebase Authentication.',
  'auth/invalid-api-key': 'A chave de API do Firebase está inválida. Confira o arquivo .env.',
  'auth/invalid-action-code': 'Este link expirou ou já foi usado.',
  'auth/expired-action-code': 'Este link expirou. Solicite outro.',
  'auth/quota-exceeded': 'O limite temporário de solicitações do Firebase foi atingido.',
  'permission-denied': 'Acesso negado. Confira as regras do Cloud Firestore.',
  unauthenticated: 'Sua sessão expirou. Entre novamente.',
  unavailable: 'Firebase indisponível. Verifique sua conexão e tente novamente.',
  'resource-exhausted': 'O limite de uso do Firebase foi atingido. Tente novamente mais tarde.',
  'failed-precondition': 'O Firebase exige configuração adicional para esta operação.'
};

// Converte códigos conhecidos do Firebase em mensagens compreensíveis na interface.
export function friendlyError(err) {
  if (err instanceof ValidationError) return err;
  if (err?.code && MESSAGES[err.code]) return new Error(MESSAGES[err.code]);
  if (typeof err?.code === 'string' && err.code.startsWith('auth/')) {
    return new Error('Não foi possível autenticar. Tente novamente.');
  }
  return err instanceof Error ? err : new Error('Erro inesperado. Tente novamente.');
}
