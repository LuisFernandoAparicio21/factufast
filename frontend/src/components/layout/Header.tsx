import { Receipt } from 'lucide-react'

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
            <Receipt size={16} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-gray-900 text-[15px] tracking-tight">
            FactuFastAI
          </span>
        </div>
        <span className="text-xs font-medium bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-full">
          Sandbox
        </span>
        <div className="ml-auto flex items-center gap-1.5 text-xs text-gray-400">
          <span className="hidden sm:block">CFDI 4.0</span>
          <span className="hidden sm:block">·</span>
          <span className="hidden sm:block">Facturama</span>
        </div>
      </div>
    </header>
  )
}
