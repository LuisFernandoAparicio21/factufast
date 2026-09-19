import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { LayoutDashboard, Users, FileText, Menu, Receipt } from 'lucide-react'
import { AppSidebar } from './AppSidebar'

const NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/emisores',  label: 'Emisores',  icon: Users           },
  { to: '/admin/facturas',  label: 'Facturas',  icon: FileText        },
]

export function AdminLayout() {
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile top bar */}
      <div className="lg:hidden bg-slate-900 border-b border-slate-800 h-14 px-4 flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={() => setOpen(o => !o)}
          aria-label="Abrir menú"
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-colors"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600">
            <Receipt size={12} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-slate-100 text-[14px] tracking-tight">
            FactuFast<span className="text-indigo-400 font-bold">AI</span>
          </span>
        </div>
        <span className="text-[10px] font-medium bg-violet-500/20 text-violet-300 border border-violet-500/30 px-1.5 py-0.5 rounded-full">
          Admin
        </span>
      </div>

      <AppSidebar
        items={NAV_ITEMS}
        title="Admin"
        subtitle="Dev · Luis Fernando"
        accent="violet"
        open={open}
        onClose={() => setOpen(false)}
      />
      <div className="lg:ml-60">
        <Outlet />
      </div>
    </div>
  )
}
