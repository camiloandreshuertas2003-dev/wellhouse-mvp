'use client'

import Link from 'next/link'
import { useState, useEffect, memo, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { 
  Bell, Compass, Home, Plus, MessageCircle, User, MoreHorizontal,
  Trophy, Sparkles, Heart, Star, Video, Settings, ShieldAlert, X, HelpCircle, Bot, Search
} from 'lucide-react'
import NotificationsDropdown from './notifications/NotificationsDropdown'
import { useNotifications } from './notifications/NotificationsProvider'
import WellBotPanel from './WellBot/WellBotPanel'

const NavbarContent = memo(function NavbarContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [session, setSession] = useState<any>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [hasMounted, setHasMounted] = useState(false)

  // Modals state
  const [moreOpen, setMoreOpen] = useState(false)
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [checkingPublish, setCheckingPublish] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showWellBot, setShowWellBot] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [unreadMessagesCount, setUnreadMessagesCount] = useState<number>(0)
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()

  useEffect(() => {
    if (!session?.user?.id) {
      setUnreadMessagesCount(0)
      return
    }

    const userId = session.user.id

    const fetchUnreadMessages = async () => {
      try {
        const { data: convs } = await supabase
          .from('conversations')
          .select('id')
          .or(`participant_a.eq.${userId},participant_b.eq.${userId}`)

        if (convs && convs.length > 0) {
          const convIds = convs.map(c => c.id)
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .in('conversation_id', convIds)
            .neq('sender_id', userId)
            .is('read_at', null)

          setUnreadMessagesCount(count || 0)
        } else {
          setUnreadMessagesCount(0)
        }
      } catch (err) {
        console.error('Error fetching unread messages count:', err)
      }
    }

    fetchUnreadMessages()

    const channel = supabase
      .channel('navbar-unread-messages')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        () => {
          fetchUnreadMessages()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [session, pathname])

  useEffect(() => {
    setHasMounted(true)
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      if (s?.user?.id) fetchUserData(s.user.id)
    })
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s)
      if (s?.user?.id) {
        fetchUserData(s.user.id)
      } else {
        setAvatarUrl(null)
        setRole(null)
      }
    })

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      subscription.unsubscribe()
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])


  const fetchUserData = async (userId: string) => {
    const { data } = await (supabase as any).from('users').select('avatar_url, role').eq('id', userId).single()
    if (data) {
      if (data.avatar_url) setAvatarUrl(data.avatar_url)
      if (data.role) setRole(data.role)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/search')
  }

  const handlePublishClick = async () => {
    if (!session) {
      router.push('/login')
      return
    }
    setCheckingPublish(true)
    try {
      // Check if user already has a property
      const { data: prop, error } = await supabase
        .from('properties')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle()

      if (prop) {
        // User already has a property, redirect to stories tab
        router.push('/dashboard?tab=stories')
      } else {
        // Offer choice
        setShowPublishModal(true)
      }
    } catch (err) {
      console.error(err)
      router.push('/properties/create')
    } finally {
      setCheckingPublish(false)
    }
  }

  const navLinkClass = (href: string) =>
    `font-inter font-medium text-sm transition-colors ${
      pathname === href
        ? 'text-[#0f766e]'
        : 'text-[#6b7280] hover:text-[#0f766e]'
    }`


  if (!hasMounted) return null

  return (
    <>
      {/* ── Desktop Navbar ─────────────────────────────────────────────── */}
      <nav className={`hidden md:block bg-white border-b border-surface-mist-dark sticky top-0 z-50 transition-all duration-300 ease-in-out ${isScrolled ? 'shadow-md' : 'shadow-sm'}`} role="navigation" aria-label="Navegación principal">
        <div className="max-w-[1380px] mx-auto px-6 lg:px-8">
          <div className={`flex items-center transition-all duration-300 ease-in-out ${isScrolled ? 'h-16' : 'h-20'}`}>

            {/* Logo - Left */}
            <div className="flex-1 flex justify-start">
            <Link href="/search" className="focus:outline-none rounded">
              <span className={`font-fraunces font-bold text-ink-teal-900 tracking-tight transition-all duration-300 ${isScrolled ? 'text-xl' : 'text-2xl'}`}>Wellhouse</span>
            </Link>

            </div>

            {/* Desktop Links / Mega-Search - Center */}
            <div className="flex items-center justify-center h-full relative flex-1 min-w-[300px]">
              {isScrolled ? (
                <div className="w-full max-w-sm animate-in fade-in zoom-in duration-300">
                  <Link href="/search" className="flex items-center gap-3 bg-gray-50 border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all rounded-full px-4 py-2 w-full">
                    <Search className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500 font-medium flex-1 text-left">¿A dónde vas?</span>
                    <div className="w-7 h-7 bg-[#0f766e] rounded-full flex items-center justify-center">
                      <Search className="w-3.5 h-3.5 text-white" />
                    </div>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-10 lg:gap-14 h-full animate-in fade-in duration-300">
                  <Link href="/search" className="flex flex-col items-center justify-center gap-1 group relative h-full pt-1">
                    <div className={`w-8 h-8 transition-transform group-hover:scale-110 ${pathname === '/search' ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
                      <img src="/images/nav_icons/explorar.png" alt="Explorar" className="w-full h-full object-contain" />
                    </div>
                    <span className={`font-inter text-xs font-semibold transition-colors ${pathname === '/search' ? 'text-ink-teal-900' : 'text-gray-500 group-hover:text-ink-teal-900'}`}>
                      Explorar
                    </span>
                    {pathname === '/search' && <div className="absolute -bottom-[22px] left-0 right-0 h-[3px] bg-ink-teal-900 rounded-t-full" />}
                  </Link>
                  
                  <Link href="/how-it-works" className="flex flex-col items-center justify-center gap-1 group relative h-full pt-1">
                    <div className={`w-8 h-8 transition-transform group-hover:scale-110 ${pathname === '/how-it-works' ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
                      <img src="/images/nav_icons/como_funciona.png" alt="Cómo funciona" className="w-full h-full object-contain" />
                    </div>
                    <span className={`font-inter text-xs font-semibold transition-colors ${pathname === '/how-it-works' ? 'text-ink-teal-900' : 'text-gray-500 group-hover:text-ink-teal-900'}`}>
                      Cómo funciona
                    </span>
                    {pathname === '/how-it-works' && <div className="absolute -bottom-[22px] left-0 right-0 h-[3px] bg-ink-teal-900 rounded-t-full" />}
                  </Link>

                  {session && (
                    <>
                      <Link href="/dashboard" className="flex flex-col items-center justify-center gap-1 group relative h-full pt-1">
                        <div className={`w-8 h-8 transition-transform group-hover:scale-110 ${pathname === '/dashboard' ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
                          <img src="/images/nav_icons/mi_espacio.png" alt="Mi espacio" className="w-full h-full object-contain" />
                        </div>
                        <span className={`font-inter text-xs font-semibold transition-colors ${pathname === '/dashboard' ? 'text-ink-teal-900' : 'text-gray-500 group-hover:text-ink-teal-900'}`}>
                          Mi espacio
                        </span>
                        {pathname === '/dashboard' && <div className="absolute -bottom-[22px] left-0 right-0 h-[3px] bg-ink-teal-900 rounded-t-full" />}
                      </Link>

                      <Link href="/messages" className="flex flex-col items-center justify-center gap-1 group relative h-full pt-1">
                        <div className="relative">
                          <div className={`w-8 h-8 transition-transform group-hover:scale-110 ${pathname === '/messages' ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
                            <img src="/images/nav_icons/mensajes.png" alt="Mensajes" className="w-full h-full object-contain" />
                          </div>
                          {unreadMessagesCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[9px] font-extrabold w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white shadow-sm">
                              {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                            </span>
                          )}
                        </div>
                        <span className={`font-inter text-xs font-semibold transition-colors ${pathname === '/messages' ? 'text-ink-teal-900' : 'text-gray-500 group-hover:text-ink-teal-900'}`}>
                          Mensajes
                        </span>
                        {pathname === '/messages' && <div className="absolute -bottom-[22px] left-0 right-0 h-[3px] bg-ink-teal-900 rounded-t-full" />}
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Desktop Right - Actions */}
            <div className="flex-1 flex items-center justify-end gap-3 lg:gap-5">
              {session ? (
                <>
                  {role === 'ADMIN' && (
                    <Link href="/admin" className="hidden lg:inline-flex font-inter font-bold text-sm text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-100 transition-colors">
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="hidden lg:inline-flex font-inter font-medium text-sm text-signal-red hover:opacity-80 transition-opacity"
                  >
                    Salir
                  </button>
                  {/* WellBot button — Desktop */}
                  <div className="relative">
                    <button
                      onClick={() => setShowWellBot(!showWellBot)}
                      className="p-2 text-ink-teal-900 relative hover:bg-surface-mist rounded-full transition-colors flex items-center justify-center"
                      title="WellBot — Asistente IA"
                    >
                      <Bot className="w-5 h-5" />
                    </button>
                    {showWellBot && (
                      <div className="absolute right-0 top-full mt-2 z-50 w-[380px] h-[500px] max-h-[80vh] bg-white rounded-2xl shadow-xl border border-surface-mist-dark overflow-hidden flex flex-col">
                        <WellBotPanel onClose={() => setShowWellBot(false)} />
                      </div>
                    )}
                  </div>

                  {/* Desktop Notification Bell */}
                  <div className="relative">
                    <button
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="p-2 text-ink-teal-900 relative hover:bg-surface-mist rounded-full transition-colors flex items-center justify-center"
                      title="Notificaciones"
                    >
                      <Bell className="w-5 h-5" />
                      {unreadCount > 0 && (
                        unreadCount > 99 ? (
                          <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
                        ) : (
                          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">
                            {unreadCount}
                          </span>
                        )
                      )}
                    </button>
                    {showNotifications && (
                      <div className="absolute right-0 top-full mt-2">
                        <NotificationsDropdown onClose={() => setShowNotifications(false)} />
                      </div>
                    )}
                  </div>

                  {/* Profile Dropdown */}
                  <div className="relative">
                    <button 
                      onClick={() => setProfileMenuOpen(!profileMenuOpen)} 
                      className="w-8 h-8 rounded-full overflow-hidden border border-surface-mist-dark bg-gray-100 flex items-center justify-center transition-transform hover:scale-105" 
                      title="Menú de perfil"
                    >
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Perfil" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    
                    {profileMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setProfileMenuOpen(false)}></div>
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-surface-mist-dark shadow-xl rounded-xl py-1 z-50 overflow-hidden">
                          <Link href="/dashboard?tab=settings" onClick={() => setProfileMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-ink-teal-900 hover:bg-gray-50 transition-colors">
                            <Settings className="w-4 h-4" />
                            Ajustes
                          </Link>
                          {role === 'ADMIN' && (
                            <Link href="/admin" onClick={() => setProfileMenuOpen(false)} className="lg:hidden flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors">
                              <ShieldAlert className="w-4 h-4" />
                              Admin
                            </Link>
                          )}
                          <button
                            onClick={() => { setProfileMenuOpen(false); handleLogout() }}
                            className="lg:hidden w-full flex items-center gap-2 text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
                          >
                            <X className="w-4 h-4" />
                            Salir
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link href="/login" className={navLinkClass('/login')}>Iniciar sesión</Link>
                  <Link
                    href="/register"
                    className="bg-[#0f766e] text-white px-5 py-2.5 rounded-xl font-inter font-medium text-sm hover:bg-[#0d635c] transition-colors"
                  >
                    Registrarse
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ── Mobile Header Navbar (Mockup style) ──────────────────────────── */}
      <nav className="md:hidden bg-white border-b border-surface-mist-dark sticky top-0 z-50 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex flex-col">
          <Link href="/search" className="focus:outline-none">
            <span className="font-fraunces font-bold text-xl text-ink-teal-900 tracking-tight">Wellhouse</span>
          </Link>
          <span className="text-[10px] text-text-muted-custom font-inter leading-none mt-0.5">Intercambia hogares, vive experiencias</span>
        </div>

          <div className="flex items-center gap-2">
            {session && (
              <>
                {/* WellBot — Mobile */}
                <div className="relative">
                  <button
                    onClick={() => setShowWellBot(!showWellBot)}
                    className="p-2 text-ink-teal-900 hover:bg-surface-mist rounded-full transition-colors flex items-center justify-center"
                    aria-label="WellBot"
                  >
                    <Bot className="w-5 h-5" />
                  </button>
                  {showWellBot && (
                    <div className="absolute right-[-48px] md:right-0 top-full mt-2 z-50 w-[90vw] max-w-[380px] h-[500px] max-h-[70vh] bg-white rounded-2xl shadow-xl border border-surface-mist-dark overflow-hidden flex flex-col">
                      <WellBotPanel onClose={() => setShowWellBot(false)} />
                    </div>
                  )}
                </div>

                {/* Bell — Mobile */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 text-ink-teal-900 relative hover:bg-surface-mist rounded-full transition-colors flex items-center justify-center"
                    aria-label="Notificaciones"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      unreadCount > 99 ? (
                        <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
                      ) : (
                        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">
                          {unreadCount}
                        </span>
                      )
                    )}
                  </button>
                  {showNotifications && (
                    <div className="md:hidden">
                      <NotificationsDropdown onClose={() => setShowNotifications(false)} />
                    </div>
                  )}
                </div>
              </>
            )}

            <Link href={session ? "/dashboard?tab=settings" : "/login"} className="w-9 h-9 rounded-full overflow-hidden border border-surface-mist-dark bg-gray-100 flex items-center justify-center">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Perfil" className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5 text-gray-400" />
              )}
            </Link>
          </div>
      </nav>

      {/* ── Mobile Bottom Tab Bar (Mockup style) ──────────────────────────── */}
      <nav
        className={`md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-surface-mist-dark safe-area-inset-bottom shadow-lg ${
          pathname === '/messages' && searchParams.has('conversation_id') ? 'hidden' : ''
        }`}
        role="navigation"
        aria-label="Navegación móvil"
      >
        <div className="flex items-end justify-between px-2 py-1">
          {/* Explorar */}
          <Link
            href="/search"
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-1.5 transition-colors ${
              pathname === '/search' ? 'text-[#0f766e]' : 'text-[#6b7280]'
            }`}
          >
            <Compass className="w-[18px] h-[18px]" strokeWidth={pathname === '/search' ? 2.5 : 1.5} />
            <span className={`font-inter text-[9px] font-medium ${pathname === '/search' ? 'text-[#0f766e] font-semibold' : 'text-[#6b7280]'}`}>
              Explorar
            </span>
          </Link>

          {/* Mi espacio */}
          <Link
            href="/dashboard"
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-1.5 transition-colors ${
              pathname === '/dashboard' && !moreOpen ? 'text-[#0f766e]' : 'text-[#6b7280]'
            }`}
          >
            <Home className="w-[18px] h-[18px]" strokeWidth={pathname === '/dashboard' && !moreOpen ? 2.5 : 1.5} />
            <span className={`font-inter text-[9px] font-medium ${pathname === '/dashboard' && !moreOpen ? 'text-[#0f766e] font-semibold' : 'text-[#6b7280]'}`}>
              Mi espacio
            </span>
          </Link>

          {/* Publicar (Action) */}
          <button
            onClick={handlePublishClick}
            disabled={checkingPublish}
            className="flex-1 flex flex-col items-center justify-center text-[#6b7280] focus:outline-none"
            aria-label="Publicar"
          >
            <div className="w-10 h-10 rounded-full bg-[#0f766e] flex items-center justify-center text-white shadow-md hover:bg-[#0d635c] transition-colors -translate-y-1.5 border-4 border-white">
              {checkingPublish ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Plus className="w-5 h-5" strokeWidth={3} />
              )}
            </div>
            <span className="font-inter text-[9px] font-medium text-[#6b7280] -mt-1">
              Publicar
            </span>
          </button>

          <Link
            href="/messages"
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-1.5 transition-colors relative ${
              pathname === '/messages' ? 'text-[#0f766e]' : 'text-[#6b7280]'
            }`}
          >
            <div className="relative">
              <MessageCircle className="w-[18px] h-[18px]" strokeWidth={pathname === '/messages' ? 2.5 : 1.5} />
              {unreadMessagesCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-emerald-500 text-white text-[8px] font-extrabold px-1 py-0.2 min-w-[13px] h-[13px] rounded-full flex items-center justify-center border border-white shadow-sm">
                  {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                </span>
              )}
            </div>
            <span className={`font-inter text-[9px] font-medium ${pathname === '/messages' ? 'text-[#0f766e] font-semibold' : 'text-[#6b7280]'}`}>
              Mensajes
            </span>
          </Link>

          {/* Más */}
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-1.5 transition-colors ${
              moreOpen ? 'text-[#0f766e]' : 'text-[#6b7280]'
            }`}
          >
            <MoreHorizontal className="w-[18px] h-[18px]" strokeWidth={moreOpen ? 2.5 : 1.5} />
            <span className={`font-inter text-[9px] font-medium ${moreOpen ? 'text-[#0f766e] font-semibold' : 'text-[#6b7280]'}`}>
              Más
            </span>
          </button>
        </div>
      </nav>

      {/* ── Global "Más" Bottom Sheet ────────────────────────────────────── */}
      {moreOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/40 flex items-end">
          <div className="absolute inset-0" onClick={() => setMoreOpen(false)} />
          <div className="bg-white rounded-t-3xl w-full max-h-[85vh] overflow-y-auto p-5 relative z-10 border-t border-surface-mist-dark safe-area-inset-bottom">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-4" />
            
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-fraunces font-bold text-lg text-ink-teal-900">Menú de Wellhouse</h3>
              <button onClick={() => setMoreOpen(false)} className="p-1 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <Link 
                href="/rankings" 
                onClick={() => setMoreOpen(false)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-gray-100 text-center transition-colors"
              >
                <Trophy className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-semibold text-ink-teal-900 leading-tight">Tabla líderes</span>
              </Link>

              <Link 
                href="/dashboard?tab=quests" 
                onClick={() => setMoreOpen(false)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-gray-100 text-center transition-colors"
              >
                <Sparkles className="w-5 h-5 text-[#0f766e]" />
                <span className="text-xs font-semibold text-ink-teal-900 leading-tight">Mis retos</span>
              </Link>

              <Link 
                href="/dashboard?tab=favorites" 
                onClick={() => setMoreOpen(false)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-gray-100 text-center transition-colors"
              >
                <Heart className="w-5 h-5 text-rose-500" />
                <span className="text-xs font-semibold text-ink-teal-900 leading-tight">Favoritos</span>
              </Link>

              <Link 
                href="/dashboard?tab=reviews" 
                onClick={() => setMoreOpen(false)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-gray-100 text-center transition-colors"
              >
                <Star className="w-5 h-5 text-amber-500" />
                <span className="text-xs font-semibold text-ink-teal-900 leading-tight">Reseñas</span>
              </Link>

              <Link 
                href="/dashboard?tab=stories" 
                onClick={() => setMoreOpen(false)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-gray-100 text-center transition-colors"
              >
                <Video className="w-5 h-5 text-blue-500" />
                <span className="text-xs font-semibold text-ink-teal-900 leading-tight">Historias</span>
              </Link>

              <Link 
                href="/dashboard?tab=settings" 
                onClick={() => setMoreOpen(false)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-gray-100 text-center transition-colors"
              >
                <Settings className="w-5 h-5 text-gray-500" />
                <span className="text-xs font-semibold text-ink-teal-900 leading-tight">Ajustes</span>
              </Link>
            </div>

            <div className="border-t border-[#f0ede8] pt-4 flex flex-col gap-3">
              <Link 
                href="/how-it-works"
                onClick={() => setMoreOpen(false)}
                className="flex items-center gap-3 px-3 py-2 text-sm font-semibold text-ink-teal-900 hover:bg-gray-50 rounded-xl"
              >
                <HelpCircle className="w-5 h-5 text-[#0f766e]" />
                ¿Cómo funciona?
              </Link>

              {role === 'ADMIN' && (
                <Link 
                  href="/admin"
                  onClick={() => setMoreOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm font-bold text-rose-600 bg-rose-50 border border-dashed border-rose-200 rounded-xl"
                >
                  <ShieldAlert className="w-5 h-5" />
                  Panel de Administrador
                </Link>
              )}

              {session && (
                <button
                  onClick={() => { setMoreOpen(false); handleLogout() }}
                  className="w-full mt-2 py-3 bg-red-50 text-red-600 font-bold text-sm rounded-xl hover:bg-red-100 transition-colors"
                >
                  Cerrar sesión
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Publish Chooser Modal ────────────────────────────────────────── */}
      {showPublishModal && (
        <div className="fixed inset-0 z-[100] bg-black/55 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative">
            <button 
              onClick={() => setShowPublishModal(false)}
              className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
            
            <h3 className="font-fraunces font-bold text-lg text-ink-teal-900 mb-2">¿Qué deseas publicar?</h3>
            <p className="text-xs text-text-muted-custom mb-5 leading-normal">
              Las cuentas Wellhouse pueden registrar una vivienda principal y múltiples historias de video sobre sus intercambios.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setShowPublishModal(false)
                  router.push('/properties/create')
                }}
                className="w-full py-3 bg-[#0f766e] hover:bg-[#0d635c] text-white font-bold text-sm rounded-2xl transition-colors shadow-sm"
              >
                Registrar mi vivienda
              </button>

              <button
                onClick={() => {
                  setShowPublishModal(false)
                  router.push('/dashboard?tab=stories')
                }}
                className="w-full py-3 bg-white border border-[#cbd5cc] text-ink-teal-900 font-bold text-sm rounded-2xl hover:bg-gray-50 transition-colors"
              >
                Publicar una Historia (Video YouTube)
              </button>
            </div>
          </div>
        </div>
      )}


    </>
  )
})
export default function Navbar() {
  return (
    <Suspense fallback={null}>
      <NavbarContent />
    </Suspense>
  )
}
