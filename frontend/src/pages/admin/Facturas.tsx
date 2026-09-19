import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, FileDown, FileCode2, FileX } from 'lucide-react'
import { getTodasFacturas } from '../../services/admin-api'
import type { FacturaAdmin } from '../../types/admin'

function EstatusBadge({ estatus }: { estatus: 'OK' | 'ERROR' }) {
  return estatus === 'OK'
    ? <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">OK</span>
    : <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">Error</span>
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function AdminFacturas() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [facturas, setFacturas] = useState<FacturaAdmin[]>([])
  const [loading, setLoading] = useState(true)

  const rfcEmisor = searchParams.get('rfc_emisor') ?? ''
  const rfcReceptor = searchParams.get('rfc_receptor') ?? ''
  const estatus = searchParams.get('estatus') ?? ''

  useEffect(() => {
    setLoading(true)
    getTodasFacturas({
      estatus: estatus || undefined,
      rfc_emisor: rfcEmisor || undefined,
      rfc_receptor: rfcReceptor || undefined,
    }).then(setFacturas).finally(() => setLoading(false))
  }, [rfcEmisor, rfcReceptor, estatus])

  function setFiltro(key: string, value: string) {
    setSearchParams(prev => {
      if (value) prev.set(key, value)
      else prev.delete(key)
      return prev
    })
  }

  return (
    <div className="py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900">Todas las facturas</h1>
          <p className="text-sm text-gray-500 mt-0.5">Historial de timbrado de todos los emisores</p>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="RFC emisor…"
              value={rfcEmisor}
              onChange={e => setFiltro('rfc_emisor', e.target.value)}
              className="pl-8 pr-3 py-2 text-sm rounded-lg border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-44 font-mono"
            />
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="RFC receptor…"
              value={rfcReceptor}
              onChange={e => setFiltro('rfc_receptor', e.target.value)}
              className="pl-8 pr-3 py-2 text-sm rounded-lg border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-44 font-mono"
            />
          </div>
          <select
            value={estatus}
            onChange={e => setFiltro('estatus', e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="">Todas</option>
            <option value="OK">Timbradas</option>
            <option value="ERROR">Errores</option>
          </select>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)}
            </div>
          ) : facturas.length === 0 ? (
            <div className="py-16 text-center">
              <FileX size={28} className="text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-500">Sin resultados</p>
              <p className="text-xs text-gray-400 mt-1">Ajusta los filtros para ver más facturas</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[800px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th scope="col" className="text-left px-5 py-3 text-xs font-medium text-gray-500">Folio</th>
                    <th scope="col" className="text-left px-3 py-3 text-xs font-medium text-gray-500">Emisor</th>
                    <th scope="col" className="text-left px-3 py-3 text-xs font-medium text-gray-500">Receptor</th>
                    <th scope="col" className="text-left px-3 py-3 text-xs font-medium text-gray-500">Fecha</th>
                    <th scope="col" className="text-left px-3 py-3 text-xs font-medium text-gray-500">Estatus</th>
                    <th scope="col" className="text-left px-3 py-3 text-xs font-medium text-gray-500">Docs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {facturas.map(f => (
                    <tr key={f.folio} className="hover:bg-gray-50/50">
                      <td className="px-5 py-3.5 font-mono text-xs text-gray-600 font-medium">
                        #{String(f.folio).padStart(5, '0')}
                      </td>
                      <td className="px-3 py-3.5">
                        <p className="font-mono text-xs text-gray-900">{f.rfc_emisor}</p>
                        <p className="text-xs text-gray-400 truncate max-w-[140px]">{f.nombre_emisor}</p>
                      </td>
                      <td className="px-3 py-3.5 font-mono text-xs text-gray-600">{f.rfc_receptor}</td>
                      <td className="px-3 py-3.5 text-xs text-gray-500 whitespace-nowrap">{formatFecha(f.fecha)}</td>
                      <td className="px-3 py-3.5">
                        <div>
                          <EstatusBadge estatus={f.estatus} />
                          {f.error && <p className="text-xs text-red-500 mt-1 max-w-[180px] truncate" title={f.error}>{f.error}</p>}
                        </div>
                      </td>
                      <td className="px-3 py-3.5">
                        {f.estatus === 'OK' ? (
                          <div className="flex items-center gap-2">
                            <a href={f.pdf_url} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500 transition-colors">
                              <FileDown size={13} /> PDF
                            </a>
                            <a href={f.xml_url} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-500 transition-colors">
                              <FileCode2 size={13} /> XML
                            </a>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
