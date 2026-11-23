import { updateEmail, updateProfile } from 'firebase/auth';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  where
} from 'firebase/firestore';
import { auth, db, firebaseReady } from './firebase.js';
import {
  normalizeEmail,
  validateAreaRecord,
  validateDocumentRecord,
  validateEventRecord,
  validatePopularSearchRecord,
  validateProfileInput,
  validateQuickResourceRecord,
  validateSearchTerm
} from './lib/validation.js';

const requireFirebase = () => {
  if (!firebaseReady || !auth || !db) {
    throw new Error('Firebase não configurado. Preencha as variáveis VITE_FIREBASE_* no arquivo .env.');
  }
};

const initials = (name = '') =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join('');

const normalizeText = (value) => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase();

const tokenize = (value) => normalizeText(value)
  .split(/[^\p{L}\p{N}]+/u)
  .filter(Boolean);

function profileFrom(uid, data = {}, authUser = auth?.currentUser) {
  const name = data.name || authUser?.displayName || authUser?.email?.split('@')[0] || '';
  return {
    id: uid,
    name,
    email: normalizeEmail(authUser?.email || data.email || ''),
    matricula: data.matricula || '',
    course: data.course || '',
    initials: data.initials || initials(name),
    notificationsEmail: data.notificationsEmail ?? true,
    notificationsDocAlerts: data.notificationsDocAlerts ?? true,
    interests: Array.isArray(data.interests) ? data.interests : []
  };
}

export async function getUserProfile(user) {
  requireFirebase();
  if (!user?.uid || !normalizeEmail(user.email)) {
    throw new Error('A conta autenticada não possui UID ou e-mail válidos.');
  }
  const ref = doc(db, 'users', user.uid);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) {
    const profile = profileFrom(user.uid, {}, user);
    validateProfileInput(profile);
    await setDoc(ref, {
      name: profile.name,
      email: user.email || '',
      matricula: '',
      course: '',
      notificationsEmail: true,
      notificationsDocAlerts: true,
      interests: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return profile;
  }
  const profile = profileFrom(user.uid, snapshot.data(), user);
  validateProfileInput(profile);
  return profile;
}

export async function saveUserProfile(user, changes) {
  requireFirebase();
  if (!user?.uid) throw new Error('Sessão Firebase não encontrada. Entre novamente.');
  const validated = validateProfileInput(changes);
  const { name, email } = validated;

  if (email !== user.email) await updateEmail(user, email);
  if (name !== user.displayName) await updateProfile(user, { displayName: name });

  const profile = profileFrom(user.uid, {
    ...validated,
    name,
    email,
    initials: initials(name)
  }, user);
  await setDoc(doc(db, 'users', user.uid), {
    name,
    email,
    matricula: String(changes.matricula || '').trim(),
    course: validated.course,
    initials: profile.initials,
    notificationsEmail: validated.notificationsEmail,
    notificationsDocAlerts: validated.notificationsDocAlerts,
    interests: validated.interests,
    updatedAt: serverTimestamp()
  }, { merge: true });

  return { ...profile, email: user.email || email, name: user.displayName || name };
}

async function loadCollection(name) {
  const snapshot = await getDocs(collection(db, name));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export async function loadCatalog() {
  requireFirebase();
  const [areas, popularSearches, quickResources, events] = await Promise.all([
    loadCollection('areas'),
    loadCollection('popularSearches'),
    loadCollection('quickResources'),
    loadCollection('events')
  ]);
  if (!areas.length || !quickResources.length) {
    throw new Error('O catálogo do Firestore está vazio. Execute npm run sync:catalog.');
  }
  const validAreas = areas.map(validateAreaRecord);
  const validPopularSearches = popularSearches.map(validatePopularSearchRecord);
  const validResources = quickResources.map(validateQuickResourceRecord);
  const today = new Date().toISOString().slice(0, 10);
  const validEvents = events.map(validateEventRecord).filter((event) => event.startDate >= today);
  return {
    areas: validAreas.map((item) => item.name).sort((a, b) => a.localeCompare(b, 'pt-BR')),
    termosPopulares: validPopularSearches
      .sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0))
      .map((item) => item.term),
    recursos: validResources
      .map(({ id, title, description, action, icon, query: searchQuery, fonte }) => ({
        id, title, description, action, icon, query: searchQuery || '', fonte: fonte || '',
        url: quickResources.find((item) => item.id === id)?.url || ''
      }))
      .sort((a, b) => a.title.localeCompare(b.title, 'pt-BR')),
    eventos: validEvents
      .map((event) => ({
        id: event.id,
        title: event.title,
        place: event.place,
        tag: event.tag,
        day: event.startDate.slice(8, 10),
        month: new Date(`${event.startDate}T00:00:00Z`)
          .toLocaleDateString('pt-BR', { month: 'short', timeZone: 'UTC' })
          .replace('.', '')
          .toUpperCase(),
        url: event.url,
        startDate: event.startDate
      }))
      .sort((a, b) => a.startDate.localeCompare(b.startDate))
  };
}

export async function searchDocuments(searchTerm = '', source = '') {
  requireFirebase();
  const normalizedTerm = validateSearchTerm(searchTerm);
  const normalizedSource = validateSearchTerm(source);
  const terms = [...new Set(tokenize(normalizedTerm))].slice(0, 10);
  const documentsRef = collection(db, 'documents');
  const constraints = terms.length
    ? [where('searchTokens', 'array-contains-any', terms), limit(500)]
    : [limit(50)];
  const snapshot = await getDocs(query(documentsRef, ...constraints));

  return snapshot.docs
    .map((item) => ({ id: item.id, ...item.data() }))
    .map(validateDocumentRecord)
    .filter((item) => {
      const tokens = Array.isArray(item.searchTokens) ? item.searchTokens : tokenize(
        [item.title, item.type, item.author, item.area, item.source].join(' ')
      );
      return terms.every((term) => tokens.includes(term)) &&
        (!normalizedSource || normalizeText(item.source) === normalizeText(normalizedSource));
    })
    .sort((a, b) => Number(b.year || 0) - Number(a.year || 0))
    .slice(0, 50)
    .map(({ searchTokens: _searchTokens, ...item }) => item);
}

export async function recordSearch(userId, term, resultCount) {
  requireFirebase();
  const validatedTerm = validateSearchTerm(term);
  if (!validatedTerm) return;
  if (!userId || !Number.isInteger(resultCount) || resultCount < 0 || resultCount > 50) {
    throw new Error('Dados inválidos para registrar a busca.');
  }
  await addDoc(collection(db, 'users', userId, 'searchHistory'), {
    term: validatedTerm,
    resultCount,
    createdAt: serverTimestamp()
  });
}
