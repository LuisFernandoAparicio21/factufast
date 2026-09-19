"""
Prueba de integración local sin Docker.

Dos modos:
  --mode mock   (default) AWS mockeado con moto + Facturama sandbox REAL
  --mode aws    AWS real (tablas/bucket ya creados por sam deploy) + Facturama real

Uso:
  cd backend

  # Modo mock — no necesita credenciales AWS, solo Facturama
  python scripts/invoke_local.py

  # Modo aws — requiere sam deploy previo y AWS_PROFILE o aws configure
  python scripts/invoke_local.py --mode aws

  # Pasar datos distintos
  python scripts/invoke_local.py --rfc URE180429TM6 --email tu@email.com

  # Probar flujo de error (RFC inválido)
  python scripts/invoke_local.py --rfc INVALIDO

Requiere backend/.env con:
  FACTURAMA_USER=tu_usuario_sandbox
  FACTURAMA_PASS=tu_password_sandbox
  SES_FROM_EMAIL=remitente@tudominio.com

En modo --mode aws también requiere:
  DYNAMODB_TABLE=factufast-facturas-dev
  COUNTERS_TABLE=factufast-counters-dev
  S3_BUCKET=<bucket generado por SAM>
"""
import argparse
import json
import os
import sys
from contextlib import contextmanager

# src/ al path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../src"))

# Carga .env si existe (python-dotenv opcional)
try:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(os.path.dirname(__file__), "../.env"))
except ImportError:
    pass

# ── helpers ──────────────────────────────────────────────────────────────────

def _check_env(*vars_):
    missing = [v for v in vars_ if not os.environ.get(v)]
    if missing:
        for v in missing:
            print(f"  ERROR: falta {v}")
        print("\nCrea backend/.env o expórtalas antes de correr el script.")
        sys.exit(1)


def _reset_singletons():
    """Limpia boto3 cacheados entre runs."""
    import utils.db as db_mod
    db_mod._table = None
    db_mod._counters_table = None
    try:
        import utils.s3 as s3_mod
        s3_mod._s3 = None
    except ImportError:
        pass
    try:
        import utils.email as em_mod
        em_mod._client = None
    except ImportError:
        pass


@contextmanager
def _mock_aws_ctx():
    """Configura moto y crea todos los recursos necesarios."""
    import boto3
    from moto import mock_aws

    os.environ.setdefault("AWS_DEFAULT_REGION",    "us-east-1")
    os.environ.setdefault("AWS_ACCESS_KEY_ID",     "testing")
    os.environ.setdefault("AWS_SECRET_ACCESS_KEY", "testing")
    os.environ["DYNAMODB_TABLE"] = "factufast-facturas-local"
    os.environ["COUNTERS_TABLE"] = "factufast-counters-local"
    os.environ["S3_BUCKET"]      = "factufast-local-bucket"
    os.environ.setdefault("SES_FROM_EMAIL", "test@local.dev")
    os.environ.setdefault("SES_CONFIG_SET", "factufast-config")

    with mock_aws():
        ddb = boto3.resource("dynamodb", region_name="us-east-1")
        ddb.create_table(
            TableName=os.environ["DYNAMODB_TABLE"],
            KeySchema=[
                {"AttributeName": "rfc",         "KeyType": "HASH"},
                {"AttributeName": "folio_fiscal", "KeyType": "RANGE"},
            ],
            AttributeDefinitions=[
                {"AttributeName": "rfc",         "AttributeType": "S"},
                {"AttributeName": "folio_fiscal", "AttributeType": "S"},
                {"AttributeName": "fecha_dia",    "AttributeType": "S"},
                {"AttributeName": "timestamp",    "AttributeType": "S"},
            ],
            GlobalSecondaryIndexes=[{
                "IndexName": "fecha-estatus-index",
                "KeySchema": [
                    {"AttributeName": "fecha_dia",  "KeyType": "HASH"},
                    {"AttributeName": "timestamp",  "KeyType": "RANGE"},
                ],
                "Projection": {"ProjectionType": "ALL"},
            }],
            BillingMode="PAY_PER_REQUEST",
        )
        ddb.create_table(
            TableName=os.environ["COUNTERS_TABLE"],
            KeySchema=[{"AttributeName": "rfc_emisor", "KeyType": "HASH"}],
            AttributeDefinitions=[{"AttributeName": "rfc_emisor", "AttributeType": "S"}],
            BillingMode="PAY_PER_REQUEST",
        )
        boto3.client("s3", region_name="us-east-1").create_bucket(
            Bucket=os.environ["S3_BUCKET"]
        )
        yield ddb


