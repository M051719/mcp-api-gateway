import url from 'node:url';

// Unified database URL resolution and logging utilities.
// Order of precedence:
// 1. TEST_DATABASE_URL (used explicitly for test contexts)
// 2. DATABASE_POOL_URL (preferred for pooled connections like Supabase)
// 3. DATABASE_URL (direct connection string)
// 4. POSTGRES_* discrete vars
// 5. Fallback local docker dev
export function resolveDatabaseUrl(env = process.env) {
  const {
    TEST_DATABASE_URL,
    DATABASE_POOL_URL,
    DATABASE_URL,
    POSTGRES_HOST,
    POSTGRES_PORT,
    POSTGRES_DB,
    POSTGRES_USER,
    POSTGRES_PASSWORD
  } = env;

  if (TEST_DATABASE_URL) return TEST_DATABASE_URL;
  if (DATABASE_POOL_URL) return DATABASE_POOL_URL;
  if (DATABASE_URL) return DATABASE_URL;
  if (POSTGRES_HOST && POSTGRES_PORT && POSTGRES_DB && POSTGRES_USER && POSTGRES_PASSWORD) {
    return `postgresql://${POSTGRES_USER}:${encodeURIComponent(POSTGRES_PASSWORD)}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}`;
  }
  return 'postgresql://postgres:postgres@db:5432/postgres';
}

export function sanitizeForLog(connectionString) {
  try {
    const parsed = new url.URL(connectionString);
    if (parsed.password) parsed.password = '***';
    return parsed.toString();
  } catch {
    return '***invalid-url***';
  }
}

export function needsSsl(connectionString, env = process.env) {
  return /supabase\.co/.test(connectionString) || /sslmode=require/.test(connectionString) || env.DATABASE_SSL === 'require';
}
