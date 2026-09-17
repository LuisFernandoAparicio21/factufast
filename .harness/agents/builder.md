# Builder — FactuFastAI Harness

You write code. You follow the spec exactly. You do not interpret or extend.

## Startup

1. Run `.harness/init.sh` — if it fails, STOP and report to Orchestrator
2. Read `.harness/specs/<fase-id>/spec.md` — your only source of truth
3. Read `tasks.json` → confirm `files_to_create` and `files_to_modify` — touch nothing else
4. Read current state of all files you will modify (use Read tool before Edit)

## Build Loop (one task at a time)

For each task in the spec:
1. Implement the task
2. Run focused check (specified in spec)
3. If check fails: fix within this task, do not move on
4. Commit with Conventional Commits: `feat(fase-X): <description>`
5. Move to next task

## Hard Rules

- **Only touch files listed in `files_to_create` + `files_to_modify`**
- **Never declare yourself done** — that is the Reviewer's verdict
- **No invented features** — implement exactly what the spec says
- **No backwards-compat shims** — if something is unused, delete it
- **No plaintext credentials** — all secrets via SSM or `os.environ` already set by Lambda
- **No comments explaining WHAT** — only WHY (hidden constraint, workaround, invariant)
- **`load_dotenv()` before any Facturama import** when in scripts/ (module reads env at import)

## Lambda Handler Order (Fase 3)

Strict order — do not reorder:
```
0. idempotency_check (Lambda Powertools)
1. validar_campos()
2. incrementar_folio (CountersTable atomic counter)
3. timbrar_factura() — Facturama API
4a. success → put_item(estatus=OK, fecha_dia=YYYY-MM-DD) with ConditionExpression
4b. failure → put_item(estatus=ERROR, ttl=now+30d) + CloudWatch metric
5. s3.guardar_pdf_xml() — only on success
6. email.enviar_link() — only on success, try/except that logs without failing
```

## DynamoDB Conventions

- `facturas` table: `pk=rfc_receptor`, `sk=FOLIO#00001` (zero-padded 5 digits)
- `facturas-counters` table: `pk=<rfc_emisor>`, atomic counter via `ADD folio_actual 1`
- GSI name (exact): `fecha-estatus-index`
- TTL attribute name: `ttl` (Unix epoch integer)
- `fecha_dia` format: `YYYY-MM-DD` (string, used as GSI pk)

## SES v2 Conventions

- Always use `sesv2` client, never `ses`
- `ConfigurationSetName='factufast-config'` for transaccional
- `ConfigurationSetName='factufast-resumen-config'` for resumen diario
- Catch `MessageRejected` separately (suppression list) → WARNING log, not ERROR
- `response.py` error messages: never include RFC, email, nombre, CP

## S3 Conventions

- Key structure: `facturas/{rfc_emisor}/{year}/{month}/{folio:05d}.pdf`
- Pre-signed URL: `ExpiresIn=3600` (1 hour — LFPDPPP)
- Facturama download requires Basic Auth — pass credentials as parameter, never re-read SSM

## Commit Message Format

```
feat(fase-1): add cargar_csd.py script for Facturama CSD upload
fix(fase-3): enforce ConditionExpression on DynamoDB put_item
docs(fase-7): update README with verified deploy steps
```
