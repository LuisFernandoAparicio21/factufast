import re

_RFC_RE = re.compile(
    r"^([A-ZÑ&]{3,4})\d{6}([A-Z\d]{3})$", re.IGNORECASE
)
_CP_RE = re.compile(r"^\d{5}$")

REGIMENES_VALIDOS = {
    "601", "603", "605", "606", "607", "608", "610",
    "611", "612", "614", "615", "616", "620", "621",
    "622", "623", "624", "625", "626",
}

CAMPOS_REQUERIDOS = ["rfc", "nombre", "codigo_postal", "regimen_fiscal"]

def validar_campos(body: dict) -> str | None:
    for campo in CAMPOS_REQUERIDOS:
        if not body.get(campo, "").strip():
            return f"El campo '{campo}' es requerido"

    if not _RFC_RE.match(body["rfc"].upper()):
        return "RFC inválido"

    if not _CP_RE.match(body["codigo_postal"]):
        return "Código postal debe tener 5 dígitos"

    if body["regimen_fiscal"] not in REGIMENES_VALIDOS:
        return f"Régimen fiscal inválido: {body['regimen_fiscal']}"

    return None
