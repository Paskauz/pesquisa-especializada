// Cria o banco e carrega schema + seed:  npm run db:setup
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';
import { dbConfig } from './db.js';

const read = (name) => readFile(fileURLToPath(new URL(name, import.meta.url)), 'utf8');

const conn = await mysql.createConnection({ ...dbConfig, multipleStatements: true, charset: 'utf8mb4' });
try {
  await conn.query(await read('schema.mysql.sql'));
  await conn.query(await read('seed.mysql.sql'));
  console.log('Banco busca_especializada criado e populado.');
  console.log('Usuário demo: gabriel@edu.unifor.br / 123456');
} catch (err) {
  console.error('Falha ao preparar o banco:', err.message);
  process.exitCode = 1;
} finally {
  await conn.end();
}
