# FactuFastAI — API Specification & Backend Requirements

**Stack:** AWS SAM · Python 3.12 · DynamoDB On-Demand · S3 · SES v2 · API Gateway REST · Lambda

---

## Tablas DynamoDB

### `facturas`

| Atributo | Tipo | Descripción |
|---|---|---|
| `rfc` (PK) | S | RFC del emisor |
| `folio_fiscal` (SK) | S | UUID del CFDI, o `ERROR#<timestamp>` si falló |
| `folio` | N | Folio secuencial interno |
| `rfc_receptor` | S | RFC del receptor |
| `nombre_receptor` | S | |
| `fecha` | S | ISO 8601 con zona horaria |
| `fecha_dia` | S | `YYYY-MM-DD` (para GSI y resumen diario) |
| `timestamp` | S | ISO 8601 (para GSI SK) |
| `estatus` | S | `OK` \| `ERROR` |
| `pdf_url` | S | URL presignada S3 — solo si OK |
| `xml_url` | S | URL presignada S3 — solo si OK |
| `error` | S | Mensaje de error Facturama — solo si ERROR |
| `ttl` | N | Unix epoch — solo registros ERROR, expiran en 30 días |

**GSI `fecha-estatus-index`:** PK=`fecha_dia`, SK=`timestamp`
Usado por `resumen_diario` para query por día. Nombre exacto — hardcodeado en template.yaml.

### `facturas-counters`

| Atributo | Tipo | Descripción |
|---|---|---|
| `pk` (PK) | S | `"folio"` (o RFC del emisor para counters por emisor) |
| `folio_actual` | N | Contador atómico — iniciar en 0 |

Operación: `ADD folio_actual :1` — DynamoDB garantiza atomicidad. Incrementar **antes** de llamar a Facturama, después de validar los campos.

### `emisores`

| Atributo | Tipo | Descripción |
|---|---|---|
| `rfc` (PK) | S | RFC del emisor (12–13 chars) |
| `nombre` | S | Razón social |
| `regimen_fiscal` | S | Clave SAT (p.ej. `"612"`) |
| `codigo_postal` | S | CP del domicilio fiscal |
| `email_resumen` | S | Email para resumen diario SES |
| `csd_vigente` | BOOL | `true` si CSD está activo |
| `csd_vencimiento` | S | ISO date |
| `csd_s3_key` | S | Key del `.cer` en bucket CSD (SSE-KMS) |
| `key_s3_key` | S | Key del `.key` en bucket CSD (SSE-KMS) |
| `token_invitacion` | S | Token de registro (limpiar tras primer uso) |
| `creado_en` | S | ISO 8601 |

---

## S3 Buckets

### `factufast-facturas-{env}`

Estructura de keys:
```
facturas/{rfc_emisor}/{año}/{mes}/{folio:05d}.pdf
facturas/{rfc_emisor}/{año}/{mes}/{folio:05d}.xml
```

- Block Public Access: **total**
- Cifrado: SSE-S3 mínimo (SSE-KMS recomendado)
- Presigned URL expiry: **3600 s** (cumplimiento LFPDPPP — no aumentar)
- CORS: solo el dominio Amplify (`AllowOrigins: [https://your-app.amplifyapp.com]`)

### `factufast-csd-{env}`

Estructura de keys:
```
csd/{rfc_emisor}/{rfc_emisor}.cer
csd/{rfc_emisor}/{rfc_emisor}.key
```

- Block Public Access: **total**
- Cifrado: SSE-KMS **obligatorio**
- Bucket policy: solo el rol Lambda tiene `s3:GetObject`
- **Nunca** generar presigned URLs para este bucket

---

## SES v2 — Configuration Sets

| Set | Uso | Eventos a capturar |
|---|---|---|
| `factufast-config` | Correo al receptor tras factura exitosa | bounce, complaint, delivery |
| `factufast-resumen-config` | Resumen diario a la PYME | bounce, delivery |

Los dos sets están separados para aislar la reputación transaccional de la batch.

**Template registrada:** `FacturaEmitida`
- Subject: `Tu factura está lista`
- Body: RFC emisor, folio, links PDF/XML (presignados)

---

## Los 9 Endpoints

