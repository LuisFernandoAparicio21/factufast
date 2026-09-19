import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FileCheck2,
  Calendar,
  TrendingUp,
  AlertCircle,
  FileDown,
  Copy,
  Check,
  ArrowRight,
} from 'lucide-react'
import { getStats, getFacturas } from '../../services/pyme-api'
import { EstatusBadge } from '../../components/ui/EstatusBadge'
import { formatFecha } from '../../utils/format'
import type { EmisorStats, Factura } from '../../types/pyme'

function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="animate-pulse space-y-3">
        <div className="h-4 bg-gray-100 rounded w-2/3" />
        <div className="h-8 bg-gray-100 rounded w-1/3" />
      </div>
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="divide-y divide-gray-100">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="px-5 py-3.5 animate-pulse flex gap-4">
          <div className="h-4 bg-gray-100 rounded w-10" />
          <div className="h-4 bg-gray-100 rounded w-32" />
          <div className="h-4 bg-gray-100 rounded w-24 ml-auto" />
        </div>
      ))}
    </div>
  )
}

interface StatCardProps {
  label: string
  value: number
  icon: React.ReactNode
  accent?: 'blue' | 'gray' | 'red'
}

function StatCard({ label, value, icon, accent = 'blue' }: StatCardProps) {
  const iconBg    = { blue: 'bg-gradient-to-br from-blue-50 to-indigo-100', gray: 'bg-gray-100', red: 'bg-red-50' }[accent]
  const iconColor = { blue: 'text-blue-600', gray: 'text-gray-500', red: 'text-red-600' }[accent]
  const valueColor = accent === 'red' && value > 0 ? 'text-red-600' : 'text-gray-900'

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md hover:border-gray-300 transition-shadow duration-200">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
          <p className={`text-3xl font-semibold tracking-tight ${valueColor}`}>{value}</p>
        </div>
        <div className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
          <span className={iconColor}>{icon}</span>
        </div>
      </div>
    </div>
  )
}

export function PymeDashboard() {
  const [stats, setStats] = useState<EmisorStats | null>(null)
  const [facturas, setFacturas] = useState<Factura[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const publicUrl = window.location.origin + '/'

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [statsData, facturasData] = await Promise.all([getStats(), getFacturas()])
        if (cancelled) return
        setStats(statsData)
        setFacturas(facturasData.slice(0, 5))
      } catch {
        if (!cancelled) setError('No se pudieron cargar los datos del dashboard.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  function handleCopyUrl() {
    navigator.clipboard.writeText(publicUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="mt-0.5 text-sm text-gray-500">Resumen de actividad del emisor EKU9003173C9</p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            <><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /></>
          ) : stats ? (
            <>
              <StatCard label="Facturas hoy"      value={stats.facturas_hoy}   icon={<FileCheck2 size={18} />} accent="blue" />
              <StatCard label="Facturas del mes"  value={stats.facturas_mes}   icon={<Calendar size={18} />}   accent="blue" />
              <StatCard label="Total acumulado"   value={stats.facturas_total} icon={<TrendingUp size={18} />} accent="gray" />
              <StatCard label="Errores del mes"   value={stats.errores_mes}    icon={<AlertCircle size={18} />} accent={stats.errores_mes > 0 ? 'red' : 'gray'} />
            </>
          ) : null}
        </div>

        {/* Últimas facturas */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900">Últimas facturas</p>
            <Link
              to="/pyme/facturas"
              className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Ver todas
              <ArrowRight size={12} />
            </Link>
          </div>

          {loading ? <TableSkeleton /> : facturas.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-gray-400">
              No hay facturas registradas.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Folio</th>
                    <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">RFC Receptor</th>
                    <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide hidden sm:table-cell">Fecha</th>
                    <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Estatus</th>
                    <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide hidden md:table-cell">PDF</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {facturas.map(f => (
                    <tr key={f.folio} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-xs text-gray-600">#{String(f.folio).padStart(5, '0')}</td>
                      <td className="px-5 py-3.5 font-mono text-xs text-gray-800 tracking-wider">{f.rfc_receptor}</td>
                      <td className="px-5 py-3.5 text-xs text-gray-500 hidden sm:table-cell">{formatFecha(f.fecha)}</td>
                      <td className="px-5 py-3.5"><EstatusBadge estatus={f.estatus} /></td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        {f.estatus === 'OK' && f.pdf_url ? (
                          <a href={f.pdf_url} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700">
                            <FileDown size={13} /> PDF
                          </a>
                        ) : <span className="text-xs text-gray-300">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Formulario público */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">Formulario público</p>
            <p className="text-xs text-gray-400 mt-0.5">Comparte este enlace con tus clientes para que soliciten su factura</p>
          </div>
          <div className="p-5 flex items-center gap-3">
            <code className="flex-1 font-mono text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5 break-all">
              {publicUrl}
            </code>
            <button
              onClick={handleCopyUrl}
              aria-label="Copiar URL del formulario"
              className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:text-gray-800 hover:border-gray-300 bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {copied ? (
                <><Check size={13} className="text-emerald-600" /><span className="text-emerald-600">Copiado</span></>
              ) : (
                <><Copy size={13} />Copiar</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
