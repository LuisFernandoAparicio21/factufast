import { Receipt, Menu } from 'lucide-react'

interface HeaderProps {
  variant?: 'default' | 'pyme' | 'admin'
  onMenuToggle?: () => void
}

export function Header({ variant = 'default', onMenuToggle }: HeaderProps) {
  return (
    <header className="bg-white sticky top-0 z-10 shadow-sm">
      <div className="h-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-600" />
      <div className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
          {onMenuToggle && (
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors -ml-1 mr-1"
              aria-label="Abrir menú"
            >
              <Menu size={20} />
            </button>
          )}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-gradient-to-br from-blue-500 to-indigo-600">
              <Receipt size={16} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-semibold text-gray-900 text-[15px] tracking-tight">
              FactuFast<span className="text-indigo-600 font-bold">AI</span>
            </span>
          </div>
          {variant === 'admin' && (
            <span className="text-xs font-medium bg-violet-50 text-violet-600 border border-violet-200 px-2 py-0.5 rounded-full">
              Admin
            </span>
          )}
          {variant === 'pyme' && (
            <span className="text-xs font-medium bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full">
              Portal PYME
            </span>
          )}
          <div className="ml-auto flex items-center gap-1.5 text-xs text-gray-400">
            <span className="hidden sm:block">CFDI 4.0</span>
            <span className="hidden sm:block">·</span>
            <span className="hidden sm:block">Facturama</span>
          </div>
        </div>
      </div>
    </header>
  )
}
