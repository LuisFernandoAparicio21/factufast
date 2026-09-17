# Fase 1 Spec — Validar Facturama standalone

## Exit Criteria

Terminal muestra un `folio_fiscal` UUID válido sin errores de Facturama.

## Verification Command

```bash
cd C:\Users\HP\Proyectos\Factufast
python scripts/test_timbrado.py
# Expected output: folio_fiscal: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

## Files to Create

- `scripts/cargar_csd.py`
- `scripts/test_timbrado.py`

## Files to NOT Touch

Everything else. Backend source, template.yaml, frontend — all off-limits.

## Design Decisions

**D1:** `load_dotenv()` is called before any import of `facturama.py`
- Rejected: calling dotenv after import
- Why: `facturama.py` reads `os.environ['FACTURAMA_USER']` at module load time; importing before dotenv runs causes `KeyError`

**D2:** `python-dotenv` in `requirements.txt` (root dev requirements) only
- Rejected: adding to `backend/layers/python/requirements.txt`
- Why: dotenv is dev-only; Lambda reads env vars from SSM-injected environment variables, not `.env` files

**D3:** `scripts/cargar_csd.py` reads CSD files from disk (absolute path or `scripts/` relative)
- Rejected: hardcoded base64 in the script
- Why: CSD files are in `.gitignore` and should not be embedded in source

## The Surface

### `scripts/cargar_csd.py`

```python
# Uploads CSD (cer + key + password) to Facturama Multi-issuer sandbox
# Usage: python scripts/cargar_csd.py

# Reads from:
#   CSD_CER_PATH env var (path to .cer file)
#   CSD_KEY_PATH env var (path to .key file)
#   CSD_PASSWORD env var (CSD password)
#   FACTURAMA_USER, FACTURAMA_PASS via .env

# Endpoint: POST https://apisandbox.facturama.mx/api-lite/csds
# Auth: HTTPBasicAuth(user, pass)
# Body: { "Rfc": "EKU9003173C9", "Certificate": "<base64 cer>",
#          "PrivateKey": "<base64 key>", "PrivateKeyPassword": "<pass>" }
# Success: HTTP 200/201
```

### `scripts/test_timbrado.py`

```python
# Stamps a test CFDI and prints the folio_fiscal UUID
# Usage: python scripts/test_timbrado.py

# Order:
#   from dotenv import load_dotenv
#   load_dotenv()   # MUST be before facturama import
#   from backend.src.services.facturama import timbrar_factura

# Hardcoded test payload (not from user input):
#   rfc_receptor: "XAXX010101000" (generic SAT test RFC)
#   cp_receptor: "06600"
#   regimen_fiscal_receptor: "616"
#   email_receptor: not needed for standalone test
```

## Out of Scope

- DEFERRED: error handling for expired CSD — owner: Fase 7
- DEFERRED: retry logic on network failure — owner: Fase 3 (Lambda retry via idempotency)

## Environment Variables Required (`.env`)

```
FACTURAMA_USER=<sandbox user>
FACTURAMA_PASS=<sandbox pass>
CSD_CER_PATH=./csd-pruebas/EKU9003173C9.cer
CSD_KEY_PATH=./csd-pruebas/EKU9003173C9.key
CSD_PASSWORD=<csd password>
```

Note: `.env` and `csd-pruebas/` are in `.gitignore` — never commit them.
