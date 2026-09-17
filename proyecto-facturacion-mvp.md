# FactuFastAI — MVP de facturación automática (proyecto de práctica AWS)

Documento de referencia con toda la información técnica confirmada para construir el MVP. Objetivo del proyecto: aprender AWS con un caso real, no facturación en producción.

---

## 1. Modelo de negocio (resumen)

- **FactuFastAI** es la capa intermedia simple entre una pyme (doctor, restaurante, ferretería) y el PAC (proveedor autorizado de timbrado).
- El cliente final manda sus datos, un agente/formulario los interpreta, el sistema llama al PAC, se regresa la factura.
- **Facturama es reemplazable** — solo cumple el rol de PAC. El valor real del negocio está en la capa intermedia (interpretación de datos, manejo de errores, simplicidad), no en el PAC elegido.

### Roles en cada factura
| Rol | Quién es | Qué necesita |
|---|---|---|
| **Emisor** | Tu pyme cliente directa (ej. Consultorio Dr. X) | RFC + CSD (certificado + llave privada) |
| **Receptor** | El cliente del cliente (paciente, comensal) | Solo 4 datos: RFC, nombre, código postal, régimen fiscal — sin CSD |

---

## 2. Datos de prueba confirmados (sandbox Facturama)

### Emisor de prueba (simula a tu pyme cliente)
```
RFC: EKU9003173C9
Nombre: ESCUELA KEMPER URGATE
Régimen fiscal: 601
```
CSD de prueba descargado desde `apisandbox.facturama.mx/guias/conocimientos/sellos-digitales-pruebas`, carpeta `Personas Morales > EKU9003173C9_...`, archivos de "Sucursal_1" (`.cer` y `.key`), contraseña fija: **`12345678a`**

### Receptor de prueba (simula al cliente final / paciente)
Dato tomado del ejemplo oficial de Facturama en `apisandbox.facturama.mx/guias/api-multi/cfdi/factura`:
```
RFC: URE180429TM6
Nombre: UNIVERSIDAD ROBOTICA ESPAÑOLA
Régimen fiscal: 601
Código postal: 65000
```

---

## 3. Autenticación contra Facturama

No existe una "API key" separada. Es **Basic Auth** con el usuario y contraseña de tu cuenta de Facturama (la misma con la que te registraste en el dashboard), confirmado en los SDKs oficiales:

```python
# Python SDK
facturama._credentials = ('username', 'password')
```
```php
// PHP SDK
$facturama = new \Facturama\Client('USER', 'PASSWORD');
```

En una llamada HTTP directa, va en el header:
```
Authorization: Basic <base64(usuario:contraseña)>
```

> **Dónde guardar las credenciales en AWS**: guardarlas en **AWS Secrets Manager**, no en variables de entorno en texto plano ni en el código. Leerlas desde Lambda con:
> ```python
> import boto3, json
> secret = boto3.client('secretsmanager').get_secret_value(SecretId='facturama/credentials')
> creds = json.loads(secret['SecretString'])
> # creds['usuario'], creds['password']
> ```

---

## 4. Endpoints confirmados de la API (Multiemisor, sandbox)

### 4.1 Cargar el CSD (paso único, antes de poder facturar)
```
POST https://apisandbox.facturama.mx/api-lite/csds
```
```json
{
  "Rfc": "EKU9003173C9",
  "Certificate": "...(.cer en base64)...",
  "PrivateKey": "...(.key en base64)...",
  "PrivateKeyPassword": "12345678a"
}
```
Otras operaciones sobre CSD:
- `GET /api-lite/csds` — lista los CSD cargados
- `GET /api-lite/csds/{rfc}` — obtiene el CSD de un RFC
- `PUT /api-lite/csds/{rfc}` — actualiza un CSD existente
- `DELETE /api-lite/csds/{rfc}` — elimina un CSD

Este paso se hace **una sola vez por RFC**. Facturama guarda el certificado internamente y lo usa automáticamente después, sin que tengas que volver a mandarlo.

> **Cómo ejecutarlo**: con un script Python local (fuera de AWS), la primera vez que configures el RFC. No es parte del Lambda de facturar — es un paso de setup separado.

### 4.2 Timbrar un CFDI (cada vez que se factura)
```
POST https://apisandbox.facturama.mx/api-lite/3/cfdis
```
```json
{
  "CfdiType": "I",
  "PaymentForm": "01",
  "PaymentMethod": "PUE",
  "ExpeditionPlace": "65000",
  "Folio": 120,
  "Issuer": {
    "FiscalRegime": "601",
    "Rfc": "EKU9003173C9",
    "Name": "ESCUELA KEMPER URGATE"
  },
  "Receiver": {
    "Rfc": "URE180429TM6",
    "CfdiUse": "G03",
    "Name": "UNIVERSIDAD ROBOTICA ESPAÑOLA",
    "FiscalRegime": "601",
    "TaxZipCode": "65000"
  },
  "Items": [
    {
      "ProductCode": "25173108",
      "Description": "Servicio de prueba MVP",
      "UnitCode": "E48",
      "Quantity": 1.0,
      "UnitPrice": 100.0,
      "Subtotal": 100.00,
      "TaxObject": "02",
      "Taxes": [
        {"Total": 16, "Name": "IVA", "Base": 100, "Rate": 0.16, "IsRetention": false}
      ],
      "Total": 116
    }
  ]
}
```

