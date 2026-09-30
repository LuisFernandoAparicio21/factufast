"""End-to-end: start the real server over stdio and talk to it with an MCP client."""
import asyncio
import sys

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client


async def _session_roundtrip():
    params = StdioServerParameters(command=sys.executable, args=["-m", "mcp_server_cfdi.server"])
    async with stdio_client(params) as (read, write), ClientSession(read, write) as session:
        await session.initialize()
        tools = {t.name for t in (await session.list_tools()).tools}
        resources = {str(r.uri) for r in (await session.list_resources()).resources}
        rfc = await session.call_tool("validate_rfc", {"rfc": "URE180429TM6"})
        return tools, resources, rfc.structured_content


def test_server_expone_tools_y_resource():
    tools, resources, rfc = asyncio.run(_session_roundtrip())
    assert tools == {"validate_rfc", "parse_cfdi_xml", "list_pac_providers"}
    assert resources == {"cfdi://schema/4.0"}
    assert rfc["is_valid"] is True and rfc["rfc_type"] == "persona_moral"
