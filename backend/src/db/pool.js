import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import mockPool from './mockPool.js';

dotenv.config();

const USE_MOCK = String(process.env.USE_MOCK_DB).toLowerCase() === 'true';

/**
 * Shared MySQL connection pool.
 * mysql2/promise lets us use async/await + parameterized queries (?, ?)
 * which protect against SQL injection.
 *
 * When USE_MOCK_DB=true, we swap in an in-memory mock so the whole app
 * (auth + saving) works without a real MySQL server — handy for a quick
 * end-to-end test. Set it back to false to use real MySQL.
 */
const realPool = USE_MOCK
  ? null
  : mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'futureme',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      typeCast: true,
    });

const pool = USE_MOCK ? mockPool : realPool;

export async function assertDbConnection() {
  if (USE_MOCK) {
    console.log('🧪 Using IN-MEMORY mock database (USE_MOCK_DB=true). Data resets on restart.');
    return;
  }
  const conn = await pool.getConnection();
  try {
    await conn.ping();
    console.log(`✅ MySQL connected → ${process.env.DB_NAME}@${process.env.DB_HOST}`);
  } finally {
    conn.release();
  }
}

export default pool;
