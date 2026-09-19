import { Routes, Route } from 'react-router-dom'
import { Header } from './components/layout/Header'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import { Formulario } from './pages/factura/Formulario'
import { Resultado } from './pages/factura/Resultado'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Formulario />} />
            <Route path="/resultado" element={<Resultado />} />
          </Routes>
        </ErrorBoundary>
      </main>
    </div>
  )
}
