# FactuFastAI

MVP de facturación electrónica CFDI 4.0 construido sobre AWS Serverless. Proyecto de práctica para aprender AWS con un caso real: una pyme manda 4 datos y recibe su factura timbrada por correo.

> Sandbox Facturama — las facturas generadas son apócrifas (sin validez legal).

---

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | HTML + CSS + JS estático, desplegado en **AWS Amplify** |
| API | **API Gateway** (REST) |
| Backend | **AWS Lambda** · Python 3.12 · SAM |
| Base de datos | **DynamoDB** On-Demand (`pk=rfc`, `sk=folio_fiscal`) |
| Correo | **Amazon SES v2** (link pre-firmado S3) |
| PAC (timbrado) | **Facturama** API Multiemisor sandbox |
| Credenciales | **AWS SSM Parameter Store** |
| IaC | **AWS SAM** (`template.yaml`) |

---

## Arquitectura

```
Formulario (Amplify)
      ↓
 API Gateway  POST /facturas
      ↓
 Lambda crear_factura
      ├─ 1. validar_campos()
      ├─ 2. Facturama API → CFDI timbrado
      ├─ 3. DynamoDB → guardar estatus + folio fiscal
      ├─ 4. S3 → guardar PDF/XML
      └─ 5. SES → enviar link al receptor
```

---

## Estructura del proyecto

```
factufast/
├── backend/
│   ├── src/
│   │   ├── handlers/
│   │   │   └── crear_factura.py     # Handler principal del Lambda
│   │   ├── services/
│   │   │   └── facturama.py         # Cliente Facturama API
│   │   └── utils/
│   │       ├── db.py                # Escritura a DynamoDB
│   │       ├── validators.py        # Validación RFC, CP, régimen
│   │       └── response.py          # Helpers HTTP 200/400/500
│   ├── layers/python/
│   │   └── requirements.txt         # Dependencias empaquetadas en Lambda Layer
│   ├── events/
│   │   └── crear_factura.json       # Evento de prueba para sam local invoke
│   ├── tests/
│   │   └── conftest.py
│   ├── requirements.txt
│   ├── samconfig.toml
│   └── template.yaml                # Infraestructura SAM (Lambda + API GW + DynamoDB)
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── amplify.yml                      # Build spec para Amplify CI/CD
├── .env.example                     # Variables de entorno para desarrollo local
├── .gitignore
└── proyecto-facturacion-mvp.md      # Documento técnico completo del MVP
```

---

## Prerrequisitos

- [AWS CLI](https://aws.amazon.com/cli/) configurado (`aws configure`)
- [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)
- Python 3.12
- Cuenta en [Facturama sandbox](https://apisandbox.facturama.mx)

---

## Configuración inicial

### 1. Cargar credenciales de Facturama en SSM

```bash
aws ssm put-parameter \
  --name /factufast/facturama_user \
  --value "TU_USUARIO_SANDBOX" \
  --type SecureString

aws ssm put-parameter \
  --name /factufast/facturama_pass \
  --value "TU_PASSWORD_SANDBOX" \
  --type SecureString
```

### 2. Cargar el CSD de prueba en Facturama (una sola vez)

```bash
# Con un script Python local, antes de desplegar
# Ver sección 4.1 de proyecto-facturacion-mvp.md
python scripts/cargar_csd.py
```

### 3. Variables de entorno para desarrollo local

```bash
cp .env.example .env
# Editar .env con tus credenciales sandbox
```

---

## Despliegue

```bash
cd backend

# Primera vez
sam build
sam deploy --guided

# Deploys siguientes
sam build && sam deploy
```

Al terminar, SAM imprime el `ApiUrl` — ese endpoint va en `frontend/app.js`.

---

## Prueba local

```bash
cd backend

# Invocar el Lambda con el evento de prueba
sam local invoke CrearFacturaFunction --event events/crear_factura.json

# Levantar API local (requiere Docker)
sam local start-api
```

---

## Verificaciones necesarias antes del test end-to-end

1. **SES — verificar identidades**: en AWS Console → SES → Verified identities, verificar el correo emisor y el correo receptor de prueba (sandbox SES solo envía a direcciones verificadas).
2. **SES — crear Configuration Set**: SES → Configuration sets → crear `factufast-config`.

---

## Sandbox vs Producción

| | Sandbox | Producción |
|---|---|---|
| RFC emisor | `EKU9003173C9` (prueba) | RFC real de la pyme |
| CSD | Certificado de prueba Facturama | CSD real tramitado ante el SAT |
| Cuenta Facturama | Gratis, sin trámite | Suscripción + activar Multiemisor |
| Validez CFDI | Ninguna (apócrifo) | Legal ante el SAT |
| Código | Igual | Igual — solo cambian los datos |
| URL Facturama | `apisandbox.facturama.mx` | `api.facturama.mx` |
| SES | Sandbox (solo direcciones verificadas) | Verificar dominio completo + DKIM/SPF/DMARC |

---

## Notas de diseño

- **DynamoDB On-Demand** — sin necesidad de estimar RCU/WCU; escala automático y entra en Free Tier para volúmenes bajos.
- **Un solo `put_item` al final** — el Lambda escribe en DynamoDB después de llamar a Facturama, no antes, para evitar doble escritura en caso de error.
- **ConditionExpression en put_item** — protege contra retries del cliente que sobreescriban un registro ya guardado.
- **Link S3 en lugar de adjunto PDF** — SES envía un pre-signed URL válido 24h; adjuntar binarios requiere MIME a mano.
- **SSM Parameter Store** para credenciales Facturama — no variables de entorno en texto plano.
