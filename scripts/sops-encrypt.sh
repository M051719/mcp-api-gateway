#!/usr/bin/env bash
# Usage: ./scripts/sops-encrypt.sh .env.production
set -euo pipefail
if [ $# -ne 1 ]; then
  echo "Usage: $0 <file-to-encrypt>"
  exit 2
fi
FILE="$1"
OUT="${FILE}.enc"

# Example: uses default sops configuration (.sops.yaml)
# Replace this command with your KMS provider options if needed
sops --encrypt "$FILE" > "$OUT"

echo "Encrypted $FILE -> $OUT"
