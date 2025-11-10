#!/bin/sh
set -e

# Wait for database to be reachable before running migrations/app
echo "Waiting for database to accept connections..."
ATTEMPTS=${DB_WAIT_ATTEMPTS:-30}
SLEEP_SECS=${DB_WAIT_SLEEP_SECS:-2}
COUNT=0

wait_for_db() {
  # Use node to test DB connectivity via our config (ESM)
  node --input-type=module -e "import('/app/config/database.js').then(m=>m.default.authenticate()).then(()=>process.exit(0)).catch(()=>process.exit(1))" >/dev/null 2>&1
}

until wait_for_db; do
  COUNT=$((COUNT+1))
  if [ "$COUNT" -ge "$ATTEMPTS" ]; then
    echo "Database not ready after $ATTEMPTS attempts; continuing anyway."
    break
  fi
  echo "DB not ready yet (attempt $COUNT/$ATTEMPTS). Sleeping ${SLEEP_SECS}s..."
  sleep "$SLEEP_SECS"
done

echo "Checking RUN_MIGRATIONS (default: true)..."
if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  echo "Running DB migrations (Umzug)..."
  if [ -f /app/scripts/migrate.js ]; then
    node /app/scripts/migrate.js up || true
  fi
else
  echo "RUN_MIGRATIONS is not 'true' — skipping migrations."
fi

echo "Starting application..."
exec node /app/index.js
