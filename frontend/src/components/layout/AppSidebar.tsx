import { NavLink } from 'react-router-dom'
import { type LucideIcon, X, Receipt } from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

interface AppSidebarProps {
  items: NavItem[]
  title: string
  subtitle: string
  accent: 'blue' | 'violet'
  open: boolean
  onClose: () => void
}

export function AppSidebar({ items, title, subtitle, accent, open, onClose }: AppSidebarProps) {
  const activeItem = accent === 'blue'
    ? 'bg-blue-500/20 text-white font-semibold'
    : 'bg-violet-500/20 text-white font-semibold'
  const activeIcon = accent === 'blue' ? 'text-blue-400' : 'text-violet-400'
  const dotColor   = accent === 'blue' ? 'bg-blue-400'   : 'bg-violet-400'
  const accentBadge = accent === 'blue'
    ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    : 'bg-violet-500/20 text-violet-300 border-violet-500/30'

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onClose}
          onKeyDown={e => e.key === 'Escape' && onClose()}
          role="presentation"
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-screen w-60 bg-slate-900 border-r border-slate-800 z-30
          flex flex-col overflow-y-auto transition-transform duration-200
          ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        `}
      >
        {/* Brand */}
        <div className="px-4 pt-5 pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-gradient-to-br from-blue-500 to-indigo-600">
                <Receipt size={13} className="text-white" strokeWidth={2.5} />
              </div>
              <span className="font-semibold text-slate-100 text-[14px] tracking-tight">
                FactuFast<span className="text-indigo-400 font-bold">AI</span>
              </span>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded text-slate-500 hover:text-slate-300 transition-colors"
              aria-label="Cerrar menú"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Portal info */}
        <div className="px-4 py-3.5 border-b border-slate-800 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-100 truncate">{title}</p>
              <p className="font-mono text-[10px] text-slate-500 mt-0.5 truncate">{subtitle}</p>
            </div>
            <span className={`shrink-0 text-[10px] font-medium border px-1.5 py-0.5 rounded-full ${accentBadge}`}>
              Sandbox
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end
              onClick={() => onClose()}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? activeItem
                    : 'text-slate-400 hover:bg-white/[0.06] hover:text-slate-100'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={16} className={isActive ? activeIcon : 'text-slate-500'} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${dotColor} opacity-60`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColor}`} />
            </span>
            <span className="text-xs text-slate-500">CFDI 4.0 · Facturama</span>
          </div>
        </div>
      </aside>
    </>
  )
}
