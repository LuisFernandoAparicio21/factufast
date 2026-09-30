"""Extract the fields factufast cares about from a CFDI 4.0 XML.

Parsing is hardened against XXE (no entity resolution, no network). Error
messages never echo the XML content (LFPDPPP, AGENTS.md rule 5).
"""
from lxml import etree

NS = {
    "cfdi": "http://www.sat.gob.mx/cfd/4",
    "tfd": "http://www.sat.gob.mx/TimbreFiscalDigital",
}
_PARSER = etree.XMLParser(resolve_entities=False, no_network=True, load_dtd=False, huge_tree=False)


def _attrs(node, names: list[str]) -> dict:
    return {name: node.get(name) for name in names} if node is not None else {}


def parse_cfdi_xml(xml_content: str) -> dict:
    if not xml_content or not xml_content.strip():
        return {"ok": False, "errors": ["xml_content is empty"]}
    try:
        # Encode first: lxml rejects str input that carries an encoding declaration.
        root = etree.fromstring(xml_content.strip().encode("utf-8"), _PARSER)
    except etree.XMLSyntaxError as e:
        return {"ok": False, "errors": [f"malformed XML at line {e.lineno}"]}

    if root.tag != f"{{{NS['cfdi']}}}Comprobante":
        return {"ok": False, "errors": ["root element is not cfdi:Comprobante (namespace http://www.sat.gob.mx/cfd/4)"]}
    if root.get("Version") != "4.0":
        return {"ok": False, "errors": [f"unsupported CFDI version {root.get('Version')!r}, expected '4.0'"]}

    emisor = root.find("cfdi:Emisor", NS)
    receptor = root.find("cfdi:Receptor", NS)
    timbre = root.find("cfdi:Complemento/tfd:TimbreFiscalDigital", NS)
    errors = [f"missing cfdi:{name}" for name, node in (("Emisor", emisor), ("Receptor", receptor)) if node is None]

    return {
        "ok": not errors,
        "errors": errors,
        "comprobante": _attrs(root, ["Serie", "Folio", "Fecha", "SubTotal", "Total", "Moneda", "TipoDeComprobante"]),
        "emisor": _attrs(emisor, ["Rfc", "Nombre", "RegimenFiscal"]),
        "receptor": _attrs(receptor, ["Rfc", "Nombre", "UsoCFDI", "DomicilioFiscalReceptor", "RegimenFiscalReceptor"]),
        "conceptos": [
            _attrs(c, ["ClaveProdServ", "Cantidad", "ClaveUnidad", "Descripcion", "ValorUnitario", "Importe"])
            for c in root.findall("cfdi:Conceptos/cfdi:Concepto", NS)
        ],
        "timbre": _attrs(timbre, ["UUID", "FechaTimbrado"]) or None,
    }
