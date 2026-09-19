export interface Emisor {
  rfc: string
  nombre: string
  regimen_fiscal: string
  facturas_mes: number
  facturas_total: number
  errores_mes: number
  csd_vigente: boolean
  ultima_factura: string
}

export interface FacturaAdmin {
  folio: number
  folio_fiscal: string
  rfc_emisor: string
  nombre_emisor: string
  rfc_receptor: string
  fecha: string
  estatus: 'OK' | 'ERROR'
  pdf_url?: string
  xml_url?: string
  error?: string
}

export interface SystemStats {
  facturas_total: number
  facturas_hoy: number
  errores_total: number
  emisores_activos: number
  tasa_exito: number
}

export interface ServiceStatus {
  nombre: string
  estado: 'ok' | 'degraded' | 'down'
}
