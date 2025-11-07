-- migrate_md5_roles.sql
-- This file lists roles with md5 hashed passwords and prints suggested ALTER ROLE statements.
-- WARNING: ALTER ROLE ... WITH PASSWORD must be executed with the new password you choose and will change authentication for apps.
-- Usage (dry-run): psql "$DATABASE_URL" -f scripts/migrate_md5_roles.sql

-- 1) List roles currently using md5
SELECT rolname, rolcanlogin, rolreplication
FROM pg_authid
WHERE rolcanlogin = true
  AND rolpassword LIKE 'md5%'
ORDER BY rolname;

-- 2) Generate suggested ALTER ROLE statements (NOTE: replace <NEW_PASSWORD> before running)
SELECT 'ALTER ROLE "' || rolname || '" WITH PASSWORD ' || quote_literal('<NEW_PASSWORD_FOR_'||rolname||'>') || ';' AS suggested_alter
FROM pg_authid
WHERE rolcanlogin = true
  AND rolpassword LIKE 'md5%'
ORDER BY rolname;

-- 3) After running ALTER ROLE, confirm new format by re-checking pg_authid
-- SELECT rolname, rolpassword FROM pg_authid WHERE rolname = 'some_role';
