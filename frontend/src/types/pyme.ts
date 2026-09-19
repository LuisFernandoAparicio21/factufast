export interface Factura {
  folio: number
  folio_fiscal: string
  rfc_receptor: string
  fecha: string
  estatus: 'OK' | 'ERROR'
  pdf_url?: string
  xml_url?: string
  error?: string
}

export interface EmisorStats {
  facturas_hoy: number
  facturas_mes: number
  facturas_total: number
  errores_mes: number
}

export interface EmisorInfo {
  rfc: string
  nombre: string
  regimen_fiscal: string
  email_resumen: string
  csd_vigente: boolean
  csd_vencimiento: string
}
