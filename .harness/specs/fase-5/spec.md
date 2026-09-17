# Fase 5 Spec — Frontend React Native (Expo)

## Exit Criteria

App corre en Expo Go en dispositivo real y genera una factura de punta a punta (formulario → POST → pantalla de resultado con folio fiscal y link PDF).

## Verification Command

```bash
cd frontend
npx expo start
# Scan QR code with Expo Go on physical device
# Fill form → tap "Generar Factura" → resultado screen shows folio + PDF link
```

## Files to Create

- `frontend/package.json`
- `frontend/app.json`
- `frontend/tsconfig.json`
- `frontend/constants/regimenes.ts`
- `frontend/services/api.ts`
- `frontend/components/CampoFormulario.tsx`
- `frontend/app/index.tsx`
- `frontend/app/resultado.tsx`

## Files to NOT Touch

All backend files, template.yaml, scripts/, docs/.

## Design Decisions

**D1:** Expo Router (file-based routing via `app/` directory), not React Navigation
- Rejected: React Navigation with manual stack
- Why: Expo Router ships with Expo SDK 50+; no extra setup; `app/index.tsx` = home, `app/resultado.tsx` = result screen

**D2:** `API_URL` and `API_KEY` from `Constants.expoConfig.extra` (app.json `extra` field)
- Rejected: hardcoded strings in `api.ts`
- Why: never hardcode secrets; `app.json` extra is not committed with real values (use `.env` + `app.config.js`)

**D3:** `x-api-key` header always sent in `api.ts`
- Rejected: no API key (endpoint would be public)
- Why: API Gateway requires it; missing header → 403

**D4:** `CampoFormulario.tsx` is a controlled input with label + error prop
- Rejected: raw `TextInput` in index.tsx
- Why: reusable across 4 fields; error state is uniform

**D5:** `regimenes.ts` exports a flat array of `{ value: string; label: string }`
- Rejected: object/enum
- Why: directly consumable by Picker/Select component without transformation

## The Surface

### `frontend/services/api.ts`

```typescript
export async function generarFactura(payload: {
  rfc_receptor: string;
  cp_receptor: string;
  regimen_fiscal_receptor: string;
  email_receptor: string;
}): Promise<{ folio_fiscal: string; pdf_url: string }> {
  // POST to API_URL with x-api-key header
  // Throws on non-200
}
```

### `frontend/components/CampoFormulario.tsx`

```typescript
interface Props {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  keyboardType?: KeyboardTypeOptions;
  placeholder?: string;
}
```

### `frontend/app/index.tsx` (home screen)

- 4 `CampoFormulario` inputs: RFC, CP, Régimen (Picker), Email
- "Generar Factura" button
- Loading state while POST is in-flight
- On success → navigate to `resultado` with `folio_fiscal` + `pdf_url` as params
- On error → show inline error message (generic, no API response body)

### `frontend/app/resultado.tsx` (result screen)

- Display: `folio_fiscal` UUID
- Button: "Descargar PDF" → `Linking.openURL(pdf_url)`
- Button: "Nueva Factura" → navigate back to index

### `frontend/constants/regimenes.ts`

23 SAT tax regimes, same list as `backend/src/utils/validators.py`:
```typescript
export const REGIMENES = [
  { value: "601", label: "General de Ley Personas Morales" },
  { value: "603", label: "Personas Morales con Fines no Lucrativos" },
  // ... all 23
];
```

### `frontend/app.json`

```json
{
  "expo": {
    "name": "FactuFastAI",
    "slug": "factufast-ai",
    "version": "1.0.0",
    "extra": {
      "apiUrl": "",
      "apiKey": ""
    }
  }
}
```

## Environment

For local development, create `frontend/.env` (gitignored):
```
EXPO_PUBLIC_API_URL=https://...execute-api.us-east-1.amazonaws.com/Prod
EXPO_PUBLIC_API_KEY=...
```

## Out of Scope

- DEFERRED: EAS Build (APK distribution) — owner: Fase 7
- DEFERRED: input validation UI (regex feedback per field) — owner: post-MVP
- DEFERRED: offline support — owner: post-MVP
- DEFERRED: `amplify.yml` update — owner: Fase 7 (or remove if only mobile)
