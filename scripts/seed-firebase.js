import { readFile } from 'node:fs/promises';
import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import {
  ALL_INTERESTS,
  DOCUMENTS,
  EVENTS,
  POPULAR_TAGS,
  QUICK_RESOURCES
} from '../src/data/catalogSeed.js';

const normalizeText = (value) => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase();

const tokenize = (value) => [...new Set(
  normalizeText(value).split(/[^\p{L}\p{N}]+/u).filter(Boolean)
)];

async function seedFirebase() {
  const credentialsPath = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!credentialsPath) {
    throw new Error('Defina FIREBASE_SERVICE_ACCOUNT com o caminho do JSON da conta de serviço.');
  }

  const serviceAccount = JSON.parse(await readFile(credentialsPath, 'utf8'));
  const app = initializeApp({
    credential: cert(serviceAccount),
    projectId: serviceAccount.project_id
  });
  try {
    const database = getFirestore(app);
    const records = [
      ...ALL_INTERESTS.map((name) => ['areas', name, { name }]),
      ...POPULAR_TAGS.map((term, index) => [
        'popularSearches',
        String(index + 1).padStart(2, '0'),
        { term, order: index }
      ]),
      ...QUICK_RESOURCES.map((resource) => [
        'quickResources',
        resource.id,
        resource
      ]),
      ...EVENTS.map((event, index) => [
        'events',
        String(index + 1).padStart(2, '0'),
        { ...event, order: index }
      ]),
      ...DOCUMENTS.map((document) => [
        'documents',
        String(document.id),
        {
          ...document,
          searchTokens: tokenize([
            document.title,
            document.type,
            document.author,
            document.area,
            document.source
          ].join(' '))
        }
      ])
    ];

    for (let offset = 0; offset < records.length; offset += 450) {
      const batch = database.batch();
      for (const [collectionName, id, data] of records.slice(offset, offset + 450)) {
        batch.set(database.collection(collectionName).doc(id), data, { merge: true });
      }
      await batch.commit();
    }

    console.log(`Catálogo Firebase carregado: ${records.length} documentos.`);
  } finally {
    await app.delete();
  }
}

seedFirebase().catch((error) => {
  console.error('Falha ao carregar o catálogo Firebase:', error.message);
  process.exitCode = 1;
});
