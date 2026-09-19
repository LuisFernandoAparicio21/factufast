// TODO: Replace with real API calls to GET /admin/* endpoints when backend is ready
import type { Emisor, FacturaAdmin, SystemStats, ServiceStatus } from '../types/admin'

const delay = (ms: number) => new Promise(r => setTimeout(r, ms))

const EMISORES_MOCK: Emisor[] = [
  {
    rfc: 'EKU9003173C9',
    nombre: 'ESCUELA KEMPER URGATE',
    regimen_fiscal: '601',
    facturas_mes: 23,
    facturas_total: 147,
    errores_mes: 2,
    csd_vigente: true,
    ultima_factura: '2026-09-19T14:32:00Z',
  },
  {
    rfc: 'CACX7605101P8',
    nombre: 'CONSULTORIO DR. CARLOS ÁNGEL',
    regimen_fiscal: '612',
    facturas_mes: 8,
    facturas_total: 41,
    errores_mes: 0,
    csd_vigente: true,
    ultima_factura: '2026-09-18T11:15:00Z',
  },
  {
    rfc: 'GODE561231GR8',
    nombre: 'RESTAURANTE EL BUEN GUSTO SA',
    regimen_fiscal: '601',
    facturas_mes: 3,
    facturas_total: 19,
    errores_mes: 1,
    csd_vigente: false,
    ultima_factura: '2026-09-15T09:00:00Z',
  },
]

const FACTURAS_MOCK: FacturaAdmin[] = [
  { folio: 15, folio_fiscal: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', rfc_emisor: 'EKU9003173C9', nombre_emisor: 'ESCUELA KEMPER URGATE', rfc_receptor: 'URE180429TM6', fecha: '2026-09-19T14:32:00Z', estatus: 'OK', pdf_url: 'https://s3.amazonaws.com/factufast-dev/facturas/EKU9003173C9/2026/09/00015.pdf', xml_url: 'https://s3.amazonaws.com/factufast-dev/facturas/EKU9003173C9/2026/09/00015.xml' },
  { folio: 14, folio_fiscal: 'b2c3d4e5-f6a7-8901-bcde-f12345678901', rfc_emisor: 'EKU9003173C9', nombre_emisor: 'ESCUELA KEMPER URGATE', rfc_receptor: 'XAXX010101000', fecha: '2026-09-19T13:10:00Z', estatus: 'ERROR', error: 'RFC receptor no registrado en Facturama' },
  { folio: 13, folio_fiscal: 'c3d4e5f6-a7b8-9012-cdef-123456789012', rfc_emisor: 'CACX7605101P8', nombre_emisor: 'CONSULTORIO DR. CARLOS ÁNGEL', rfc_receptor: 'GODE561231GR8', fecha: '2026-09-18T11:15:00Z', estatus: 'OK', pdf_url: 'https://s3.amazonaws.com/factufast-dev/facturas/CACX7605101P8/2026/09/00013.pdf', xml_url: 'https://s3.amazonaws.com/factufast-dev/facturas/CACX7605101P8/2026/09/00013.xml' },
  { folio: 12, folio_fiscal: 'd4e5f6a7-b8c9-0123-defa-234567890123', rfc_emisor: 'EKU9003173C9', nombre_emisor: 'ESCUELA KEMPER URGATE', rfc_receptor: 'CACX7605101P8', fecha: '2026-09-17T16:45:00Z', estatus: 'OK', pdf_url: 'https://s3.amazonaws.com/factufast-dev/facturas/EKU9003173C9/2026/09/00012.pdf', xml_url: 'https://s3.amazonaws.com/factufast-dev/facturas/EKU9003173C9/2026/09/00012.xml' },
  { folio: 11, folio_fiscal: 'e5f6a7b8-c9d0-1234-efab-345678901234', rfc_emisor: 'GODE561231GR8', nombre_emisor: 'RESTAURANTE EL BUEN GUSTO SA', rfc_receptor: 'URE180429TM6', fecha: '2026-09-15T09:00:00Z', estatus: 'ERROR', error: 'CSD expirado — renovar certificado ante el SAT' },
  { folio: 10, folio_fiscal: 'f6a7b8c9-d0e1-2345-fabc-456789012345', rfc_emisor: 'EKU9003173C9', nombre_emisor: 'ESCUELA KEMPER URGATE', rfc_receptor: 'XAXX010101000', fecha: '2026-09-14T12:00:00Z', estatus: 'OK', pdf_url: 'https://s3.amazonaws.com/factufast-dev/facturas/EKU9003173C9/2026/09/00010.pdf', xml_url: 'https://s3.amazonaws.com/factufast-dev/facturas/EKU9003173C9/2026/09/00010.xml' },
  { folio: 9, folio_fiscal: 'a7b8c9d0-e1f2-3456-abcd-567890123456', rfc_emisor: 'CACX7605101P8', nombre_emisor: 'CONSULTORIO DR. CARLOS ÁNGEL', rfc_receptor: 'GODE561231GR8', fecha: '2026-09-13T10:30:00Z', estatus: 'OK', pdf_url: 'https://s3.amazonaws.com/factufast-dev/facturas/CACX7605101P8/2026/09/00009.pdf', xml_url: 'https://s3.amazonaws.com/factufast-dev/facturas/CACX7605101P8/2026/09/00009.xml' },
  { folio: 8, folio_fiscal: 'b8c9d0e1-f2a3-4567-bcde-678901234567', rfc_emisor: 'EKU9003173C9', nombre_emisor: 'ESCUELA KEMPER URGATE', rfc_receptor: 'URE180429TM6', fecha: '2026-09-10T08:00:00Z', estatus: 'OK', pdf_url: 'https://s3.amazonaws.com/factufast-dev/facturas/EKU9003173C9/2026/09/00008.pdf', xml_url: 'https://s3.amazonaws.com/factufast-dev/facturas/EKU9003173C9/2026/09/00008.xml' },
]

export async function getSystemStats(): Promise<SystemStats> {
  await delay(300)
  return {
    facturas_total: 207,
    facturas_hoy: 6,
    errores_total: 8,
    emisores_activos: 3,
    tasa_exito: 96,
  }
}

export async function getEmisores(): Promise<Emisor[]> {
  await delay(300)
  return EMISORES_MOCK
}

export async function getTodasFacturas(filtros?: {
  estatus?: string
  rfc_emisor?: string
  rfc_receptor?: string
}): Promise<FacturaAdmin[]> {
  await delay(300)
  let result = [...FACTURAS_MOCK]
  if (filtros?.estatus) result = result.filter(f => f.estatus === filtros.estatus)
  if (filtros?.rfc_emisor) result = result.filter(f => f.rfc_emisor.includes(filtros.rfc_emisor!.toUpperCase()))
  if (filtros?.rfc_receptor) result = result.filter(f => f.rfc_receptor.includes(filtros.rfc_receptor!.toUpperCase()))
  return result
}

export async function getServiceStatus(): Promise<ServiceStatus[]> {
  await delay(200)
  return [
    { nombre: 'Lambda', estado: 'ok' },
    { nombre: 'DynamoDB', estado: 'ok' },
    { nombre: 'S3', estado: 'ok' },
    { nombre: 'SES', estado: 'ok' },
    { nombre: 'Facturama API', estado: 'ok' },
    { nombre: 'API Gateway', estado: 'ok' },
  ]
}
