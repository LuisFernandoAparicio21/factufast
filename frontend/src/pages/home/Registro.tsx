import {
  useState,
  useRef,
  type FormEvent,
  type FocusEvent,
  type ChangeEvent,
} from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Loader2,
  Eye,
  EyeOff,
  CheckCircle2,
  Building2,
  Lock,
  Mail,
  Upload,
} from 'lucide-react'
import { Header } from '../../components/layout/Header'
import { REGIMENES } from '../../constants/regimenes'

// ── Types ────────────────────────────────────────────────────────────────────

interface FormCampos {
  rfc: string
  razonSocial: string
  regimenFiscal: string
  codigoPostal: string
  cerFile: File | null
  keyFile: File | null
  csdPassword: string
  email: string
}

interface FormErrores {
  rfc?: string
  razonSocial?: string
  regimenFiscal?: string
  codigoPostal?: string
  cerFile?: string
  keyFile?: string
  csdPassword?: string
  email?: string
}

type TouchedFields = Partial<Record<keyof FormCampos, boolean>>

// ── Validation ───────────────────────────────────────────────────────────────

function validarCampos(campos: FormCampos): FormErrores {
  const e: FormErrores = {}
  const rfc = campos.rfc.trim().toUpperCase()
  if (!rfc) {
    e.rfc = 'El RFC es obligatorio'
  } else if (!/^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/.test(rfc)) {
    e.rfc = 'RFC inválido (12–13 caracteres alfanuméricos)'
  }
  if (!campos.razonSocial.trim()) e.razonSocial = 'La razón social es obligatoria'
  if (!campos.regimenFiscal) e.regimenFiscal = 'Selecciona un régimen fiscal'
  const cp = campos.codigoPostal.trim()
  if (!cp) e.codigoPostal = 'El código postal es obligatorio'
  else if (!/^\d{5}$/.test(cp)) e.codigoPostal = 'Deben ser exactamente 5 dígitos'
  if (!campos.cerFile) e.cerFile = 'Selecciona el archivo .cer'
  if (!campos.keyFile) e.keyFile = 'Selecciona el archivo .key'
  if (!campos.csdPassword) e.csdPassword = 'La contraseña del CSD es obligatoria'
  const email = campos.email.trim()
  if (!email) e.email = 'El correo es obligatorio'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Correo inválido'
  return e
}

// ── Shared UI primitives ─────────────────────────────────────────────────────

const inputBase =
  'w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-50 disabled:text-gray-500'
const inputError = 'border-red-400 focus:border-red-500 focus:ring-red-500/20'

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p role="alert" className="mt-1.5 text-xs text-red-600">{msg}</p>
}

function Label({ children, required, htmlFor }: { children: React.ReactNode; required?: boolean; htmlFor: string }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1.5">
      {children}
      {required && <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>}
    </label>
  )
}

function SectionHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-md bg-blue-50 flex items-center justify-center shrink-0">{icon}</div>
      <div>
        <p className="text-sm font-medium text-gray-900">{title}</p>
        {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
      </div>
    </div>
  )
}

// ── File field ────────────────────────────────────────────────────────────────

interface FileFieldProps {
  id: string
  label: string
  accept: string
  file: File | null
  error?: string
  touched: boolean
  disabled: boolean
  onChange: (file: File | null) => void
  onBlur: () => void
}

