import { Routes, Route } from 'react-router-dom'
import { Header } from './components/layout/Header'
import { Formulario } from './pages/Formulario'
import { Resultado } from './pages/Resultado'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Formulario />} />
          <Route path="/resultado" element={<Resultado />} />
        </Routes>
      </main>
    </div>
  )
}
