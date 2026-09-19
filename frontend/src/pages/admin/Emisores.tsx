import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, ShieldCheck, ShieldX, ArrowRight, UserPlus, Copy, Check, X } from 'lucide-react'
import { getEmisores } from '../../services/admin-api'
import type { Emisor } from '../../types/admin'

function InviteModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('')
  const [copied, setCopied] = useState(false)
  const token = btoa(`invite:${email}:${Date.now()}`).replace(/=/g, '')
  const link = `${window.location.origin}/registro?token=${token}`

  function handleCopy() {
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-gray-200 shadow-xl w-full max-w-md">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-900">Invitar nuevo emisor</p>
          <button onClick={onClose} className="p-1 rounded text-gray-400 hover:text-gray-600 transition-colors" aria-label="Cerrar">
            <X size={16} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label htmlFor="invite-email" className="block text-xs font-medium text-gray-700 mb-1.5">
              Email del contacto en la PYME
            </label>
            <input
              id="invite-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="contacto@empresa.com"
              className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          {email && (
            <div>
              <p className="text-xs font-medium text-gray-700 mb-1.5">Enlace de registro</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 font-mono text-[11px] text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 break-all">
                  {link}
                </code>
                <button
                  onClick={handleCopy}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:border-gray-300 hover:text-gray-800 bg-white transition-colors"
                  aria-label="Copiar enlace"
                >
                  {copied ? <><Check size={13} className="text-emerald-600" /><span className="text-emerald-600">Copiado</span></> : <><Copy size={13} />Copiar</>}
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-400">El enlace pre-verifica el RFC del emisor al llegar a /registro.</p>
            </div>
          )}
        </div>
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export function AdminEmisores() {
  const [emisores, setEmisores] = useState<Emisor[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [loading, setLoading] = useState(true)
  const [showInvite, setShowInvite] = useState(false)

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
        {showInvite && <InviteModal onClose={() => setShowInvite(false)} />}

        <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Emisores</h1>
            <p className="text-sm text-gray-500 mt-0.5">PYMEs registradas en el sistema</p>
          </div>
          <div className="flex items-center gap-3">
          <button
            onClick={() => setShowInvite(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-600 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <UserPlus size={15} />
            Invitar emisor
          </button>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por RFC o nombre…"
              aria-label="Buscar emisor por RFC o nombre"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="pl-8 pr-3 py-2 text-sm rounded-lg border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-64"
            />
          </div>
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
