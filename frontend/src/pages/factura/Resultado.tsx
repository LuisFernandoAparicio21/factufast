import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { CheckCircle2, Copy, Check, FileDown, FileCode2, ArrowLeft, AlertCircle } from 'lucide-react'
import type { FacturaResult } from '../../services/api'

export function Resultado() {
  const location = useLocation()
  const navigate = useNavigate()
  const result = location.state as FacturaResult | null
  const [copied, setCopied] = useState(false)

  if (!result) {
    return (
      <div className="py-20 px-4">
        <div className="max-w-sm mx-auto text-center">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={22} className="text-amber-600" />
          </div>
          <h2 className="text-base font-semibold text-gray-900 mb-1">Sin datos de factura</h2>
          <p className="text-sm text-gray-500 mb-5">
            Esta página requiere haber generado una factura previamente.
          </p>
          <button
            onClick={() => navigate('/factura')}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft size={15} />
            Volver al formulario
          </button>
        </div>
      </div>
    )
  }

  function handleCopy() {
    navigator.clipboard.writeText(result!.folio_fiscal).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="py-10 px-4">
      <div className="max-w-xl mx-auto">
        {/* Success header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={28} className="text-emerald-600" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Factura timbrada</h1>
          <p className="mt-1 text-sm text-gray-500">
            El CFDI fue generado y enviado al correo del receptor.
          </p>
        </div>

        {/* Folio fiscal card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-4">
          <div className="px-5 py-4 border-b border-gray-100">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Folio fiscal (UUID)</p>
          </div>
          <div className="p-5 flex items-center gap-3">
            <code className="flex-1 font-mono text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5 break-all">
              {result.folio_fiscal}
            </code>
            <button
              onClick={handleCopy}
              title="Copiar UUID"
              className="shrink-0 w-9 h-9 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {copied ? (
                <Check size={15} className="text-emerald-600" />
              ) : (
                <Copy size={15} />
              )}
            </button>
          </div>
          {result.folio && (
            <div className="px-5 pb-4">
              <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                Folio interno:{' '}
                <span className="font-mono text-gray-600">#{String(result.folio).padStart(5, '0')}</span>
              </span>
            </div>
          )}
        </div>

        {/* Download buttons */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8">
          <div className="px-5 py-4 border-b border-gray-100">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Descargar documentos</p>
          </div>
          <div className="p-5 grid grid-cols-2 gap-3">
            <a
              href={result.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <FileDown size={15} className="text-red-500" />
              PDF
            </a>
            <a
              href={result.xml_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <FileCode2 size={15} className="text-blue-500" />
              XML
            </a>
          </div>
        </div>

        {/* Back link */}
        <div className="text-center">
          <button
            onClick={() => navigate('/factura')}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft size={15} />
            Generar otra factura
          </button>
        </div>
      </div>
    </div>
  )
}
