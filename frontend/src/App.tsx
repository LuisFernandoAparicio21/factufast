import { Routes, Route, Navigate } from 'react-router-dom'
import { Header } from './components/layout/Header'
import { PymeLayout } from './components/layout/PymeLayout'
import { AdminLayout } from './components/layout/AdminLayout'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import { Landing } from './pages/home/Landing'
import { RegistroPyme } from './pages/home/Registro'
import { Formulario } from './pages/factura/Formulario'
import { Resultado } from './pages/factura/Resultado'
import { PymeDashboard } from './pages/pyme/Dashboard'
import { PymeFacturas } from './pages/pyme/Facturas'
import { PymeConfiguracion } from './pages/pyme/Configuracion'
import { AdminDashboard } from './pages/admin/Dashboard'
import { AdminEmisores } from './pages/admin/Emisores'
import { AdminFacturas } from './pages/admin/Facturas'

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Landing page pública */}
        <Route path="/" element={<Landing />} />

        {/* Registro de nuevas PYMEs */}
        <Route path="/registro" element={<RegistroPyme />} />

        {/* Vista receptor (pública) */}
        <Route
          path="/factura"
          element={
            <div className="min-h-screen bg-gray-50">
              <Header />
              <main><Formulario /></main>
            </div>
          }
        />
        <Route
          path="/factura/resultado"
          element={
            <div className="min-h-screen bg-gray-50">
              <Header />
              <main><Resultado /></main>
            </div>
          }
        />

        {/* Vista 2 — Portal PYME */}
        <Route path="/pyme" element={<PymeLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"     element={<PymeDashboard />} />
          <Route path="facturas"      element={<PymeFacturas />} />
          <Route path="configuracion" element={<PymeConfiguracion />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Vista 1 — Admin/Dev */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="emisores"  element={<AdminEmisores />} />
          <Route path="facturas"  element={<AdminFacturas />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* 404 global → landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  )
}
