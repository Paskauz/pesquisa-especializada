import 'dotenv/config';
import mysql from 'mysql2/promise';

export const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || ''
};

export const pool = mysql.createPool({
  ...dbConfig,
  database: process.env.DB_NAME || 'busca_especializada',
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10
});
