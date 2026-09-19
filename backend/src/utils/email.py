import os
import boto3
from botocore.exceptions import ClientError

_client = None

def _get_client():
    global _client
    if _client is None:
        _client = boto3.client("sesv2")
    return _client


def enviar_factura_al_receptor(
    *,
    email_receptor: str,
    nombre_emisor: str,
    rfc_emisor: str,
    rfc_receptor: str,
    folio: int,
    folio_fiscal: str,
    pdf_url: str,
    xml_url: str,
) -> str:
    """
    Envía el correo de factura lista al receptor.
    Retorna el MessageId de SES.
    Lanza ClientError si SES rechaza el mensaje (no reintenta en 4xx).
    """
    from_email = os.environ["SES_FROM_EMAIL"]
    config_set = os.environ["SES_CONFIG_SET"]
    folio_str = f"#{str(folio).zfill(5)}"

    subject = f"Tu factura {folio_str} está lista — {nombre_emisor}"

    text_body = (
        f"Hola,\n\n"
        f"{nombre_emisor} ha emitido una factura electrónica a tu nombre.\n\n"
        f"Folio interno : {folio_str}\n"
        f"UUID CFDI     : {folio_fiscal}\n"
        f"RFC emisor    : {rfc_emisor}\n"
        f"RFC receptor  : {rfc_receptor}\n\n"
        f"Descarga tu factura (los enlaces expiran en 1 hora):\n"
        f"  PDF → {pdf_url}\n"
        f"  XML → {xml_url}\n\n"
        f"FactuFastAI · CFDI 4.0"
    )

    html_body = f"""<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:Arial,sans-serif;background:#f9fafb;margin:0;padding:32px 16px">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;
              border:1px solid #e5e7eb;padding:32px">
    <p style="font-size:13px;color:#6b7280;margin:0 0 24px">
      Factura electrónica CFDI 4.0
    </p>
    <h1 style="font-size:20px;color:#111827;margin:0 0 8px">
      Tu factura está lista
    </h1>
    <p style="font-size:14px;color:#374151;margin:0 0 24px">
      <strong>{nombre_emisor}</strong> ha emitido un CFDI a tu nombre.
    </p>

    <table style="width:100%;border-collapse:collapse;font-size:13px;
                  color:#374151;margin-bottom:28px">
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;width:40%">
          Folio interno
        </td>
        <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;
                   font-family:monospace;font-weight:600">
          {folio_str}
        </td>
      </tr>
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;color:#6b7280">UUID CFDI</td>
        <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;
                   font-family:monospace;font-size:11px">
          {folio_fiscal}
        </td>
      </tr>
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;color:#6b7280">RFC emisor</td>
        <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;font-family:monospace">
          {rfc_emisor}
        </td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#6b7280">RFC receptor</td>
        <td style="padding:8px 0;font-family:monospace">{rfc_receptor}</td>
      </tr>
    </table>

    <p style="font-size:12px;color:#6b7280;margin:0 0 16px">
      Los enlaces expiran en <strong>1 hora</strong>.
    </p>
    <div style="display:flex;gap:12px">
      <a href="{pdf_url}"
         style="display:inline-block;padding:10px 20px;background:#ef4444;color:#fff;
                text-decoration:none;border-radius:8px;font-size:13px;font-weight:600">
        Descargar PDF
      </a>
      <a href="{xml_url}"
         style="display:inline-block;padding:10px 20px;background:#3b82f6;color:#fff;
                text-decoration:none;border-radius:8px;font-size:13px;font-weight:600">
        Descargar XML
      </a>
    </div>

    <hr style="border:none;border-top:1px solid #f3f4f6;margin:32px 0 16px">
    <p style="font-size:11px;color:#9ca3af;margin:0">
      FactuFastAI · CFDI 4.0 · México
    </p>
  </div>
</body>
</html>"""

    try:
        response = _get_client().send_email(
            FromEmailAddress=from_email,
            Destination={"ToAddresses": [email_receptor]},
            Content={
                "Simple": {
                    "Subject": {"Data": subject, "Charset": "UTF-8"},
                    "Body": {
                        "Text": {"Data": text_body, "Charset": "UTF-8"},
                        "Html": {"Data": html_body, "Charset": "UTF-8"},
                    },
                }
            },
            EmailTags=[
                {"Name": "rfc_emisor", "Value": rfc_emisor},
                {"Name": "tipo", "Value": "transaccional"},
            ],
            ConfigurationSetName=config_set,
        )
        return response["MessageId"]
    except ClientError as e:
        code = e.response["Error"]["Code"]
        # 4xx — no reintentar, propagar para que el handler decida
        if code in (
            "MessageRejected",
            "MailFromDomainNotVerifiedException",
            "ConfigurationSetDoesNotExistException",
            "AccountSendingPausedException",
        ):
            raise
        # 5xx / throttling — propagar; Lambda retry policy lo maneja
        raise
