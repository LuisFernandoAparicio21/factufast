"""RFC (Registro Federal de Contribuyentes) format validation.

Format only: no check-digit algorithm and no SAT registry lookup. Error
messages never echo the input (LFPDPPP, AGENTS.md rule 5).
"""
import re
from datetime import date

GENERIC_RFCS = {
    "XAXX010101000": "generico_nacional",    # público en general
    "XEXX010101000": "generico_extranjero",  # residente en el extranjero
}

# persona moral: 3 letters, persona física: 4 letters; then YYMMDD + 3-char homoclave
_RFC_RE = re.compile(r"^(?P<letters>[A-ZÑ&]{3,4})(?P<date>\d{6})(?P<homoclave>[A-Z\d]{2}[\dA])$")


def _valid_date(yymmdd: str) -> bool:
    yy, mm, dd = int(yymmdd[:2]), int(yymmdd[2:4]), int(yymmdd[4:])
    # The century is ambiguous; accept the date if it exists in either one (e.g. 000229).
    for century in (1900, 2000):
        try:
            date(century + yy, mm, dd)
            return True
        except ValueError:
            continue
    return False


def validate_rfc(rfc: str) -> dict:
    value = (rfc or "").strip().upper()
    if value in GENERIC_RFCS:
        return {"is_valid": True, "rfc_type": "generico", "generic_kind": GENERIC_RFCS[value], "errors": []}

    if len(value) not in (12, 13):
        return {"is_valid": False, "rfc_type": None,
                "errors": [f"length must be 12 (moral) or 13 (física), got {len(value)}"]}

    rfc_type = "persona_moral" if len(value) == 12 else "persona_fisica"
    match = _RFC_RE.match(value)
    if not match:
        return {"is_valid": False, "rfc_type": rfc_type,
                "errors": ["format must be letters + YYMMDD + 3-char homoclave (last char digit or 'A')"]}

    errors = [] if _valid_date(match["date"]) else ["date segment (YYMMDD) is not a real date"]
    return {"is_valid": not errors, "rfc_type": rfc_type, "errors": errors}
