/**
 * Create usage_logs table
 */
export async function up({ context: qi }) {
  await qi.sequelize.query(`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE TABLE IF NOT EXISTS public.usage_logs (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      api_id UUID REFERENCES public.apis(id) ON DELETE SET NULL,
      user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
      path TEXT,
      method TEXT,
      status INTEGER,
      duration_ms INTEGER,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
  `);
}

export async function down({ context: qi }) {
  await qi.sequelize.query(`DROP TABLE IF EXISTS public.usage_logs;`);
}
