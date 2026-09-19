import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, ShieldCheck, ShieldX, ArrowRight } from 'lucide-react'
import { getEmisores } from '../../services/admin-api'
import type { Emisor } from '../../types/admin'

function formatFecha(iso: string) {
  return new Date(iso).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export function AdminEmisores() {
  const [emisores, setEmisores] = useState<Emisor[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getEmisores().then(setEmisores).finally(() => setLoading(false))
  }, [])

  const filtrados = emisores.filter(e =>
    e.rfc.includes(busqueda.toUpperCase()) ||
    e.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Emisores</h1>
            <p className="text-sm text-gray-500 mt-0.5">PYMEs registradas en el sistema</p>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por RFC o nombre…"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="pl-8 pr-3 py-2 text-sm rounded-lg border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-64"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(3)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />)}
            </div>
          ) : filtrados.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm text-gray-500">No se encontraron emisores</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th scope="col" className="text-left px-5 py-3 text-xs font-medium text-gray-500">RFC / Nombre</th>
                    <th scope="col" className="text-left px-3 py-3 text-xs font-medium text-gray-500">Régimen</th>
                    <th scope="col" className="text-right px-3 py-3 text-xs font-medium text-gray-500">Facturas mes</th>
                    <th scope="col" className="text-right px-3 py-3 text-xs font-medium text-gray-500">Total</th>
                    <th scope="col" className="text-right px-3 py-3 text-xs font-medium text-gray-500">Errores mes</th>
                    <th scope="col" className="text-left px-3 py-3 text-xs font-medium text-gray-500">CSD</th>
                    <th scope="col" className="text-left px-3 py-3 text-xs font-medium text-gray-500">Última factura</th>
                    <th scope="col" className="px-3 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtrados.map(e => (
                    <tr key={e.rfc} className="hover:bg-gray-50/50">
                      <td className="px-5 py-3.5">
                        <p className="font-mono text-xs text-gray-900 font-medium">{e.rfc}</p>
                        <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[200px]">{e.nombre}</p>
                      </td>
                      <td className="px-3 py-3.5 text-xs font-mono text-gray-600">{e.regimen_fiscal}</td>
                      <td className="px-3 py-3.5 text-sm text-right text-gray-900 font-medium">{e.facturas_mes}</td>
                      <td className="px-3 py-3.5 text-sm text-right text-gray-500">{e.facturas_total}</td>
                      <td className="px-3 py-3.5 text-right">
                        <span className={`text-sm font-medium ${e.errores_mes > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                          {e.errores_mes}
                        </span>
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="flex items-center gap-1.5">
                          {e.csd_vigente
                            ? <><ShieldCheck size={14} className="text-emerald-500" /><span className="text-xs text-emerald-600">Vigente</span></>
                            : <><ShieldX size={14} className="text-red-500" /><span className="text-xs text-red-600">Expirado</span></>
                          }
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-xs text-gray-500 whitespace-nowrap">{formatFecha(e.ultima_factura)}</td>
                      <td className="px-3 py-3.5">
                        <Link
                          to={`/admin/facturas?rfc_emisor=${e.rfc}`}
                          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                        >
                          Ver <ArrowRight size={11} />
                        </Link>
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
