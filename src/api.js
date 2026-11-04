import {
  DEMO_USER,
  ALL_INTERESTS,
  POPULAR_TAGS,
  QUICK_RESOURCES,
  EVENTS,
  DOCUMENTS
} from './data/mockData.js';

const STORAGE_KEY = 'pesquisa-especializada-demo-user';

const normalizeUser = (usuario = DEMO_USER) => ({
  id: usuario.id ?? 1,
  name: usuario.name ?? 'Gabriel Silva',
  email: usuario.email ?? 'gabriel@edu.unifor.br',
  matricula: usuario.matricula ?? '2110482',
  course: usuario.course ?? 'Ciência da Computação - CCT',
  initials: usuario.initials ?? 'GS',
  notificationsEmail: Boolean(usuario.notificationsEmail ?? true),
  notificationsDocAlerts: Boolean(usuario.notificationsDocAlerts ?? true),
  interests: Array.isArray(usuario.interests) ? usuario.interests : ['Inteligência Artificial', 'Engenharia de Software']
});

const readStoredUser = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? normalizeUser(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
};

let mockSessionUser = readStoredUser();

const persistMockUser = (usuario) => {
  if (!usuario) {
    localStorage.removeItem(STORAGE_KEY);
    mockSessionUser = null;
    return;
  }
  mockSessionUser = normalizeUser(usuario);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockSessionUser));
};

const mockCatalog = {
  areas: ALL_INTERESTS,
  termosPopulares: POPULAR_TAGS,
  recursos: QUICK_RESOURCES.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    action: item.action,
    icon: item.icon,
    fonte: item.query || 'Biblioteca'
  })),
  eventos: EVENTS.map((evento, index) => ({
    id: index + 1,
    title: evento.title,
    place: evento.place,
    tag: evento.tag,
    day: evento.day,
    month: evento.month
  }))
};

const mockDocuments = (q = '', fonte = '') => {
  const query = String(q || '').trim().toLowerCase();
  const sourceFilter = String(fonte || '').trim().toLowerCase();

  return DOCUMENTS.filter((doc) => {
    const matchesQuery = !query || [doc.title, doc.type, doc.author, doc.area, doc.source].some((value) =>
      String(value).toLowerCase().includes(query)
    );
    const matchesFonte = !sourceFilter || String(doc.source).toLowerCase() === sourceFilter;
    return matchesQuery && matchesFonte;
  });
};

const mockApi = (path, { method = 'GET', body } = {}) => {
  const route = String(path || '').replace(/^\/+/, '');

  if (route === 'auth/login') {
    const payload = body ? JSON.parse(body) : {};
    const identificador = String(payload.identificador || '').trim().toLowerCase();
    const senha = String(payload.senha || '');
    const loginMatches =
      (identificador === DEMO_USER.email.toLowerCase() || identificador === String(DEMO_USER.matricula)) &&
      senha === DEMO_USER.password;

    if (!loginMatches) {
      throw Object.assign(new Error('Credenciais inválidas.'), { status: 401 });
    }

    const usuario = normalizeUser(DEMO_USER);
    persistMockUser(usuario);
    return { usuario };
  }

  if (route === 'auth/signup') {
    const payload = body ? JSON.parse(body) : {};
    const name = String(payload.nome || '').trim();
    const email = String(payload.email || '').trim();
    const senha = String(payload.senha || '');

    if (!name || !email || senha.length < 6) {
      throw Object.assign(new Error('Informe nome, e-mail válido e senha com 6+ caracteres.'), { status: 400 });
    }

    const usuario = normalizeUser({
      id: Date.now(),
      name,
      email,
      matricula: '',
      course: '',
      initials: name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join(''),
      notificationsEmail: true,
      notificationsDocAlerts: true,
      interests: []
    });
    persistMockUser(usuario);
    return { usuario };
  }

  if (route === 'auth/logout') {
    persistMockUser(null);
    return { ok: true };
  }

  if (route === 'auth/forgot') {
    return { mensagem: 'Se o e-mail estiver cadastrado, você receberá um link de redefinição.' };
  }

  if (route === 'me' && method === 'GET') {
    if (!mockSessionUser) {
      throw Object.assign(new Error('Sessão expirada. Entre novamente.'), { status: 401 });
    }
    return { usuario: mockSessionUser };
  }

  if (route === 'me' && method === 'PUT') {
    const payload = body ? JSON.parse(body) : {};
    if (!mockSessionUser) {
      throw Object.assign(new Error('Sessão expirada. Entre novamente.'), { status: 401 });
    }

    const usuario = normalizeUser({
      ...mockSessionUser,
      ...payload,
      name: String(payload.name || mockSessionUser.name || '').trim(),
      email: String(payload.email || mockSessionUser.email || '').trim(),
      course: String(payload.course || mockSessionUser.course || '').trim(),
      notificationsEmail: Boolean(payload.notificationsEmail ?? mockSessionUser.notificationsEmail ?? true),
      notificationsDocAlerts: Boolean(payload.notificationsDocAlerts ?? mockSessionUser.notificationsDocAlerts ?? true),
      interests: Array.isArray(payload.interests) ? payload.interests : mockSessionUser.interests
    });
    persistMockUser(usuario);
    return { usuario };
  }

  if (route === 'catalogo') {
    return mockCatalog;
  }

  if (route.startsWith('documentos')) {
    const searchParams = new URLSearchParams(String(path.split('?')[1] || ''));
    return { documentos: mockDocuments(searchParams.get('q') || '', searchParams.get('fonte') || '') };
  }

  throw Object.assign(new Error('Rota mock não encontrada.'), { status: 404 });
};

/* Cliente da API. Em dev o Vite encaminha /api para o servidor; quando ele não está disponível,
   cai para uma camada local de demonstração para apresentação. */
export async function api(path, { method = 'GET', body } = {}) {
  const requestInit = {
    method,
    credentials: 'same-origin',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined
  };

  try {
    const res = await fetch(`/api${path}`, requestInit);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw Object.assign(new Error(data.erro || 'Erro inesperado. Tente novamente.'), { status: res.status });
    }
    return data;
  } catch (err) {
    console.warn('[demo-fallback] usando dados locais para apresentação.', err);
    return mockApi(path, { method, body: body ? JSON.stringify(body) : undefined });
  }
}
