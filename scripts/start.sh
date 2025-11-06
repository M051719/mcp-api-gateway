#!/bin/sh
set -e

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