**Nota importante:** en API Multiemisor, el `Folio` NO se asigna automático — hay que mandarlo tú en cada petición (a diferencia de otros sistemas que lo autoincrementan solos).

**Validación de entrada antes de incrementar el folio** — si el RFC o CP están mal, retornar 400 al frontend ANTES de tocar el contador. Un folio incrementado sin factura se pierde para siempre:

```python
import re

def validar_datos(rfc, codigo_postal, regimen):
    if not re.match(r'^[A-Z&Ñ]{3,4}[0-9]{6}[A-Z0-9]{3}$', rfc):
        raise ValueError(f"RFC inválido: {rfc}")
    if not re.match(r'^\d{5}$', str(codigo_postal)):
        raise ValueError(f"Código postal inválido: {codigo_postal}")
    regimenes_validos = {'601', '612', '616', '621', '625', '626'}
    if str(regimen) not in regimenes_validos:
        raise ValueError(f"Régimen fiscal no reconocido: {regimen}")
```

**Estrategia para generar el Folio sin colisiones** — usar un contador atómico en DynamoDB antes de llamar a Facturama:

```python
response = dynamo.update_item(
    TableName='facturas-counters',
    Key={'pk': {'S': 'folio'}},
    UpdateExpression='ADD folio_actual :inc',
    ExpressionAttributeValues={':inc': {'N': '1'}},
    ReturnValues='UPDATED_NEW'
)
folio = int(response['Attributes']['folio_actual']['N'])
```

**Manejo de error de timbrado + escritura correcta a DynamoDB** — un solo `put_item` al final (no antes de llamar a Facturama). Incluye `ConditionExpression` para que retries no sobreescriban un registro ya existente, y `ttl` en registros ERROR para que DynamoDB los limpie automáticamente a los 30 días:

```python
import time
from datetime import datetime

timestamp = datetime.utcnow().isoformat()

try:
    cfdi_response = llamar_facturama(payload)
    item = {
        'pk': {'S': rfc_receptor},
        'sk': {'S': f'FOLIO#{folio:05d}'},
        'estatus': {'S': 'OK'},
        'facturama_id': {'S': cfdi_response['Id']},
        's3_key': {'S': s3_key},
        'rfc_emisor': {'S': rfc_emisor},
        'timestamp': {'S': timestamp},
    }
except Exception as e:
    item = {
        'pk': {'S': rfc_receptor},
        'sk': {'S': f'FOLIO#{folio:05d}'},
        'estatus': {'S': 'ERROR'},
        'error': {'S': str(e)},
        'rfc_emisor': {'S': rfc_emisor},
        'timestamp': {'S': timestamp},
        'ttl': {'N': str(int(time.time()) + 30 * 86400)},  # auto-eliminar en 30 días
    }
    dynamo.put_item(
        TableName='facturas',
        Item=item,
        ConditionExpression='attribute_not_exists(pk) AND attribute_not_exists(sk)'
    )
    return {"statusCode": 500, "body": str(e)}

dynamo.put_item(
    TableName='facturas',
    Item=item,
    ConditionExpression='attribute_not_exists(pk) AND attribute_not_exists(sk)'
    # Si este folio ya existe (retry del cliente), lanza ConditionalCheckFailedException
    # y no sobreescribe el registro original
)
```

### Respuesta esperada (factura timbrada)
```json
{
  "Id": "abc123...",
  "Complement": {
    "PdfUrl": "...",
    "XmlUrl": "..."
  }
}
```

---

## 5. Arquitectura del MVP en AWS

### Flujo inmediato (cada vez que alguien pide factura)
```
Formulario web (AWS Amplify)
        ↓
   API Gateway
        ↓
      Lambda facturar
        ├──1. validar_datos()              ← sin tocar AWS, falla rápido con 400
        ├──2. DynamoDB counter             ← obtener folio atómico
        ├──3. Facturama API                ← timbrar CFDI (puede fallar)
        ├──4. DynamoDB facturas put_item   ← un solo write con estatus OK|ERROR + ConditionExpression
        ├──5. S3                           ← guardar PDF/XML (solo si estatus=OK)
        └──6. SES                          ← mandar link al cliente final (solo si estatus=OK)
```

