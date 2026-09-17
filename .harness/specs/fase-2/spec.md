# Fase 2 Spec — Infraestructura SAM completa

## Exit Criteria

`sam deploy` sin errores, tablas DynamoDB y bucket S3 visibles en consola AWS, endpoint API Gateway responde (aunque Lambda falle por lógica incompleta).

## Verification Command

```bash
cd backend
sam validate --template template.yaml   # must exit 0
sam build
sam deploy                              # must complete without errors
# Then verify in AWS Console:
# - DynamoDB: facturas table + facturas-counters table visible
# - S3: FacturasBucket visible
# - API Gateway: endpoint URL printed in outputs
```

## Files to Modify

- `backend/template.yaml`

## Files to NOT Touch

All source code, frontend, scripts — off-limits.

## Design Decisions

**D1:** `CountersTable` is a separate DynamoDB table (not an item in `facturas`)
- Rejected: counter as item in `facturas` table
- Why: separates concerns; counter table uses `ADD` atomically without risking collision with invoice records

**D2:** GSI on `FacturasTable`: pk=`fecha_dia`, sk=`timestamp`, name=`fecha-estatus-index`
- Rejected: pk=`estatus` (only 2 values → hot partition)
- Why: `fecha_dia` (YYYY-MM-DD) distributes load across days; name must match exactly in Python code

**D3:** No hardcoded `BucketName` on `FacturasBucket`
- Rejected: hardcoded name
- Why: CloudFormation auto-generates unique names; hardcoded names cause conflicts on re-deploy

**D4:** API Key auth via SAM `Auth.ApiKeyRequired: true`
- Rejected: no auth (scraping risk on public endpoint)
- Why: even in sandbox, unprotected endpoint is bad practice; cost protection

**D5:** `ScheduleV2` for EventBridge (ResumenDiario) not `ScheduleV1`
- Rejected: `Schedule` (legacy EventBridge Rules)
- Why: ScheduleV2 supports `ScheduleExpressionTimezone` natively; no manual UTC offset calculation

**D6:** `SESSendEmailPolicy` not `SESCrudPolicy`
- Rejected: `SESCrudPolicy` (does not exist in SAM)
- Why: `SESSendEmailPolicy` is the correct SAM managed policy for SES send permissions

## The Surface — `backend/template.yaml` additions

```yaml
Globals:
  Function:
    Runtime: python3.12
    Timeout: 30
    Environment:
      Variables:
        FACTURAMA_USER: "{{resolve:ssm:/factufast/facturama_user}}"
        FACTURAMA_PASS: "{{resolve:ssm:/factufast/facturama_pass}}"
        FACTURAS_TABLE: !Ref FacturasTable
        COUNTERS_TABLE: !Ref CountersTable
        S3_BUCKET: !Ref FacturasBucket
        SES_FROM_EMAIL: "{{resolve:ssm:/factufast/ses_from_email}}"
        SES_CONFIG_SET: factufast-config

Resources:
  # Existing: FacturasTable — ADD GSI + TTL
  FacturasTable:
    Type: AWS::DynamoDB::Table
    Properties:
      BillingMode: PAY_PER_REQUEST
      AttributeDefinitions:
        - AttributeName: pk / rfc_receptor (S)
        - AttributeName: sk / FOLIO#n (S)
        - AttributeName: fecha_dia (S)
        - AttributeName: timestamp (S)
      GlobalSecondaryIndexes:
        - IndexName: fecha-estatus-index
          KeySchema: [pk=fecha_dia, sk=timestamp]
          Projection: ALL
      TimeToLiveSpecification:
        AttributeName: ttl
        Enabled: true

  # NEW: CountersTable
  CountersTable:
    Type: AWS::DynamoDB::Table
    Properties:
      BillingMode: PAY_PER_REQUEST
      KeySchema: pk=rfc_emisor (S) HASH

  # NEW: FacturasBucket (no BucketName)
  FacturasBucket:
    Type: AWS::S3::Bucket
    Properties:
      PublicAccessBlockConfiguration:
        BlockPublicAcls: true
        BlockPublicPolicy: true
        IgnorePublicAcls: true
        RestrictPublicBuckets: true

  # NEW: SES Configuration Sets
  FactufastConfigSet:
    Type: AWS::SES::ConfigurationSet
    Properties:
      Name: factufast-config

  ResumenConfigSet:
    Type: AWS::SES::ConfigurationSet
    Properties:
      Name: factufast-resumen-config

  # Lambda: add policies
  CrearFacturaFunction:
    Policies:
      - S3CrudPolicy: FacturasBucket
      - SESSendEmailPolicy:
          IdentityName: "{{resolve:ssm:/factufast/ses_from_email}}"
      - DynamoDBCrudPolicy: CountersTable
    Auth:
      ApiKeyRequired: true
      UsagePlan:
        CreateUsagePlan: PER_API

  # NEW: Log groups with 30-day retention
  CrearFacturaFunctionLogGroup:
    Type: AWS::Logs::LogGroup
    Properties:
      RetentionInDays: 30
```

## SSM Parameters (must exist before deploy)

```bash
aws ssm put-parameter --name /factufast/facturama_user --value "..." --type SecureString
aws ssm put-parameter --name /factufast/facturama_pass --value "..." --type SecureString
aws ssm put-parameter --name /factufast/ses_from_email --value "noreply@yourdomain.com" --type String
```

## Out of Scope

- DEFERRED: custom domain for API Gateway — owner: Fase 7
- DEFERRED: WAF on API Gateway — owner: post-MVP
- DEFERRED: S3 lifecycle rules for old invoices — owner: post-MVP
