import { useEffect, useState } from 'react'
import { Search, FileDown, FileCode2, FileX } from 'lucide-react'
import { getFacturas } from '../../services/pyme-api'
import { EstatusBadge } from '../../components/ui/EstatusBadge'
import { formatFecha } from '../../utils/format'
import type { Factura } from '../../types/pyme'

function TableSkeleton() {
  return (
    <div className="divide-y divide-gray-100">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="px-5 py-3.5 animate-pulse flex gap-4">
          <div className="h-4 bg-gray-100 rounded w-10 shrink-0" />
          <div className="h-4 bg-gray-100 rounded w-32 shrink-0" />
          <div className="h-4 bg-gray-100 rounded w-24 shrink-0 hidden sm:block" />
          <div className="h-4 bg-gray-100 rounded w-16 ml-auto" />
        </div>
      ))}
    </div>
  )
}

export function PymeFacturas() {
  const [allFacturas, setAllFacturas] = useState<Factura[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rfcQuery, setRfcQuery] = useState('')
  const [estatusFiltro, setEstatusFiltro] = useState<'all' | 'OK' | 'ERROR'>('all')

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const data = await getFacturas()
        if (!cancelled) setAllFacturas(data)
      } catch {
        if (!cancelled) setError('No se pudieron cargar las facturas.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const filtradas = allFacturas.filter((f) => {
    const rfcMatch =
      rfcQuery.trim() === '' || f.rfc_receptor.includes(rfcQuery.trim().toUpperCase())
    const estatusMatch = estatusFiltro === 'all' || f.estatus === estatusFiltro
    return rfcMatch && estatusMatch
  })

  return (
    <div className="py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Facturas</h1>
          <p className="mt-0.5 text-sm text-gray-500">Historial completo de CFDI emitidos</p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Filters */}
          <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Buscar por RFC receptor…"
                value={rfcQuery}
                onChange={(e) => setRfcQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white pl-8 pr-3.5 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <select
              value={estatusFiltro}
              onChange={(e) => setEstatusFiltro(e.target.value as 'all' | 'OK' | 'ERROR')}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              <option value="all">Todas</option>
              <option value="OK">Timbradas</option>
              <option value="ERROR">Errores</option>
            </select>
          </div>

          {loading ? (
            <TableSkeleton />
          ) : filtradas.length === 0 ? (
            <div className="py-16 px-5 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <FileX size={22} className="text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-700">Sin resultados</p>
              <p className="text-xs text-gray-400 mt-1">
                No hay facturas que coincidan con los filtros aplicados.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Folio</th>
                    <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">RFC Receptor</th>
                    <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Fecha</th>
                    <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Estatus</th>
                    <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">PDF</th>
                    <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">XML</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtradas.map((f) => (
                    <tr key={f.folio} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-xs text-gray-600">
                        #{String(f.folio).padStart(5, '0')}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs text-gray-800 tracking-wider">
                        {f.rfc_receptor}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-500 whitespace-nowrap">
                        {formatFecha(f.fecha)}
                      </td>
                      <td className="px-5 py-3.5">
                        <EstatusBadge estatus={f.estatus} />
                      </td>
                      <td className="px-5 py-3.5">
                        {f.estatus === 'OK' && f.pdf_url ? (
                          <a
                            href={f.pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
                            title="Descargar PDF"
                          >
                            <FileDown size={13} className="text-red-500" />
                            PDF
                          </a>
                        ) : f.estatus === 'ERROR' ? (
                          <span className="text-xs text-gray-300" title={f.error}>
                            —
                          </span>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        {f.estatus === 'OK' && f.xml_url ? (
                          <a
                            href={f.xml_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
                            title="Descargar XML"
                          >
                            <FileCode2 size={13} className="text-blue-500" />
                            XML
                          </a>
                        ) : f.estatus === 'ERROR' ? (
                          <span
                            className="text-xs text-red-400 cursor-help truncate block max-w-[160px]"
                            title={f.error}
                          >
                            {f.error}
                          </span>
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

          {!loading && filtradas.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-400">
                {filtradas.length} {filtradas.length === 1 ? 'factura' : 'facturas'} encontradas
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
