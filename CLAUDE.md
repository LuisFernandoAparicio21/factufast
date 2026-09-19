# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Qué es este proyecto

**FactuFastAI** — MVP de facturación electrónica CFDI 4.0 en AWS. Objetivo: **aprender AWS con un caso real**, no producción.

Es la capa intermedia entre una pyme (doctor, restaurante) y Facturama (el PAC que timbra). El valor está en la simplicidad: el receptor manda 4 datos → el sistema genera el CFDI → regresa PDF/XML + correo.

**Roles en cada factura:**
- **Emisor** (pyme): RFC + CSD (certificado). En sandbox: `EKU9003173C9`, password CSD: `12345678a`
- **Receptor** (cliente final): solo RFC, nombre, código postal, régimen fiscal. En sandbox: `URE180429TM6 / UNIVERSIDAD ROBOTICA ESPAÑOLA / 601 / 65000`

**Facturama es reemplazable** — es solo el PAC. Auth: Basic Auth con usuario/password de la cuenta Facturama, guardado en AWS Secrets Manager.

## Flujos principales

**Flujo inmediato (facturar):**
```
React (Amplify) → API Gateway → Lambda crear_factura:
  1. validar_datos()          ← falla rápido con 400 antes de tocar AWS
  2. DynamoDB counter         ← folio atómico (ADD, no sobreescribe)
  3. Facturama sandbox API    ← POST /api-lite/3/cfdis
  4. DynamoDB put_item        ← estatus OK|ERROR + ConditionExpression (idempotente)
  5. S3                       ← guardar PDF/XML (solo si OK)
  6. SES v2                   ← link pre-firmado al cliente (solo si OK)
```

**Flujo programado (resumen diario):**
```
EventBridge cron (6pm MX) → Lambda resumen_diario → DynamoDB query → SES v2 → pyme
```

## Datos técnicos críticos

