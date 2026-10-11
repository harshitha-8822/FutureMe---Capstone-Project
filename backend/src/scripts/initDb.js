/**
 * Creates the database + tables from schema.sql.
 * Usage:  npm run db:init
 *
 * Connects WITHOUT a database selected first (multipleStatements enabled)
 * so the `CREATE DATABASE` statement in schema.sql can run.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');

async function run() {
  const sql = fs.readFileSync(schemaPath, 'utf8');

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  try {
    console.log('⏳ Running schema.sql ...');
    await conn.query(sql);
    console.log('✅ Database + tables created successfully.');
  } catch (err) {
    console.error('❌ Failed to initialise database:', err.message);
    process.exitCode = 1;
  } finally {
    await conn.end();
  }
}

run();
