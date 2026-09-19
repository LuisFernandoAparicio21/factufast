import { Link } from 'react-router-dom'
import {
  Zap, ShieldCheck, Mail, ArrowRight, Receipt,
  Check, Clock, FileText, CheckCircle2, FileDown, FileCode2,
} from 'lucide-react'

// ── Nav ───────────────────────────────────────────────────────────────────────

function LandingNav() {
  return (
    <nav className="sticky top-0 z-20 border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-900/40">
            <Receipt size={16} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-white text-[15px] tracking-tight">
            FactuFast<span className="text-indigo-400 font-bold">AI</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/factura"
            className="text-sm text-slate-400 hover:text-slate-200 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5 hidden sm:block"
          >
            Solicitar factura
          </Link>
          <Link
            to="/registro"
            className="text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors shadow-md shadow-blue-900/30"
          >
            Registrarse
          </Link>
        </div>
      </div>
    </nav>
  )
}

// ── Hero ──────────────────────────────────────────────────────────────────────

function MockCfdiCard() {
  return (
    <div className="relative">
      {/* Glow behind card */}
      <div className="absolute inset-0 -m-6 rounded-3xl bg-indigo-500/10 blur-2xl" />

      <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden ring-1 ring-white/10">
        {/* Card header */}
        <div className="bg-emerald-50 border-b border-emerald-100 px-5 py-3.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <CheckCircle2 size={16} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">CFDI timbrado</p>
            <p className="text-xs text-emerald-600">Válido ante el SAT · en segundos</p>
          </div>
        </div>

        {/* UUID */}
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-1.5">Folio fiscal (UUID)</p>
          <p className="font-mono text-xs text-gray-700 bg-gray-50 rounded-lg px-3 py-2 break-all">
            a1b2c3d4-e5f6-7890-abcd-ef1234567890
          </p>
        </div>

        {/* Receptor info */}
        <div className="px-5 py-3 border-b border-gray-100 grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-gray-400 mb-0.5">RFC Receptor</p>
            <p className="font-mono font-medium text-gray-800">URE180429TM6</p>
          </div>
          <div>
            <p className="text-gray-400 mb-0.5">Folio interno</p>
            <p className="font-mono font-medium text-gray-800">#00015</p>
          </div>
        </div>

        {/* Download buttons */}
        <div className="px-5 py-3.5 flex items-center gap-3">
          <div aria-hidden="true" className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg py-2">
            <FileDown size={13} /> PDF
          </div>
          <div aria-hidden="true" className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg py-2">
            <FileCode2 size={13} /> XML
          </div>
          <p className="text-[10px] text-gray-400 shrink-0">enviado a correo ✓</p>
        </div>
      </div>

      {/* Floating badge */}
      <div className="absolute -top-3 -right-3 bg-indigo-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg shadow-indigo-900/50 ring-2 ring-slate-900">
        CFDI 4.0
      </div>
    </div>
  )
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-slate-950 pt-20 pb-28 px-4">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-32 right-0 w-[700px] h-[700px] rounded-full bg-indigo-600/20 blur-[130px]" />
        <div className="absolute bottom-0 -left-32 w-[500px] h-[500px] rounded-full bg-blue-700/15 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[300px] rounded-full bg-violet-700/10 blur-[80px]" />
      </div>

      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: 'linear-gradient(rgba(99,102,241,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.07) 1px,transparent 1px)',
          backgroundSize: '48px 48px',
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          {/* Left: text */}
          <div>
            <span className="inline-block text-[11px] font-semibold tracking-widest uppercase text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-3 py-1 mb-7">
              CFDI 4.0 · Facturama PAC · AWS
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight leading-[1.12] mb-5">
              Facturación electrónica
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
                que trabaja sola
              </span>
              <br />
              mientras tú trabajas en lo tuyo.
            </h1>
            <p className="text-lg text-slate-400 mb-3 leading-relaxed max-w-lg">
              Un enlace público. Tu cliente llena 4 datos fiscales.
              El SAT timbra el CFDI y lo manda a su correo — sin que toques nada.
            </p>
            <p className="text-sm text-slate-500 mb-9">
              Para médicos, restaurantes, consultores y cualquier PYME mexicana.
            </p>

            {/* Primary CTA — PYMEs */}
            <Link
              to="/registro"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm px-7 py-3.5 rounded-xl shadow-lg shadow-blue-900/40 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-950 mb-4"
            >
              Registrar mi empresa
              <ArrowRight size={15} />
            </Link>

            <p className="text-xs text-slate-600 mb-3">
              Sin tarjeta de crédito · Gratis para comenzar · CFDI firmado por Facturama
            </p>

            {/* Separator */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 h-px bg-slate-800" />
              <span className="text-xs text-slate-700">¿Eres cliente de una PYME?</span>
              <div className="flex-1 h-px bg-slate-800" />
            </div>

            {/* Secondary CTA — receptores */}
            <Link
              to="/factura"
              className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors underline underline-offset-4 decoration-slate-700 hover:decoration-slate-400"
            >
              Solicita tu factura electrónica aquí
              <ArrowRight size={13} />
            </Link>
          </div>

          {/* Right: product mockup */}
          <div className="hidden lg:block">
            <MockCfdiCard />
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Problem ───────────────────────────────────────────────────────────────────

function Problem() {
  const pains = [
    { icon: Clock, text: '15 minutos buscando el RFC del cliente por WhatsApp' },
    { icon: FileText, text: 'Abrir CONTPAQI, copiar datos, timbrar, exportar XML' },
    { icon: Mail, text: 'Mandar el PDF por correo o WhatsApp a mano' },
  ]
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
      <div className="grid lg:grid-cols-2 gap-14 items-center">
        <div>
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-3 block">El problema</span>
          <h2 className="text-3xl font-bold text-gray-900 mb-5 leading-snug">
            ¿Tu PYME todavía
            <br />factura de forma manual?
          </h2>
          <p className="text-gray-500 mb-7 leading-relaxed">
            Abrir el ERP, buscar el RFC del cliente, llenar el CFDI, exportar el XML,
            mandarlo por correo. Un proceso arcaico que se repite con cada cliente y
            consume tiempo que no tienes.
            <span className="font-medium text-gray-700"> Con FactuFastAI tus clientes solicitan su factura solos — tú no tienes que tocar nada.</span>
          </p>
          <ul className="space-y-4">
            {pains.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3.5">
                <div className="w-7 h-7 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon size={13} className="text-red-500" />
                </div>
                <span className="text-sm text-gray-600 leading-relaxed">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Form mockup */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
          <div className="bg-slate-50 border-b border-gray-200 px-4 py-3 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
            </div>
            <span className="ml-2 text-xs text-gray-400 font-mono">factufast.ai/f/mi-empresa</span>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-gray-500">RFC del receptor</p>
              <div className="h-9 rounded-lg bg-gray-50 border border-gray-200 flex items-center px-3 font-mono text-sm text-gray-800">URE180429TM6</div>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-gray-500">Razón social</p>
              <div className="h-9 rounded-lg bg-gray-50 border border-gray-200 flex items-center px-3 text-sm text-gray-800">Universidad Robótica Española</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-gray-500">Régimen fiscal</p>
                <div className="h-9 rounded-lg bg-gray-50 border border-gray-200 flex items-center px-3 text-xs text-gray-800">601 — General</div>
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-gray-500">Código postal</p>
                <div className="h-9 rounded-lg bg-gray-50 border border-gray-200 flex items-center px-3 font-mono text-sm text-gray-800">65000</div>
              </div>
            </div>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors">
              Solicitar factura →
            </button>
            <p className="text-center text-xs text-emerald-600 font-medium flex items-center justify-center gap-1.5">
              <Check size={12} /> CFDI timbrado y enviado a tu correo en segundos
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Features ──────────────────────────────────────────────────────────────────

function Features() {
  const items = [
    {
      icon: <Zap size={18} className="text-blue-500" />,
      accent: 'bg-blue-50 border-blue-100',
      title: 'Timbrado en segundos',
      desc: 'CFDI 4.0 válido ante el SAT, firmado por Facturama (PAC autorizado). Sin colas, sin esperas.',
    },
    {
      icon: <ShieldCheck size={18} className="text-indigo-500" />,
      accent: 'bg-indigo-50 border-indigo-100',
      title: 'CSD siempre cifrado',
      desc: 'Tu certificado digital vive en AWS. Nunca sale de servidores cifrados. Tu .key solo se valida al registrarte.',
    },
    {
      icon: <Mail size={18} className="text-violet-500" />,
      accent: 'bg-violet-50 border-violet-100',
      title: 'Resumen diario automático',
      desc: 'A las 6 PM recibes un correo con todas las facturas del día: timbrads, errores y links de descarga.',
    },
  ]
  return (
    <section className="bg-slate-950 border-y border-slate-800/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-3 block">Características</span>
          <h2 className="text-2xl font-bold text-white">Todo lo que necesitas, nada que no necesitas</h2>
          <p className="text-slate-400 text-sm mt-2">Sin instalaciones. Sin contratos. Sin curvas de aprendizaje.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {items.map(({ icon, accent, title, desc }) => (
            <div key={title} className="bg-slate-900 rounded-xl border border-slate-800 p-6 hover:border-slate-700 transition-colors">
              <div className={`w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 mb-4 ${accent}`}>
                {icon}
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">{title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── How it works ──────────────────────────────────────────────────────────────

function HowItWorks() {
  const steps = [
    {
      n: '01',
      title: 'Regístrate con tu RFC y CSD',
      desc: 'Sube tu .cer y .key una sola vez. Tu certificado queda guardado en AWS de forma cifrada.',
      time: '2 min',
    },
    {
      n: '02',
      title: 'Comparte tu enlace público',
      desc: 'Cada PYME tiene un link único. Tus clientes entran sin cuenta y llenan 4 campos fiscales.',
      time: '30 seg',
    },
    {
      n: '03',
      title: 'El CFDI llega solo',
      desc: 'El sistema timbra en Facturama, guarda en S3 y manda PDF + XML al correo del cliente.',
      time: 'segundos',
    },
  ]
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
      <div className="grid lg:grid-cols-2 gap-14 items-start">
        <div>
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-3 block">Cómo funciona</span>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Tres pasos. El primero lo haces una vez.</h2>
          <p className="text-sm text-gray-400 mb-10">Después, el sistema trabaja solo con cada cliente.</p>
          <div className="space-y-8">
            {steps.map(({ n, title, desc, time }) => (
              <div key={n} className="flex gap-5">
                <div className="shrink-0 w-10 h-10 rounded-xl bg-indigo-600 text-white text-sm font-bold flex items-center justify-center mt-0.5">
                  {n}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-gray-900">{title}</p>
                    <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">{time}</span>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Why not alternatives */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900">¿Por qué no las alternativas?</p>
            <p className="text-xs text-gray-400 mt-0.5">Optimizado para PYMEs sin equipo de IT</p>
          </div>
          <div className="divide-y divide-gray-50">
            {[
              { alt: 'CONTPAQI / CONTPAQi', con: 'Instalación, licencia anual, curva de aprendizaje' },
              { alt: 'Factura.com', con: 'Interfaz compleja, exportación manual' },
              { alt: 'El contador lo hace', con: 'Retrasos, costo por factura, intermediario' },
            ].map(({ alt, con }) => (
              <div key={alt} className="px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{alt}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{con}</p>
                  </div>
                  <span className="shrink-0 flex items-center gap-1 text-xs text-emerald-600 font-medium bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-full">
                    <Check size={11} /> Resuelto
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ── CTA final ─────────────────────────────────────────────────────────────────

function CtaFinal() {
  return (
    <section className="bg-slate-950 border-t border-slate-800/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="grid sm:grid-cols-2 gap-4">
          {/* PYME card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl px-8 py-10">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/3 translate-x-1/3" aria-hidden="true" />
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center mb-5">
                <Receipt size={20} className="text-white" />
              </div>
              <p className="text-xl font-bold text-white mb-2">Soy una PYME</p>
              <p className="text-blue-200 text-sm mb-7 leading-relaxed">
                Quiero registrarme y empezar a timbrar CFDIs para mis clientes sin instalar nada.
              </p>
              <Link
                to="/registro"
                className="inline-flex items-center gap-2 bg-white text-indigo-700 hover:bg-blue-50 font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
              >
                Registrar mi empresa <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Receptor card */}
          <div className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-2xl px-8 py-10">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-slate-800/50 -translate-y-1/3 translate-x-1/3" aria-hidden="true" />
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-5">
                <FileText size={20} className="text-slate-300" />
              </div>
              <p className="text-xl font-bold text-white mb-2">Necesito una factura</p>
              <p className="text-slate-400 text-sm mb-7 leading-relaxed">
                Mi proveedor ya usa FactuFastAI. Quiero solicitar mi CFDI electrónico en segundos.
              </p>
              <Link
                to="/factura"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/10 text-slate-200 font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                Solicitar mi factura <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <Receipt size={12} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="text-xs text-slate-500">
            FactuFast<strong className="text-indigo-400">AI</strong> · Facturación electrónica CFDI 4.0
          </span>
        </div>
        <span className="text-xs text-slate-700">© 2026 FactuFastAI · México</span>
      </div>
    </footer>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function Landing() {
  return (
    <div className="min-h-screen bg-gray-50">
      <LandingNav />
      <main>
        <Hero />
        <Problem />
        <Features />
        <HowItWorks />
        <CtaFinal />
      </main>
      <Footer />
    </div>
  )
}