- **Folio**: NO se autogenera en Facturama Multiemisor — usar contador atómico DynamoDB (`ADD folio_actual :1`) **antes** de llamar a Facturama. Validar campos primero para no desperdiciar folios.
- **DynamoDB**: dos tablas: `facturas` (pk=RFC_receptor, sk=FOLIO#n, GSI estatus-timestamp, TTL en ERROR) y `facturas-counters` (pk=folio)
- **S3 key**: `facturas/{rfc_emisor}/{año}/{mes}/{folio:05d}.pdf`
- **SES**: usar siempre `sesv2` (no V1). Mandar link pre-firmado S3, no adjunto. Siempre `ConfigurationSetName`. En sandbox verificar emisor y receptor antes del test e2e.
- **Credenciales**: nunca en código ni `.env`. En SSM Parameter Store o Secrets Manager.
- **Presigned URLs**: máximo 3600s (LFPDPPP compliance).

## Estado actual del proyecto

Fases definidas en `.harness/specs/fase-{1-7}/`. Ver `.harness/progress/history.md` para estado actual.
Spec completo: `proyecto-facturacion-mvp.md`

## Commands

### Frontend (`frontend/`)
```bash
npm run dev       # Vite dev server at http://localhost:5173
npm run build     # TypeScript compile + bundle → dist/
npm run preview   # Preview production build
npx tsc --noEmit  # Type-check only (no emit) — run after any TS changes
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

**Frontend** (`frontend/src/`): React 18 + Vite 5 SPA con tres portales. Estado local con hooks solamente; sin Redux. Deploy en AWS Amplify (`amplify.yml`). Estilos con Tailwind CSS. Iconos con Lucide React.

**Tres portales (rutas):**
- `/` y `/resultado` — **Vista pública (receptor)**: `Formulario` (validación inline: RFC, CP, régimen, email) → `Resultado` (UUID + links PDF/XML). Usa `services/api.ts` → POST a `$VITE_API_URL/facturas` con header `x-api-key`.
- `/pyme/*` — **Portal PYME** (`PymeLayout` con sidebar azul): Dashboard, Facturas, Configuración. Usa `services/pyme-api.ts` (mock con 300ms delay). RFC fijo: `EKU9003173C9`.
- `/admin/*` — **Portal Admin/Dev** (`AdminLayout` con sidebar violeta): Dashboard (stats del sistema), Emisores, Facturas (todas). Usa `services/admin-api.ts` (mock).

**Routing**: Nested routes con `<Outlet />`. `PymeLayout` y `AdminLayout` envuelven sus rutas hijas. Cada portal tiene catch-all `path="*"` → redirect a dashboard. `AppSidebar` es compartido, acepta `accent: 'blue' | 'violet'`.

**Shared components**: `components/layout/Header.tsx` (variant: default/pyme/admin), `components/layout/AppSidebar.tsx` (sidebar responsivo con overlay mobile + Escape key), `components/ui/EstatusBadge.tsx`, `components/ui/ErrorBoundary.tsx`.

**Services layer**: `services/api.ts` es el único que llama al backend real. `services/pyme-api.ts` y `services/admin-api.ts` son mock completos — cuando el backend esté listo, reemplazar con llamadas reales.

**Types**: `types/pyme.ts` (Factura, EmisorStats, EmisorInfo) y `types/admin.ts` (Emisor, FacturaAdmin, SystemStats, ServiceStatus). `utils/format.ts` exporta `formatFecha()`.

> Nota: el directorio `frontend/` tiene archivos residuales del pivot de React Native (`.expo/`, `app/`, `app.json`). Son ignorados por Vite; no afectan el build.

**Backend** (`backend/src/`): Single handler `handlers/crear_factura.py` orchestrates: validate → stamp (Facturama) → persist (DynamoDB) → return pre-signed URLs. `services/facturama.py` builds the CFDI 4.0 payload and calls the sandbox API. `utils/db.py` uses a `ConditionExpression` on put_item to prevent duplicate folios from retries.

**IaC**: `backend/template.yaml` (SAM). Two deploy configs in `samconfig.toml`: `default` (dev stack `factufast-dev`) and `prod` (stack `factufast-prod`). Env param controls table name suffix.

**CI/CD**: Frontend via `amplify.yml` (npm ci → npm run build). Backend is manual SAM deploy.

## Key Constraints

- **`VITE_API_KEY` is NOT a secret** — it is embedded in the JS bundle at build time and is readable by anyone inspecting the minified JS. It is a rate-limit control key only. The backend **must** enforce: (1) API Gateway Usage Plan with per-key throttling, and (2) CORS restricted to the Amplify domain (`AllowOrigins: [https://your-app.amplifyapp.com]`). Never treat the client-side key as access control.
- **Credentials never in code or `.env` files committed to git.** Facturama user/pass and SES sender are stored in SSM Parameter Store (`/factufast/facturama_*`, `/factufast/ses_from_email`) and resolved by SAM at deploy time. For local Lambda invocations use a local `.env` that is gitignored.
- **Pre-signed S3 URLs expire in 3600s (1h)** — LFPDPPP compliance. Do not increase.
- **No `python-dotenv` in the Lambda layer** (`backend/layers/python/requirements.txt`). It belongs only in dev/test tooling.
- **RFC validator** (`backend/src/utils/validators.py`) accepts 13-character RFCs only (persons); 12-char (moral) is intentionally excluded from the MVP.
- **DynamoDB table schema**: PK=`rfc` (S), SK=`folio_fiscal` (S). GSI `fecha-estatus-index` (PK=`fecha_dia`, SK=`timestamp`) supports daily summary queries — must exist for `resumen_diario` Lambda.

## What Is Not Yet Implemented

The SAM template is missing several resources described in the spec (`.harness/specs/`): `CountersTable` (atomic sequential folio counter), `S3Bucket` for PDF/XML storage, SES Configuration Sets (`factufast-config`, `factufast-resumen-config`), EventBridge Scheduler rule, and the `resumen_diario` Lambda function with its IAM policies. These are planned for later phases.

## Spec-Driven Development

This project uses a phased harness under `.harness/specs/fase-{1-7}/`. When starting a new phase, use the `factufast-architect` agent to translate the spec into a concrete implementation plan, then `factufast-builder` to write code, and `factufast-reviewer` to verify exit criteria. Custom slash commands are in `.claude/commands/` (e.g. `/harness-next`, `/harness-status`).

## Skills Catalog

All skills installed in `~/.claude/skills/`. Invoke with the Skill tool or as slash commands.

### AWS Backend
| Skill | Cuándo usarla |
|---|---|
| `aws-serverless-eda` | Lambda, API Gateway, DynamoDB, EventBridge — cualquier trabajo de backend serverless |
| `aws-ses` | Implementar o depurar envío de correos (factura al receptor, resumen a la pyme) |
| `aws-s3-security` | Configurar políticas del bucket, block public access, cifrado de PDFs/XMLs |
| `aws-s3-troubleshoot` | Depurar presigned URLs, permisos, errores de acceso a S3 |
| `senior-data-engineer` | Diseño de tabla DynamoDB, GSIs, TTL, contadores atómicos |

### Frontend
| Skill | Cuándo usarla |
|---|---|
| `react-expert` | Implementar componentes React, hooks, estado, rutas (React 18 + Vite) |
| `react-doctor` | Revisar y corregir cambios en React después de editar componentes |
| `vercel-composition-patterns` | Patrones de composición React (compound components, context) |
| `ui-ux-pro-max` | Diseño visual, UX, paleta de colores, tipografía, accesibilidad |

### DevOps / CI-CD
| Skill | Cuándo usarla |
|---|---|
| `git-workflow` | Crear branches, escribir commits convencionales, abrir PRs, merge strategies |
| `devops-skills:github-actions-generator` | Generar pipeline CI/CD para `sam deploy` automático en push |
| `devops-skills:bash-script-generator` | Escribir el script de carga del CSD (paso previo al deploy) |
| `devops-skills:bash-script-validator` | Validar scripts bash antes de ejecutarlos en producción |

### Seguridad
| Skill | Cuándo usarla |
|---|---|
| `security-review` | Revisar credenciales Facturama, CSD, datos fiscales, cualquier dato sensible |

### Código / Calidad
| Skill | Cuándo usarla |
|---|---|
| `simplify` | Revisar código cambiado para detectar duplicación, ineficiencias o malas abstracciones |

### UI / Diseño
| Skill | Cuándo usarla |
|---|---|
| `21st-ai` | Generar componentes UI con IA desde terminal |
| `21st-ui-build` | Construir o reescribir componentes React con diseño visual |
| `21st-ui-review` | Revisar diseño de componentes existentes contra estándares |
| `ui-ux-pro-max` | Diseño visual, paleta, tipografía, accesibilidad |
