#!/usr/bin/env bash
# Usage: ./scripts/sops-decrypt.sh .env.production.enc
set -euo pipefail
if [ $# -ne 1 ]; then
  echo "Usage: $0 <file-to-decrypt>"
  exit 2
fi
FILE="$1"
OUT="${FILE%.enc}"

sops --decrypt "$FILE" > "$OUT"

echo "Decrypted $FILE -> $OUT"
