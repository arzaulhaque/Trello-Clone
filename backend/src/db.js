'use strict';

const { Pool } = require('pg');

require('dotenv').config();

const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 5432,
        database: process.env.DB_NAME || 'trello_clone',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      }
);

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err);
});

/**
 * Execute a parameterised query.
 * @param {string} text
 * @param {unknown[]} [params]
 */
async function query(text, params) {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;
  if (process.env.NODE_ENV !== 'test') {
    console.log(`[db] ${text.slice(0, 80).replace(/\s+/g, ' ')} — ${duration}ms, rows: ${result.rowCount}`);
  }
  return result;
}

/**
 * Retrieve a single client from the pool (for transactions).
 */
function getClient() {
  return pool.connect();
}

module.exports = { query, getClient, pool };