function FileField({ id, label, accept, file, error, touched, disabled, onChange, onBlur }: FileFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  function handleChange(e: ChangeEvent<HTMLInputElement>) { onChange(e.target.files?.[0] ?? null) }
  return (
    <div>
      <Label required htmlFor={id}>{label}</Label>
      <div className={`flex items-center gap-2.5 rounded-lg border px-3.5 py-2.5 bg-white shadow-sm transition-colors ${
        touched && error ? 'border-red-400' : 'border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20'
      } ${disabled ? 'opacity-60' : ''}`}>
        <button
          type="button" disabled={disabled} onClick={() => inputRef.current?.click()}
          className="shrink-0 inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 focus:outline-none focus:underline disabled:cursor-not-allowed"
          aria-label={`Seleccionar archivo ${label}`}
        >
          <Upload size={13} /> Elegir
        </button>
        <span className="text-sm text-gray-500 truncate flex-1">{file ? file.name : 'Sin archivo seleccionado'}</span>
        <input ref={inputRef} id={id} type="file" accept={accept} className="sr-only" disabled={disabled} onChange={handleChange} onBlur={onBlur} />
      </div>
      <FieldError msg={touched ? error : undefined} />
    </div>
  )
}

// ── Success screen ────────────────────────────────────────────────────────────

function SuccessScreen({ email }: { email: string }) {
  return (
    <div className="py-10 px-4">
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-10 text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={28} className="text-emerald-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">¡Cuenta creada!</h2>
          <p className="text-sm text-gray-500 mb-8 max-w-sm mx-auto">
            En breve recibirás un email de confirmación en{' '}
            <span className="font-medium text-gray-700">{email}</span>.
          </p>
          <Link to="/pyme/dashboard" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-3 rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            Ir al portal
          </Link>
        </div>
      </div>
    </div>
  )
}

// ── Form section components ───────────────────────────────────────────────────

interface EmpresaProps {
  campos: FormCampos
  errores: FormErrores
  touched: TouchedFields
  loading: boolean
  updateField: <K extends keyof FormCampos>(field: K, value: FormCampos[K]) => void
  handleTextBlur: (e: FocusEvent<HTMLInputElement | HTMLSelectElement>) => void
}

function EmpresaSection({ campos, errores, touched, loading, updateField, handleTextBlur }: EmpresaProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-4">
      <SectionHeader icon={<Building2 size={14} className="text-blue-600" />} title="Tu empresa" subtitle="Datos fiscales registrados ante el SAT" />
      <div className="p-5 space-y-5">
        <div>
          <Label required htmlFor="rfc">RFC emisor</Label>
          <input id="rfc" name="rfc" type="text" value={campos.rfc}
            onChange={(e) => updateField('rfc', e.target.value.toUpperCase())}
            onBlur={handleTextBlur} placeholder="EKU9003173C9" maxLength={13}
            autoCapitalize="characters" disabled={loading}
            className={`${inputBase} font-mono tracking-wider ${touched.rfc && errores.rfc ? inputError : ''}`}
          />
          <FieldError msg={touched.rfc ? errores.rfc : undefined} />
        </div>
        <div>
          <Label required htmlFor="razonSocial">Nombre / Razón social</Label>
          <input id="razonSocial" name="razonSocial" type="text" value={campos.razonSocial}
            onChange={(e) => updateField('razonSocial', e.target.value)}
            onBlur={handleTextBlur} placeholder="Mi Empresa SA de CV" disabled={loading}
            className={`${inputBase} ${touched.razonSocial && errores.razonSocial ? inputError : ''}`}
          />
          <FieldError msg={touched.razonSocial ? errores.razonSocial : undefined} />
        </div>
        <div>
          <Label required htmlFor="regimenFiscal">Régimen fiscal</Label>
          <select id="regimenFiscal" name="regimenFiscal" value={campos.regimenFiscal}
            onChange={(e) => updateField('regimenFiscal', e.target.value)}
            onBlur={handleTextBlur} disabled={loading}
            className={`${inputBase} cursor-pointer ${touched.regimenFiscal && errores.regimenFiscal ? inputError : ''}`}
          >
            <option value="">Selecciona un régimen…</option>
            {REGIMENES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          <FieldError msg={touched.regimenFiscal ? errores.regimenFiscal : undefined} />
        </div>
        <div>
          <Label required htmlFor="codigoPostal">Código postal</Label>
          <input id="codigoPostal" name="codigoPostal" type="text" inputMode="numeric"
            value={campos.codigoPostal}
            onChange={(e) => updateField('codigoPostal', e.target.value.replace(/\D/g, '').slice(0, 5))}
            onBlur={handleTextBlur} placeholder="06600" maxLength={5} disabled={loading}
            className={`${inputBase} font-mono tracking-widest ${touched.codigoPostal && errores.codigoPostal ? inputError : ''}`}
          />
          <FieldError msg={touched.codigoPostal ? errores.codigoPostal : undefined} />
        </div>
      </div>
    </div>
  )
}

