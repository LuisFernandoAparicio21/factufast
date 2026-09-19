import logging
import os
from datetime import datetime
from zoneinfo import ZoneInfo

import boto3
from boto3.dynamodb.conditions import Key
from botocore.exceptions import ClientError

logger = logging.getLogger()
logger.setLevel(logging.INFO)

_MX_TZ = ZoneInfo("America/Mexico_City")
_table = None
_ses = None


def _get_table():
    global _table
    if _table is None:
        _table = boto3.resource("dynamodb").Table(os.environ["DYNAMODB_TABLE"])
    return _table


def _get_ses():
    global _ses
    if _ses is None:
        _ses = boto3.client("sesv2")
    return _ses


def handler(event, context):
    fecha_dia = datetime.now(tz=_MX_TZ).strftime("%Y-%m-%d")

    items = _query_dia(fecha_dia)
    ok_count = sum(1 for i in items if i.get("estatus") == "OK")
    error_count = sum(1 for i in items if i.get("estatus") == "ERROR")
    total = ok_count + error_count

    logger.info("Resumen %s: OK=%d ERROR=%d", fecha_dia, ok_count, error_count)

    _enviar_resumen(fecha_dia, ok_count, error_count, total)
    return {"statusCode": 200}


def _query_dia(fecha_dia: str) -> list:
    table = _get_table()
    items = []
    kwargs = {
        "IndexName": "fecha-estatus-index",
        "KeyConditionExpression": Key("fecha_dia").eq(fecha_dia),
    }
    while True:
        resp = table.query(**kwargs)
        items.extend(resp.get("Items", []))
        last = resp.get("LastEvaluatedKey")
        if not last:
            break
        kwargs["ExclusiveStartKey"] = last
    return items


def _enviar_resumen(fecha_dia: str, ok_count: int, error_count: int, total: int) -> None:
    from_email = os.environ["SES_FROM_EMAIL"]
    config_set = os.environ.get("SES_RESUMEN_CONFIG_SET", "factufast-resumen-config")

    subject = f"Resumen de facturas — {fecha_dia}"
    body = (
        f"Resumen de facturación FactuFastAI\n"
        f"Fecha: {fecha_dia}\n\n"
        f"  Timbradas OK : {ok_count}\n"
        f"  Errores      : {error_count}\n"
        f"  Total        : {total}\n\n"
        f"FactuFastAI · CFDI 4.0"
    )

    try:
        _get_ses().send_email(
            FromEmailAddress=from_email,
            Destination={"ToAddresses": [from_email]},
            Content={
                "Simple": {
                    "Subject": {"Data": subject, "Charset": "UTF-8"},
                    "Body": {"Text": {"Data": body, "Charset": "UTF-8"}},
                }
            },
            ConfigurationSetName=config_set,
        )
    except ClientError as exc:
        logger.error("SES resumen error: %s", exc)
        raise
