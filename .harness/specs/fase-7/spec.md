# Fase 7 Spec — Cierre MVP

## Exit Criteria

Cualquier persona puede clonar el repo, seguir el README y tener el MVP corriendo.

## Verification Command

```bash
# Clone fresh copy and follow README from scratch:
git clone https://github.com/LuisFernandoAparicio21/factufast.git factufast-test
cd factufast-test
# Follow README — if it works without asking questions, exit criteria met

# EAS Build:
cd frontend && eas build --platform android --profile preview
# Expected: APK download URL in output

# Tag:
git tag v1.0.0 && git push --tags
```

## Files to Create

- `frontend/eas.json`

## Files to Modify

- `README.md`
- `proyecto-facturacion-mvp.md`

## Design Decisions

**D1:** `eas.json` profile `preview` (unsigned APK, no Google Play required)
- Rejected: `production` profile (requires Play Store keys)
- Why: for learning/demo purposes, a direct APK install is sufficient

**D2:** README documents actual verified steps (not planned steps)
- Rejected: keeping the original planned README
- Why: exit criteria requires a stranger to follow it successfully; every step must be verified

## The Surface

### `frontend/eas.json`

```json
{
  "cli": { "version": ">= 5.0.0" },
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

### `README.md` sections to update

1. **Setup** — replace planned steps with verified commands + actual SSM parameter names
2. **Deploy** — add actual `ApiUrl` and `ApiKey` retrieval commands
3. **Local Testing** — add `sam local invoke` with correct event file path
4. **Frontend** — add Expo Go instructions + EAS Build command
5. **Architecture diagram** — already present (`FactuFast.png`)

### `proyecto-facturacion-mvp.md` sections to update

- Mark completed phases with `✓`
- Note any deviations from the original design (e.g., actual GSI design, ConditionExpression approach, 1h vs 24h URL)

## EAS Prerequisites (manual — cannot be automated)

1. `eas login` with Expo account
2. Verify `app.json` has `slug: "factufast-ai"` and `owner: "<expo-username>"`
3. Run `eas build:configure` to generate `eas.json`

## Out of Scope

- DEFERRED: Play Store submission — post-MVP
- DEFERRED: SES production access + DKIM/SPF/DMARC — post-MVP
- DEFERRED: custom domain for API Gateway — post-MVP
