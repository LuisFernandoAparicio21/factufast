import os
import requests
from requests.auth import HTTPBasicAuth

FACTURAMA_URL = "https://apisandbox.facturama.mx"
_auth = HTTPBasicAuth(
    os.environ["FACTURAMA_USER"],
    os.environ["FACTURAMA_PASS"],
)

def timbrar_factura(datos: dict) -> dict:
    payload = _construir_cfdi(datos)
    r = requests.post(f"{FACTURAMA_URL}/3/cfdis", json=payload, auth=_auth, timeout=15)
    r.raise_for_status()
    cfdi = r.json()

    folio = cfdi["Id"]
    return {
        "folio_fiscal": cfdi.get("Complement", {}).get("TaxStamp", {}).get("Uuid", folio),
        "pdf_url": f"{FACTURAMA_URL}/cfdi/{folio}/pdf",
        "xml_url": f"{FACTURAMA_URL}/cfdi/{folio}/xml",
    }


def _construir_cfdi(d: dict) -> dict:
    return {
        "Serie": "FF",
        "Currency": "MXN",
        "ExpeditionPlace": d["codigo_postal"],
        "PaymentConditions": "CONTADO",
        "CfdiType": "I",
        "PaymentForm": "01",
        "PaymentMethod": "PUE",
        "Receiver": {
            "Rfc": d["rfc"],
            "Name": d["nombre"],
            "CfdiUse": "G03",
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
