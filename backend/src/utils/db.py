import os
import boto3
from datetime import datetime, timezone

_table = None

def _get_table():
    global _table
    if _table is None:
        _table = boto3.resource("dynamodb").Table(os.environ["DYNAMODB_TABLE"])
    return _table

def guardar_factura(datos: dict, resultado: dict):
    _get_table().put_item(Item={
        "rfc": datos["rfc"].upper(),
        "folio_fiscal": resultado["folio_fiscal"],
        "nombre": datos["nombre"],
        "codigo_postal": datos["codigo_postal"],
        "regimen_fiscal": datos["regimen_fiscal"],
        "pdf_url": resultado["pdf_url"],
        "xml_url": resultado["xml_url"],
        "fecha": datetime.now(timezone.utc).isoformat(),
        "estatus": "timbrada",
    })
