#!/usr/bin/env bash
# Environment gate — run before every build.
# Exits non-zero if any required tool or credential is missing.
# Called by Builder before writing any code.

set -euo pipefail

PASS=0
FAIL=0

check() {
  local name=$1 cmd=$2
  if eval "$cmd" &>/dev/null; then
    echo "  ✓ $name"
  else
    echo "  ✗ $name — MISSING"
    FAIL=$((FAIL + 1))
  fi
}

echo "=== FactuFastAI Environment Gate ==="
echo ""

echo "→ Tools"
check "Python 3.12"      "python --version 2>&1 | grep -E '3\\.12'"
check "AWS CLI"          "aws --version"
check "AWS SAM CLI"      "sam --version"
check "Node.js (≥18)"    "node --version 2>&1 | grep -E 'v(1[89]|[2-9][0-9])'"
check "git"              "git --version"

echo ""
echo "→ AWS Credentials"
check "AWS credentials"  "aws sts get-caller-identity"

echo ""
echo "→ SSM Parameters (sandbox)"
check "/factufast/facturama_user"  "aws ssm get-parameter --name /factufast/facturama_user --with-decryption"
check "/factufast/facturama_pass"  "aws ssm get-parameter --name /factufast/facturama_pass --with-decryption"
check "/factufast/ses_from_email"  "aws ssm get-parameter --name /factufast/ses_from_email"

echo ""
echo "→ Project Structure"
check "backend/template.yaml"           "test -f backend/template.yaml"
check "backend/src/handlers/"           "test -d backend/src/handlers"
check "proyecto-facturacion-mvp.md"     "test -f proyecto-facturacion-mvp.md"
check ".harness/state/tasks.json"       "test -f .harness/state/tasks.json"

echo ""
if [ $FAIL -eq 0 ]; then
  echo "=== GATE PASSED — $(( $(grep -c '✓' <<< "$(echo $PASS)") + 0 )) checks OK ==="
  exit 0
else
  echo "=== GATE FAILED — $FAIL check(s) missing ==="
  echo "Fix the above before proceeding."
  exit 1
fi
