import { useState, type FormEvent, type FocusEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, FileText, MapPin, Building2, Mail } from 'lucide-react'
import { generarFactura } from '../services/api'
import { REGIMENES } from '../constants/regimenes'

interface Campos {
  rfc_receptor: string
  cp_receptor: string
  regimen_fiscal_receptor: string
  email_receptor: string
}

interface Errores {
  rfc_receptor?: string
  cp_receptor?: string
  regimen_fiscal_receptor?: string
  email_receptor?: string
}

function validarCampos(campos: Campos): Errores {
  const e: Errores = {}
  const rfc = campos.rfc_receptor.trim().toUpperCase()
  if (!rfc) {
    e.rfc_receptor = 'El RFC es obligatorio'
  } else if (!/^([A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3})$/.test(rfc)) {
    e.rfc_receptor = 'RFC inválido (ej: XAXX010101000)'
  }
  if (!campos.cp_receptor.trim()) {
    e.cp_receptor = 'El código postal es obligatorio'
  } else if (!/^\d{5}$/.test(campos.cp_receptor.trim())) {
    e.cp_receptor = 'Deben ser exactamente 5 dígitos'
  }
  if (!campos.regimen_fiscal_receptor) {
    e.regimen_fiscal_receptor = 'Selecciona un régimen fiscal'
  }
  const email = campos.email_receptor.trim()
  if (!email) {
    e.email_receptor = 'El correo es obligatorio'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    e.email_receptor = 'Correo inválido'
  }
  return e
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="mt-1.5 text-xs text-red-600">{msg}</p>
}

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  )
}

const inputBase =
  'w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-50 disabled:text-gray-500'
const inputError =
  'border-red-400 focus:border-red-500 focus:ring-red-500/20'

export function Formulario() {
  const navigate = useNavigate()
  const [campos, setCampos] = useState<Campos>({
    rfc_receptor: '',
    cp_receptor: '',
    regimen_fiscal_receptor: '',
    email_receptor: '',
  })
  const [errores, setErrores] = useState<Errores>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  function handleChange(field: keyof Campos, value: string) {
    setCampos((prev) => ({ ...prev, [field]: value }))
    if (touched[field]) {
      const e = validarCampos({ ...campos, [field]: value })
      setErrores((prev) => ({ ...prev, [field]: e[field] }))
    }
  }

  function handleBlur(e: FocusEvent<HTMLInputElement | HTMLSelectElement>) {
    const field = e.target.name as keyof Campos
    setTouched((prev) => ({ ...prev, [field]: true }))
    const e2 = validarCampos(campos)
    setErrores((prev) => ({ ...prev, [field]: e2[field] }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setTouched({ rfc_receptor: true, cp_receptor: true, regimen_fiscal_receptor: true, email_receptor: true })
    const e2 = validarCampos(campos)
    setErrores(e2)
    if (Object.keys(e2).length > 0) return

    setLoading(true)
    setApiError(null)
    try {
      const result = await generarFactura({
        rfc_receptor: campos.rfc_receptor.trim().toUpperCase(),
        cp_receptor: campos.cp_receptor.trim(),
        regimen_fiscal_receptor: campos.regimen_fiscal_receptor,
        email_receptor: campos.email_receptor.trim(),
      })
      navigate('/resultado', { state: result })
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Error al generar la factura')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="py-10 px-4">
      <div className="max-w-xl mx-auto">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
            Nueva factura
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Genera un CFDI 4.0 timbrado. El PDF y XML llegan al correo del receptor.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* Section 1: Receptor */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-4">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-blue-50 flex items-center justify-center shrink-0">
                <Building2 size={14} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Datos del receptor</p>
                <p className="text-xs text-gray-400">Información fiscal registrada ante el SAT</p>
              </div>
            </div>

            <div className="p-5 space-y-5">
              {/* RFC + CP row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label required>
                    <span className="flex items-center gap-1.5">
                      <FileText size={13} className="text-gray-400" />
                      RFC del receptor
                    </span>
                  </Label>
                  <input
                    name="rfc_receptor"
                    type="text"
                    value={campos.rfc_receptor}
                    onChange={(e) => handleChange('rfc_receptor', e.target.value)}
                    onBlur={handleBlur}
                    placeholder="XAXX010101000"
                    maxLength={13}
                    autoCapitalize="characters"
                    className={`${inputBase} font-mono tracking-wider ${errores.rfc_receptor && touched.rfc_receptor ? inputError : ''}`}
                    disabled={loading}
                  />
                  <FieldError msg={touched.rfc_receptor ? errores.rfc_receptor : undefined} />
                </div>

                <div>
                  <Label required>
                    <span className="flex items-center gap-1.5">
                      <MapPin size={13} className="text-gray-400" />
                      Código postal
                    </span>
                  </Label>
                  <input
                    name="cp_receptor"
                    type="text"
                    inputMode="numeric"
                    value={campos.cp_receptor}
                    onChange={(e) => handleChange('cp_receptor', e.target.value.replace(/\D/g, '').slice(0, 5))}
                    onBlur={handleBlur}
                    placeholder="06600"
                    maxLength={5}
                    className={`${inputBase} font-mono tracking-widest ${errores.cp_receptor && touched.cp_receptor ? inputError : ''}`}
                    disabled={loading}
                  />
                  <FieldError msg={touched.cp_receptor ? errores.cp_receptor : undefined} />
                </div>
              </div>

              {/* Régimen */}
              <div>
                <Label required>Régimen fiscal</Label>
                <select
                  name="regimen_fiscal_receptor"
                  value={campos.regimen_fiscal_receptor}
                  onChange={(e) => handleChange('regimen_fiscal_receptor', e.target.value)}
                  onBlur={handleBlur}
                  className={`${inputBase} cursor-pointer ${errores.regimen_fiscal_receptor && touched.regimen_fiscal_receptor ? inputError : ''}`}
                  disabled={loading}
                >
                  <option value="">Selecciona un régimen…</option>
                  {REGIMENES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
                <FieldError msg={touched.regimen_fiscal_receptor ? errores.regimen_fiscal_receptor : undefined} />
              </div>
            </div>
          </div>

          {/* Section 2: Entrega */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-blue-50 flex items-center justify-center shrink-0">
                <Mail size={14} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Entrega</p>
                <p className="text-xs text-gray-400">El PDF y XML se envían a este correo</p>
              </div>
            </div>

            <div className="p-5">
              <Label required>Correo del receptor</Label>
              <input
                name="email_receptor"
                type="email"
                value={campos.email_receptor}
                onChange={(e) => handleChange('email_receptor', e.target.value)}
                onBlur={handleBlur}
                placeholder="receptor@empresa.com"
                className={`${inputBase} ${errores.email_receptor && touched.email_receptor ? inputError : ''}`}
                disabled={loading}
              />
              <FieldError msg={touched.email_receptor ? errores.email_receptor : undefined} />
              <p className="mt-2 text-xs text-gray-400">
                Asegúrate de que el correo esté verificado en SES (modo sandbox).
              </p>
            </div>
          </div>

          {/* API error */}
          {apiError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {apiError}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Generando factura…
              </>
            ) : (
              'Generar factura'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
