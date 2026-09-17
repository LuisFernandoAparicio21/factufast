# Fase 6 Spec — Lambda resumen diario + EventBridge Scheduler

## Exit Criteria

Correo de resumen diario llega a la hora configurada (6pm hora México) con conteo de facturas del día (OK + ERROR counts).

## Verification Command

```bash
# Force trigger via CLI (don't wait for 6pm):
aws lambda invoke \
  --function-name ResumenDiarioFunction \
  --payload '{}' \
  response.json && cat response.json

# Expected: {"statusCode": 200}
# Check email inbox for resumen with today's counts
# Check CloudWatch Logs for ResumenDiarioFunction
```

## Files to Create

- `backend/src/handlers/resumen_diario.py`

## Files to Modify

- `backend/template.yaml`

## Files to NOT Touch

All other source files, frontend.

## Design Decisions

**D1:** GSI query by `fecha_dia` (today in `America/Mexico_City`), not UTC
- Rejected: UTC date
- Why: pyme's business day is in Mexico timezone; a 6pm daily report should count today's Mexico-time invoices

**D2:** `ScheduleV2` (`AWS::Scheduler::Schedule`) not `ScheduleV1` (`AWS::Events::Rule`)
- Rejected: EventBridge Rules (ScheduleV1)
- Why: ScheduleV2 supports `ScheduleExpressionTimezone` natively; Rules require manual UTC offset and don't handle DST

**D3:** Separate ConfigurationSet `factufast-resumen-config` (not `factufast-config`)
- Rejected: reusing `factufast-config`
- Why: transaccional and batch emails should have separate reputation monitoring; a bounce in bulk shouldn't affect transactional deliverability metrics

**D4:** GSI name `fecha-estatus-index` (exact match required)
- Note: this name was defined in Fase 2. Never change it — it is hardcoded in template.yaml and must match here.

## The Surface

### `backend/src/handlers/resumen_diario.py`

```python
def handler(event, context):
    # 1. Get today's date in America/Mexico_City timezone
    #    from zoneinfo import ZoneInfo
    #    fecha_dia = datetime.now(tz=ZoneInfo("America/Mexico_City")).strftime("%Y-%m-%d")
    
    # 2. Query GSI fecha-estatus-index
    #    KeyConditionExpression: Key("fecha_dia").eq(fecha_dia)
    #    Returns: all items for today
    
    # 3. Count by estatus
    #    ok_count = sum(1 for item in items if item["estatus"] == "OK")
    #    error_count = sum(1 for item in items if item["estatus"] == "ERROR")
    
    # 4. Send summary email via sesv2
    #    To: SES_FROM_EMAIL (same as sender — pyme owner)
    #    ConfigurationSetName: "factufast-resumen-config"
    #    Subject: f"Resumen de facturas — {fecha_dia}"
    #    Body: plain text with ok_count, error_count, total
    
    # 5. Return {"statusCode": 200}
```

### `backend/template.yaml` additions

```yaml
ResumenDiarioFunction:
  Type: AWS::Serverless::Function
  Properties:
    Handler: src/handlers/resumen_diario.handler
    Policies:
      - DynamoDBReadPolicy: FacturasTable
      - SESSendEmailPolicy:
          IdentityName: "{{resolve:ssm:/factufast/ses_from_email}}"
    Environment:
      Variables:
        FACTURAS_TABLE: !Ref FacturasTable
        SES_FROM_EMAIL: "{{resolve:ssm:/factufast/ses_from_email}}"
        SES_RESUMEN_CONFIG_SET: factufast-resumen-config
    Events:
      DailySchedule:
        Type: ScheduleV2
        Properties:
          ScheduleExpression: "cron(0 18 * * ? *)"
          ScheduleExpressionTimezone: America/Mexico_City

ResumenDiarioFunctionLogGroup:
  Type: AWS::Logs::LogGroup
  Properties:
    LogGroupName: !Sub "/aws/lambda/${ResumenDiarioFunction}"
    RetentionInDays: 30
```

## Environment Variables (Lambda)

- `FACTURAS_TABLE` — from `!Ref FacturasTable`
- `SES_FROM_EMAIL` — from SSM
- `SES_RESUMEN_CONFIG_SET` — hardcoded string `factufast-resumen-config`

## Out of Scope

- DEFERRED: HTML email template for resumen — owner: post-MVP
- DEFERRED: filter resumen by RFC emisor (multi-issuer support) — owner: post-MVP
- DEFERRED: resumen to multiple recipients — owner: post-MVP
