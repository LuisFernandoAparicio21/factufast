import { Link } from 'react-router-dom'
import { Zap, ShieldCheck, Mail, ArrowRight, Receipt, Check, Clock, FileText } from 'lucide-react'

// ── Nav ───────────────────────────────────────────────────────────────────────

function LandingNav() {
  return (
    <nav className="sticky top-0 z-20 bg-slate-900/80 backdrop-blur border-b border-slate-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0">
            <Receipt size={16} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-white text-[15px] tracking-tight">
            FactuFast<span className="text-indigo-400 font-bold">AI</span>
          </span>
          <span className="hidden sm:block text-[10px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full ml-1">
            Sandbox
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/factura"
            className="text-sm text-slate-400 hover:text-white transition-colors px-3 py-1.5 hidden sm:block"
          >
            Solicitar factura
          </Link>
          <Link
            to="/registro"
            className="text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg transition-colors"
          >
            Registrarse
          </Link>
        </div>
      </div>
    </nav>
  )
}

// ── Hero ──────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 pt-20 pb-24 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <span className="inline-block text-[11px] font-semibold tracking-widest uppercase text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-3 py-1 mb-8">
          CFDI 4.0 · Facturama PAC · AWS Lambda
        </span>
        <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight leading-tight mb-5">
          Tu PYME emite facturas
          <br />
          <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
            en menos de 3 segundos
          </span>
        </h1>
        <p className="text-lg text-slate-400 mb-3 max-w-xl mx-auto leading-relaxed">
          Un enlace público. Tu cliente llena 4 datos. El SAT timbra el CFDI.
          PDF y XML en su correo — sin que toques nada.
        </p>
        <p className="text-sm text-slate-500 mb-10">
          Para médicos, restaurantes, consultores y cualquier PYME que emita CFDI 4.0.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-5">
          <Link
            to="/registro"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm px-7 py-3.5 rounded-xl shadow-lg shadow-blue-900/40 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            Registrar mi empresa
            <ArrowRight size={15} />
          </Link>
          <Link
            to="/factura"
            className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-slate-200 font-semibold text-sm px-7 py-3.5 rounded-xl border border-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            Solicitar una factura
          </Link>
        </div>
        <p className="text-xs text-slate-600">
          Sin tarjeta de crédito · Entorno sandbox gratuito · CFDI firmado por Facturama
        </p>
      </div>
    </section>
  )
}

// ── Tech stack / proof ────────────────────────────────────────────────────────

