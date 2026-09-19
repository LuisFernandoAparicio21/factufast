# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Frontend (`frontend/`)
```bash
npm run dev       # Vite dev server at http://localhost:5173
npm run build     # TypeScript compile + bundle → dist/
npm run preview   # Preview production build
```

### Backend (`backend/`)
```bash
sam build                                               # Bundle Python + Layer
sam deploy --guided                                     # First deploy (writes samconfig.toml)
sam build && sam deploy                                 # Subsequent deploys
sam local invoke CrearFacturaFunction --event events/crear_factura.json
sam local start-api                                     # Requires Docker
```

### Tests (Backend)
```bash
cd backend
pytest                    # Run all tests (moto mocks DynamoDB)
pytest tests/test_foo.py  # Single test file
```

## Architecture

**Frontend → Backend flow:**
```
React (Amplify) → API Gateway REST → Lambda (Python 3.12) → Facturama sandbox API
                                   → DynamoDB (facturas table, On-Demand)
                                   → S3 (PDF/XML, pre-signed 1h URLs)
                                   → SES v2 (email delivery)
                               SSM → Lambda env vars (credentials)
EventBridge Scheduler (6pm MX tz) → Lambda resumen_diario (daily summary)
```

**Frontend** (`frontend/src/`): React 18 + Vite 5 SPA con dos rutas — `Formulario` (formulario CFDI con validación inline por campo: RFC, CP, régimen, email) → `Resultado` (UUID + links PDF/XML + copy button). Estado local con hooks solamente; sin Redux. `api.ts` hace POST a `$VITE_API_URL/facturas` con header `x-api-key`. Deploy en AWS Amplify (`amplify.yml`). Estilos con Tailwind CSS. Iconos con Lucide React.

**Backend** (`backend/src/`): Single handler `handlers/crear_factura.py` orchestrates: validate → stamp (Facturama) → persist (DynamoDB) → return pre-signed URLs. `services/facturama.py` builds the CFDI 4.0 payload and calls the sandbox API. `utils/db.py` uses a `ConditionExpression` on put_item to prevent duplicate folios from retries.

**IaC**: `backend/template.yaml` (SAM). Two deploy configs in `samconfig.toml`: `default` (dev stack `factufast-dev`) and `prod` (stack `factufast-prod`). Env param controls table name suffix.

**CI/CD**: Frontend via `amplify.yml` (npm ci → npm run build). Backend is manual SAM deploy.

## Key Constraints

- **Credentials never in code or `.env` files committed to git.** Facturama user/pass and SES sender are stored in SSM Parameter Store (`/factufast/facturama_*`, `/factufast/ses_from_email`) and resolved by SAM at deploy time. For local Lambda invocations use a local `.env` that is gitignored.
- **Pre-signed S3 URLs expire in 3600s (1h)** — LFPDPPP compliance. Do not increase.
- **No `python-dotenv` in the Lambda layer** (`backend/layers/python/requirements.txt`). It belongs only in dev/test tooling.
- **RFC validator** (`backend/src/utils/validators.py`) accepts 13-character RFCs only (persons); 12-char (moral) is intentionally excluded from the MVP.
- **DynamoDB table schema**: PK=`rfc` (S), SK=`folio_fiscal` (S). GSI `fecha-estatus-index` (PK=`fecha_dia`, SK=`timestamp`) supports daily summary queries — must exist for `resumen_diario` Lambda.

## What Is Not Yet Implemented

The SAM template is missing several resources described in the spec (`.harness/specs/`): `CountersTable` (atomic sequential folio counter), `S3Bucket` for PDF/XML storage, SES Configuration Sets (`factufast-config`, `factufast-resumen-config`), EventBridge Scheduler rule, and the `resumen_diario` Lambda function with its IAM policies. These are planned for later phases.

## Spec-Driven Development

This project uses a phased harness under `.harness/specs/fase-{1-7}/`. When starting a new phase, use the `factufast-architect` agent to translate the spec into a concrete implementation plan, then `factufast-builder` to write code, and `factufast-reviewer` to verify exit criteria. Custom slash commands are in `.claude/commands/` (e.g. `/harness-next`, `/harness-status`).
