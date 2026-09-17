import os
import pytest
import boto3
from moto import mock_aws

os.environ["DYNAMODB_TABLE"] = "factufast-facturas-test"
os.environ["FACTURAMA_USER"] = "test_user"
os.environ["FACTURAMA_PASS"] = "test_pass"

@pytest.fixture
def ddb_table():
    with mock_aws():
        client = boto3.resource("dynamodb", region_name="us-east-1")
        table = client.create_table(
            TableName=os.environ["DYNAMODB_TABLE"],
            KeySchema=[
                {"AttributeName": "rfc", "KeyType": "HASH"},
                {"AttributeName": "folio_fiscal", "KeyType": "RANGE"},
            ],
            AttributeDefinitions=[
                {"AttributeName": "rfc", "AttributeType": "S"},
                {"AttributeName": "folio_fiscal", "AttributeType": "S"},
            ],
            BillingMode="PAY_PER_REQUEST",
        )
        yield table
