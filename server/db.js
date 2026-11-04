import 'dotenv/config';

let mysql = null;
try {
  mysql = (await import('mysql2/promise')).default;
} catch {
  mysql = null;
}

export const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || ''
};

export const isDemoMode = !mysql;

export const pool = mysql ? mysql.createPool({
  ...dbConfig,
  database: process.env.DB_NAME || 'busca_especializada',
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10
}) : {
  async query() {
    throw new Error('MySQL indisponível. O modo demonstração está ativo para apresentação.');
  },
  async getConnection() {
    throw new Error('MySQL indisponível. O modo demonstração está ativo para apresentação.');
  }
};
