# FactuFastAI — Product Constitution (Layer 0)

> This document is the single source of truth. All phase specs must be consistent with it.
> If a phase spec conflicts with this document, this document wins.

## The Problem

Mexican SMBs (pymes) need to generate CFDI 4.0 electronic invoices but the existing tools are:
- Desktop software that requires accounting expertise
- Enterprise SaaS with monthly fees and complex setup
- Manual processes that eat hours per invoice

**FactuFastAI**: business sends 4 fields, gets a stamped invoice by email in < 30 seconds.

## The 4 Fields

| Field | Validation |
|-------|-----------|
| `rfc_receptor` | SAT RFC regex (12 chars physical, 13 moral) |
| `cp_receptor` | 5-digit Mexican postal code |
| `regimen_fiscal_receptor` | One of 23 valid SAT regimens |
| `email_receptor` | Valid email format |

## Invariants (never violate)

1. **No folio duplication** — atomic DynamoDB counter + Lambda Powertools Idempotency
2. **No plaintext credentials** — all secrets in SSM Parameter Store
3. **No personal data in error messages** — RFC, email, nombre, CP are PII under LFPDPPP
4. **Pre-signed URLs expire in 1 hour** — PDF contains fiscal data, LFPDPPP requires minimum necessary access time
5. **Error status items have TTL = now + 30 days** — do not store failures indefinitely
6. **`python-dotenv` is dev-only** — never in Lambda layer (`backend/layers/python/requirements.txt`)
7. **GSI name is `fecha-estatus-index`** everywhere — template.yaml AND Python code AND resumen handler
8. **SES client is `sesv2`** — never legacy `ses`

## Architecture

```
React Native (Expo)
        ↓  x-api-key
API Gateway POST /facturas
        ↓
Lambda crear_factura (Python 3.12)
    ├─ 0. Idempotency check (Lambda Powertools)
    ├─ 1. validate_fields()
    ├─ 2. Increment folio counter (CountersTable atomic ADD)
    ├─ 3. Facturama API → stamped CFDI (apisandbox.facturama.mx)
    ├─ 4. DynamoDB put_item (ConditionExpression, fecha_dia, ttl on error)
    ├─ 5. S3 upload PDF/XML
    └─ 6. SES v2 email with pre-signed URL

Lambda resumen_diario (EventBridge ScheduleV2 6pm MX)
    └─ Query GSI fecha-estatus-index → SES resumen email
```

## Data Model

### facturas table
- pk: `rfc_receptor` (string)
- sk: `FOLIO#00001` (zero-padded 5 digits)
- Attributes: `estatus` (OK|ERROR), `fecha_dia` (YYYY-MM-DD), `timestamp` (ISO), `folio_fiscal` (UUID), `ttl` (epoch int, only on ERROR)

### facturas-counters table
- pk: `rfc_emisor` (string)
- Attribute: `folio_actual` (number, incremented with ADD)

### GSI: fecha-estatus-index
- pk: `fecha_dia` (YYYY-MM-DD)
- sk: `timestamp`

## Sandbox vs Production

The code is identical. Only data changes:

| | Sandbox | Production |
|---|---|---|
| Issuer RFC | `EKU9003173C9` | Real business RFC |
| Facturama URL | `apisandbox.facturama.mx` | `api.facturama.mx` |
| SES | Verified addresses only | Full domain + DKIM/SPF/DMARC |
| CFDI validity | None (apocryphal) | Legally valid before SAT |
