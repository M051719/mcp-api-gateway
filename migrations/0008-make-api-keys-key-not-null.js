/**
 * Migration 0008: Ensure api_keys.key is NOT NULL.
 * - Update any existing NULL keys to a generated value.
 * - Alter column to set NOT NULL.
 */
export async function up({ context: qi }) {
  // Use pgcrypto's gen_random_uuid() if available; fall back to uuid_generate_v4().
  await qi.sequelize.query(`
    -- populate any NULL keys with a generated UUID string
    UPDATE public.api_keys
    SET key = COALESCE(key, (
      CASE
        WHEN (SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto') IS NOT NULL
          THEN gen_random_uuid()::text
        ELSE uuid_generate_v4()::text
      END
    ))
    WHERE key IS NULL;

    -- set NOT NULL constraint (idempotent)
    ALTER TABLE IF EXISTS public.api_keys
    ALTER COLUMN key SET NOT NULL;
  `);
}

export async function down({ context: qi }) {
  // Revert NOT NULL constraint if needed
  await qi.sequelize.query(`
    ALTER TABLE IF EXISTS public.api_keys
    ALTER COLUMN key DROP NOT NULL;
  `);
}
