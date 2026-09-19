import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileCheck2, Users, AlertCircle, TrendingUp, XCircle, MinusCircle, ArrowRight } from 'lucide-react'
import { getSystemStats, getTodasFacturas, getServiceStatus } from '../../services/admin-api'
import type { SystemStats, FacturaAdmin, ServiceStatus } from '../../types/admin'

function StatusDot({ estado }: { estado: ServiceStatus['estado'] }) {
  if (estado === 'ok') return (
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
    </span>
  )
  if (estado === 'degraded') return <MinusCircle size={14} className="text-amber-500" />
  return <XCircle size={14} className="text-red-500" />
}

function EstatusBadge({ estatus }: { estatus: 'OK' | 'ERROR' }) {
  return estatus === 'OK'
    ? <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">OK</span>
    : <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">Error</span>
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export function AdminDashboard() {
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [facturas, setFacturas] = useState<FacturaAdmin[]>([])
  const [services, setServices] = useState<ServiceStatus[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getSystemStats(), getTodasFacturas(), getServiceStatus()])
      .then(([s, f, sv]) => { setStats(s); setFacturas(f.slice(0, 6)); setServices(sv) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="py-10 px-4 max-w-5xl mx-auto space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
        <div className="h-64 rounded-xl bg-gray-100 animate-pulse" />
      </div>
    )
  }

  const statCards = [
    { label: 'Facturas hoy', value: stats?.facturas_hoy ?? 0, icon: FileCheck2, color: 'blue' },
    { label: 'Total acumulado', value: stats?.facturas_total ?? 0, icon: TrendingUp, color: 'gray' },
    { label: 'Emisores activos', value: stats?.emisores_activos ?? 0, icon: Users, color: 'blue' },
    { label: 'Errores totales', value: stats?.errores_total ?? 0, icon: AlertCircle, color: stats?.errores_total ? 'red' : 'gray' },
  ] as const

  return (
    <div className="py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md hover:border-gray-300 transition-all duration-200">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${
                color === 'blue' ? 'bg-blue-50' : color === 'red' ? 'bg-red-50' : 'bg-gray-100'
              }`}>
                <Icon size={16} className={
                  color === 'blue' ? 'text-blue-600' : color === 'red' ? 'text-red-500' : 'text-gray-500'
                } />
              </div>
              <p className="text-2xl font-semibold text-gray-900">{value.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent facturas */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900">Últimas facturas</p>
              <Link to="/admin/facturas" className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700">
                Ver todas <ArrowRight size={12} />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th scope="col" className="text-left px-5 py-3 text-xs font-medium text-gray-500">Folio</th>
                    <th scope="col" className="text-left px-3 py-3 text-xs font-medium text-gray-500">Emisor</th>
                    <th scope="col" className="text-left px-3 py-3 text-xs font-medium text-gray-500">Receptor</th>
                    <th scope="col" className="text-left px-3 py-3 text-xs font-medium text-gray-500">Fecha</th>
                    <th scope="col" className="text-left px-3 py-3 text-xs font-medium text-gray-500">Estatus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {facturas.map(f => (
                    <tr key={f.folio} className="hover:bg-gray-50/50">
                      <td className="px-5 py-3 font-mono text-xs text-gray-600">#{String(f.folio).padStart(5, '0')}</td>
                      <td className="px-3 py-3 font-mono text-xs text-gray-600">{f.rfc_emisor}</td>
                      <td className="px-3 py-3 font-mono text-xs text-gray-600">{f.rfc_receptor}</td>
                      <td className="px-3 py-3 text-xs text-gray-500 whitespace-nowrap">{formatFecha(f.fecha)}</td>
                      <td className="px-3 py-3"><EstatusBadge estatus={f.estatus} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Service health */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">Estado del sistema</p>
            </div>
            <div className="p-5 space-y-3">
              {services.map(s => (
                <div key={s.nombre} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{s.nombre}</span>
                  <div className="flex items-center gap-2">
                    <StatusDot estado={s.estado} />
                    <span className={`text-xs font-medium ${
                      s.estado === 'ok' ? 'text-emerald-600' : s.estado === 'degraded' ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {s.estado === 'ok' ? 'Operativo' : s.estado === 'degraded' ? 'Degradado' : 'Caído'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50">
              <p className="text-xs text-gray-400">Datos en tiempo real — próximamente via CloudWatch</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
