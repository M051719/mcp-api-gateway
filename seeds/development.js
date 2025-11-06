/**
 * Development seeds: idempotent inserts for dev/test
 */
export async function up({ sequelize }) {
  await sequelize.query(`
    -- ensure extensions
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS pgcrypto;

    -- admin user
    INSERT INTO public.users (email, password_hash, created_at, updated_at)
    SELECT 'admin@example.com', 'changeme', now(), now()
    WHERE NOT EXISTS (SELECT 1 FROM public.users WHERE email = 'admin@example.com');

    -- example api
    INSERT INTO public.apis (name, config, created_at, updated_at)
    SELECT 'example-api', '{}'::jsonb, now(), now()
    WHERE NOT EXISTS (SELECT 1 FROM public.apis WHERE name = 'example-api');

    -- api key
    INSERT INTO public.api_keys (user_id, key, revoked, created_at)
    SELECT u.id, 'initial-key-123', false, now()
    FROM public.users u
    WHERE u.email = 'admin@example.com'
      AND NOT EXISTS (SELECT 1 FROM public.api_keys k WHERE k.key = 'initial-key-123');

    -- sample usage log
    INSERT INTO public.usage_logs (api_id, user_id, path, method, status, duration_ms, created_at)
    SELECT a.id, u.id, '/test', 'GET', 200, 123, now()
    FROM public.apis a, public.users u
    WHERE a.name = 'example-api' AND u.email = 'admin@example.com'
      AND NOT EXISTS (
        SELECT 1 FROM public.usage_logs l
        WHERE l.path = '/test' AND l.user_id = u.id
      );
  `);
}

export async function down({ sequelize }) {
  await sequelize.query(`
    DELETE FROM public.usage_logs WHERE path = '/test';
    DELETE FROM public.api_keys WHERE key = 'initial-key-123';
    DELETE FROM public.apis WHERE name = 'example-api';
    DELETE FROM public.users WHERE email = 'admin@example.com';
  `);
}
