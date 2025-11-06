/**
 * Create api_keys table
 */
export async function up({ context: qi }) {
  await qi.sequelize.query(`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE TABLE IF NOT EXISTS public.api_keys (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
      key TEXT NOT NULL,
      revoked BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
  `);
}

export async function down({ context: qi }) {
  await qi.sequelize.query(`DROP TABLE IF EXISTS public.api_keys;`);
}