| # | Método | Path | Lambda | Auth |
|---|---|---|---|---|
| 1 | `POST` | `/facturas` | `CrearFactura` | `x-api-key` (rate-limit) |
| 2 | `POST` | `/emisores` | `RegistrarEmisor` | `x-api-key` (rate-limit) |
| 3 | `GET` | `/pyme/stats` | `ObtenerStatsEmisor` | `x-rfc` + `x-api-key` ¹ |
| 4 | `GET` | `/pyme/facturas` | `ListarFacturasEmisor` | `x-rfc` + `x-api-key` ¹ |
| 5 | `GET` | `/pyme/configuracion` | `ObtenerConfiguracionEmisor` | `x-rfc` + `x-api-key` ¹ |
| 6 | `GET` | `/admin/stats` | `ObtenerStatsAdmin` | `x-admin-key` ² |
| 7 | `GET` | `/admin/emisores` | `ListarEmisores` | `x-admin-key` ² |
| 8 | `GET` | `/admin/facturas` | `ListarTodasFacturas` | `x-admin-key` ² |
| 9 | `GET` | `/admin/services` | `HealthCheck` | `x-admin-key` ² |

> ¹ **Auth PYME (MVP):** el frontend envía el RFC en header `x-rfc`; Lambda valida que exista en tabla `emisores`. Suficiente para MVP interno. Reemplazar con Cognito User Pools antes de producción.
>
> ² **Auth Admin (MVP):** header `x-admin-key` con valor almacenado en SSM Parameter Store `/factufast/admin_key`. Reemplazar con Cognito + grupos IAM antes de producción.

---

## Contratos de Petición/Respuesta

### `POST /facturas`

```json
// Request body (application/json)
{
  "rfc_receptor": "URE180429TM6",
  "nombre_receptor": "UNIVERSIDAD ROBOTICA ESPAÑOLA",
  "uso_cfdi": "G03",
  "regimen_fiscal_receptor": "601",
  "codigo_postal_receptor": "65000",
  "email_receptor": "test@example.com",
  "concepto": "Consulta médica",
  "monto": 500.00
}

// 201 Created
{
  "folio": 1,
  "folio_fiscal": "3f5e2a1b-0000-0000-0000-000000000000",
  "pdf_url": "https://factufast-facturas-dev.s3.amazonaws.com/facturas/EKU9003173C9/2026/09/00001.pdf?...",
  "xml_url": "https://factufast-facturas-dev.s3.amazonaws.com/facturas/EKU9003173C9/2026/09/00001.xml?..."
}

// 400 Bad Request
{ "error": "RFC inválido: debe tener 12 o 13 caracteres alfanuméricos" }

// 422 Unprocessable Entity (Facturama rechazó)
{ "error": "El emisor no tiene CSD vigente en sandbox Facturama" }
```

### `POST /emisores`

```
Content-Type: multipart/form-data

Campos:   rfc, nombre, regimen_fiscal, codigo_postal, email_resumen
          token (opcional — token de invitación)
Archivos: csd_cer (*.cer), csd_key (*.key)
```

```json
// 201 Created
{ "rfc": "AAA010101AAA", "nombre": "Mi Empresa SA de CV" }

// 409 Conflict
{ "error": "El RFC AAA010101AAA ya está registrado" }

// 400 Bad Request
{ "error": "Token de invitación inválido o expirado" }
```

### `GET /pyme/stats`

Headers: `x-rfc: EKU9003173C9`

```json
// 200 OK
{
  "facturas_hoy": 3,
  "facturas_mes": 47,
  "facturas_total": 214,
  "errores_mes": 2
}
```

### `GET /pyme/facturas?rfc_receptor=URE&estatus=OK`

Headers: `x-rfc: EKU9003173C9`

```json
// 200 OK
[
  {
    "folio": 1,
    "folio_fiscal": "3f5e2a1b-...",
    "rfc_receptor": "URE180429TM6",
    "fecha": "2026-09-19T14:30:00-06:00",
    "estatus": "OK",
    "pdf_url": "https://...",
    "xml_url": "https://..."
  }
]
```

### `GET /pyme/configuracion`

Headers: `x-rfc: EKU9003173C9`

```json
// 200 OK
{
  "rfc": "EKU9003173C9",
  "nombre": "ESCUELA KEMPER URGATE",
  "regimen_fiscal": "612",
  "email_resumen": "admin@empresa.com",
  "csd_vigente": true,
  "csd_vencimiento": "2027-03-15"
}
```

> Nunca exponer `csd_s3_key` ni `key_s3_key` en la respuesta.

### `GET /admin/stats`

Headers: `x-admin-key: <valor SSM>`

```json
// 200 OK
{
  "facturas_total": 1240,
  "facturas_hoy": 18,
  "errores_total": 34,
  "emisores_activos": 12,
  "tasa_exito": 97.3
}
```

### `GET /admin/emisores`

Headers: `x-admin-key: <valor SSM>`

