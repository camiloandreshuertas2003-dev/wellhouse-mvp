'use client'

import Link from 'next/link'
import { useState, useEffect, memo } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'

// ── Bottom tab bar nav items (Módulo 7 mobile navigation) ─────────────────────
const BOTTOM_NAV = [
  {
    href: '/search',
    label: 'Explorar',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round">
        <circle cx="10" cy="10" r="7"/>
        <path d="M19 19l-4-4"/>
      </svg>
    ),
  },
  {
    href: '/messages',
    label: 'Mensajes',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 2H2v15l4-4h14V2z"/>
      </svg>
    ),
  },
  {
    href: '/dashboard',
    label: 'Perfil',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="7" r="4"/>
        <path d="M2 20c0-4.4 4-8 9-8s9 3.6 9 8"/>
      </svg>
    ),
  },
]

const Navbar = memo(function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [session, setSession] = useState<any>(null)
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
    supabase.auth.getSession().then(({ data: { session: s } }) => setSession(s))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setIsOpen(false)
    router.push('/search')
  }

  const navLinkClass = (href: string) =>
    `font-inter font-medium text-sm transition-colors ${
      pathname === href
        ? 'text-ink-teal-900'
        : 'text-text-muted-custom hover:text-ink-teal-900'
    }`

  return (
    <>
      {/* ── Desktop Navbar ─────────────────────────────────────────────── */}
      <nav className="bg-white border-b border-surface-mist-dark sticky top-0 z-50" role="navigation" aria-label="Navegación principal">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <Link href="/search" className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-teal-500 rounded">
              <span className="font-fraunces font-semibold text-2xl text-ink-teal-900 tracking-tight">Well</span>
              <span className="font-fraunces font-semibold text-2xl text-accent-mango tracking-tight">house</span>
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-7">
              <Link href="/search" className={navLinkClass('/search')}>Explorar</Link>
              <Link href="/how-it-works" className={navLinkClass('/how-it-works')}>Cómo funciona</Link>

              {hasMounted && (
                <>
                  {session ? (
                    <>
                      <Link href="/dashboard" className={navLinkClass('/dashboard')}>Dashboard</Link>
                      <Link href="/messages" className={navLinkClass('/messages')}>Mensajes</Link>
                      <button
                        onClick={handleLogout}
                        className="font-inter font-medium text-sm text-signal-red hover:opacity-80 transition-opacity"
                      >
                        Salir
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" className={navLinkClass('/login')}>Iniciar sesión</Link>
                      <Link
                        href="/register"
                        className="bg-accent-mango text-white px-5 py-2.5 rounded-radius-sm font-inter font-medium text-sm hover:bg-accent-mango-hover transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-mango"
                      >
                        Registrarse
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-radius-sm text-ink-teal-700 hover:bg-surface-mist transition-colors"
              aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={isOpen}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                {isOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12"/>
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16"/>
                }
              </svg>
            </button>
          </div>

          {/* Mobile menu dropdown */}
          {isOpen && (
            <div className="md:hidden py-4 space-y-3 border-t border-surface-mist" role="navigation" aria-label="Menú móvil">
              <Link href="/search" className="block font-inter text-sm font-medium text-ink-teal-700 hover:text-ink-teal-900 py-2" onClick={() => setIsOpen(false)}>Explorar viviendas</Link>
              <Link href="/how-it-works" className="block font-inter text-sm font-medium text-[#4a6b5e] hover:text-ink-teal-900 py-2" onClick={() => setIsOpen(false)}>Cómo funciona</Link>
              {hasMounted && (
                <>
                  {session ? (
                    <>
                      <Link href="/dashboard" className="block font-inter text-sm font-semibold text-ink-teal-900 py-2" onClick={() => setIsOpen(false)}>Dashboard</Link>
                      <button onClick={handleLogout} className="block w-full text-left font-inter text-sm font-medium text-signal-red py-2">Cerrar sesión</button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" className="block font-inter text-sm font-medium text-[#4a6b5e] py-2" onClick={() => setIsOpen(false)}>Iniciar sesión</Link>
                      <Link href="/register" className="block bg-accent-mango text-white px-4 py-3 rounded-radius-sm font-inter font-medium text-sm text-center hover:bg-accent-mango-hover transition-colors" onClick={() => setIsOpen(false)}>Registrarse</Link>
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* ── Mobile Bottom Tab Bar (Módulo 7) ──────────────────────────── */}
      {hasMounted && session && pathname !== '/dashboard' && (
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-surface-mist-dark safe-area-inset-bottom"
          role="navigation"
          aria-label="Navegación móvil"
        >
          <div className="flex">
            {BOTTOM_NAV.map(({ href, label, icon }) => {
              const isActive = pathname === href || pathname.startsWith(href + '/')
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 min-h-[56px] transition-colors ${
                    isActive ? 'text-ink-teal-900' : 'text-text-muted-custom'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {icon(isActive)}
                  <span className={`font-inter text-[10px] font-medium ${isActive ? 'text-ink-teal-900' : 'text-text-muted-custom'}`}>
                    {label}
                  </span>
                </Link>
              )
            })}
          </div>
        </nav>
      )}
    </>
  )
})

export default Navbar
