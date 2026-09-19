import json
import pytest
from tests.conftest import make_event, PAYLOAD_VALIDO


def test_bad_request_campo_faltante(facturas_table):
    from handlers.crear_factura import handler
    event = make_event({"rfc": "URE180429TM6"})  # faltan nombre, cp, regimen
    resp = handler(event, {})
    assert resp["statusCode"] == 400
    body = json.loads(resp["body"])
    assert "error" in body


def test_bad_request_rfc_invalido(facturas_table):
    from handlers.crear_factura import handler
    body = {**PAYLOAD_VALIDO, "rfc": "INVALIDO"}
    resp = handler(make_event(body), {})
    assert resp["statusCode"] == 400


def test_bad_request_cp_invalido(facturas_table):
    from handlers.crear_factura import handler
    body = {**PAYLOAD_VALIDO, "codigo_postal": "1234"}
    resp = handler(make_event(body), {})
    assert resp["statusCode"] == 400


def test_bad_request_regimen_invalido(facturas_table):
    from handlers.crear_factura import handler
    body = {**PAYLOAD_VALIDO, "regimen_fiscal": "999"}
    resp = handler(make_event(body), {})
    assert resp["statusCode"] == 400


def test_server_error_cuando_facturama_falla(facturas_table, mocker):
    """Facturama lanza excepción → handler devuelve 500."""
    mocker.patch(
        "services.facturama.timbrar_factura",
        side_effect=Exception("Facturama no disponible"),
    )
    from handlers.crear_factura import handler
    resp = handler(make_event(PAYLOAD_VALIDO), {})
    assert resp["statusCode"] == 500
    body = json.loads(resp["body"])
    assert "error" in body


def test_ok_cuando_facturama_responde(facturas_table, mocker):
    """Facturama OK → handler devuelve 200 con folio_fiscal y URLs."""
    mock_resultado = {
        "folio_fiscal": "3f5e2a1b-0000-0000-0000-000000000000",
        "pdf_url": "https://s3.example.com/factura.pdf",
        "xml_url": "https://s3.example.com/factura.xml",
    }
    mocker.patch("handlers.crear_factura.timbrar_factura", return_value=mock_resultado)

    from handlers.crear_factura import handler
    resp = handler(make_event(PAYLOAD_VALIDO), {})

    assert resp["statusCode"] == 200
    body = json.loads(resp["body"])
    assert body["folio_fiscal"] == mock_resultado["folio_fiscal"]
    assert "pdf_url" in body
    assert "xml_url" in body


def test_item_guardado_en_dynamodb(facturas_table, mocker):
    """Después del timbrado el item existe en DynamoDB."""
    mock_resultado = {
        "folio_fiscal": "abc-uuid-test",
        "pdf_url": "https://s3.example.com/f.pdf",
        "xml_url": "https://s3.example.com/f.xml",
    }
    mocker.patch("handlers.crear_factura.timbrar_factura", return_value=mock_resultado)

    from handlers.crear_factura import handler
    handler(make_event(PAYLOAD_VALIDO), {})

    item = facturas_table.get_item(
        Key={"rfc": PAYLOAD_VALIDO["rfc"].upper(), "folio_fiscal": "abc-uuid-test"}
    ).get("Item")
    assert item is not None
    assert item["folio_fiscal"] == "abc-uuid-test"


def test_cors_header_presente(facturas_table):
    """Todas las respuestas incluyen CORS header."""
    from handlers.crear_factura import handler
    resp = handler(make_event({}), {})
    assert resp["headers"]["Access-Control-Allow-Origin"] == "*"
