import 'dotenv/config';
import { readFileSync } from 'node:fs';
import admin from 'firebase-admin';

// Chave de serviço do Firebase (Console > Configurações do projeto > Contas de serviço).
// Aponte o caminho do JSON em FIREBASE_SERVICE_ACCOUNT no .env. NUNCA suba esse arquivo no GitHub.
let instance = null;

export function firebaseAuth() {
  if (instance) return instance;
  const path = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!path) return null;
  admin.initializeApp({ credential: admin.credential.cert(JSON.parse(readFileSync(path, 'utf8'))) });
  instance = admin.auth();
  return instance;
}
