import pool from '../db/pool.js';

export async function createUser({ name, email, passwordHash }) {
  const [result] = await pool.execute(
    'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
    [name, email, passwordHash],
  );
  return { id: result.insertId, name, email };
}

export async function findUserByEmail(email) {
  const [rows] = await pool.execute(
    'SELECT id, name, email, password_hash FROM users WHERE email = ? LIMIT 1',
    [email],
  );
  return rows[0] || null;
}

export async function findUserById(id) {
  const [rows] = await pool.execute(
    'SELECT id, name, email, created_at FROM users WHERE id = ? LIMIT 1',
    [id],
  );
  return rows[0] || null;
}
