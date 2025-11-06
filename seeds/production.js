/**
 * Production seeds: minimal safe placeholder data
 */
export async function up({ sequelize }) {
  await sequelize.query(`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS pgcrypto;

    -- minimal admin placeholder
    INSERT INTO public.users (email, password_hash, created_at, updated_at)
    SELECT 'admin@example.com', 'changeme', now(), now()
    WHERE NOT EXISTS (SELECT 1 FROM public.users WHERE email = 'admin@example.com');
  `);
}

export async function down({ sequelize }) {
  await sequelize.query(`DELETE FROM public.users WHERE email = 'admin@example.com';`);
}