@contextmanager
def _real_aws_ctx():
    """No hace nada — usa las vars de entorno y tablas reales ya desplegadas."""
    _check_env("DYNAMODB_TABLE", "COUNTERS_TABLE", "S3_BUCKET", "SES_FROM_EMAIL", "SES_CONFIG_SET")
    yield None


# ── invocación ────────────────────────────────────────────────────────────────

def _invoke(payload: dict) -> dict:
    _reset_singletons()
    from handlers.crear_factura import handler
    return handler({"body": json.dumps(payload)}, {})


def _print_dynamodb_item(mode, rfc, folio_fiscal):
    """Muestra el item guardado si es posible."""
    try:
        import boto3
        table = boto3.resource("dynamodb").Table(os.environ["DYNAMODB_TABLE"])
        item = table.get_item(
            Key={"rfc": rfc.upper(), "folio_fiscal": folio_fiscal}
        ).get("Item")
        if item:
            print("\n  DynamoDB item guardado:")
            for k, v in sorted(item.items()):
                print(f"    {k:20s}: {v}")
        else:
            print("\n  (item DynamoDB no encontrado — puede ser normal en modo mock)")
    except Exception as exc:
        print(f"\n  (no se pudo leer DynamoDB: {exc})")


# ── main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Prueba de integración local sin Docker",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("--mode",    choices=["mock", "aws"], default="mock",
                        help="mock = AWS con moto | aws = AWS real (requiere sam deploy)")
    parser.add_argument("--rfc",     default="XAXX010101000")
    parser.add_argument("--nombre",  default="PUBLICO EN GENERAL")
    parser.add_argument("--cp",      default="65000")
    parser.add_argument("--regimen", default="616")
    parser.add_argument("--email",   default="",
                        help="Si se pasa, el handler intenta enviar correo SES")
    args = parser.parse_args()

    _check_env("FACTURAMA_USER", "FACTURAMA_PASS")

    payload = {
        "rfc":            args.rfc,
        "nombre":         args.nombre,
        "codigo_postal":  args.cp,
        "regimen_fiscal": args.regimen,
    }
    if args.email:
        payload["email_receptor"] = args.email

    aws_label = "moto (local, sin Docker)" if args.mode == "mock" else f"AWS REAL (tabla: {os.environ.get('DYNAMODB_TABLE', '?')})"

    print("\n" + "─" * 60)
    print("  PRUEBA DE INTEGRACIÓN — FactuFastAI")
    print("─" * 60)
    print(f"  Payload       : {json.dumps(payload, ensure_ascii=False)}")
    print(f"  Facturama     : sandbox REAL → apisandbox.facturama.mx")
    print(f"  AWS services  : {aws_label}")
    print("─" * 60 + "\n")

    ctx = _mock_aws_ctx() if args.mode == "mock" else _real_aws_ctx()

    with ctx:
        response = _invoke(payload)

        status = response["statusCode"]
        body   = json.loads(response["body"])

        print(f"  ← HTTP {status}")
        print(f"  body: {json.dumps(body, indent=4, ensure_ascii=False)}")

        if status == 200:
            print("\n  ✓ Factura timbrada")
            print(f"    folio_fiscal : {body.get('folio_fiscal')}")
            print(f"    pdf_url      : {body.get('pdf_url')}")
            # Muestra el item en DynamoDB para confirmar persistencia
            _print_dynamodb_item(args.mode, args.rfc, body.get("folio_fiscal", ""))
        else:
            print(f"\n  ✗ Error: {body.get('error')}")

    print("\n" + "─" * 60 + "\n")
    sys.exit(0 if status == 200 else 1)


if __name__ == "__main__":
    main()