```json
// 200 OK
[
  {
    "rfc": "EKU9003173C9",
    "nombre": "ESCUELA KEMPER URGATE",
    "regimen_fiscal": "612",
    "facturas_mes": 47,
    "facturas_total": 214,
    "errores_mes": 2,
    "csd_vigente": true,
    "ultima_factura": "2026-09-19T14:30:00-06:00"
  }
]
```

### `GET /admin/facturas?rfc_emisor=EKU&rfc_receptor=URE&estatus=ERROR`

Headers: `x-admin-key: <valor SSM>`

```json
// 200 OK
[
  {
    "folio": 3,
    "folio_fiscal": "ERROR#1726777200000",
    "rfc_emisor": "EKU9003173C9",
    "nombre_emisor": "ESCUELA KEMPER URGATE",
    "rfc_receptor": "URE180429TM6",
    "fecha": "2026-09-19T14:35:00-06:00",
    "estatus": "ERROR",
    "error": "El CSD del emisor está vencido"
  }
]
```

### `GET /admin/services`

Headers: `x-admin-key: <valor SSM>`

```json
// 200 OK
[
  { "nombre": "DynamoDB", "estado": "ok" },
  { "nombre": "Facturama", "estado": "ok" },
  { "nombre": "S3", "estado": "ok" },
  { "nombre": "SES", "estado": "ok" }
]
```

Implementación: cada check es un ping real al servicio (GetItem, GET /api-lite/3/cfdis?top=1, HeadBucket, GetAccount). Si falla → `"degraded"` si hay timeout, `"down"` si hay error 5xx.

---

## Lambda Functions — Responsabilidades

### `CrearFactura`

```
1. Validar campos → 400 si inválido (no gastar folio)
2. DynamoDB ADD folio_actual :1 → obtener folio secuencial
3. POST Facturama /api-lite/3/cfdis (Basic Auth de Secrets Manager)
4. Si OK:
   a. Subir PDF y XML a S3
   b. Generar presigned URLs (expiry=3600)
   c. DynamoDB put_item con ConditionExpression: attribute_not_exists(folio_fiscal)
   d. SES v2 sendEmail al receptor con links (ConfigurationSetName: factufast-config)
   e. Return 201
5. Si Facturama falla:
   a. DynamoDB put_item estatus=ERROR + mensaje
   b. Return 422 {error}
```

### `RegistrarEmisor`

```
1. Validar RFC (regex SAT), email, campos obligatorios
2. Verificar token_invitacion si viene en el body
3. DynamoDB ConditionalCheckFailed si RFC ya existe → 409
4. Subir .cer y .key a bucket CSD (SSE-KMS)
5. DynamoDB put_item en emisores
6. Limpiar token_invitacion del emisor que lo generó (UpdateItem)
7. Return 201 {rfc, nombre}
```

### `ObtenerStatsEmisor`

```
1. Validar x-rfc header (existe en tabla emisores)
2. DynamoDB query GSI fecha-estatus-index por fecha_dia del mes actual
3. También query para facturas_hoy (fecha_dia = hoy)
4. Contar y agregar
5. Return 200 EmisorStats
```

### `ListarFacturasEmisor`

```
1. Validar x-rfc header
2. DynamoDB query PK=rfc con FilterExpression opcional (rfc_receptor, estatus)
3. Return 200 Factura[]
```

### `ObtenerConfiguracionEmisor`

```
1. Validar x-rfc header
2. DynamoDB GetItem emisores PK=rfc
3. Proyectar solo campos públicos (excluir csd_s3_key, key_s3_key)
4. Return 200 EmisorInfo
```

### `ObtenerStatsAdmin`

```
1. Validar x-admin-key header
2. DynamoDB Scan facturas con paginación (o tabla separada de agregados)
3. Calcular métricas: total, hoy, errores, emisores_activos, tasa_exito
4. Return 200 SystemStats
Nota: si la tabla crece, reemplazar el Scan por una tabla de agregados
      que se actualiza atómicamente en cada invocación de CrearFactura.
```

### `ListarEmisores`

```
1. Validar x-admin-key header
2. DynamoDB Scan emisores con paginación
3. Para cada emisor, obtener contadores de facturas (batch GetItem o join en app)
4. Return 200 Emisor[]
```

### `ListarTodasFacturas`

```
1. Validar x-admin-key header
2. Query params: rfc_emisor?, rfc_receptor?, estatus?
   - Si rfc_emisor: query PK=rfc_emisor + FilterExpression opcionales
   - Si solo estatus/receptor: necesita GSI adicional o Scan con filtro
3. Enriquecer con nombre_emisor (GetItem emisores)
4. Return 200 FacturaAdmin[]
```