interface CsdProps {
  campos: FormCampos
  errores: FormErrores
  touched: TouchedFields
  loading: boolean
  showPassword: boolean
  updateField: <K extends keyof FormCampos>(field: K, value: FormCampos[K]) => void
  handleTextBlur: (e: FocusEvent<HTMLInputElement | HTMLSelectElement>) => void
  handleFileBlur: (field: keyof FormCampos) => void
  setShowPassword: (v: boolean | ((prev: boolean) => boolean)) => void
}

function CsdSection({ campos, errores, touched, loading, showPassword, updateField, handleTextBlur, handleFileBlur, setShowPassword }: CsdProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-4">
      <SectionHeader icon={<Lock size={14} className="text-blue-600" />} title="Certificado Digital (CSD)" subtitle="Necesario para timbrar bajo tu RFC" />
      <div className="p-5 space-y-5">
        <FileField id="cerFile" label="Archivo .cer" accept=".cer" file={campos.cerFile}
          error={errores.cerFile} touched={!!touched.cerFile} disabled={loading}
          onChange={(file) => updateField('cerFile', file)} onBlur={() => handleFileBlur('cerFile')} />
        <FileField id="keyFile" label="Archivo .key" accept=".key" file={campos.keyFile}
          error={errores.keyFile} touched={!!touched.keyFile} disabled={loading}
          onChange={(file) => updateField('keyFile', file)} onBlur={() => handleFileBlur('keyFile')} />
        <div>
          <Label required htmlFor="csdPassword">Contraseña del CSD</Label>
          <div className="relative">
            <input id="csdPassword" name="csdPassword" type={showPassword ? 'text' : 'password'}
              value={campos.csdPassword} onChange={(e) => updateField('csdPassword', e.target.value)}
              onBlur={handleTextBlur} placeholder="••••••••" disabled={loading}
              className={`${inputBase} pr-10 ${touched.csdPassword && errores.csdPassword ? inputError : ''}`}
            />
            <button type="button" onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-700"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          <FieldError msg={touched.csdPassword ? errores.csdPassword : undefined} />
        </div>
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-800 leading-relaxed">
          Tu archivo .key nunca se almacena. Se usa solo para validar tu CSD en el momento del registro.
        </div>
      </div>
    </div>
  )
}

interface ContactoProps {
  campos: FormCampos
  errores: FormErrores
  touched: TouchedFields
  loading: boolean
  updateField: <K extends keyof FormCampos>(field: K, value: FormCampos[K]) => void
  handleTextBlur: (e: FocusEvent<HTMLInputElement | HTMLSelectElement>) => void
}

function ContactoSection({ campos, errores, touched, loading, updateField, handleTextBlur }: ContactoProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
      <SectionHeader icon={<Mail size={14} className="text-blue-600" />} title="Contacto" subtitle="Para recibir el resumen diario de facturas" />
      <div className="p-5">
        <Label required htmlFor="email">Email para resumen diario</Label>
        <input id="email" name="email" type="email" value={campos.email}
          onChange={(e) => updateField('email', e.target.value)}
          onBlur={handleTextBlur} placeholder="admin@miempresa.com" disabled={loading}
          className={`${inputBase} ${touched.email && errores.email ? inputError : ''}`}
        />
        <FieldError msg={touched.email ? errores.email : undefined} />
      </div>
    </div>
  )
}

