import os
import time
from datetime import datetime
from zoneinfo import ZoneInfo

import boto3
from boto3.dynamodb.conditions import Attr

_table = None
_counters_table = None

_MX_TZ = ZoneInfo("America/Mexico_City")


def _get_table():
    global _table
    if _table is None:
        _table = boto3.resource("dynamodb").Table(os.environ["DYNAMODB_TABLE"])
    return _table


def _get_counters():
    global _counters_table
    if _counters_table is None:
        _counters_table = boto3.resource("dynamodb").Table(os.environ["COUNTERS_TABLE"])
    return _counters_table


def incrementar_folio(rfc_emisor: str) -> int:
    """Atomic increment. Returns the new sequential folio number."""
    resp = _get_counters().update_item(
        Key={"rfc_emisor": rfc_emisor},
        UpdateExpression="ADD folio_actual :inc",
        ExpressionAttributeValues={":inc": 1},
        ReturnValues="UPDATED_NEW",
    )
    return int(resp["Attributes"]["folio_actual"])


def guardar_factura(datos: dict, resultado: dict, folio: int) -> None:
    now_mx = datetime.now(tz=_MX_TZ)
    _get_table().put_item(
        Item={
            "rfc": datos["rfc"].upper(),
            "folio_fiscal": resultado["folio_fiscal"],
            "folio": folio,
            "nombre": datos.get("nombre", ""),
            "codigo_postal": datos["codigo_postal"],
            "regimen_fiscal": datos["regimen_fiscal"],
            "pdf_url": resultado.get("pdf_url", ""),
            "xml_url": resultado.get("xml_url", ""),
            "fecha_dia": now_mx.strftime("%Y-%m-%d"),
            "timestamp": now_mx.isoformat(),
            "estatus": "OK",
        },
        ConditionExpression=Attr("rfc").not_exists(),
    )


def guardar_error(datos: dict, folio: int) -> None:
    now_mx = datetime.now(tz=_MX_TZ)
    _get_table().put_item(
        Item={
            "rfc": datos["rfc"].upper(),
            "folio_fiscal": f"ERROR#{folio:05d}",
            "folio": folio,
            "fecha_dia": now_mx.strftime("%Y-%m-%d"),
            "timestamp": now_mx.isoformat(),
            "estatus": "ERROR",
            "ttl": int(time.time()) + 30 * 86400,
        }
    )
