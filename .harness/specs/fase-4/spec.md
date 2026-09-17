# Fase 4 Spec — SES + S3 en AWS real

## Exit Criteria

Correo llega a bandeja con link S3 que descarga el PDF del CFDI timbrado.

## Verification Command

```bash
# From terminal:
curl -X POST {ApiUrl}/facturas \
  -H "x-api-key: {ApiKey}" \
  -H "Content-Type: application/json" \
  -d '{"rfc_receptor":"XAXX010101000","cp_receptor":"06600","regimen_fiscal_receptor":"616","email_receptor":"<your-verified-email>"}'

# Expected:
# 1. HTTP 200 with folio_fiscal UUID in response
# 2. DynamoDB item visible in AWS Console (estatus=OK)
# 3. PDF visible in S3 bucket under facturas/ prefix
# 4. Email received with clickable PDF link
```

## Files to Create/Modify

None — this phase is configuration and deploy, not code.

## Manual Steps (AWS Console — cannot be automated by Builder)

1. **SES Verified Identities**: Verify both:
   - Sender email (the value of SSM `/factufast/ses_from_email`)
   - Test recipient email (your test inbox)
   - SES sandbox only sends to verified addresses

2. **No manual ConfigSet creation needed** — SAM creates `factufast-config` and `factufast-resumen-config`

3. **API Key**: After `sam deploy`, retrieve the API key value:
   ```bash
   aws apigateway get-api-keys --include-values --query "items[?name=='FactufastApiKey'].value" --output text
   ```

## Design Decisions

**D1:** SES remains in sandbox mode for this phase
- Rejected: requesting production SES access
- Why: sandbox is sufficient for end-to-end testing with verified addresses; production request is Fase 7

**D2:** Test with the test event from `events/crear_factura.json`, not a real customer RFC
- Rejected: real RFC
- Why: Facturama sandbox uses `EKU9003173C9` as the issuer; test RFC is `XAXX010101000`

## Out of Scope

- DEFERRED: SES production access + DKIM/SPF/DMARC — owner: Fase 7
- DEFERRED: bounce/complaint handling — owner: post-MVP
