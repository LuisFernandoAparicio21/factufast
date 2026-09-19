// TODO: Replace mock data with real API calls once backend endpoints are ready.
// Pattern: replace `delay(300)` + return mock with `fetch(API_URL + '/pyme/...')`.
import type { Factura, EmisorStats, EmisorInfo } from '../types/pyme'

const RFC_EMISOR = 'EKU9003173C9'
const BASE_URL = `https://s3.amazonaws.com/factufast-dev/facturas/${RFC_EMISOR}`

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function padFolio(n: number): string {
  return String(n).padStart(5, '0')
}

function pdfUrl(year: string, month: string, folio: number): string {
  return `${BASE_URL}/${year}/${month}/${padFolio(folio)}.pdf`
}

function xmlUrl(year: string, month: string, folio: number): string {
  return `${BASE_URL}/${year}/${month}/${padFolio(folio)}.xml`
}

const FACTURAS_MOCK: Factura[] = [
  // 5 de hoy (2026-09-19): 4 OK, 1 ERROR
  {
    folio: 1,
    folio_fiscal: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    rfc_receptor: 'URE180429TM6',
    fecha: '2026-09-19T08:15:00.000Z',
    estatus: 'OK',
    pdf_url: pdfUrl('2026', '09', 1),
    xml_url: xmlUrl('2026', '09', 1),
  },
  {
    folio: 2,
    folio_fiscal: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    rfc_receptor: 'XAXX010101000',
    fecha: '2026-09-19T09:30:00.000Z',
    estatus: 'OK',
    pdf_url: pdfUrl('2026', '09', 2),
    xml_url: xmlUrl('2026', '09', 2),
  },
  {
    folio: 3,
    folio_fiscal: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
    rfc_receptor: 'CACX7605101P8',
    fecha: '2026-09-19T10:45:00.000Z',
    estatus: 'OK',
    pdf_url: pdfUrl('2026', '09', 3),
    xml_url: xmlUrl('2026', '09', 3),
  },
  {
    folio: 4,
    folio_fiscal: 'd4e5f6a7-b8c9-0123-def0-234567890123',
    rfc_receptor: 'GODE561231GR8',
    fecha: '2026-09-19T12:00:00.000Z',
    estatus: 'OK',
    pdf_url: pdfUrl('2026', '09', 4),
    xml_url: xmlUrl('2026', '09', 4),
  },
  {
    folio: 5,
    folio_fiscal: 'e5f6a7b8-c9d0-1234-ef01-345678901234',
    rfc_receptor: 'URE180429TM6',
    fecha: '2026-09-19T14:20:00.000Z',
    estatus: 'ERROR',
    error: 'RFC receptor inválido en Facturama',
  },
  // 6 del mes actual (sept 2026, días anteriores): todas OK
  {
    folio: 6,
    folio_fiscal: 'f6a7b8c9-d0e1-2345-f012-456789012345',
    rfc_receptor: 'XAXX010101000',
    fecha: '2026-09-15T09:00:00.000Z',
    estatus: 'OK',
    pdf_url: pdfUrl('2026', '09', 6),
    xml_url: xmlUrl('2026', '09', 6),
  },
  {
    folio: 7,
    folio_fiscal: 'a7b8c9d0-e1f2-3456-0123-567890123456',
    rfc_receptor: 'CACX7605101P8',
    fecha: '2026-09-14T11:30:00.000Z',
    estatus: 'OK',
    pdf_url: pdfUrl('2026', '09', 7),
    xml_url: xmlUrl('2026', '09', 7),
  },
  {
    folio: 8,
    folio_fiscal: 'b8c9d0e1-f2a3-4567-1234-678901234567',
    rfc_receptor: 'GODE561231GR8',
    fecha: '2026-09-12T08:45:00.000Z',
    estatus: 'OK',
    pdf_url: pdfUrl('2026', '09', 8),
    xml_url: xmlUrl('2026', '09', 8),
  },
  {
    folio: 9,
    folio_fiscal: 'c9d0e1f2-a3b4-5678-2345-789012345678',
    rfc_receptor: 'URE180429TM6',
    fecha: '2026-09-10T15:00:00.000Z',
    estatus: 'OK',
    pdf_url: pdfUrl('2026', '09', 9),
    xml_url: xmlUrl('2026', '09', 9),
  },
  {
    folio: 10,
    folio_fiscal: 'd0e1f2a3-b4c5-6789-3456-890123456789',
    rfc_receptor: 'XAXX010101000',
    fecha: '2026-09-08T13:15:00.000Z',
    estatus: 'OK',
    pdf_url: pdfUrl('2026', '09', 10),
    xml_url: xmlUrl('2026', '09', 10),
  },
  {
    folio: 11,
    folio_fiscal: 'e1f2a3b4-c5d6-7890-4567-901234567890',
    rfc_receptor: 'CACX7605101P8',
    fecha: '2026-09-05T10:00:00.000Z',
    estatus: 'OK',
    pdf_url: pdfUrl('2026', '09', 11),
    xml_url: xmlUrl('2026', '09', 11),
  },
  // 4 del mes anterior (ago 2026): 3 OK, 1 ERROR
  {
    folio: 12,
    folio_fiscal: 'f2a3b4c5-d6e7-8901-5678-012345678901',
    rfc_receptor: 'GODE561231GR8',
    fecha: '2026-08-28T09:30:00.000Z',
    estatus: 'OK',
    pdf_url: pdfUrl('2026', '08', 12),
    xml_url: xmlUrl('2026', '08', 12),
  },
  {
    folio: 13,
    folio_fiscal: 'a3b4c5d6-e7f8-9012-6789-123456789012',
    rfc_receptor: 'URE180429TM6',
    fecha: '2026-08-20T14:00:00.000Z',
    estatus: 'OK',
    pdf_url: pdfUrl('2026', '08', 13),
    xml_url: xmlUrl('2026', '08', 13),
  },
  {
    folio: 14,
    folio_fiscal: 'b4c5d6e7-f8a9-0123-7890-234567890123',
    rfc_receptor: 'XAXX010101000',
    fecha: '2026-08-15T11:45:00.000Z',
    estatus: 'OK',
    pdf_url: pdfUrl('2026', '08', 14),
    xml_url: xmlUrl('2026', '08', 14),
  },
  {
    folio: 15,
    folio_fiscal: 'c5d6e7f8-a9b0-1234-8901-345678901234',
    rfc_receptor: 'CACX7605101P8',
    fecha: '2026-08-10T08:00:00.000Z',
    estatus: 'ERROR',
    error: 'RFC receptor inválido en Facturama',
  },
]

