# Fase 5 Spec — Frontend React 18 + Vite 5

> **Pivot:** Esta fase originalmente era React Native (Expo). Se cambió a React 18 + Vite 5 SPA
> deployada en AWS Amplify (PR #1 Expo cerrado → PR #2 Vite abierto).

## Exit Criteria

App deployada en AWS Amplify. Formulario CFDI 4.0 genera una factura de punta a punta en navegador:
formulario → POST a API Gateway → pantalla de resultado con UUID (folio fiscal) + links de descarga PDF/XML.

## Verification Command

```bash
cd frontend
npm run dev
# Abrir http://localhost:5173
# Llenar formulario → click "Generar factura" → resultado muestra folio + links
```

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | React 18.3 + TypeScript 5.4 (strict) |
| Build | Vite 5.3 |
| Routing | React Router DOM 6.23 |
| Estilos | Tailwind CSS 3.4 + PostCSS |
| Iconos | Lucide React 0.400 |
| Deploy | AWS Amplify (`amplify.yml`: npm ci → npm run build → frontend/dist) |

## Files Created

- `frontend/package.json`
- `frontend/vite.config.ts`
- `frontend/tsconfig.json`
- `frontend/tailwind.config.js`
- `frontend/index.html`
- `frontend/src/main.tsx` — React 18 root
- `frontend/src/App.tsx` — BrowserRouter + routes + ErrorBoundary
- `frontend/src/index.css` — Tailwind imports + Google Fonts (Inter)
- `frontend/src/constants/regimenes.ts` — 19 regímenes SAT `{ value, label }`
- `frontend/src/services/api.ts` — `generarFactura()`, tipos `FacturaPayload` / `FacturaResult`
- `frontend/src/components/layout/Header.tsx` — logo, badge Sandbox, CFDI 4.0 label
- `frontend/src/components/ui/ErrorBoundary.tsx` — class component, previene pantalla blanca
- `frontend/src/pages/factura/Formulario.tsx` — formulario con validación inline por campo
- `frontend/src/pages/factura/Resultado.tsx` — UUID + botones PDF/XML + "Generar otra"

## Files Modified

- `amplify.yml` — `appRoot: frontend`, `baseDirectory: dist`

## Design Decisions

**D1:** React 18 + Vite en lugar de React Native / Expo
- Rechazado: Expo requiere dispositivo físico o emulador; más fricción para MVP web
- Por qué: SPA en navegador es suficiente para el MVP; deploy en Amplify es trivial

**D2:** Estado local (hooks) — sin Redux ni Context
- Por qué: solo 4 campos de formulario y un resultado; no hay estado compartido entre rutas

**D3:** Credenciales via `import.meta.env` (`VITE_API_URL`, `VITE_API_KEY`)
- Rechazado: hardcoded en `api.ts`
- Por qué: Amplify inyecta env vars en build time; nunca en código fuente

**D4:** Validación en frontend Y backend (no solo uno)
- Frontend: feedback inmediato al usuario (RFC regex, CP 5 dígitos, email, régimen)
- Backend: autoridad de verdad (misma regex en `validators.py`)

**D5:** `x-api-key` header siempre en `api.ts`
- Por qué: API Gateway lo exige; sin él → 403

## Surface

### Routes (`App.tsx`)
- `/` → `<Formulario />` — form con 4 campos
- `/resultado` → `<Resultado />` — estado vía `useLocation().state`

### `api.ts`
```typescript
export async function generarFactura(payload: FacturaPayload): Promise<FacturaResult>
// POST ${VITE_API_URL}/facturas con x-api-key header
// Lanza Error con mensaje del backend en non-200
```

### `Formulario.tsx`
- Campos: `rfc_receptor`, `cp_receptor`, `regimen_fiscal_receptor` (select), `email_receptor`
- Validación touched: solo muestra errores tras blur o submit
- Loading state: deshabilita inputs y botón, spinner en botón
- Error API: banner rojo con mensaje del servidor
- Submit: `navigate('/resultado', { state: result })`

### `Resultado.tsx`
- Guard: si no hay `location.state` → mensaje de error + link a formulario
- Folio fiscal: `<code>` con botón copy-to-clipboard (feedback 2s)
- Folio interno: `#00001` si el backend lo devuelve
- Downloads: `<a target="_blank">` para PDF y XML (pre-signed S3 URLs)
- CTA: "Generar otra factura" → `navigate('/')`

## Environment

```
# frontend/.env.local (gitignored)
VITE_API_URL=https://XXXXXXXX.execute-api.us-east-1.amazonaws.com/Prod
VITE_API_KEY=XXXXXXXXXXXXXXXXXXXXXXXXXX
```

En Amplify: configurar las mismas vars en Console → Environment variables.

## Out of Scope

- DEFERRED: tests unitarios (Vitest + Testing Library) — post-MVP
- DEFERRED: offline support — post-MVP
- DEFERRED: EAS Build / APK — eliminado por pivot a web
