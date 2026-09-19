import { Link } from 'react-router-dom'
import { Zap, ShieldCheck, Mail, ArrowRight } from 'lucide-react'
import { Header } from '../../components/layout/Header'

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col gap-4">
      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

interface StepProps {
  number: number
  title: string
  description: string
}

function Step({ number, title, description }: StepProps) {
  return (
    <div className="flex items-start gap-4">
      <div
        className="w-8 h-8 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center shrink-0 mt-0.5"
        aria-hidden="true"
      >
        {number}
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <p className="text-sm text-gray-500 mt-0.5">{description}</p>
      </div>
    </div>
  )
}

export function Landing() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header variant="default" />

      <main>
        {/* ── 1. Hero ─────────────────────────────────────────── */}
        <section className="bg-white border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 sm:py-28 text-center">
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-full px-3 py-1 mb-6">
              CFDI 4.0 · Facturama · AWS
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight leading-tight mb-4">
              Facturación CFDI 4.0
              <br />
              <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-600 bg-clip-text text-transparent">
                para tu empresa
              </span>
            </h1>
            <p className="text-lg text-gray-500 mb-10 max-w-xl mx-auto">
              Timbra en segundos. Sin instalaciones. Conforme al SAT.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/registro"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-3 rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Registrar mi empresa
                <ArrowRight size={15} />
              </Link>
              <Link
                to="/factura"
                className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm px-6 py-3 rounded-lg border border-gray-200 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
              >
                Solicitar una factura
              </Link>
            </div>
          </div>
        </section>

        {/* ── 2. Features ─────────────────────────────────────── */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <h2 className="text-xl font-semibold text-gray-900 text-center mb-10">
            Todo lo que necesitas, nada que no necesitas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FeatureCard
              icon={<Zap size={18} className="text-blue-600" />}
              title="Timbrado instantáneo"
              description="Tu CFDI 4.0 en menos de 3 segundos vía Facturama."
            />
            <FeatureCard
              icon={<ShieldCheck size={18} className="text-blue-600" />}
              title="CSD protegido"
              description="Tu certificado digital nunca sale de servidores cifrados en AWS."
            />
            <FeatureCard
              icon={<Mail size={18} className="text-blue-600" />}
              title="Resumen diario"
              description="Recibe un correo cada tarde con el resumen de facturas del día."
            />
          </div>
        </section>

        {/* ── 3. Cómo funciona ────────────────────────────────── */}
        <section className="bg-white border-y border-gray-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
            <h2 className="text-xl font-semibold text-gray-900 mb-10">
              ¿Cómo funciona?
            </h2>
            <div className="flex flex-col gap-8 max-w-lg">
              <Step
                number={1}
                title="Regístrate con tu RFC y CSD"
                description="Sube tu certificado .cer y .key. Solo se usan para validar tu CSD en el momento del registro."
              />
              <Step
                number={2}
                title="Comparte tu enlace de facturación"
                description="Tus clientes acceden a un formulario público con tu nombre de empresa. No necesitan cuenta."
              />
              <Step
                number={3}
                title="Los clientes reciben su CFDI en segundos"
                description="Llenan 4 datos fiscales y reciben el PDF y XML timbrado directo a su correo."
              />
            </div>
          </div>
        </section>

        {/* ── 4. CTA final ────────────────────────────────────── */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="bg-indigo-600 rounded-2xl px-8 py-12 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">
                ¿Ya eres cliente de una PYME?
              </h2>
              <p className="text-indigo-200 text-sm">
                Solicita tu factura electrónica en segundos, sin crear cuenta.
              </p>
            </div>
            <Link
              to="/factura"
              className="shrink-0 inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-indigo-700 font-semibold text-sm px-6 py-3 rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
            >
              Solicitar mi factura
              <ArrowRight size={15} />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-100 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
          <span>FactuFast<strong className="text-indigo-600">AI</strong> · MVP CFDI 4.0</span>
          <span>Powered by Facturama · AWS · Sandbox</span>
        </div>
      </footer>
    </div>
  )
}
