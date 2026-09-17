import Constants from "expo-constants";

const API_URL: string =
  (Constants.expoConfig?.extra?.apiUrl as string) ||
  process.env.EXPO_PUBLIC_API_URL ||
  "";

const API_KEY: string =
  (Constants.expoConfig?.extra?.apiKey as string) ||
  process.env.EXPO_PUBLIC_API_KEY ||
  "";

export interface FacturaPayload {
  rfc_receptor: string;
  cp_receptor: string;
  regimen_fiscal_receptor: string;
  email_receptor: string;
}

export interface FacturaResult {
  folio_fiscal: string;
  pdf_url: string;
  xml_url: string;
}

export async function generarFactura(payload: FacturaPayload): Promise<FacturaResult> {
  const resp = await fetch(`${API_URL}/facturas`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
    },
    body: JSON.stringify(payload),
  });

  if (!resp.ok) {
    const body = await resp.json().catch(() => ({}));
    throw new Error(body.error || `Error ${resp.status}`);
  }

  return resp.json();
}
