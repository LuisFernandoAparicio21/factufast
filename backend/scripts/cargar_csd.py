"""
Carga el CSD del emisor de prueba EKU9003173C9 al API Multiemisor de Facturama sandbox.

Pasos previos:
1. Ve a https://apisandbox.facturama.mx y haz login
2. Ir a: Documentacion → Conocimientos → Sellos Digitales de Prueba
   URL directa: https://apisandbox.facturama.mx/guias/conocimientos/sellos-digitales-pruebas
3. Descargar los archivos de "Personas Morales → EKU9003173C9_... → Sucursal_1"
   - archivo .cer  (certificado)
   - archivo .key  (llave privada)
4. Correr este script:
   cd backend
   python scripts/cargar_csd.py --cer path/al/archivo.cer --key path/al/archivo.key

Notas:
  - La contraseña del CSD de prueba siempre es: 12345678a
  - El script registra CP 29000 como lugar de expedicion (Tuxtla Gutierrez)
    Si Facturama rechaza ese CP, cambia --cp por otro de 5 digitos
"""
import argparse
import base64
import json
import os
import sys

sys.stdout.reconfigure(encoding="utf-8") if hasattr(sys.stdout, "reconfigure") else None

try:
    from dotenv import load_dotenv
    _backend = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    for _f in [os.path.join(_backend, ".env"), os.path.join(_backend, "..", ".env")]:
        if os.path.exists(_f):
            load_dotenv(_f)
            break
except ImportError:
    pass

import requests
from requests.auth import HTTPBasicAuth


def upload_csd(cer_path: str, key_path: str, cp: str, dry_run: bool) -> None:
    user = os.environ.get("FACTURAMA_USER")
    pwd  = os.environ.get("FACTURAMA_PASS")
    if not user or not pwd:
        print("ERROR: Falta FACTURAMA_USER o FACTURAMA_PASS en .env")
        sys.exit(1)

    auth = HTTPBasicAuth(user, pwd)
    url  = "https://apisandbox.facturama.mx/api-lite/csds"

    with open(cer_path, "rb") as f:
        cer_b64 = base64.b64encode(f.read()).decode()
    with open(key_path, "rb") as f:
        key_b64 = base64.b64encode(f.read()).decode()

    payload = {
        "Rfc": "EKU9003173C9",
        "Certificate": cer_b64,
        "PrivateKey": key_b64,
        "PrivateKeyPassword": "12345678a",
        "BranchAddress": {
            "Street": "Blvd. Adolfo Lopez Mateos",
            "ExteriorNumber": "1",
            "InteriorNumber": "",
            "Neighborhood": "Centro",
            "ZipCode": cp,
            "Locality": "",
            "Municipality": "Tuxtla Gutierrez",
            "State": "CHP",
            "Country": "MEX",
        },
    }

    print(f"\n  RFC emisor : EKU9003173C9")
    print(f"  .cer       : {cer_path}")
    print(f"  .key       : {key_path}")
    print(f"  CP lugar   : {cp}")
    print(f"  API URL    : {url}\n")

    if dry_run:
        print("  (dry-run — no se envia la solicitud)")
        return

    r = requests.post(url, json=payload, auth=auth, timeout=15)
    print(f"  <- HTTP {r.status_code}")

    if r.ok:
        data = r.json() if r.text else {}
        print(f"  CSD cargado correctamente!")
        print(f"  Respuesta: {json.dumps(data, indent=4, ensure_ascii=False)}")
        print(f"\n  Ahora puedes correr:")
        print(f"    python scripts/invoke_local.py --expedition-cp {cp}")
    else:
        print(f"  ERROR: {r.text[:600]}")
        if "ExpeditionPlace" in r.text or "ZipCode" in r.text:
            print(f"\n  Sugerencia: prueba con otro CP con --cp XXXXX")
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(description="Carga CSD de prueba EKU a Facturama sandbox")
    parser.add_argument("--cer", required=True, help="Ruta al archivo .cer")
    parser.add_argument("--key", required=True, help="Ruta al archivo .key")
    parser.add_argument("--cp",  default="29000",
                        help="Codigo postal lugar de expedicion (default: 29000)")
    parser.add_argument("--dry-run", action="store_true",
                        help="Solo muestra el payload, no lo envia")
    args = parser.parse_args()

    for p in [args.cer, args.key]:
        if not os.path.exists(p):
            print(f"ERROR: Archivo no encontrado: {p}")
            sys.exit(1)

    upload_csd(args.cer, args.key, args.cp, args.dry_run)


if __name__ == "__main__":
    main()
