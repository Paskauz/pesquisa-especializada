import crypto from 'node:crypto';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import { pool, isDemoMode } from './db.js';
import {
  DEMO_USER,
  ALL_INTERESTS,
  POPULAR_TAGS,
  QUICK_RESOURCES,
  EVENTS,
  DOCUMENTS
} from '../src/data/mockData.js';

const PROD = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT || 3001);
const APP_URL = process.env.APP_URL || 'http://localhost:5173';
const COOKIE = 'sid';
const SESSAO_DIAS = 7;
const MESES = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

const app = express();
app.use(express.json());
app.use(cookieParser());

const sha256 = (txt) => crypto.createHash('sha256').update(txt).digest('hex');
const handler = (fn) => (req, res, next) => fn(req, res, next).catch(next);
const emailValido = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e || '');
const iniciais = (nome) =>
  nome.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('');

const DEMO_USER_ID = 1;
const demoSessions = new Map();
const demoUsers = new Map([[DEMO_USER_ID, { ...DEMO_USER, id: DEMO_USER_ID }]]);
const demoModeForced = () => isDemoMode || ['1', 'true', 'yes'].includes(String(process.env.USE_DEMO || '').toLowerCase());

function serializarUsuario(usuario) {
  return {
    id: usuario.id,
    name: usuario.name,
    email: usuario.email,
    matricula: usuario.matricula || '',
    course: usuario.course || '',
    initials: usuario.initials || iniciais(usuario.name),
    notificationsEmail: Boolean(usuario.notificationsEmail),
    notificationsDocAlerts: Boolean(usuario.notificationsDocAlerts),
    interests: Array.isArray(usuario.interests) ? usuario.interests : []
  };
}

function demoUserByCredentials(identificador, senha) {
  const identifier = String(identificador || '').trim().toLowerCase();
  if (String(senha || '') !== DEMO_USER.password) return null;
  if (identifier === DEMO_USER.email.toLowerCase() || identifier === String(DEMO_USER.matricula)) {
    return demoUsers.get(DEMO_USER_ID);
  }
  return null;
}

function criarSessaoDemo(res, usuarioId) {
  const token = crypto.randomBytes(32).toString('hex');
  demoSessions.set(token, usuarioId);
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: PROD,
    maxAge: SESSAO_DIAS * 864e5
  });
  return token;
}

async function ensureDemoMode() {
  if (demoModeForced()) {
    return true;
  }
  try {
    await pool.query('SELECT 1');
    return false;
  } catch {
    console.warn('[demo-mode] MySQL indisponível. Utilizando dados locais para apresentação.');
    return true;
  }
}

// ---------- sessão ----------
async function criarSessao(req, res, usuarioId) {
  const token = crypto.randomBytes(32).toString('hex');
  await pool.query(
    `INSERT INTO sessoes (usuario_id, token_hash, user_agent, expira_em)
     VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL ? DAY))`,
    [usuarioId, sha256(token), (req.get('user-agent') || '').slice(0, 300), SESSAO_DIAS]
  );
  res.cookie(COOKIE, token, {
    httpOnly: true, sameSite: 'lax', secure: PROD, maxAge: SESSAO_DIAS * 864e5
  });
}

const exigirLogin = handler(async (req, res, next) => {
  if (await ensureDemoMode()) {
    const token = req.cookies[COOKIE];
    const usuarioId = demoSessions.get(token);
    if (usuarioId) {
      req.usuarioId = usuarioId;
      return next();
    }
    return res.status(401).json({ erro: 'Sessão expirada. Entre novamente.' });
  }

  const token = req.cookies[COOKIE];
  if (token) {
    const [rows] = await pool.query(
      `SELECT usuario_id FROM sessoes
       WHERE token_hash = ? AND revogada_em IS NULL AND expira_em > NOW()`,
      [sha256(token)]
    );
    if (rows.length) {
      req.usuarioId = rows[0].usuario_id;
      return next();
    }
  }
  res.status(401).json({ erro: 'Sessão expirada. Entre novamente.' });
});

// Monta o usuário no mesmo formato que o front já usava (DEMO_USER).
async function carregarUsuario(id) {
  if (await ensureDemoMode()) {
    const usuario = demoUsers.get(Number(id)) || demoUsers.get(DEMO_USER_ID);
    return usuario ? serializarUsuario(usuario) : null;
  }

  const [[u]] = await pool.query(
    `SELECT u.id, u.nome, u.email, u.matricula, c.nome AS curso, ce.sigla,
            p.notif_email, p.notif_alertas_docs
     FROM usuarios u
     LEFT JOIN cursos c  ON c.id = u.curso_id
     LEFT JOIN centros ce ON ce.id = c.centro_id
     LEFT JOIN preferencias_usuario p ON p.usuario_id = u.id
     WHERE u.id = ?`, [id]);
  if (!u) return null;
  const [areas] = await pool.query(
    `SELECT a.nome FROM usuario_areas ua JOIN areas a ON a.id = ua.area_id
     WHERE ua.usuario_id = ? ORDER BY a.nome`, [id]);
  return {
    name: u.nome,
    email: u.email,
    matricula: u.matricula || '',
    course: u.curso ? (u.sigla ? `${u.curso} - ${u.sigla}` : u.curso) : '',
    initials: iniciais(u.nome),
    notificationsEmail: Boolean(u.notif_email),
    notificationsDocAlerts: Boolean(u.notif_alertas_docs),
    interests: areas.map((a) => a.nome)
  };
}