// ── Form state hook ───────────────────────────────────────────────────────────

const EMPTY_CAMPOS: FormCampos = {
  rfc: '', razonSocial: '', regimenFiscal: '', codigoPostal: '',
  cerFile: null, keyFile: null, csdPassword: '', email: '',
}

function useRegistroForm() {
  const [campos, setCampos] = useState<FormCampos>(EMPTY_CAMPOS)
  const [errores, setErrores] = useState<FormErrores>({})
  const [touched, setTouched] = useState<TouchedFields>({})
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  function updateField<K extends keyof FormCampos>(field: K, value: FormCampos[K]) {
    const next = { ...campos, [field]: value }
    setCampos(next)
    if (touched[field]) {
      const fieldErrors = validarCampos(next)
      setErrores((prev) => ({ ...prev, [field]: fieldErrors[field] }))
    }
  }

  function handleTextBlur(e: FocusEvent<HTMLInputElement | HTMLSelectElement>) {
    const field = e.target.name as keyof FormCampos
    setTouched((prev) => ({ ...prev, [field]: true }))
    const fieldErrors = validarCampos(campos)
    setErrores((prev) => ({ ...prev, [field]: fieldErrors[field] }))
  }

  function handleFileBlur(field: keyof FormCampos) {
    setTouched((prev) => ({ ...prev, [field]: true }))
    const fieldErrors = validarCampos(campos)
    setErrores((prev) => ({ ...prev, [field]: fieldErrors[field] }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const allTouched = Object.fromEntries(Object.keys(EMPTY_CAMPOS).map((k) => [k, true])) as TouchedFields
    setTouched(allTouched)
    const fieldErrors = validarCampos(campos)
    setErrores(fieldErrors)
    if (Object.keys(fieldErrors).length > 0) return
    setLoading(true)
    await new Promise<void>((resolve) => setTimeout(resolve, 1500))
    setLoading(false)
    setSubmitted(true)
  }

  return { campos, errores, touched, loading, showPassword, submitted, updateField, handleTextBlur, handleFileBlur, handleSubmit, setShowPassword }
}

// ── Main component ────────────────────────────────────────────────────────────

export function RegistroPyme() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const form = useRegistroForm()

  if (form.submitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header variant="default" />
        <main><SuccessScreen email={form.campos.email} /></main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header variant="default" />
      <main className="py-10 px-4">
        <div className="max-w-xl mx-auto">
          {token && (
            <div role="status" className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Fuiste invitado por FactuFastAI. Tu RFC está pre-verificado.
            </div>
          )}
          <div className="mb-7">
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Crear cuenta</h1>
            <p className="mt-1 text-sm text-gray-500">Registra tu empresa para empezar a timbrar CFDIs al instante.</p>
          </div>
          <form onSubmit={form.handleSubmit} noValidate>
            <EmpresaSection campos={form.campos} errores={form.errores} touched={form.touched} loading={form.loading} updateField={form.updateField} handleTextBlur={form.handleTextBlur} />
            <CsdSection campos={form.campos} errores={form.errores} touched={form.touched} loading={form.loading} showPassword={form.showPassword} updateField={form.updateField} handleTextBlur={form.handleTextBlur} handleFileBlur={form.handleFileBlur} setShowPassword={form.setShowPassword} />
            <ContactoSection campos={form.campos} errores={form.errores} touched={form.touched} loading={form.loading} updateField={form.updateField} handleTextBlur={form.handleTextBlur} />
            <button type="submit" disabled={form.loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {form.loading ? <><Loader2 size={16} className="animate-spin" aria-hidden="true" />Creando cuenta…</> : 'Crear cuenta'}
            </button>
            <p className="mt-5 text-center text-sm text-gray-500">
              ¿Ya tienes cuenta?{' '}
              <Link to="/pyme/dashboard" className="font-medium text-blue-600 hover:text-blue-700">Acceder al portal →</Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  )
}
