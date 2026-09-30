import pytest

from mcp_server_cfdi.rfc_validator import validate_rfc


@pytest.mark.parametrize("rfc,rfc_type", [
    ("EKU9003173C9", "persona_moral"),   # emisor sandbox Facturama
    ("URE180429TM6", "persona_moral"),   # receptor sandbox
    ("CACX7605101P8", "persona_fisica"),
    ("cacx7605101p8", "persona_fisica"),  # case-insensitive
])
def test_rfc_valido(rfc, rfc_type):
    result = validate_rfc(rfc)
    assert result == {"is_valid": True, "rfc_type": rfc_type, "errors": []}


@pytest.mark.parametrize("rfc", ["XAXX010101000", "XEXX010101000"])
def test_rfc_generico(rfc):
    result = validate_rfc(rfc)
    assert result["is_valid"] and result["rfc_type"] == "generico"


@pytest.mark.parametrize("rfc", [
    "",                # vacío
    "ABC12345",        # longitud
    "1BC900317AB1",    # letras con dígito
    "EKU9013173C9",    # mes 13
    "EKU9002303C9",    # 30 de febrero
    "EKU9003173CZ",    # verificador no es dígito ni 'A'
])
def test_rfc_invalido(rfc):
    assert validate_rfc(rfc)["is_valid"] is False


def test_errores_no_repiten_el_rfc():
    # LFPDPPP: el mensaje de error nunca incluye el dato recibido
    result = validate_rfc("EKU9013173C9")
    assert all("EKU9013173C9" not in e for e in result["errors"])
