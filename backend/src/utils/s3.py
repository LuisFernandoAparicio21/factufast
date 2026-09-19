import os
from datetime import datetime, timezone

import boto3
import requests
from requests.auth import HTTPBasicAuth

_s3 = None


def _get_s3():
    global _s3
    if _s3 is None:
        _s3 = boto3.client("s3")
    return _s3


def guardar_pdf_xml(
    pdf_url: str,
    xml_url: str,
    rfc_emisor: str,
    folio: int,
    facturama_user: str,
    facturama_pass: str,
) -> str:
    """Downloads PDF from Facturama, uploads to S3. Returns pre-signed URL (1h)."""
    auth = HTTPBasicAuth(facturama_user, facturama_pass)
    bucket = os.environ["S3_BUCKET"]
    now = datetime.now(timezone.utc)
    key = f"facturas/{rfc_emisor}/{now.year}/{now.month:02d}/{folio:05d}.pdf"

    r = requests.get(pdf_url, auth=auth, timeout=15)
    r.raise_for_status()

    _get_s3().put_object(
        Bucket=bucket,
        Key=key,
        Body=r.content,
        ContentType="application/pdf",
        ServerSideEncryption="AES256",
    )

    return _get_s3().generate_presigned_url(
        "get_object",
        Params={"Bucket": bucket, "Key": key},
        ExpiresIn=3600,
    )
