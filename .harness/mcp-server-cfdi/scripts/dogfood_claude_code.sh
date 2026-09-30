#!/usr/bin/env bash
# Dogfood check: a headless Claude Code session calls every cfdi-tools tool.
# Uses a temporary MCP config that points at this package's venv, so it does
# not depend on the global Python. Spends a small amount of Claude usage.
set -euo pipefail
cd "$(dirname "$0")/.."

ROOT="$(pwd -W 2>/dev/null || pwd)"  # Windows path under Git Bash
PY="$ROOT/.venv/Scripts/python.exe"
[ -f "$PY" ] || PY="$ROOT/.venv/bin/python"
CFG="$(mktemp)"
trap 'rm -f "$CFG"' EXIT
printf '{"mcpServers":{"cfdi-tools":{"command":"%s","args":["-m","mcp_server_cfdi.server"]}}}' "$PY" > "$CFG"

OUT="$(claude -p "Use only cfdi-tools. 1) validate_rfc with URE180429TM6 and with EKU9013173C9. \
2) Read tests/fixtures/cfdi_ejemplo.xml and pass it to parse_cfdi_xml. 3) list_pac_providers. \
4) Read the resource cfdi://schema/4.0. Reply with a short table: tool, input, key result, \
including the UUID from parse_cfdi_xml verbatim." \
  --mcp-config "$CFG" --strict-mcp-config --model sonnet \
  --allowedTools "mcp__cfdi-tools__validate_rfc,mcp__cfdi-tools__parse_cfdi_xml,mcp__cfdi-tools__list_pac_providers,ReadMcpResourceTool,ListMcpResourcesTool,Read" \
  < /dev/null)"
echo "$OUT"

check() { grep -q "$1" <<<"$OUT" && echo "[OK]   $2" || { echo "[FAIL] $2"; exit 1; }; }
check "6B1A7E2C-0000-4000-8000-000000000042" "parse_cfdi_xml returned the fixture UUID"
check "persona_moral" "validate_rfc classified the sandbox RFC"
check "Facturama" "list_pac_providers returned the provider in use"
