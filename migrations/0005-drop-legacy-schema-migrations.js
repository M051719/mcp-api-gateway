/**
 * Drop legacy schema_migrations table created by manual SQL runs
 */
export async function up({ context: qi }) {
  await qi.sequelize.query(`
    DROP TABLE IF EXISTS public.schema_migrations;
  `);
}

export async function down({ context: qi }) {
  // No-op: we don't recreate the legacy table
}
