from pathlib import Path

from mcp_server_cfdi.cfdi_parser import parse_cfdi_xml

FIXTURE = (Path(__file__).parent / "fixtures" / "cfdi_ejemplo.xml").read_text(encoding="utf-8")


def test_extrae_campos_del_cfdi():
    result = parse_cfdi_xml(FIXTURE)
    assert result["ok"] and result["errors"] == []
    assert result["comprobante"]["Total"] == "1160.00"
    assert result["emisor"] == {"Rfc": "EKU9003173C9", "Nombre": "ESCUELA KEMPER URGATE", "RegimenFiscal": "601"}
    assert result["receptor"]["UsoCFDI"] == "G03"
    assert result["conceptos"][0]["ClaveProdServ"] == "85121800"
    assert result["timbre"]["UUID"] == "6B1A7E2C-0000-4000-8000-000000000042"


def test_rechaza_xml_invalido_y_version_incorrecta():
    assert parse_cfdi_xml("<cfdi:Comprobante")["ok"] is False
    assert parse_cfdi_xml(FIXTURE.replace('Version="4.0"', 'Version="3.3"'))["ok"] is False
    assert parse_cfdi_xml("")["ok"] is False


def test_no_resuelve_entidades_externas():
    # XXE: la entidad no se expande y el contenido no aparece en la salida
    xxe = ('<?xml version="1.0"?><!DOCTYPE r [<!ENTITY x SYSTEM "file:///etc/passwd">]>'
           + FIXTURE.split("?>", 1)[1].replace('Serie="A"', 'Serie="&x;"'))
    result = parse_cfdi_xml(xxe)
    assert "root:" not in str(result)
