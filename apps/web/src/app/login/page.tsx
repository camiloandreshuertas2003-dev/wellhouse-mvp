'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })
      if (authError) throw authError
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión. Verifica tus credenciales.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
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
      {/* Left panel — branding (desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-ink-teal-900 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-accent-mango/20 blur-3xl pointer-events-none" aria-hidden="true"/>
        <div className="absolute -bottom-24 -left-24 w-[400px] h-[400px] rounded-full bg-ink-teal-500/30 blur-3xl pointer-events-none" aria-hidden="true"/>
        <div className="relative z-10">
          <div className="flex items-center gap-1">
            <span className="font-fraunces font-semibold text-3xl text-white">Well</span>
            <span className="font-fraunces font-semibold text-3xl text-accent-mango">house</span>
          </div>
        </div>
        <div className="relative z-10">
          <blockquote className="font-fraunces text-3xl text-white leading-snug mb-6">
            &ldquo;Hospedé a una familia de Cartagena y dos meses después yo estaba disfrutando de su finca en el Eje Cafetero.&rdquo;
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-radius-full bg-accent-mango-light flex items-center justify-center font-inter font-semibold text-accent-mango text-sm">MC</div>
            <div>
              <p className="font-inter font-semibold text-white text-sm">María Camila Torres</p>
              <p className="font-inter text-white/50 text-xs">Medellín · Miembro desde 2025</p>
            </div>
          </div>
        </div>
        <div className="relative z-10 flex gap-6">
          {[
            { value: '500+', label: 'Viviendas' },
            { value: '1.2K', label: 'Intercambios' },
            { value: '4.9★', label: 'Valoración' },
          ].map((s) => (
            <div key={s.label}>
              <div className="font-plex font-medium text-wellpoint-gold text-xl">{s.value}</div>
              <div className="font-inter text-white/50 text-xs">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-1 mb-8 lg:hidden">
            <span className="font-fraunces font-semibold text-2xl text-ink-teal-900">Well</span>
            <span className="font-fraunces font-semibold text-2xl text-accent-mango">house</span>
          </div>

          <h1 className="font-fraunces font-semibold text-3xl text-ink-teal-900 mb-1">Bienvenido de nuevo</h1>
          <p className="font-inter text-text-muted-custom text-base mb-8">Inicia sesión en tu cuenta Wellhouse</p>

          {error && (
            <div className="mb-5 p-3.5 bg-signal-red/10 border border-signal-red/20 text-signal-red rounded-radius-sm font-inter text-sm flex items-start gap-2" role="alert">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 flex-shrink-0" aria-hidden="true">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M8 5v3M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              {error}
            </div>
          )}

          {/* Google login */}
          <button
            id="google-login-btn"
            onClick={handleGoogleLogin}
            disabled={loading || googleLoading}
            className="w-full flex items-center justify-center gap-3 border border-surface-mist-dark bg-white text-ink-teal-900 font-inter font-medium text-sm py-3 rounded-radius-sm hover:bg-surface-mist hover:border-ink-teal-500 transition-all disabled:opacity-50 mb-5"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {googleLoading ? 'Conectando...' : 'Continuar con Google'}
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-surface-mist-dark"/>
            <span className="font-inter text-text-muted-custom text-xs">O con email</span>
            <div className="flex-1 h-px bg-surface-mist-dark"/>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="block font-inter font-medium text-sm text-ink-teal-700 mb-1.5">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-field"
                placeholder="tu@correo.com"
                required
                autoComplete="email"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="password" className="block font-inter font-medium text-sm text-ink-teal-700">
                  Contraseña
                </label>
                <Link href="/forgot-password" className="font-inter text-xs text-accent-mango hover:text-accent-mango-hover transition-colors">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-field pr-11"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted-custom hover:text-ink-teal-700 transition-colors"
                  aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPass ? (
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true"><path d="M1.5 9s2.5-5 7.5-5 7.5 5 7.5 5-2.5 5-7.5 5-7.5-5-7.5-5z"/><circle cx="9" cy="9" r="2.5"/><path d="M2 2l14 14" stroke="currentColor" strokeWidth="1.5"/></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true"><path d="M1.5 9s2.5-5 7.5-5 7.5 5 7.5 5-2.5 5-7.5 5-7.5-5-7.5-5z"/><circle cx="9" cy="9" r="2.5"/></svg>
                  )}
                </button>
              </div>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading || googleLoading}
              className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeDasharray="28" strokeDashoffset="10"/></svg>
                  Iniciando sesión…
                </span>
              ) : 'Iniciar sesión'}
            </button>
          </form>

          <p className="font-inter text-center text-text-muted-custom text-sm mt-6">
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="text-accent-mango font-medium hover:text-accent-mango-hover transition-colors">
              Regístrate gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
