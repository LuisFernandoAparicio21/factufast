export interface FacturaPayload {
  rfc_receptor: string
  cp_receptor: string
  regimen_fiscal_receptor: string
  email_receptor: string
}

export interface FacturaResult {
  folio_fiscal: string
  pdf_url: string
  xml_url: string
  folio: number
}

const API_URL = import.meta.env.VITE_API_URL ?? ''
// VITE_* variables are embedded in the JS bundle at build time — this key is publicly readable.
// It is a rate-limit control key only, NOT a secret. Backend must enforce:
//   1. API Gateway Usage Plan with per-key throttling
//   2. CORS restricted to the Amplify domain (never *)
const API_KEY = import.meta.env.VITE_API_KEY ?? ''

export async function generarFactura(payload: FacturaPayload): Promise<FacturaResult> {
  const resp = await fetch(`${API_URL}/facturas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    },
    body: JSON.stringify(payload),
  })

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}))
    throw new Error((err as { message?: string }).message ?? `Error ${resp.status}`)
  }

  return resp.json()
}
