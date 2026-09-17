# Fase 3 Spec — Lambda completa

## Exit Criteria

`sam local invoke CrearFacturaFunction --event events/crear_factura.json` retorna HTTP 200 con `folio_fiscal` UUID y URLs de PDF/XML. DynamoDB local muestra el item guardado con `estatus=OK`.

## Verification Command

```bash
cd backend
sam local invoke CrearFacturaFunction --event events/crear_factura.json
# Expected: {"statusCode": 200, "body": "{\"folio_fiscal\": \"...\", \"pdf_url\": \"...\"}"}
```

## Files to Create

- `backend/src/utils/s3.py`
- `backend/src/utils/email.py`
- `backend/tests/conftest.py`

## Files to Modify

- `backend/src/handlers/crear_factura.py`
- `backend/src/utils/db.py`
- `backend/src/utils/response.py`

## Files to NOT Touch

`validators.py`, `facturama.py`, `template.yaml`, any frontend file.

## Handler Operation Order (strict — do not reorder)

```python
# Step 0: Idempotency check (Lambda Powertools)
# key = hash(rfc_receptor + timestamp rounded to minute)
# If key exists in idempotency table → return cached response

# Step 1: validate_fields(body)
# If invalid → return 400 with generic error (no PII in message)

# Step 2: Increment folio counter (CountersTable)
# DynamoDB: UPDATE facturas-counters SET folio_actual = folio_actual + 1
# Returns: new folio int

# Step 3: Facturama API
# facturama.timbrar_factura(payload) → {pdf_url, xml_url, folio_fiscal}
# If fails → put_item(estatus=ERROR, ttl=now+30d) + CloudWatch metric → return 500

# Step 4a (success): DynamoDB put_item
# sk = f"FOLIO#{folio:05d}"
# fecha_dia = datetime.now(tz=ZoneInfo("America/Mexico_City")).strftime("%Y-%m-%d")
# ConditionExpression: "attribute_not_exists(pk)"

# Step 5: S3 upload (only on success)
# s3.guardar_pdf_xml(pdf_url, xml_url, rfc_emisor, folio, facturama_user, facturama_pass)
# Returns: presigned_url (ExpiresIn=3600)

# Step 6: SES email (only on success, try/except — log but don't fail handler)
# email.enviar_link(email_receptor, presigned_url, folio_fiscal)
```

## Design Decisions

**D1:** Idempotency key = hash(rfc_receptor + floor(timestamp, minute))
- Rejected: UUID per request (no dedup)
- Why: client retries within 1 minute must return the same folio, not create duplicates

**D2:** ConditionExpression `attribute_not_exists(pk)` on success put_item
- Rejected: unconditional put (overwrites on retry)
- Why: prevents double-write if Lambda is invoked twice after successful stamp

**D3:** Step 6 (SES) in try/except that logs but does not re-raise
- Rejected: raising SES errors as 500
- Why: invoice is already stamped and in DynamoDB; email failure should not invalidate a valid CFDI

**D4:** S3 key = `facturas/{rfc_emisor}/{year}/{month}/{folio:05d}.pdf`
- Rejected: flat key structure
- Why: enables prefix-based lifecycle rules and human browsing by date

**D5:** Facturama credentials passed as parameters to `s3.py`, not re-read from SSM
- Rejected: `s3.py` reads SSM directly
- Why: credentials are already in `os.environ` (injected by Lambda); SSM re-read adds latency and cost

**D6:** ERROR items have `ttl = int(time.time()) + 30 * 86400`
- Rejected: no TTL on errors (infinite retention)
- Why: LFPDPPP; error items may contain partial PII; 30-day limit is proportionate

## The Surface

### `backend/src/utils/s3.py`

```python
def guardar_pdf_xml(
    pdf_url: str,
    xml_url: str,
    rfc_emisor: str,
    folio: int,
    facturama_user: str,
    facturama_pass: str,
) -> str:
    """Downloads PDF from Facturama, uploads to S3. Returns pre-signed URL."""
    # S3 key: facturas/{rfc_emisor}/{year}/{month}/{folio:05d}.pdf
    # ExpiresIn=3600
```

### `backend/src/utils/email.py`

```python
def enviar_link(
    email_receptor: str,
    presigned_url: str,
    folio_fiscal: str,
) -> None:
    """Sends SES v2 email with PDF download link."""
    # client = boto3.client("sesv2")
    # ConfigurationSetName = "factufast-config"
    # Catch MessageRejected → WARNING log (suppression list), not ERROR
```

### `backend/src/utils/db.py` changes

```python
def guardar_factura(item: dict) -> None:
    # sk = f"FOLIO#{folio:05d}"
    # ConditionExpression = "attribute_not_exists(pk)" (success only)

def guardar_error(item: dict) -> None:
    # ttl = int(time.time()) + 30 * 86400
    # no ConditionExpression
```

### `backend/src/utils/response.py` change

```python
# Error messages must never contain: rfc, email, nombre, cp, regimen
# Only generic: "Validation error", "Internal error", "Invoice already exists"
```

### `backend/tests/conftest.py`

```python
# moto fixtures:
# @pytest.fixture: dynamodb table (facturas + facturas-counters)
# @pytest.fixture: s3 bucket
# @pytest.fixture: ses mock
# Uses moto decorators: @mock_aws
```

## Environment Variables (Lambda)

All injected by SAM template (from Globals):
- `FACTURAS_TABLE`
- `COUNTERS_TABLE`
- `S3_BUCKET`
- `FACTURAMA_USER`
- `FACTURAMA_PASS`
- `SES_FROM_EMAIL`
- `SES_CONFIG_SET`

## Known Limitation (MVP accepted)

Steps 3+5+6 are 3 sequential HTTP calls. API Gateway has 29s timeout. If Facturama is slow, client may receive 504 even though stamping succeeded. Accepted for MVP. Future: async via EventBridge after step 3.

## Out of Scope

- DEFERRED: async Lambda for S3+SES post-stamp — owner: post-MVP
- DEFERRED: XML upload to S3 (only PDF for MVP) — owner: Fase 7
- DEFERRED: moto tests for Facturama call (external API mock) — owner: Fase 7