// ---------- auth ----------
const auth = express.Router();

auth.post('/signup', handler(async (req, res) => {
  if (await ensureDemoMode()) {
    const { nome = '', email = '', senha = '' } = req.body;
    if (!nome.trim() || !emailValido(email) || senha.length < 6) {
      return res.status(400).json({ erro: 'Informe nome, e-mail válido e senha com 6+ caracteres.' });
    }
    const usuario = {
      id: Date.now(),
      name: nome.trim(),
      email: email.trim(),
      matricula: '',
      course: '',
      initials: iniciais(nome.trim()),
      notificationsEmail: true,
      notificationsDocAlerts: true,
      interests: []
    };
    demoUsers.set(usuario.id, usuario);
    criarSessaoDemo(res, usuario.id);
    return res.status(201).json({ usuario: serializarUsuario(usuario) });
  }

  const { nome = '', email = '', senha = '' } = req.body;
  if (!nome.trim() || !emailValido(email) || senha.length < 6) {
    return res.status(400).json({ erro: 'Informe nome, e-mail válido e senha com 6+ caracteres.' });
  }
  try {
    const hash = await bcrypt.hash(senha, 10);
    const [r] = await pool.query(
      'INSERT INTO usuarios (nome, email, senha_hash) VALUES (?, ?, ?)',
      [nome.trim(), email.trim(), hash]);
    await criarSessao(req, res, r.insertId);
    res.status(201).json({ usuario: await carregarUsuario(r.insertId) });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ erro: 'E-mail já cadastrado.' });
    throw err;
  }
}));

auth.post('/login', handler(async (req, res) => {
  const { identificador = '', senha = '' } = req.body;
  if (!identificador.trim() || !senha) {
    return res.status(400).json({ erro: 'Preencha e-mail/matrícula e senha para entrar.' });
  }

  if (await ensureDemoMode()) {
    const usuario = demoUserByCredentials(identificador, senha);
    if (!usuario) {
      return res.status(401).json({ erro: 'Credenciais inválidas.' });
    }
    criarSessaoDemo(res, usuario.id);
    return res.json({ usuario: serializarUsuario(usuario) });
  }

  const [rows] = await pool.query(
    `SELECT id, senha_hash, situacao FROM usuarios WHERE email = ? OR matricula = ? LIMIT 1`,
    [identificador.trim(), identificador.trim()]);
  const u = rows[0];
  const ok = u?.senha_hash && (await bcrypt.compare(senha, u.senha_hash));
  if (!ok) return res.status(401).json({ erro: 'Credenciais inválidas.' });
  if (u.situacao === 'inativo') return res.status(403).json({ erro: 'Conta inativa.' });
  await criarSessao(req, res, u.id);
  res.json({ usuario: await carregarUsuario(u.id) });
}));

auth.post('/logout', handler(async (req, res) => {
  if (await ensureDemoMode()) {
    const token = req.cookies[COOKIE];
    if (token) demoSessions.delete(token);
    res.clearCookie(COOKIE);
    return res.json({ ok: true });
  }

  const token = req.cookies[COOKIE];
  if (token) {
    await pool.query('UPDATE sessoes SET revogada_em = NOW() WHERE token_hash = ?', [sha256(token)]);
  }
  res.clearCookie(COOKIE);
  res.json({ ok: true });
}));

auth.post('/forgot', handler(async (req, res) => {
  const email = (req.body.email || '').trim();
  if (!emailValido(email)) return res.status(400).json({ erro: 'Informe o e-mail cadastrado.' });

  if (await ensureDemoMode()) {
    const token = crypto.randomBytes(32).toString('hex');
    console.log(`[redefinir senha] ${email}: ${APP_URL}/?reset=${token}`);
    return res.json({ mensagem: 'Se o e-mail estiver cadastrado, você receberá um link de redefinição.' });
  }

  const [rows] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
  if (rows.length) {
    const token = crypto.randomBytes(32).toString('hex');
    await pool.query(
      `INSERT INTO tokens_redefinicao_senha (usuario_id, token_hash, expira_em)
       VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR))`, [rows[0].id, sha256(token)]);
    console.log(`[redefinir senha] ${email}: ${APP_URL}/?reset=${token}`);
  }
  res.json({ mensagem: 'Se o e-mail estiver cadastrado, você receberá um link de redefinição.' });
}));

