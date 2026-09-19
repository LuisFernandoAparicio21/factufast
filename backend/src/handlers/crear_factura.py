import json
import logging
import os

from services.facturama import timbrar_factura
from utils.db import guardar_error, guardar_factura, incrementar_folio
from utils.email import enviar_link
from utils.response import bad_request, ok, server_error
from utils.s3 import guardar_pdf_xml
from utils.validators import validar_campos

logger = logging.getLogger()
logger.setLevel(logging.INFO)

_RFC_EMISOR = os.environ.get("RFC_EMISOR", "EKU9003173C9")


def handler(event, context):
    try:
        body = json.loads(event.get("body") or "{}")
    except (ValueError, TypeError):
        return bad_request("Invalid JSON body")

    try:
        error = validar_campos(body)
        if error:
            return bad_request(error)

        rfc = body["rfc"].upper()  # noqa: F841 — used implicitly via body

        # Step 2: atomic folio counter
        folio = incrementar_folio(_RFC_EMISOR)

        # Step 3: Facturama stamp
        try:
            resultado = timbrar_factura(body, folio)
        except Exception as exc:
            logger.error("Facturama error folio=%s: %s", folio, exc)
            guardar_error(body, folio)
            return server_error("Invoice stamping failed")

        # Step 4a: persist (ConditionExpression prevents double-write on retry)
        guardar_factura(body, resultado, folio)

        # Step 5: S3 upload → presigned URL (fallback to Facturama URL on error)
        presigned_url = resultado["pdf_url"]
        try:
            presigned_url = guardar_pdf_xml(
                pdf_url=resultado["pdf_url"],
                xml_url=resultado["xml_url"],
                rfc_emisor=_RFC_EMISOR,
                folio=folio,
                facturama_user=os.environ["FACTURAMA_USER"],
                facturama_pass=os.environ["FACTURAMA_PASS"],
            )
        except Exception as exc:
            logger.warning("S3 upload failed folio=%s: %s", folio, exc)

        # Step 6: SES email (non-fatal)
        if body.get("email_receptor"):
            try:
                enviar_link(
                    email_receptor=body["email_receptor"],
                    presigned_url=presigned_url,
                    folio_fiscal=resultado["folio_fiscal"],
                )
            except Exception as exc:
                logger.warning("SES send failed folio=%s: %s", folio, exc)

        return ok({
            "folio_fiscal": resultado["folio_fiscal"],
            "pdf_url": presigned_url,
            "xml_url": resultado["xml_url"],
        })

    except Exception as exc:
        logger.error("Unhandled error: %s", exc)
        return server_error("Internal error")
