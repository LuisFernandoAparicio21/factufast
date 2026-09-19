import pytest
from utils.validators import validar_campos


BASE = {
    "rfc":            "URE180429TM6",
    "nombre":         "UNIVERSIDAD ROBOTICA",
    "codigo_postal":  "65000",
    "regimen_fiscal": "601",
}


def test_payload_valido():
    assert validar_campos(BASE) is None


@pytest.mark.parametrize("campo", ["rfc", "nombre", "codigo_postal", "regimen_fiscal"])
def test_campo_faltante(campo):
    body = {k: v for k, v in BASE.items() if k != campo}
    error = validar_campos(body)
    assert error is not None
    assert campo in error


@pytest.mark.parametrize("rfc_invalido", [
    "INVALIDO",
    "12345678",
    "ABCD",
    "",
    "URE180429TM",   # 11 chars — demasiado corto
    "URE180429TM6X", # 13 chars — uno de más
])
def test_rfc_invalido(rfc_invalido):
    body = {**BASE, "rfc": rfc_invalido}
    assert validar_campos(body) is not None


@pytest.mark.parametrize("rfc_valido", [
    "URE180429TM6",   # moral 12 chars
    "XAXX010101000",  # genérico SAT 13 chars
    "EKU9003173C9",   # sandbox emisor 12 chars
])
def test_rfc_valido(rfc_valido):
    body = {**BASE, "rfc": rfc_valido}
    assert validar_campos(body) is None


@pytest.mark.parametrize("cp", ["1234", "123456", "abcde", ""])
def test_codigo_postal_invalido(cp):
    body = {**BASE, "codigo_postal": cp}
    assert validar_campos(body) is not None


def test_regimen_fiscal_invalido():
    body = {**BASE, "regimen_fiscal": "999"}
    error = validar_campos(body)
    assert error is not None
    assert "999" in error


@pytest.mark.parametrize("regimen", ["601", "612", "626"])
def test_regimen_fiscal_valido(regimen):
    body = {**BASE, "regimen_fiscal": regimen}
    assert validar_campos(body) is None
