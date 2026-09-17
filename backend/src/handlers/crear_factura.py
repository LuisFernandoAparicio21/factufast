import json
from services.facturama import timbrar_factura
from utils.validators import validar_campos
from utils.db import guardar_factura
from utils.response import ok, bad_request, server_error

def handler(event, context):
    try:
        body = json.loads(event.get("body", "{}"))
        error = validar_campos(body)
        if error:
            return bad_request(error)

        resultado = timbrar_factura(body)
        guardar_factura(body, resultado)

        return ok({
            "pdf_url": resultado["pdf_url"],
            "xml_url": resultado["xml_url"],
            "folio_fiscal": resultado["folio_fiscal"],
        })

    except Exception as e:
        return server_error(str(e))
