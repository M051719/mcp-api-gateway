/**
 * Migration 0006: ensure required Postgres extensions exist.
 * Seed data has been moved to dedicated seed files under /seeds.
 */
export async function up({ context: qi }) {
  // Keep this migration minimal and idempotent: only create extensions.
  await qi.sequelize.query(`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS pgcrypto;
  `);
}

export async function down({ context: qi }) {
  // Do not drop extensions in down migration to avoid accidental data loss in shared DBs.
  return;
}
