"""Static reference data served by the MCP server (PAC list, CFDI 4.0 schema notes)."""

PAC_PROVIDERS = {
    "disclaimer": (
        "Illustrative list, not authoritative. The SAT publishes the official, current list of "
        "authorized PACs on sat.gob.mx; check it before choosing a provider."
    ),
    "in_use_by_factufast": {
        "name": "Facturama",
        "api": "Multiemisor (api-lite v3)",
        "sandbox_url": "https://apisandbox.facturama.mx",
        "notes": "Replaceable: factufast only depends on it for stamping (timbrado).",
    },
    "other_known_providers": [
        {"name": "Finkok", "website": "https://www.finkok.com"},
        {"name": "SW Sapien (SmarterWeb)", "website": "https://sw.com.mx"},
        {"name": "Edicom", "website": "https://www.edicomgroup.com"},
        {"name": "Solución Factible", "website": "https://solucionfactible.com"},
        {"name": "Diverza", "website": "https://www.diverza.com"},
    ],
}

CFDI_40_SCHEMA = """\
# CFDI 4.0: structure summary

Namespace: http://www.sat.gob.mx/cfd/4 (prefix `cfdi`)
Official XSD: http://www.sat.gob.mx/sitio_internet/cfd/4/cfdv40.xsd
Stamp complement: http://www.sat.gob.mx/TimbreFiscalDigital (prefix `tfd`)

cfdi:Comprobante (root)
  Version="4.0"  Serie  Folio  Fecha  SubTotal  Total  Moneda (c_Moneda)
  TipoDeComprobante (I|E|T|N|P)  Exportacion (c_Exportacion)  LugarExpedicion (CP)
  ├── cfdi:Emisor      Rfc  Nombre  RegimenFiscal (c_RegimenFiscal)
  ├── cfdi:Receptor    Rfc  Nombre  DomicilioFiscalReceptor (CP)
  │                    RegimenFiscalReceptor (c_RegimenFiscal)  UsoCFDI (c_UsoCFDI)
  ├── cfdi:Conceptos
  │   └── cfdi:Concepto  ClaveProdServ  Cantidad  ClaveUnidad  Descripcion
  │                      ValorUnitario  Importe  ObjetoImp
  ├── cfdi:Impuestos   (optional, totals of traslados/retenciones)
  └── cfdi:Complemento
      └── tfd:TimbreFiscalDigital  UUID  FechaTimbrado  (added by the PAC)

Changes from 3.3 that matter for factufast: the receptor's name, CP
(DomicilioFiscalReceptor) and RegimenFiscalReceptor are mandatory, and they must
match the SAT registry exactly; `Exportacion` and `ObjetoImp` are new required
attributes.
"""
