# mcp-server-cfdi

## Overview: MCP server for CFDI 4.0 utilities

A local [MCP](https://modelcontextprotocol.io) server (stdio) that gives a
Claude agent three tools and one resource for CFDI 4.0 work. Everything runs
locally: no network, no credentials, no AWS.

```
                         ┌──────────── mcp-server-cfdi (stdio) ────────────┐
  Claude Code agent      │                                                 │
  (factufast harness) ──▶│  validate_rfc(rfc)        ─▶ rfc_validator.py   │
  or Claude Desktop      │  parse_cfdi_xml(xml)      ─▶ cfdi_parser.py     │
         ▲               │  list_pac_providers()     ─▶ reference.py       │
         │               │  resource cfdi://schema/4.0 ─▶ reference.py     │
         │               └───────────────────────┬─────────────────────────┘
         └──────────── JSON result ◀─────────────┘
                     { is_valid, rfc_type, errors } | { ok, emisor, receptor, ... }
```

## Why: dogfooding (the factufast harness uses this MCP itself)

The invoice flow burns a folio *before* calling Facturama, so bad data costs
a folio and a failed stamp. This server lets the agent check the data first,
while it builds or reviews a change:

```
  receptor data ──▶ validate_rfc ──✗──▶ stop: fix the data, no folio spent
                         │ ✓
                         ▼
                 crear_factura (Lambda) ──▶ Facturama timbra ──▶ CFDI XML
                                                                    │
                   parse_cfdi_xml ◀─────────────────────────────────┘
                         │
                         ▼
          emisor / receptor / totals / UUID match what was sent?
```

The project root `.mcp.json` registers this server for Claude Code, so any
session in this repo (architect, builder, reviewer) can call it.

## Installation (pip install -e .)

```bash
cd .harness/mcp-server-cfdi
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -e ".[dev]"
python -m mcp_server_cfdi.server   # waits on stdin; Ctrl+C to exit
```

`.mcp.json` launches `python -m mcp_server_cfdi.server` with the `python` on
your PATH. Install the package into that Python (or point `command` at
`.venv/Scripts/python.exe` / `.venv/bin/python`) so Claude Code can start it.
Run `claude mcp list` to confirm `cfdi-tools` is connected.

## Claude Desktop configuration (paste snippet, restart)

Merge `claude_desktop_config.example.json` into your Claude Desktop config
(`%APPDATA%\Claude\claude_desktop_config.json` on Windows,
`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS),
replace the path with your venv's Python, and restart Claude Desktop.

## Available tools

| Tool | Input | Returns |
|---|---|---|
| `validate_rfc` | `rfc` | `is_valid`, `rfc_type` (`persona_fisica` 13 chars, `persona_moral` 12, `generico`), `errors` |
| `parse_cfdi_xml` | `xml_content` | `ok`, `errors`, `comprobante`, `emisor`, `receptor`, `conceptos[]`, `timbre` (UUID) |
| `list_pac_providers` | none | The PAC factufast uses (Facturama) plus other known PACs |

Limits, stated in each tool's description as well:

- `validate_rfc` checks format and date only. It runs no check-digit
  algorithm and doesn't query the SAT registry.
- `list_pac_providers` is an illustrative, static list. The SAT's published
  list of authorized PACs is authoritative.
- Error messages never echo the RFC or XML received (LFPDPPP, `AGENTS.md`
  rule 5).
- XML parsing never resolves external entities or touches the network
  (XXE-safe).

## Available resources

- `cfdi://schema/4.0`: the node and attribute layout of a CFDI 4.0
  (namespaces, Emisor, Receptor, Conceptos, TimbreFiscalDigital) and what
  changed from 3.3.

## Example prompts to invoke each tool

- *"Validate the RFC URE180429TM6 with cfdi-tools before we add it to the test event."*
- *"Parse `.harness/mcp-server-cfdi/tests/fixtures/cfdi_ejemplo.xml` and check whether the total matches subtotal + 16% IVA."*
- *"List the PAC providers. If we replaced Facturama, which alternatives are there?"*
- *"Read cfdi://schema/4.0 and tell me which receptor attributes are mandatory in 4.0."*

## Development (pytest, ruff)

```bash
pytest          # unit tests plus one end-to-end test over real stdio
ruff check .
```

`tests/test_server_stdio.py` starts the server as a subprocess and talks to
it with the official MCP client, the same way Claude Code does.

To check the real dogfooding path, run `bash scripts/dogfood_claude_code.sh`.
It starts a headless Claude Code session (`claude -p`) that calls every tool
and the resource through a temporary MCP config pointing at this venv, then
asserts on the results (fixture UUID, RFC type, PAC). It spends a small amount
of Claude usage, so it isn't part of `pytest`.
