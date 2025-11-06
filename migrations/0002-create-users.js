/**
 * Create users table
 */
export async function up({ context: qi }) {
  await qi.sequelize.query(`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE TABLE IF NOT EXISTS public.users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
  `);
}

export async function down({ context: qi }) {
  await qi.sequelize.query(`DROP TABLE IF EXISTS public.users;`);
}