function TechProof() {
  const stack = ['Facturama PAC', 'AWS Lambda', 'DynamoDB', 'SES v2', 'S3']
  return (
    <section className="bg-white border-b border-gray-100 py-5">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <p className="text-center text-xs font-medium text-gray-400 mb-4 uppercase tracking-widest">
          Construido sobre
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
          {stack.map((s) => (
            <span key={s} className="text-sm font-medium text-gray-500">{s}</span>
          ))}
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
    { icon: Mail, text: 'Mandar el PDF por correo o por WhatsApp a mano' },
  ]
  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 leading-snug">
            ¿Te siguen llegando datos de facturación por WhatsApp?
          </h2>
          <p className="text-gray-500 mb-6 leading-relaxed">
            Copiar el RFC a mano, llenar el CFDI en el sistema, exportar el XML, mandarlo
            por correo. Son 15 minutos que se repiten con cada cliente. Con FactuFastAI son 3 segundos.
          </p>
          <ul className="space-y-3">
            {pains.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-sm text-gray-600">
                <div className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon size={12} className="text-red-500" />
                </div>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-100 px-4 py-3 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-emerald-400" />
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
            <button className="w-full bg-blue-600 text-white text-sm font-semibold py-2.5 rounded-lg">Solicitar factura →</button>
            <p className="text-center text-xs text-emerald-600 font-medium flex items-center justify-center gap-1.5">
              <Check size={12} /> CFDI timbrado y enviado a tu correo
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
      icon: <Zap size={18} className="text-blue-600" />,
      title: 'Timbrado en < 3 s',
      desc: 'CFDI 4.0 válido ante el SAT, firmado por Facturama (PAC autorizado), en menos de 3 segundos.',
    },
    {
      icon: <ShieldCheck size={18} className="text-blue-600" />,
      title: 'CSD siempre cifrado',
      desc: 'Tu certificado digital vive en AWS. Nunca sale de servidores cifrados. Tu .key solo se valida al registrarte.',
    },
    {
      icon: <Mail size={18} className="text-blue-600" />,
      title: 'Resumen diario automático',
      desc: 'A las 6 PM recibes un correo con todas las facturas del día: cuántas se timbraron, cuántas fallaron.',
    },
  ]
  return (
    <section className="bg-white border-y border-gray-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">
          Todo lo que necesitas, nada que no necesitas
        </h2>
        <p className="text-sm text-gray-400 text-center mb-10">Sin instalaciones. Sin contratos. Sin curvas de aprendizaje.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {items.map(({ icon, title, desc }) => (
            <div key={title} className="bg-gray-50 rounded-xl border border-gray-200 p-6 flex flex-col gap-4">
              <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 shadow-sm flex items-center justify-center shrink-0">{icon}</div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
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
      n: 1,
      title: 'Regístrate con tu RFC y CSD',
      desc: 'Sube tu .cer y .key una sola vez. Tu certificado queda guardado en AWS de forma cifrada.',
      time: '2 minutos',
    },
    {
      n: 2,
      title: 'Comparte tu enlace público',
      desc: 'Cada PYME tiene un link único. Tus clientes entran sin crear cuenta y llenan 4 campos fiscales.',
      time: '30 segundos',
    },
    {
      n: 3,
      title: 'El CFDI llega solo',
      desc: 'El sistema timbra, guarda en S3 y manda PDF + XML al correo del cliente. Sin que toques nada.',
      time: '3 segundos',
    },
  ]
  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
      <div className="max-w-lg">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">¿Cómo funciona?</h2>
        <p className="text-sm text-gray-400 mb-10">Tres pasos. El primero lo haces una vez.</p>
        <div className="flex flex-col gap-8">
          {steps.map(({ n, title, desc, time }) => (
            <div key={n} className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center shrink-0 mt-0.5" aria-hidden="true">
                {n}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-semibold text-gray-900">{title}</p>
                  <span className="text-[10px] font-medium text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded-full">{time}</span>
                </div>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Why not alternatives ──────────────────────────────────────────────────────

function WhyUs() {
  const rows = [
    { label: 'CONTPAQI / CONTPAQi', cons: 'Instalación, licencia anual, curva de aprendizaje' },
    { label: 'Factura.com', cons: 'Interfaz compleja, exportación manual del XML' },
    { label: 'El contador lo hace', cons: 'Retrasos, costo por factura, intermediario' },
  ]
  return (
    <section className="bg-white border-y border-gray-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">¿Por qué no las alternativas?</h2>
        <p className="text-sm text-gray-400 mb-8">FactuFastAI está optimizado para PYMEs que no quieren aprender un ERP.</p>
        <div className="rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Alternativa</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">El problema</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 hidden sm:table-cell">FactuFastAI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.map(({ label, cons }) => (
                <tr key={label} className="hover:bg-gray-50">
                  <td className="px-5 py-4 font-medium text-gray-800 whitespace-nowrap">{label}</td>
                  <td className="px-5 py-4 text-gray-500">{cons}</td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                      <Check size={14} /> Link público · sin instalar nada
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-gray-400">* FactuFastAI es un MVP sandbox. No apto para producción — aún.</p>
      </div>
    </section>
  )
}

// ── CTA final ─────────────────────────────────────────────────────────────────

function CtaFinal() {
  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-indigo-600 rounded-2xl px-8 py-10 flex flex-col gap-4">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
            <Receipt size={20} className="text-white" />
          </div>
          <div>
            <p className="text-lg font-bold text-white mb-1">Soy una PYME</p>
            <p className="text-indigo-200 text-sm mb-5">Quiero registrarme y empezar a timbrar CFDIs para mis clientes.</p>
          </div>
          <Link
            to="/registro"
            className="self-start inline-flex items-center gap-2 bg-white text-indigo-700 hover:bg-gray-50 font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
          >
            Registrar mi empresa <ArrowRight size={14} />
          </Link>
        </div>
        <div className="bg-gray-900 rounded-2xl px-8 py-10 flex flex-col gap-4">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
            <FileText size={20} className="text-white" />
          </div>
          <div>
            <p className="text-lg font-bold text-white mb-1">Necesito una factura</p>
            <p className="text-gray-400 text-sm mb-5">Mi proveedor usa FactuFastAI y quiero solicitar mi CFDI electrónico.</p>
          </div>
          <Link
            to="/factura"
            className="self-start inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm px-5 py-2.5 rounded-lg border border-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            Solicitar mi factura <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
        <span>
          FactuFast<strong className="text-indigo-600">AI</strong> · MVP de aprendizaje AWS
        </span>
        <span>Facturama Sandbox · No usar en producción · CFDI 4.0</span>
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
        <TechProof />
        <Problem />
        <Features />
        <HowItWorks />
        <WhyUs />
        <CtaFinal />
      </main>
      <Footer />
    </div>
  )
}