### Flujo programado (resumen periódico a la pyme, sin disparo manual)
```
EventBridge (regla cron, ej. diario 6pm)
        ↓
   Lambda resumen
        ├──→ DynamoDB (cuenta cuántas facturas se hicieron)
        └──→ SES (manda el correo resumen a la pyme)
```

| Pieza | Servicio | Rol |
|---|---|---|
| Frontend | **AWS Amplify** | Hostea el formulario con los 4 campos del receptor |
| Backend (facturar) | **AWS Lambda** | Recibe datos, valida, llama a Facturama, guarda en DB, envía correo |
| Backend (resumen) | **AWS Lambda** (segunda función) | Consulta DynamoDB y manda el resumen a la pyme |
| API | **API Gateway** | Expone el endpoint REST que llama el frontend |
| Base de datos | **DynamoDB On-Demand** | Dos tablas: `facturas` (pk=RFC_receptor, sk=FOLIO#n, GSI estatus-timestamp) y `facturas-counters` (pk=folio). TTL activo en registros ERROR. |
| Almacenamiento | **Amazon S3** | Guarda el archivo PDF/XML de cada factura timbrada |
| PAC | **Facturama (sandbox)** | Timbra el CFDI, fuera de AWS |
| Correo | **Amazon SES** | Envía el link S3 al PDF al cliente final y el resumen a la pyme. Usar `sesv2` (no `ses` V1 legacy) |
| Programación | **Amazon EventBridge** | Dispara la Lambda de resumen en horario fijo (cron), sin intervención manual |

### Por qué se decidió así (sin sobre-ingeniería)
- El correo al cliente final va **directo desde la Lambda de facturar hacia SES** — no se usa EventBridge para esto, porque es una acción inmediata y agregar una cola/evento de por medio solo complicaría el debugging sin aportar nada en el volumen de un MVP.
- EventBridge solo se usa donde sí aporta algo que no se puede lograr de otra forma simple: **ejecutar algo en un horario fijo**, sin que nadie tenga que llamarlo a mano (el resumen periódico a la pyme).

### Cómo llamar a SES correctamente desde Lambda

Usar siempre `sesv2` (no `ses`, que es V1 legacy). El correo manda un **link pre-firmado de S3** al PDF — no el PDF como adjunto, porque adjuntar binarios en SES requiere construir MIME a mano y complica el Lambda sin necesidad en un MVP.

```python
import boto3

s3 = boto3.client('s3')
ses = boto3.client('sesv2', region_name='us-east-1')

# 1. Generar link al PDF guardado en S3 (válido 24h)
# Clave estructurada: permite lifecycle rules por emisor y auditoría por período
año = datetime.utcnow().strftime('%Y')
mes = datetime.utcnow().strftime('%m')
s3_key = f"facturas/{rfc_emisor}/{año}/{mes}/{folio:05d}.pdf"

url_pdf = s3.generate_presigned_url(
    'get_object',
    Params={'Bucket': 'facturas-bucket', 'Key': s3_key},
    ExpiresIn=86400
)

# 2. Enviar correo con link (usar sesv2, siempre con ConfigurationSetName)
ses.send_email(
    FromEmailAddress='facturas@tudominio.com',
    Destination={'ToAddresses': [correo_receptor]},
    Content={
        'Simple': {
            'Subject': {'Data': f'Tu factura #{folio} — FactuFastAI'},
            'Body': {'Text': {'Data': f'Tu CFDI está listo. Descárgalo aquí (válido 24h):\n{url_pdf}'}}
        }
    },
    ConfigurationSetName='factufast-config'  # necesario para tener observabilidad
)
```

### Definición de tablas DynamoDB en SAM (template.yaml)

Ambas tablas van en el SAM template para que el entorno sea reproducible. `BillingMode: PAY_PER_REQUEST` (On-Demand) evita throttling por adivinar RCU/WCU y sigue dentro del Free Tier para volúmenes bajos:

```yaml
FacturasTable:
  Type: AWS::DynamoDB::Table
  Properties:
    TableName: facturas
    BillingMode: PAY_PER_REQUEST
    AttributeDefinitions:
      - {AttributeName: pk, AttributeType: S}
      - {AttributeName: sk, AttributeType: S}
      - {AttributeName: estatus, AttributeType: S}
      - {AttributeName: timestamp, AttributeType: S}
    KeySchema:
      - {AttributeName: pk, KeyType: HASH}
      - {AttributeName: sk, KeyType: RANGE}
    GlobalSecondaryIndexes:
      - IndexName: estatus-timestamp-index
        KeySchema:
          - {AttributeName: estatus, KeyType: HASH}
          - {AttributeName: timestamp, KeyType: RANGE}
        Projection: {ProjectionType: ALL}
    TimeToLiveSpecification:
      AttributeName: ttl
      Enabled: true

CountersTable:
  Type: AWS::DynamoDB::Table
  Properties:
    TableName: facturas-counters
    BillingMode: PAY_PER_REQUEST
    AttributeDefinitions:
      - {AttributeName: pk, AttributeType: S}
    KeySchema:
      - {AttributeName: pk, KeyType: HASH}
```

> El item del counter (`folio_actual`) NO necesita crearse manualmente. La primera llamada con `ADD folio_actual :1` crea el item y lo inicializa en 1 automáticamente.

### Por qué esto se mantiene dentro del Free Tier
- **Lambda**: 1 millón de requests/mes gratis, siempre (no expira) — aplica a ambas funciones
- **DynamoDB**: On-Demand incluye 1 millón de write request units + 1 millón de read request units por mes gratis, más 25 GB de almacenamiento. Suficiente para miles de facturas de prueba sin costo.
- **S3**: 5 GB de almacenamiento estándar gratis, siempre (no expira) — más que suficiente para PDFs/XML de facturas de prueba
- **API Gateway** y **Amplify**: elegibles Free Tier, consumen créditos pero el volumen de un MVP de práctica no se acerca al límite
- **SES**: tiene capa gratuita mensual de envíos, suficiente para pruebas
- **EventBridge**: las reglas programadas (cron) básicas caen dentro del Free Tier
- Se evita **Bedrock** en esta fase (cobra por token desde el día 1) — se puede sustituir por un parser simple (validación de campos) en el Lambda

### Herramientas necesarias en tu computadora
- **AWS CLI** — para hablar con tu cuenta AWS desde terminal
- **AWS SAM CLI** — para desplegar Lambda + API Gateway + DynamoDB con un solo comando
- **Python 3.x** — para escribir la lógica del Lambda
- Credenciales de AWS configuradas (`aws configure`)

---

## 6. Diferencia entre esto (sandbox/práctica) y producción real

| | Ahora (práctica) | Producción real |
|---|---|---|
| RFC emisor | `EKU9003173C9` (de prueba) | RFC real de cada pyme cliente |
| CSD | El del zip de pruebas, password `12345678a` | CSD real tramitado por cada pyme ante el SAT |
| Cuenta Facturama | Sandbox (sin costo, sin trámite) | Producción (requiere suscripción ~$1,650 + folios, activar Multiemisor con equipo de ventas) |
| Validez legal | Ninguna (facturas apócrifas) | Válida ante el SAT |
| Código | **Es el mismo código** | **Es el mismo código** — solo cambian los datos que se mandan |
| SES identidades | Verificar emails individuales en sandbox | Verificar el **dominio completo** (DKIM + SPF + DMARC) y solicitar salida de sandbox antes de enviar a clientes reales |
| SES bounces/quejas | No aplica en sandbox | Configurar SNS para recibir notificaciones. Bounce >5% o queja >0.1% activa enforcement de SES y suspende el envío |

---

## 7. Próximos pasos técnicos (orden sugerido)

1. Cargar el CSD de prueba vía `POST /api-lite/csds` (una sola vez) — **hacerlo con un script Python local, fuera de AWS** (ver nota en sección 4.1). No confundirlo con la lógica del Lambda de facturar.
2. Probar el timbrado vía `POST /api-lite/3/cfdis` con un script simple, fuera de AWS, para confirmar que el flujo funciona
3. Escribir la función Lambda que hace lo mismo que el script de prueba, pero recibiendo datos de una petición HTTP
4. Definir **dos tablas de DynamoDB**:
   - `facturas`: `pk = RFC_receptor` + `sk = FOLIO#<número>`. Atributos: `timestamp`, `estatus`, `facturama_id`, `s3_key`, `rfc_emisor`. GSI: `estatus-timestamp-index` (pk=`estatus`, sk=`timestamp`) para que el Lambda resumen haga queries eficientes sin full scan.
   - `facturas-counters`: `pk = 'folio'`, atributo `folio_actual` (Number, inicializar en 0 al crear la tabla).
5. Exponer la Lambda con API Gateway
6. Construir el formulario HTML con los 4 campos del receptor
7. Publicar el formulario en Amplify
8. **Antes** de la prueba end-to-end, hacer estos dos pasos en SES:
   - **a)** Ir a SES → Verified identities y verificar **tanto el correo emisor como el receptor de prueba**. En sandbox de SES solo puedes enviar a direcciones verificadas — sin esto la llamada falla.
   - **b)** Crear un Configuration Set (`factufast-config`) en SES → Configuration sets. Sin él no hay observabilidad de entregas ni bounces. Toma 30 segundos y no tiene costo.
9. Prueba end-to-end: llenar el formulario real y confirmar que regresa el PDF/XML
