const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_SEARCH_LENGTH = 200;
const MAX_INTERESTS = 20;
const VALID_ICONS = new Set(['book', 'file', 'users', 'award', 'calendar', 'external']);

export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function normalizeEmail(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

export function validateEmail(value) {
  const email = normalizeEmail(value);
  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    throw new ValidationError('Informe um e-mail válido.');
  }
  return email;
}

export function validateCredentials(email, password) {
  const normalizedEmail = validateEmail(email);
  if (typeof password !== 'string' || password.length < 1) {
    throw new ValidationError('Informe sua senha.');
  }
  return { email: normalizedEmail, password };
}

export function validateSignupInput(name, email, password) {
  const normalizedName = typeof name === 'string' ? name.trim() : '';
  if (normalizedName.length < 2 || normalizedName.length > 100) {
    throw new ValidationError('Informe um nome com até 100 caracteres.');
  }
  const credentials = validateCredentials(email, password);
  if (password.length < 6 || password.length > 128) {
    throw new ValidationError('A senha precisa ter entre 6 e 128 caracteres.');
  }
  return { name: normalizedName, ...credentials };
}

export function validateProfileInput(profile) {
  const name = typeof profile?.name === 'string' ? profile.name.trim() : '';
  const email = validateEmail(profile?.email);
  const course = typeof profile?.course === 'string' ? profile.course.trim() : '';
  const matricula = typeof profile?.matricula === 'string' ? profile.matricula.trim() : '';
  const interests = profile?.interests;

  if (name.length < 2 || name.length > 100) {
    throw new ValidationError('Informe um nome com até 100 caracteres.');
  }
  if (!EMAIL_PATTERN.test(email)) throw new ValidationError('Informe um e-mail válido.');
  if (course.length > 120) throw new ValidationError('O curso pode ter até 120 caracteres.');
  if (matricula.length > 30) throw new ValidationError('A matrícula pode ter até 30 caracteres.');
  if (!Array.isArray(interests) || interests.length > MAX_INTERESTS ||
      interests.some((interest) => typeof interest !== 'string' || !interest.trim() || interest.length > 80)) {
    throw new ValidationError('Revise as áreas de interesse selecionadas.');
  }
  if (typeof profile.notificationsEmail !== 'boolean' ||
      typeof profile.notificationsDocAlerts !== 'boolean') {
    throw new ValidationError('As preferências de notificação são inválidas.');
  }

  return {
    name,
    email,
    course,
    matricula,
    interests: [...new Set(interests.map((interest) => interest.trim()))],
    notificationsEmail: profile.notificationsEmail,
    notificationsDocAlerts: profile.notificationsDocAlerts
  };
}

export function validateSearchTerm(value) {
  if (typeof value !== 'string') throw new ValidationError('O termo de busca precisa ser texto.');
  const term = value.trim().replace(/\s+/g, ' ');
  if (term.length > MAX_SEARCH_LENGTH) {
    throw new ValidationError(`A busca pode ter até ${MAX_SEARCH_LENGTH} caracteres.`);
  }
  return term;
}

function requireText(value, field, max = 500) {
  if (typeof value !== 'string' || !value.trim() || value.length > max) {
    throw new ValidationError(`Registro inválido no catálogo: ${field}.`);
  }
}

export function validateAreaRecord(record) {
  requireText(record?.name, 'área');
  return record;
}

export function validatePopularSearchRecord(record) {
  requireText(record?.term, 'termo popular', MAX_SEARCH_LENGTH);
  return record;
}

export function validateQuickResourceRecord(record) {
  for (const field of ['title', 'description', 'action']) requireText(record?.[field], field);
  if (!VALID_ICONS.has(record?.icon)) throw new ValidationError('Registro inválido no catálogo: ícone.');
  if (record.url) {
    let url;
    try { url = new URL(record.url); } catch { throw new ValidationError('Registro inválido no catálogo: URL.'); }
    if (url.protocol !== 'https:') throw new ValidationError('Registro inválido no catálogo: URL.');
  }
  return record;
}

export function validateEventRecord(record) {
  requireText(record?.title, 'evento');
  requireText(record?.place, 'local do evento');
  requireText(record?.tag, 'categoria do evento');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(record?.startDate || '') ||
      Number.isNaN(Date.parse(`${record.startDate}T00:00:00Z`))) {
    throw new ValidationError('Registro inválido no catálogo: data do evento.');
  }
  if (record.url) {
    let url;
    try { url = new URL(record.url); } catch { throw new ValidationError('Registro inválido no catálogo: URL do evento.'); }
    if (url.protocol !== 'https:') throw new ValidationError('Registro inválido no catálogo: URL do evento.');
  }
  return record;
}

export function validateDocumentRecord(record) {
  for (const field of ['title', 'type', 'author', 'area', 'source']) requireText(record?.[field], field, 1000);
  if (!Number.isInteger(Number(record?.year)) || Number(record.year) < 1900 || Number(record.year) > 2200) {
    throw new ValidationError('Registro inválido no catálogo: ano.');
  }
  if (record.url) {
    let url;
    try { url = new URL(record.url); } catch { throw new ValidationError('Registro inválido no catálogo: URL da publicação.'); }
    if (url.protocol !== 'https:') throw new ValidationError('Registro inválido no catálogo: URL da publicação.');
  }
  if (!Array.isArray(record.searchTokens) || !record.searchTokens.length ||
      record.searchTokens.some((token) => typeof token !== 'string' || !token.trim())) {
    throw new ValidationError('Registro inválido no catálogo: índice de busca.');
  }
  return record;
}