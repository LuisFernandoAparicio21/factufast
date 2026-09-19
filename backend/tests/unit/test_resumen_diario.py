import json
import pytest
from datetime import datetime
from zoneinfo import ZoneInfo
from unittest.mock import patch


@pytest.fixture
def tabla_con_facturas(full_aws):
    """Inserta items de prueba con la fecha de hoy en MX para los tests."""
    table = full_aws["facturas_table"]
    hoy = datetime.now(tz=ZoneInfo("America/Mexico_City")).strftime("%Y-%m-%d")
    ts_base = datetime.now(tz=ZoneInfo("America/Mexico_City")).isoformat()

    items = [
        {"rfc": "RFC1", "folio_fiscal": "uuid-1", "estatus": "OK",    "fecha_dia": hoy, "timestamp": ts_base + "1"},
        {"rfc": "RFC1", "folio_fiscal": "uuid-2", "estatus": "OK",    "fecha_dia": hoy, "timestamp": ts_base + "2"},
        {"rfc": "RFC2", "folio_fiscal": "uuid-3", "estatus": "ERROR", "fecha_dia": hoy, "timestamp": ts_base + "3"},
        {"rfc": "RFC3", "folio_fiscal": "uuid-4", "estatus": "OK",    "fecha_dia": "2020-01-01", "timestamp": ts_base + "4"},
    ]
    for item in items:
        table.put_item(Item=item)
    return hoy


def test_retorna_200(full_aws, mocker):
    mocker.patch("handlers.resumen_diario._get_ses").return_value.send_email.return_value = {"MessageId": "x"}
    from handlers.resumen_diario import handler
    resp = handler({}, {})
    assert resp["statusCode"] == 200


def test_conteo_correcto(tabla_con_facturas, full_aws, mocker):
    mock_ses = mocker.patch("handlers.resumen_diario._get_ses")
    mock_ses.return_value.send_email.return_value = {"MessageId": "test-id"}

    from handlers.resumen_diario import handler
    handler({}, {})

    call_args = mock_ses.return_value.send_email.call_args
    body_text = call_args.kwargs["Content"]["Simple"]["Body"]["Text"]["Data"]

    assert "Timbradas OK : 2" in body_text
    assert "Errores      : 1" in body_text
    assert "Total        : 3" in body_text


def test_no_cuenta_otro_dia(tabla_con_facturas, full_aws, mocker):
    """Items de otro día no deben aparecer en el conteo."""
    mock_ses = mocker.patch("handlers.resumen_diario._get_ses")
    mock_ses.return_value.send_email.return_value = {"MessageId": "test-id"}

    from handlers.resumen_diario import handler
    handler({}, {})

    call_args = mock_ses.return_value.send_email.call_args
    body_text = call_args.kwargs["Content"]["Simple"]["Body"]["Text"]["Data"]
    assert "Total        : 4" not in body_text


def test_ses_config_set_resumen(full_aws, mocker):
    mock_ses = mocker.patch("handlers.resumen_diario._get_ses")
    mock_ses.return_value.send_email.return_value = {"MessageId": "test-id"}

    from handlers.resumen_diario import handler
    handler({}, {})

    call_kwargs = mock_ses.return_value.send_email.call_args.kwargs
    assert call_kwargs["ConfigurationSetName"] == "factufast-resumen-config"


def test_fecha_dia_en_subject(full_aws, mocker):
    mock_ses = mocker.patch("handlers.resumen_diario._get_ses")
    mock_ses.return_value.send_email.return_value = {"MessageId": "test-id"}
    hoy = datetime.now(tz=ZoneInfo("America/Mexico_City")).strftime("%Y-%m-%d")

    from handlers.resumen_diario import handler
    handler({}, {})

    subject = mock_ses.return_value.send_email.call_args.kwargs["Content"]["Simple"]["Subject"]["Data"]
    assert hoy in subject
