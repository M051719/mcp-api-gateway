/**
 * Umzug migration: create apis table
 */
export async function up({ context: qi }) {
  // Use idempotent SQL so running the migration twice doesn't fail
  await qi.sequelize.query(`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE TABLE IF NOT EXISTS public.apis (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      config JSONB DEFAULT '{}',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
  `);
}

export async function down({ context: qi }) {
  await qi.dropTable('apis');
}
