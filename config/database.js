import { Sequelize } from 'sequelize';
import { resolveDatabaseUrl, sanitizeForLog, needsSsl } from './resolveDbUrl.js';

// Connection resolution order:
// 1. DATABASE_POOL_URL (preferred for Supabase pooled connections)
// 2. DATABASE_URL (direct connection)
// 3. Synthesized from POSTGRES_* env vars
// 4. Fallback to local docker dev default
const rawUrl = resolveDatabaseUrl();
const useSsl = needsSsl(rawUrl);

const sequelize = new Sequelize(rawUrl, {
  dialect: 'postgres',
  logging: process.env.SQL_LOGGING === 'true' ? console.log : false,
  pool: {
    max: parseInt(process.env.DB_POOL_MAX || '20', 10),
    min: parseInt(process.env.DB_POOL_MIN || '0', 10),
    acquire: parseInt(process.env.DB_POOL_ACQUIRE_MS || '60000', 10),
    idle: parseInt(process.env.DB_POOL_IDLE_MS || '10000', 10)
  },
  dialectOptions: {
    statement_timeout: parseInt(process.env.DB_STATEMENT_TIMEOUT_MS || '60000', 10),
    idle_in_transaction_session_timeout: parseInt(process.env.DB_IDLE_IN_TX_TIMEOUT_MS || '60000', 10),
    ssl: useSsl ? { require: true, rejectUnauthorized: process.env.DB_SSL_STRICT === 'true' } : undefined
  }
});

async function ensureExtensions() {
  // Some managed platforms (like Supabase) restrict CREATE EXTENSION; wrap in try/catch.
  const statements = [];
  // uuid-ossp for generating UUIDs
  statements.push('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  // pgcrypto for cryptographic functions (hashing, gen_random_uuid())
  statements.push('CREATE EXTENSION IF NOT EXISTS pgcrypto');
  // Optional pgjwt (Supabase sometimes provides automatically)
  if (process.env.ENABLE_PGJWT === 'true') {
    statements.push('CREATE EXTENSION IF NOT EXISTS pgjwt');
  }
  for (const stmt of statements) {
    try {
      await sequelize.query(stmt);
    } catch (err) {
      // Log at debug level only
      if (process.env.LOG_LEVEL === 'debug') {
        console.warn(`Extension init skipped for: ${stmt} -> ${err.message}`);
      }
    }
  }
}

export async function initializeDatabase() {
  console.log('[DB] Connecting:', sanitizeForLog(rawUrl));
  try {
    await sequelize.authenticate();
    console.log('[DB] Connection established');
    await ensureExtensions();
    if (process.env.NODE_ENV === 'test') {
      console.log('[DB] Test environment detected');
    }
    return true;
  } catch (error) {
    console.error('[DB] Connection failed:', error.message);
    if (process.env.LOG_LEVEL === 'debug') {
      console.error(error);
    }
    return false;
  }
}

export default sequelize;