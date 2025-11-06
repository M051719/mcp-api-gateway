import test from 'node:test';
import { strict as assert } from 'assert';
import { Client } from 'pg';

const dbUrl = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres';

let client;

test.before(async () => {
  client = new Client({ connectionString: dbUrl });
  await client.connect();
});

test.after(async () => {
  await client.end();
});

test('Migrations and seeds - umzug_migrations exists', async () => {
  const res = await client.query("SELECT to_regclass('public.umzug_migrations') as name");
  const name = res.rows[0].name;
  // Postgres may return 'umzug_migrations' or 'public.umzug_migrations'
  assert.ok(name && name.includes('umzug_migrations'));
});

test('Migrations and seeds - tables exist', async () => {
  const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('apis','users','api_keys','usage_logs')");
  const names = res.rows.map(r => r.table_name).sort();
  assert.deepEqual(names, ['api_keys','apis','usage_logs','users']);
});

test('Migrations and seeds - seed user exists', async () => {
  const res = await client.query("SELECT email FROM public.users WHERE email='admin@example.com'");
  assert.equal(res.rows.length, 1);
});

test('Migrations and seeds - unique indexes exist', async () => {
  const res = await client.query("SELECT indexname FROM pg_indexes WHERE schemaname='public' AND indexname IN ('idx_apis_name_unique','idx_api_keys_key_unique')");
  const names = res.rows.map(r => r.indexname).sort();
  assert.deepEqual(names, ['idx_api_keys_key_unique','idx_apis_name_unique']);
});
