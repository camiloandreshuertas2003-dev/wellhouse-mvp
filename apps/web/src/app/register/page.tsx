'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [showPass, setShowPass] = useState(false)
  const [agreed, setAgreed] = useState(false)

  const passwordStrength = (p: string) => {
    if (p.length === 0) return 0
    let score = 0
    if (p.length >= 8) score++
    if (/[A-Z]/.test(p)) score++
    if (/[0-9]/.test(p)) score++
    if (/[^A-Za-z0-9]/.test(p)) score++
    return score
  }
  const strength = passwordStrength(formData.password)
  const strengthLabels = ['', 'Débil', 'Regular', 'Buena', 'Fuerte']
  const strengthColors = ['', 'bg-signal-red', 'bg-wellpoint-gold', 'bg-signal-green', 'bg-signal-green']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agreed) { setError('Debes aceptar los términos y condiciones para continuar.'); return }
    setLoading(true)
    setError(null)
    setSuccessMsg(null)
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { data: { name: formData.name } },
      })
      if (authError) throw authError
      if (authData.user) {
        if (authData.session) {
          const { error: dbError } = await supabase.from('users').insert({
            id: authData.user.id,
            email: formData.email,
            name: formData.name,
            role: 'user',
            plan: 'free',
            status: 'active',
          })
          if (dbError) console.error('Database insert error:', dbError)
          router.push('/dashboard')
        } else {
          setSuccessMsg('¡Registro exitoso! Revisa tu correo para verificar tu cuenta antes de entrar.')
          setFormData({ name: '', email: '', password: '' })
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la cuenta')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleRegister = async () => {
    setGoogleLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      })
      if (error) throw error
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al conectar con Google')
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-base-paper flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-ink-teal-900 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-accent-mango/20 blur-3xl pointer-events-none" aria-hidden="true"/>
        <div className="absolute -bottom-24 -left-24 w-[400px] h-[400px] rounded-full bg-ink-teal-500/30 blur-3xl pointer-events-none" aria-hidden="true"/>
        <div className="relative z-10 flex items-center gap-1">
          <span className="font-fraunces font-semibold text-3xl text-white">Well</span>
          <span className="font-fraunces font-semibold text-3xl text-accent-mango">house</span>
        </div>
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="font-fraunces font-semibold text-4xl text-white leading-snug mb-4">
              Empieza a viajar<br/><span className="text-accent-mango">sin pagar</span><br/>alojamiento
            </h2>
            <p className="font-inter text-white/60 text-base leading-relaxed">
              Registrarte es gratis. Al publicar tu vivienda, recibes automáticamente <span className="text-wellpoint-gold font-semibold">+200 WellPoints</span> para tu primer intercambio.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: 'Gratis', label: 'Registro y publicación' },
              { value: '+200 WP', label: 'Al publicar tu vivienda' },
              { value: '< 5 min', label: 'Para completar el perfil' },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 rounded-radius-md p-4 text-center">
                <div className="font-plex font-medium text-wellpoint-gold text-lg mb-1">{s.value}</div>
                <div className="font-inter text-white/50 text-xs leading-tight">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-radius-full bg-signal-green/20 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="7" stroke="#1FAE6E" strokeWidth="1.5"/><path d="M5 8l2 2 4-4" stroke="#1FAE6E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <p className="font-inter text-white/60 text-sm">Verificación con cédula de ciudadanía</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-1 mb-8 lg:hidden">
            <span className="font-fraunces font-semibold text-2xl text-ink-teal-900">Well</span>
            <span className="font-fraunces font-semibold text-2xl text-accent-mango">house</span>
          </div>

          <h1 className="font-fraunces font-semibold text-3xl text-ink-teal-900 mb-1">Crea tu cuenta</h1>
          <p className="font-inter text-text-muted-custom text-base mb-8">Únete y comienza a intercambiar viviendas en Colombia</p>

          {error && (
            <div className="mb-5 p-3.5 bg-signal-red/10 border border-signal-red/20 text-signal-red rounded-radius-sm font-inter text-sm flex items-start gap-2" role="alert">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 flex-shrink-0" aria-hidden="true"><circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/><path d="M8 5v3M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              {error}
            </div>
          )}
          {successMsg && (
            <div className="mb-5 p-3.5 bg-signal-green/10 border border-signal-green/20 text-signal-green rounded-radius-sm font-inter text-sm flex items-start gap-2" role="status">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 flex-shrink-0" aria-hidden="true"><circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/><path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              {successMsg}
            </div>
          )}

          {/* Google */}
          <button
            id="google-register-btn"
            onClick={handleGoogleRegister}
            disabled={loading || googleLoading}
            className="w-full flex items-center justify-center gap-3 border border-surface-mist-dark bg-white text-ink-teal-900 font-inter font-medium text-sm py-3 rounded-radius-sm hover:bg-surface-mist hover:border-ink-teal-500 transition-all disabled:opacity-50 mb-5"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {googleLoading ? 'Conectando...' : 'Registrarse con Google'}
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-surface-mist-dark"/>
            <span className="font-inter text-text-muted-custom text-xs">O con email</span>
            <div className="flex-1 h-px bg-surface-mist-dark"/>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="name" className="block font-inter font-medium text-sm text-ink-teal-700 mb-1.5">Nombre completo</label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                placeholder="Tu nombre completo"
                autoComplete="name"
              />
            </div>
            <div>
              <label htmlFor="reg-email" className="block font-inter font-medium text-sm text-ink-teal-700 mb-1.5">Correo electrónico</label>
              <input
                id="reg-email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-field"
                placeholder="tu@correo.com"
                autoComplete="email"
              />
            </div>
            <div>
              <label htmlFor="reg-password" className="block font-inter font-medium text-sm text-ink-teal-700 mb-1.5">Contraseña</label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPass ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-field pr-11"
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted-custom hover:text-ink-teal-700 transition-colors"
                  aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                    {showPass
                      ? <><path d="M1.5 9s2.5-5 7.5-5 7.5 5 7.5 5-2.5 5-7.5 5-7.5-5-7.5-5z"/><circle cx="9" cy="9" r="2.5"/><path d="M2 2l14 14" strokeWidth="1.5"/></>
                      : <><path d="M1.5 9s2.5-5 7.5-5 7.5 5 7.5 5-2.5 5-7.5 5-7.5-5-7.5-5z"/><circle cx="9" cy="9" r="2.5"/></>
                    }
                  </svg>
                </button>
              </div>
              {formData.password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4].map((i) => (
                      <div key={i} className={`flex-1 h-1 rounded-full transition-all ${i <= strength ? strengthColors[strength] : 'bg-surface-mist-dark'}`}/>
                    ))}
                  </div>
                  <p className="font-inter text-xs text-text-muted-custom">{strengthLabels[strength]}</p>
                </div>
              )}
            </div>

            <div className="flex items-start gap-3 pt-1">
              <input
                id="terms"
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-accent-mango rounded cursor-pointer flex-shrink-0"
              />
              <label htmlFor="terms" className="font-inter text-sm text-text-muted-custom cursor-pointer leading-relaxed">
                Acepto los{' '}
                <Link href="/" className="text-accent-mango hover:text-accent-mango-hover transition-colors">Términos de uso</Link>
                {' '}y la{' '}
                <Link href="/" className="text-accent-mango hover:text-accent-mango-hover transition-colors">Política de privacidad</Link>
                {' '}de Wellhouse
              </label>
            </div>

            <button
              id="register-submit-btn"
              type="submit"
              disabled={loading || googleLoading || !agreed}
              className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeDasharray="28" strokeDashoffset="10"/></svg>
                  Creando cuenta…
                </span>
              ) : 'Crear cuenta gratis'}
            </button>
          </form>

          <p className="font-inter text-center text-text-muted-custom text-sm mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-accent-mango font-medium hover:text-accent-mango-hover transition-colors">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