const EMISOR_INFO_MOCK: EmisorInfo = {
  rfc: 'EKU9003173C9',
  nombre: 'ESCUELA KEMPER URGATE',
  regimen_fiscal: '601',
  email_resumen: 'alvaricioinc@gmail.com',
  csd_vigente: true,
  csd_vencimiento: '2026-12-31',
}

function computeStats(): EmisorStats {
  const hoy = '2026-09-19'
  const mesActual = '2026-09'

  const facturas_hoy = FACTURAS_MOCK.filter((f) => f.fecha.startsWith(hoy)).length
  const delMes = FACTURAS_MOCK.filter((f) => f.fecha.startsWith(mesActual))
  const facturas_mes = delMes.length
  const errores_mes = delMes.filter((f) => f.estatus === 'ERROR').length
  const facturas_total = FACTURAS_MOCK.length

  return { facturas_hoy, facturas_mes, facturas_total, errores_mes }
}

export async function getStats(): Promise<EmisorStats> {
  await delay(300)
  return computeStats()
}

export async function getFacturas(filtros?: { estatus?: string; rfc?: string }): Promise<Factura[]> {
  await delay(300)
  let result = [...FACTURAS_MOCK].sort((a, b) => b.fecha.localeCompare(a.fecha))

  if (filtros?.estatus && filtros.estatus !== 'all') {
    result = result.filter((f) => f.estatus === filtros.estatus)
  }
  if (filtros?.rfc && filtros.rfc.trim() !== '') {
    const query = filtros.rfc.trim().toUpperCase()
    result = result.filter((f) => f.rfc_receptor.includes(query))
  }

  return result
}

export async function getEmisorInfo(): Promise<EmisorInfo> {
  await delay(300)
  return { ...EMISOR_INFO_MOCK }
}
