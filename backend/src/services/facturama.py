import os
from datetime import datetime
import requests
from requests.auth import HTTPBasicAuth

FACTURAMA_URL = "https://apisandbox.facturama.mx"
_auth = HTTPBasicAuth(
    os.environ["FACTURAMA_USER"],
    os.environ["FACTURAMA_PASS"],
)

_RFC_EMISOR = os.environ.get("RFC_EMISOR", "EKU9003173C9")
_REGIMEN_EMISOR = os.environ.get("FACTURAMA_REGIMEN_EMISOR", "601")
_NOMBRE_EMISOR = os.environ.get("FACTURAMA_NOMBRE_EMISOR", "ESCUELA KEMPER URGATE")


def timbrar_factura(datos: dict, folio: int) -> dict:
    payload = _construir_cfdi(datos, folio)
    r = requests.post(f"{FACTURAMA_URL}/api-lite/3/cfdis", json=payload, auth=_auth, timeout=15)
    if not r.ok:
        raise requests.HTTPError(
            f"{r.status_code} {r.reason} — {r.text[:400]}",
            response=r,
        )
    cfdi = r.json()

    folio = cfdi["Id"]
    return {
        "folio_fiscal": cfdi.get("Complement", {}).get("TaxStamp", {}).get("Uuid", folio),
        "pdf_url": f"{FACTURAMA_URL}/cfdi/{folio}/pdf",
        "xml_url": f"{FACTURAMA_URL}/cfdi/{folio}/xml",
    }


def _global_info(d: dict) -> dict:
    """Retorna GlobalInformation solo cuando el receptor es XAXX010101000."""
    if d.get("rfc", "").upper() != "XAXX010101000":
        return {}
    now = datetime.utcnow()
    return {
        "GlobalInformation": {
            "Periodicity": "01",
            "Months": f"{now.month:02d}",
            "Year": str(now.year),
        }
    }


def _construir_cfdi(d: dict, folio: int) -> dict:
    return {
        "Serie": "FF",
        "Folio": str(folio),
        "Currency": "MXN",
        "ExpeditionPlace": os.environ.get("FACTURAMA_EXPEDITION_CP", "29000"),
        "Issuer": {
            "Rfc": _RFC_EMISOR,
            "Name": _NOMBRE_EMISOR,
            "FiscalRegime": _REGIMEN_EMISOR,
        },
        "PaymentConditions": "CONTADO",
        "CfdiType": "I",
        "PaymentForm": "01",
        "PaymentMethod": "PUE",
        **_global_info(d),
        "Receiver": {
            "Rfc": d["rfc"],
            "Name": d["nombre"],
            "CfdiUse": d.get("cfdi_use", "G03"),
            "FiscalRegime": d["regimen_fiscal"],
            "TaxZipCode": d["codigo_postal"],
        },
        "Items": [
            {
                "ProductCode": "84111506",
                "IdentificationNumber": "SRV-001",
                "Description": "Servicio de facturación electrónica",
                "Unit": "Servicio",
                "UnitCode": "E48",
                "UnitPrice": 100.00,
                "Quantity": 1,
                "Subtotal": 100.00,
                "TaxObject": "02",
                "Taxes": [
                    {
                        "Total": 16.00,
                        "Name": "IVA",
                        "Base": 100.00,
                        "Rate": 0.16,
                        "IsRetention": False,
                    }
                ],
                "Total": 116.00,
            }
        ],
    }
