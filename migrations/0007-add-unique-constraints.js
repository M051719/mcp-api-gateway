/**
 * Add unique constraints to apis.name and api_keys.key
 */
export async function up({ context: qi }) {
  await qi.sequelize.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_apis_name_unique') THEN
        CREATE UNIQUE INDEX idx_apis_name_unique ON public.apis (name);
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_api_keys_key_unique') THEN
        CREATE UNIQUE INDEX idx_api_keys_key_unique ON public.api_keys (key);
      END IF;
    END$$;
  `);
}

export async function down({ context: qi }) {
  await qi.sequelize.query(`
    DROP INDEX IF EXISTS public.idx_apis_name_unique;
    DROP INDEX IF EXISTS public.idx_api_keys_key_unique;
  `);
}