auth.post('/reset', handler(async (req, res) => {
  const { token = '', senha = '' } = req.body;
  if (senha.length < 6) return res.status(400).json({ erro: 'A senha precisa ter 6+ caracteres.' });

  if (await ensureDemoMode()) {
    if (!token || token.length < 8) {
      return res.status(400).json({ erro: 'Link inválido ou expirado.' });
    }
    return res.json({ ok: true });
  }

  const [rows] = await pool.query(
    `SELECT id, usuario_id FROM tokens_redefinicao_senha
     WHERE token_hash = ? AND usado_em IS NULL AND expira_em > NOW()`, [sha256(token)]);
  if (!rows.length) return res.status(400).json({ erro: 'Link inválido ou expirado.' });
  const hash = await bcrypt.hash(senha, 10);
  await pool.query('UPDATE usuarios SET senha_hash = ? WHERE id = ?', [hash, rows[0].usuario_id]);
  await pool.query('UPDATE tokens_redefinicao_senha SET usado_em = NOW() WHERE id = ?', [rows[0].id]);
  await pool.query('UPDATE sessoes SET revogada_em = NOW() WHERE usuario_id = ? AND revogada_em IS NULL',
    [rows[0].usuario_id]);
  res.json({ ok: true });
}));

app.use('/api/auth', auth);

// ---------- rotas protegidas ----------
const api = express.Router();
api.use(exigirLogin);

api.get('/me', handler(async (req, res) => {
  const usuario = await carregarUsuario(req.usuarioId);
  res.json({ usuario });
}));

api.put('/me', handler(async (req, res) => {
  if (await ensureDemoMode()) {
    const { name = '', email = '', course = '', interests = [],
            notificationsEmail = true, notificationsDocAlerts = true } = req.body;
    if (!name.trim() || !emailValido(email)) {
      return res.status(400).json({ erro: 'Informe nome e um e-mail válido.' });
    }
    const usuario = demoUsers.get(Number(req.usuarioId)) || demoUsers.get(DEMO_USER_ID);
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }
    const atualizado = {
      ...usuario,
      name: name.trim(),
      email: email.trim(),
      course: course.trim(),
      initials: iniciais(name.trim()),
      notificationsEmail: Boolean(notificationsEmail),
      notificationsDocAlerts: Boolean(notificationsDocAlerts),
      interests: Array.isArray(interests) ? interests : []
    };
    demoUsers.set(usuario.id, atualizado);
    return res.json({ usuario: serializarUsuario(atualizado) });
  }

  const { name = '', email = '', course = '', interests = [],
          notificationsEmail = true, notificationsDocAlerts = true } = req.body;
  if (!name.trim() || !emailValido(email)) {
    return res.status(400).json({ erro: 'Informe nome e um e-mail válido.' });
  }
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    let cursoId = null;
    const [nomeCurso, sigla] = course.split(' - ').map((s) => s.trim());
    if (nomeCurso) {
      let centroId = null;
      if (sigla) {
        const [c] = await conn.query('SELECT id FROM centros WHERE sigla = ?', [sigla]);
        centroId = c[0]?.id ?? (await conn.query(
          'INSERT INTO centros (sigla, nome) VALUES (?, ?)', [sigla, sigla]))[0].insertId;
      }
      const [cs] = await conn.query('SELECT id FROM cursos WHERE nome = ? AND centro_id <=> ?', [nomeCurso, centroId]);
      cursoId = cs[0]?.id ?? (await conn.query(
        'INSERT INTO cursos (nome, centro_id) VALUES (?, ?)', [nomeCurso, centroId]))[0].insertId;
    }

    await conn.query('UPDATE usuarios SET nome = ?, email = ?, curso_id = ? WHERE id = ?',
      [name.trim(), email.trim(), cursoId, req.usuarioId]);
    await conn.query(
      'UPDATE preferencias_usuario SET notif_email = ?, notif_alertas_docs = ? WHERE usuario_id = ?',
      [notificationsEmail ? 1 : 0, notificationsDocAlerts ? 1 : 0, req.usuarioId]);
    await conn.query('DELETE FROM usuario_areas WHERE usuario_id = ?', [req.usuarioId]);
    if (Array.isArray(interests) && interests.length) {
      await conn.query(
        'INSERT INTO usuario_areas (usuario_id, area_id) SELECT ?, id FROM areas WHERE nome IN (?)',
        [req.usuarioId, interests]);
    }
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ erro: 'E-mail já cadastrado.' });
    throw err;
  } finally {
    conn.release();
  }
  res.json({ usuario: await carregarUsuario(req.usuarioId) });
}));

