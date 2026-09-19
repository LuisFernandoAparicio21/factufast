import { useEffect, useState } from 'react'
import { ShieldCheck, ShieldX, Info } from 'lucide-react'
import { getEmisorInfo } from '../../services/pyme-api'
import type { EmisorInfo } from '../../types/pyme'

const REGIMENES: Record<string, string> = {
  '601': '601 – General de Ley Personas Morales',
  '603': '603 – Personas Morales con Fines no Lucrativos',
  '605': '605 – Sueldos y Salarios e Ingresos Asimilados a Salarios',
  '606': '606 – Arrendamiento',
  '612': '612 – Personas Físicas con Actividades Empresariales y Profesionales',
  '626': '626 – Régimen Simplificado de Confianza',
}

function formatFechaVencimiento(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="animate-pulse space-y-3">
        <div className="h-4 bg-gray-100 rounded w-1/3" />
        <div className="h-4 bg-gray-100 rounded w-full" />
        <div className="h-4 bg-gray-100 rounded w-2/3" />
      </div>
    </div>
  )
}

interface ToastProps {
  visible: boolean
}

function Toast({ visible }: ToastProps) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-4 py-2.5 rounded-lg shadow-lg transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
      }`}
      role="status"
      aria-live="polite"
    >
      <ShieldCheck size={15} className="text-emerald-400 shrink-0" />
      Guardado
    </div>
  )
}

export function PymeConfiguracion() {
  const [info, setInfo] = useState<EmisorInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [toastVisible, setToastVisible] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const data = await getEmisorInfo()
        if (!cancelled) {
          setInfo(data)
          setEmail(data.email_resumen)
        }
      } catch {
        if (!cancelled) setError('No se pudieron cargar los datos de configuración.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  function handleGuardarEmail(e: React.FormEvent) {
    e.preventDefault()
    // Mock save — no real API call in sandbox
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 2500)
  }

  const csdVigente = info?.csd_vigente ?? false

  return (
    <div className="py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Configuración</h1>
          <p className="mt-0.5 text-sm text-gray-500">Datos del emisor y ajustes del portal</p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : info ? (
          <>
            {/* Datos del emisor */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900">Datos del emisor</p>
                <span className="text-xs font-medium bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-full">
                  Solo lectura en Sandbox
                </span>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">RFC</p>
                    <p className="font-mono text-sm font-medium text-gray-900 tracking-wider">
                      {info.rfc}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Nombre / Razón social</p>
                    <p className="text-sm text-gray-900">{info.nombre}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Régimen fiscal</p>
                  <p className="text-sm text-gray-900">
                    {REGIMENES[info.regimen_fiscal] ?? info.regimen_fiscal}
                  </p>
                </div>
              </div>
            </div>

            {/* CSD */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">Certificado digital (CSD)</p>
              </div>
              <div className="p-5 flex items-start gap-4">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    csdVigente ? 'bg-emerald-50' : 'bg-red-50'
                  }`}
                >
                  {csdVigente ? (
                    <ShieldCheck size={20} className="text-emerald-600" />
                  ) : (
                    <ShieldX size={20} className="text-red-600" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-gray-900">Estado del certificado</p>
                    {csdVigente ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Vigente
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                        Vencido
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Vencimiento:{' '}
                    <span className="font-medium text-gray-700">
                      {formatFechaVencimiento(info.csd_vencimiento)}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Notificaciones */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">Notificaciones</p>
              </div>
              <div className="p-5">
                <form onSubmit={handleGuardarEmail} className="space-y-3">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <label
                        htmlFor="email-resumen"
                        className="text-sm font-medium text-gray-700"
                      >
                        Correo para resumen diario
                      </label>
                      <span
                        title="Recibes un resumen de facturas cada día a las 6pm hora Ciudad de México"
                        className="cursor-help"
                        aria-label="Recibes un resumen de facturas cada día a las 6pm hora Ciudad de México"
                      >
                        <Info size={14} className="text-gray-400 hover:text-gray-600 transition-colors" />
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        id="email-resumen"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="correo@empresa.com"
                        className="flex-1 rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                      <button
                        type="submit"
                        className="shrink-0 px-4 py-2.5 rounded-lg bg-blue-600 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        Guardar
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-gray-400">
                      Recibes un resumen cada día a las 6pm hora Ciudad de México.
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </>
        ) : null}
      </div>

      <Toast visible={toastVisible} />
    </div>
  )
}
