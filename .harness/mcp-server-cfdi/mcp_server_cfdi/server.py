"""MCP server exposing CFDI 4.0 utilities over stdio.

Run: python -m mcp_server_cfdi.server   (or the `mcp-server-cfdi` script)
"""
from typing import Any

from mcp.server.mcpserver import MCPServer

from mcp_server_cfdi import __version__
from mcp_server_cfdi.cfdi_parser import parse_cfdi_xml as _parse_cfdi_xml
from mcp_server_cfdi.reference import CFDI_40_SCHEMA, PAC_PROVIDERS
from mcp_server_cfdi.rfc_validator import validate_rfc as _validate_rfc

server = MCPServer(
    "cfdi-tools",
    version=__version__,
    instructions="Validate RFCs and parse CFDI 4.0 XML before sending anything to the PAC.",
)


@server.tool(structured_output=True)
def validate_rfc(rfc: str) -> dict[str, Any]:
    """Validates a Mexican RFC (Registro Federal de Contribuyentes) format.

    Distinguishes persona física (13 chars), persona moral (12 chars) and the
    RFC genérico (XAXX010101000 / XEXX010101000). Returns is_valid, rfc_type and
    errors. Checks format and date only; it does not query the SAT registry.
    """
    return _validate_rfc(rfc)


@server.tool(structured_output=True)
def parse_cfdi_xml(xml_content: str) -> dict[str, Any]:
    """Parses a CFDI 4.0 XML and extracts emisor, receptor, totals, conceptos and the
    TimbreFiscalDigital UUID if stamped. Returns ok=False with errors for malformed XML,
    a non-4.0 version or missing required nodes.
    """
    return _parse_cfdi_xml(xml_content)


@server.tool(structured_output=True)
def list_pac_providers() -> dict[str, Any]:
    """Returns the PAC (Proveedor Autorizado de Certificación) factufast uses and other
    known CFDI 4.0 PACs. Illustrative: the SAT's official list is authoritative.
    """
    return PAC_PROVIDERS


@server.resource("cfdi://schema/4.0", name="cfdi-4.0-schema", mime_type="text/markdown")
def cfdi_schema() -> str:
    """Structure of a CFDI 4.0: namespaces, nodes and the attributes factufast uses."""
    return CFDI_40_SCHEMA


def main() -> None:
    server.run()  # stdio by default


if __name__ == "__main__":
    main()
