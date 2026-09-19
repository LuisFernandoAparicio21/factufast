import json
import pytest
from tests.conftest import make_event, PAYLOAD_VALIDO

MOCK_RESULTADO = {
    "folio_fiscal": "3f5e2a1b-0000-0000-0000-000000000000",
    "pdf_url": "https://facturama.example.com/factura.pdf",
    "xml_url": "https://facturama.example.com/factura.xml",
}
MOCK_PRESIGNED = "https://s3.presigned.example.com/factura.pdf"


def _patch_success(mocker):
    mocker.patch("handlers.crear_factura.timbrar_factura", return_value=MOCK_RESULTADO)
    mocker.patch("handlers.crear_factura.guardar_pdf_xml", return_value=MOCK_PRESIGNED)
    mocker.patch("handlers.crear_factura.enviar_link")


# ── Validation (no AWS resources needed beyond facturas_table for CORS test) ──

def test_bad_request_campo_faltante(facturas_table, counters_table):
    from handlers.crear_factura import handler
    resp = handler(make_event({"rfc": "URE180429TM6"}), {})
    assert resp["statusCode"] == 400
    assert "error" in json.loads(resp["body"])


def test_bad_request_rfc_invalido(facturas_table, counters_table):
    from handlers.crear_factura import handler
    resp = handler(make_event({**PAYLOAD_VALIDO, "rfc": "INVALIDO"}), {})
    assert resp["statusCode"] == 400


def test_bad_request_cp_invalido(facturas_table, counters_table):
    from handlers.crear_factura import handler
    resp = handler(make_event({**PAYLOAD_VALIDO, "codigo_postal": "1234"}), {})
    assert resp["statusCode"] == 400


def test_bad_request_regimen_invalido(facturas_table, counters_table):
    from handlers.crear_factura import handler
    resp = handler(make_event({**PAYLOAD_VALIDO, "regimen_fiscal": "999"}), {})
    assert resp["statusCode"] == 400


def test_cors_header_presente(facturas_table, counters_table):
    from handlers.crear_factura import handler
    resp = handler(make_event({}), {})
    assert resp["headers"]["Access-Control-Allow-Origin"] == "*"


# ── Facturama error path ──────────────────────────────────────────────────────

def test_server_error_cuando_facturama_falla(facturas_table, counters_table, mocker):
    mocker.patch(
        "handlers.crear_factura.timbrar_factura",
        side_effect=Exception("Facturama no disponible"),
    )
    from handlers.crear_factura import handler
    resp = handler(make_event(PAYLOAD_VALIDO), {})
    assert resp["statusCode"] == 500
    assert "error" in json.loads(resp["body"])


def test_error_item_guardado_en_dynamodb(facturas_table, counters_table, mocker):
    mocker.patch(
        "handlers.crear_factura.timbrar_factura",
        side_effect=Exception("timeout"),
    )
    from handlers.crear_factura import handler
    handler(make_event(PAYLOAD_VALIDO), {})

    resultado = facturas_table.scan()["Items"]
    assert any(i["estatus"] == "ERROR" for i in resultado)


# ── Success path ──────────────────────────────────────────────────────────────

def test_ok_cuando_facturama_responde(facturas_table, counters_table, mocker):
    _patch_success(mocker)
    from handlers.crear_factura import handler
    resp = handler(make_event(PAYLOAD_VALIDO), {})

    assert resp["statusCode"] == 200
    body = json.loads(resp["body"])
    assert body["folio_fiscal"] == MOCK_RESULTADO["folio_fiscal"]
    assert "pdf_url" in body
    assert "xml_url" in body


def test_pdf_url_es_presigned(facturas_table, counters_table, mocker):
    _patch_success(mocker)
    from handlers.crear_factura import handler
    resp = handler(make_event(PAYLOAD_VALIDO), {})
    body = json.loads(resp["body"])
    assert body["pdf_url"] == MOCK_PRESIGNED


def test_item_guardado_en_dynamodb(facturas_table, counters_table, mocker):
    _patch_success(mocker)
    from handlers.crear_factura import handler
    handler(make_event(PAYLOAD_VALIDO), {})

    item = facturas_table.get_item(
        Key={
            "rfc": PAYLOAD_VALIDO["rfc"].upper(),
            "folio_fiscal": MOCK_RESULTADO["folio_fiscal"],
        }
    ).get("Item")
    assert item is not None
    assert item["estatus"] == "OK"
    assert "fecha_dia" in item
    assert "folio" in item


def test_folio_counter_incrementado(facturas_table, counters_table, mocker):
    _patch_success(mocker)
    from handlers.crear_factura import handler
    handler(make_event(PAYLOAD_VALIDO), {})
    handler(make_event(PAYLOAD_VALIDO), {})

    item = counters_table.get_item(Key={"rfc_emisor": "EKU9003173C9"}).get("Item")
    assert int(item["folio_actual"]) == 2


def test_ses_no_llamado_sin_email(facturas_table, counters_table, mocker):
    _patch_success(mocker)
    mock_enviar = mocker.patch("handlers.crear_factura.enviar_link")
    payload_sin_email = {k: v for k, v in PAYLOAD_VALIDO.items() if k != "email_receptor"}

    from handlers.crear_factura import handler
    resp = handler(make_event(payload_sin_email), {})
    assert resp["statusCode"] == 200
    mock_enviar.assert_not_called()


def test_s3_error_no_rompe_respuesta(facturas_table, counters_table, mocker):
    mocker.patch("handlers.crear_factura.timbrar_factura", return_value=MOCK_RESULTADO)
    mocker.patch(
        "handlers.crear_factura.guardar_pdf_xml",
        side_effect=Exception("S3 unavailable"),
    )
    mocker.patch("handlers.crear_factura.enviar_link")

    from handlers.crear_factura import handler
    resp = handler(make_event(PAYLOAD_VALIDO), {})
    assert resp["statusCode"] == 200
    body = json.loads(resp["body"])
    # fallback: returns Facturama URL when S3 fails
    assert body["pdf_url"] == MOCK_RESULTADO["pdf_url"]


def test_ses_error_no_rompe_respuesta(facturas_table, counters_table, mocker):
    _patch_success(mocker)
    mocker.patch(
        "handlers.crear_factura.enviar_link",
        side_effect=Exception("SES unavailable"),
    )
    from handlers.crear_factura import handler
    resp = handler(make_event(PAYLOAD_VALIDO), {})
    assert resp["statusCode"] == 200
