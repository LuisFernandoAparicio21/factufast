import os
import sys
import json
import pytest
import boto3
from moto import mock_aws

# Permite imports como "from handlers.crear_factura import handler"
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../src"))

# Credenciales ficticias requeridas por moto
os.environ.setdefault("AWS_DEFAULT_REGION",    "us-east-1")
os.environ.setdefault("AWS_ACCESS_KEY_ID",     "testing")
os.environ.setdefault("AWS_SECRET_ACCESS_KEY", "testing")
os.environ.setdefault("AWS_SECURITY_TOKEN",    "testing")
os.environ.setdefault("AWS_SESSION_TOKEN",     "testing")

# Env vars que Lambda recibiría de SAM
os.environ["DYNAMODB_TABLE"] = "factufast-facturas-test"
os.environ["COUNTERS_TABLE"] = "factufast-counters-test"
os.environ["S3_BUCKET"]      = "factufast-facturas-test-bucket"
os.environ["SES_FROM_EMAIL"] = "facturas@test.com"
os.environ["SES_CONFIG_SET"] = "factufast-config"
os.environ["FACTURAMA_USER"] = "test_user"
os.environ["FACTURAMA_PASS"] = "test_pass"


@pytest.fixture
def aws_mock():
    with mock_aws():
        yield


@pytest.fixture
def facturas_table(aws_mock):
    ddb = boto3.resource("dynamodb", region_name="us-east-1")
    table = ddb.create_table(
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
    yield table


@pytest.fixture
def counters_table(aws_mock):
    ddb = boto3.resource("dynamodb", region_name="us-east-1")
    table = ddb.create_table(
        TableName=os.environ["COUNTERS_TABLE"],
        KeySchema=[{"AttributeName": "rfc_emisor", "KeyType": "HASH"}],
        AttributeDefinitions=[{"AttributeName": "rfc_emisor", "AttributeType": "S"}],
        BillingMode="PAY_PER_REQUEST",
    )
    yield table


@pytest.fixture
def s3_bucket(aws_mock):
    s3 = boto3.client("s3", region_name="us-east-1")
    s3.create_bucket(Bucket=os.environ["S3_BUCKET"])
    yield s3


@pytest.fixture
def ses_mock(aws_mock):
    ses = boto3.client("sesv2", region_name="us-east-1")
    ses.create_email_identity(EmailIdentity=os.environ["SES_FROM_EMAIL"])
    yield ses


@pytest.fixture
def full_aws(facturas_table, counters_table, s3_bucket, ses_mock):
    """Todos los recursos AWS mockeados listos para tests de integración local."""
    yield {
        "facturas_table": facturas_table,
        "counters_table": counters_table,
        "s3":             s3_bucket,
        "ses":            ses_mock,
    }


@pytest.fixture(autouse=True)
def reset_db_cache():
    """Limpia los clientes boto3 cacheados en db.py y s3.py entre tests."""
    import utils.db as db_module
    db_module._table = None
    db_module._counters_table = None
    yield
    db_module._table = None
    db_module._counters_table = None


# ── Helpers compartidos ───────────────────────────────────────────────────────

def make_event(body: dict) -> dict:
    return {"body": json.dumps(body)}


PAYLOAD_VALIDO = {
    "rfc":             "URE180429TM6",
    "nombre":          "UNIVERSIDAD ROBOTICA ESPAÑOLA",
    "codigo_postal":   "65000",
    "regimen_fiscal":  "601",
    "email_receptor":  "receptor@test.com",
}