### `HealthCheck`

```
1. Validar x-admin-key header
2. En paralelo (asyncio o threads):
   - DynamoDB GetItem facturas-counters PK="folio"
   - GET Facturama /api-lite/3/cfdis?top=1 con timeout 3s
   - S3 HeadBucket factufast-facturas-{env}
   - SES v2 GetAccount
3. Mapear resultado a "ok" | "degraded" | "down"
4. Return 200 ServiceStatus[]
```

### `ResumenDiario` (EventBridge cron 18:00 MX)

```
1. Obtener fecha de hoy en America/Mexico_City (ZoneInfo)
2. DynamoDB query GSI fecha-estatus-index KeyConditionExpression: fecha_dia=hoy
3. Contar ok_count y error_count por rfc_emisor
4. Para cada emisor activo: SES v2 sendEmail al email_resumen
   - ConfigurationSetName: factufast-resumen-config
   - Subject: f"Resumen de facturas — {fecha_dia}"
   - Body: ok_count, error_count, total
5. Return {"statusCode": 200}
```

---

## Credenciales en AWS Parameter Store / Secrets Manager

| Parámetro | Servicio | Descripción |
|---|---|---|
| `/factufast/facturama_user` | SSM SecureString | Usuario Basic Auth Facturama |
| `/factufast/facturama_password` | SSM SecureString | Password Basic Auth Facturama |
| `/factufast/ses_from_email` | SSM String | Email verificado SES (`facturas@dominio.com`) |
| `/factufast/admin_key` | SSM SecureString | Valor del header `x-admin-key` |
| KMS Key ARN | Variable de entorno | `CSD_KMS_KEY_ARN` en Lambda RegistrarEmisor |

**Nunca** en código, `.env` commitado, ni variables de entorno en texto plano para credenciales.

---

## Orden de Implementación Recomendado

### Fase 6a — Core (desbloquea el formulario público)
1. Crear tabla `facturas` + tabla `facturas-counters` en template.yaml
2. Crear bucket `factufast-facturas` (SSE-S3, Block Public Access total)
3. Implementar `CrearFactura` Lambda
4. API Gateway: `POST /facturas` con Usage Plan + x-api-key
5. SES v2: verificar dominio, crear config set `factufast-config`, template `FacturaEmitida`

### Fase 6b — Portal PYME
6. Crear tabla `emisores` en template.yaml
7. Crear bucket `factufast-csd` (SSE-KMS, Block Public Access total)
8. Implementar `RegistrarEmisor` Lambda
9. Implementar `ObtenerStatsEmisor`, `ListarFacturasEmisor`, `ObtenerConfiguracionEmisor`
10. API Gateway rutas `/pyme/*` con validación de `x-rfc` header

### Fase 6c — Portal Admin + Resumen Diario
11. Implementar `ObtenerStatsAdmin`, `ListarEmisores`, `ListarTodasFacturas`, `HealthCheck`
12. API Gateway rutas `/admin/*` con validación de `x-admin-key`
13. Implementar `ResumenDiario` Lambda
14. SES: crear config set `factufast-resumen-config`
15. EventBridge Scheduler: `cron(0 18 * * ? *)` con `ScheduleExpressionTimezone: America/Mexico_City`

### Fase 6d — Hardening pre-producción
16. GSI adicional en `facturas` para query por `rfc_receptor` (portal admin)
17. TTL en registros ERROR (30 días)
18. Reemplazar `x-rfc` / `x-admin-key` con Cognito User Pools + grupos IAM
19. WAF en API Gateway: geo-restriction México, rate limiting por IP
20. Tabla de agregados para stats admin (evitar Scan en producción)

---

## Notas de Integración Frontend

Los servicios mock del frontend deben reemplazarse en el orden de la Fase 6:

| Archivo frontend | Reemplazar cuando | Endpoint real |
|---|---|---|
| `services/api.ts` | Fase 6a | `POST /facturas` (ya apunta al backend real) |
| `services/pyme-api.ts` | Fase 6b | `GET /pyme/stats`, `/pyme/facturas`, `/pyme/configuracion` |
| `services/admin-api.ts` | Fase 6c | `GET /admin/stats`, `/admin/emisores`, `/admin/facturas`, `/admin/services` |

El formulario de `Registro.tsx` envía `multipart/form-data` a `POST /emisores` — asegurarse de que API Gateway tenga `binaryMediaTypes: ['multipart/form-data']` en template.yaml.