api.get('/catalogo', handler(async (_req, res) => {
  if (await ensureDemoMode()) {
    const recursos = QUICK_RESOURCES.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      action: item.action,
      icon: item.icon,
      fonte: item.query || 'Biblioteca'
    }));
    return res.json({
      areas: ALL_INTERESTS,
      termosPopulares: POPULAR_TAGS,
      recursos,
      eventos: EVENTS.map((evento, index) => ({
        id: index + 1,
        title: evento.title,
        place: evento.place,
        tag: evento.tag,
        day: evento.day,
        month: evento.month
      }))
    });
  }

  const [areas] = await pool.query('SELECT nome FROM areas ORDER BY nome');
  const [populares] = await pool.query('SELECT termo FROM termos_populares LIMIT 4');
  const [recursos] = await pool.query(
    `SELECT r.slug AS id, r.titulo AS title, r.descricao AS description,
            r.acao_label AS action, r.icone AS icon, f.nome AS fonte
     FROM recursos_rapidos r LEFT JOIN fontes f ON f.id = r.filtro_fonte_id
     WHERE r.ativo = 1 ORDER BY r.ordem`);
  const [eventos] = await pool.query(
    `SELECT e.id, e.titulo, e.local, c.nome AS tag, e.inicia_em
     FROM eventos e JOIN categorias_evento c ON c.id = e.categoria_id
     WHERE e.ativo = 1 AND e.inicia_em >= CURDATE() ORDER BY e.inicia_em LIMIT 4`);
  res.json({
    areas: areas.map((a) => a.nome),
    termosPopulares: populares.map((p) => p.termo),
    recursos,
    eventos: eventos.map((e) => ({
      id: e.id, title: e.titulo, place: e.local, tag: e.tag,
      day: String(e.inicia_em.getDate()).padStart(2, '0'),
      month: MESES[e.inicia_em.getMonth()]
    }))
  });
}));

const like = (t) => `%${t.replace(/[\\%_]/g, '\\$&')}%`;

api.get('/documentos', handler(async (req, res) => {
  if (await ensureDemoMode()) {
    const q = String(req.query.q || '').trim();
    const fonte = String(req.query.fonte || '').trim();
    const filtered = DOCUMENTS.filter((doc) => {
      const matchesQuery = !q || [doc.title, doc.type, doc.author, doc.area, doc.source].some((value) =>
        String(value).toLowerCase().includes(q.toLowerCase()));
      const matchesFonte = !fonte || doc.source.toLowerCase() === fonte.toLowerCase();
      return matchesQuery && matchesFonte;
    });
    return res.json({ documentos: filtered });
  }

  const q = String(req.query.q || '').trim().slice(0, 200);
  const fonte = String(req.query.fonte || '').trim();
  const termos = q.split(/\s+/).filter(Boolean).slice(0, 8);

  const where = ['d.publicado = 1'];
  const params = [];
  for (const t of termos) {
    where.push(`(d.titulo LIKE ? OR d.resumo LIKE ? OR a.nome LIKE ? OR tp.nome LIKE ? OR f.nome LIKE ?
      OR EXISTS (SELECT 1 FROM documento_autores x JOIN autores au ON au.id = x.autor_id
                 WHERE x.documento_id = d.id AND au.nome LIKE ?))`);
    params.push(...Array(6).fill(like(t)));
  }
  if (fonte) { where.push('f.nome = ?'); params.push(fonte); }

  const [docs] = await pool.query(
    `SELECT d.id, d.titulo AS title, tp.nome AS type, d.ano AS year, a.nome AS area, f.nome AS source,
            (SELECT GROUP_CONCAT(au.nome ORDER BY x.ordem SEPARATOR ', ')
               FROM documento_autores x JOIN autores au ON au.id = x.autor_id
              WHERE x.documento_id = d.id) AS author
     FROM documentos d
     JOIN tipos_documento tp ON tp.id = d.tipo_id
     JOIN fontes f ON f.id = d.fonte_id
     JOIN areas a ON a.id = d.area_id
     WHERE ${where.join(' AND ')}
     ORDER BY d.ano DESC, d.id LIMIT 50`, params);

  if (q) {
    await pool.query('INSERT INTO historico_buscas (usuario_id, termo, qtd_resultados) VALUES (?, ?, ?)',
      [req.usuarioId, q, docs.length]);
  }
  res.json({ documentos: docs });
}));

app.use('/api', api);
app.use('/api', (_req, res) => res.status(404).json({ erro: 'Rota não encontrada.' }));

const dist = fileURLToPath(new URL('../dist', import.meta.url));
if (existsSync(dist)) {
  app.use(express.static(dist));
  app.get('/{*splat}', (_req, res) => res.sendFile(`${dist}/index.html`));
}

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ erro: 'Erro interno do servidor.' });
});

app.listen(PORT, () => console.log(`API em http://localhost:${PORT}`));
