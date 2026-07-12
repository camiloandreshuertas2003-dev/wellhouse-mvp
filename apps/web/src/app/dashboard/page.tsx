'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard, Home, Repeat, MessageCircle, Heart, Star,
  Settings, Coins, LogOut, ChevronRight, Sparkles, MoreHorizontal,
  PlusCircle, Eye, Pencil, TrendingUp, CheckCircle2, Clock, XCircle, ArrowUpRight
} from 'lucide-react'
import PropertyCarousel from '@/components/PropertyCarousel'
import { type PropertyCardData } from '@/components/PropertyCard'

interface UserProfile {
  name: string
  email: string
  memberSince: string
  wellPoints: number
}

interface Property {
  id: string
  title: string
  city: string
  country: string
  status: string
  type: string
}

// ─── Level config (Módulo 4) ─────────────────────────────────────────────────
const LEVELS = [
  { id: 'newcomer',   label: 'Recién llegado',  minExchanges: 0,  color: '#6366f1' },
  { id: 'explorer',   label: 'Explorador',      minExchanges: 1,  color: '#0ea5e9' },
  { id: 'traveler',   label: 'Viajero',         minExchanges: 3,  color: '#10b981' },
  { id: 'superhost',  label: 'Superanfitrión',  minExchanges: 8,  color: '#f59e0b' },
  { id: 'ambassador', label: 'Embajador',       minExchanges: 20, color: '#a855f7' },
]

function getLevelConfig(levelId: string) {
  return LEVELS.find(l => l.id === levelId) ?? LEVELS[0]
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [property, setProperty] = useState<Property | null>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [exchanges, setExchanges] = useState<any[]>([])
  const [level, setLevel] = useState<string>('newcomer')
  const [userId, setUserId] = useState<string>('')
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [loadingProperty, setLoadingProperty] = useState(true)

  // mobile "Más" sheet
  const [moreOpen, setMoreOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      setUserId(authUser?.id || '')
      if (!authUser) { router.push('/login'); return }

      const memberSince = new Date(authUser.created_at)
        .toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })

      // WellPoints balance
      let userPoints = 100
      try {
        const { data } = await supabase
          .from('wellpoint_balances').select('current_balance')
          .eq('user_id', authUser.id).maybeSingle()
        if (data) userPoints = data.current_balance
      } catch { /* fallback */ }

      // Member level
      let userLevel = 'newcomer'
      try {
        const { data } = await supabase
          .from('member_levels').select('level')
          .eq('user_id', authUser.id).maybeSingle()
        if (data) userLevel = data.level
      } catch { /* fallback */ }

      // Recent transactions
      let recentTrans: any[] = []
      try {
        const { data } = await supabase
          .from('wellpoint_transactions').select('*')
          .eq('user_id', authUser.id)
          .order('created_at', { ascending: false }).limit(10)
        if (data) recentTrans = data
      } catch { /* fallback */ }

      // Self-heal user row
      try {
        const { data: userData } = await supabase
          .from('users').select('role').eq('id', authUser.id).maybeSingle()
        if (!userData) {
          const name = authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Usuario'
          await supabase.from('users').insert({
            id: authUser.id, email: authUser.email || '',
            name, role: 'user', plan: 'free', status: 'active',
          })
        }
      } catch { /* ignore */ }

      // Exchanges
      try {
        const { data } = await supabase
          .from('exchanges').select('*')
          .or(`host_id.eq.${authUser.id},guest_id.eq.${authUser.id}`)
          .order('created_at', { ascending: false })
        if (data) setExchanges(data)
      } catch { /* fallback */ }

      setProfile({
        name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Usuario',
        email: authUser.email || '',
        memberSince,
        wellPoints: userPoints,
      })
      setLevel(userLevel)
      setTransactions(recentTrans)
      setLoadingProfile(false)

      // Property (Fetch the most recent in case there are accidental duplicates)
      const { data: propData } = await supabase
        .from('properties')
        .select('id, title, city, country, status, type')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      setProperty(propData || null)
      setLoadingProperty(false)
    }
    fetchData()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  // ─── Navigation tabs (Módulo 2.1) ─────────────────────────────────────────
  const MAIN_TABS = [
    { id: 'overview',    label: 'Resumen',       Icon: LayoutDashboard },
    { id: 'my-property', label: 'Mi Vivienda',   Icon: Home },
    { id: 'wellpoints',  label: 'WellPoints',    Icon: Coins },
    { id: 'exchanges',   label: 'Intercambios',  Icon: Repeat },
    { id: 'messages',    label: 'Mensajes',      Icon: MessageCircle },
  ]
  const MORE_TABS = [
    { id: 'favorites', label: 'Favoritos',     Icon: Heart },
    { id: 'reviews',   label: 'Reseñas',       Icon: Star },
    { id: 'settings',  label: 'Configuración', Icon: Settings },
  ]
  const ALL_TABS = [...MAIN_TABS, ...MORE_TABS]

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-[#f8f7f4] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#1a3c34] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#1a3c34] font-semibold text-sm">Cargando tu panel…</p>
        </div>
      </div>
    )
  }

  const levelCfg = getLevelConfig(level)
  const levelIdx = LEVELS.findIndex(l => l.id === level)
  const nextLevel = LEVELS[levelIdx + 1]
  const exchangesDone = exchanges.filter(e => e.status === 'completed').length

  return (
    <div className="min-h-screen bg-[#f8f7f4]">

      {/* ── Top Header ─────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-[#e8e4dc] sticky top-0 z-40">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-fraunces font-bold text-lg text-[#1a3c34]">Wellhouse</Link>
            <span className="text-[#cbd5cc]">|</span>
            <span className="text-sm font-medium text-[#4a6b5e]">Panel de control</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm font-medium text-[#6b7280] hover:text-[#1a3c34] transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 py-3 pb-24 md:pb-6">
        <div className="flex gap-4 items-start">

          {/* ── Desktop Sidebar ───────────────────────────────────────────── */}
          <aside className="hidden md:flex flex-col w-56 shrink-0 sticky top-[57px] gap-3">

            {/* Profile card */}
            <div className="bg-white rounded-2xl border border-[#e8e4dc] p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 font-bold text-lg text-white"
                  style={{ background: levelCfg.color }}>
                  {profile?.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-[#1a3c34] text-sm truncate">{profile?.name}</p>
                  <p className="text-xs text-[#6b7280] truncate">{profile?.email}</p>
                </div>
              </div>

              {/* Level badge — no emoji, Lucide Sparkles (Módulo 1) */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold w-fit"
                style={{ borderColor: levelCfg.color + '40', color: levelCfg.color, background: levelCfg.color + '12' }}>
                <Sparkles className="w-3 h-3" />
                {levelCfg.label}
              </div>

              {/* Level progress (Módulo 4) */}
              {nextLevel && (
                <div className="mt-3 pt-3 border-t border-[#f0ede8]">
                  <div className="flex justify-between text-[10px] text-[#6b7280] mb-1">
                    <span>{levelCfg.label}</span>
                    <span>{nextLevel.label}</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#f0ede8] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.min(100, (exchangesDone / nextLevel.minExchanges) * 100)}%`,
                        background: levelCfg.color,
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-[#6b7280] mt-1.5">
                    {nextLevel.minExchanges - exchangesDone > 0
                      ? `Te faltan ${nextLevel.minExchanges - exchangesDone} intercambios para ${nextLevel.label}`
                      : '¡Ya puedes subir de nivel!'}
                  </p>
                </div>
              )}

              <div className="mt-3 pt-3 border-t border-[#f0ede8] space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#6b7280]">WellPoints</span>
                  <span className="font-bold text-amber-500">{profile?.wellPoints} WP</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6b7280]">Miembro desde</span>
                  <span className="text-[#1a3c34] capitalize">{profile?.memberSince}</span>
                </div>
              </div>
            </div>

            {/* Nav (Módulo 2.1 — Panel Admin retirado) */}
            <nav className="bg-white rounded-2xl border border-[#e8e4dc] p-2">
              {ALL_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-sm transition-colors mb-0.5 last:mb-0 ${
                    activeTab === tab.id
                      ? 'bg-[#1a3c34] text-white font-semibold'
                      : 'text-[#4a6b5e] hover:bg-[#f8f7f4] font-medium'
                  }`}
                >
                  <tab.Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{tab.label}</span>
                  {tab.id === 'my-property' && !property && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-amber-400" />
                  )}
                </button>
              ))}
            </nav>
          </aside>

          {/* ── Main Content ──────────────────────────────────────────────── */}
          <main className="flex-1 min-w-0 space-y-4">
            {activeTab === 'overview' && (
              <OverviewTab
                profile={profile}
                property={property}
                loadingProperty={loadingProperty}
                transactions={transactions}
                exchanges={exchanges}
                levelCfg={levelCfg}
                nextLevel={nextLevel}
                exchangesDone={exchangesDone}
                onTabChange={setActiveTab}
              />
            )}
            {activeTab === 'my-property' && (
              <MyPropertyTab property={property} loadingProperty={loadingProperty} />
            )}
            {activeTab === 'wellpoints' && (
              <WellPointsTab profile={profile} transactions={transactions} />
            )}
            {activeTab === 'exchanges' && (
              <ExchangesTab hasProperty={!!property} userId={userId} exchanges={exchanges} />
            )}
            {activeTab === 'messages' && <MessagesTab />}
            {activeTab === 'favorites' && <FavoritesTab />}
            {activeTab === 'reviews' && <ReviewsTab hasProperty={!!property} />}
            {activeTab === 'settings' && <SettingsTab profile={profile} />}
          </main>
        </div>
      </div>

      {/* ── Mobile Bottom Tab Bar (Módulo 5) ──────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e8e4dc] z-50 md:hidden">
        <div className="flex items-center justify-around px-2 py-1">
          {MAIN_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setMoreOpen(false) }}
              className={`flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl min-w-[44px] min-h-[44px] transition-colors ${
                activeTab === tab.id && !moreOpen
                  ? 'text-[#1a3c34]'
                  : 'text-[#9ca3af]'
              }`}
            >
              <tab.Icon className="w-5 h-5" />
              <span className="text-[9px] font-medium leading-none">{tab.label}</span>
              {tab.id === 'my-property' && !property && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-400" />
              )}
            </button>
          ))}

          {/* Más button */}
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className={`flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl min-w-[44px] min-h-[44px] transition-colors ${
              moreOpen ? 'text-[#1a3c34]' : 'text-[#9ca3af]'
            }`}
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[9px] font-medium leading-none">Más</span>
          </button>
        </div>

        {/* "Más" sheet */}
        {moreOpen && (
          <div className="bg-white border-t border-[#e8e4dc] px-4 py-3 grid grid-cols-3 gap-2">
            {MORE_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setMoreOpen(false) }}
                className={`flex flex-col items-center gap-1 px-2 py-3 rounded-xl text-xs font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#1a3c34] text-white'
                    : 'bg-[#f8f7f4] text-[#4a6b5e]'
                }`}
              >
                <tab.Icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── OVERVIEW TAB (Módulo 3.1) ────────────────────────────────────────────────
function OverviewTab({
  profile, property, loadingProperty, transactions, exchanges,
  levelCfg, nextLevel, exchangesDone, onTabChange,
}: {
  profile: UserProfile | null
  property: Property | null
  loadingProperty: boolean
  transactions: any[]
  exchanges: any[]
  levelCfg: typeof LEVELS[0]
  nextLevel: typeof LEVELS[0] | undefined
  exchangesDone: number
  onTabChange: (tab: string) => void
}) {
  const pendingExchanges = exchanges.filter(e => e.status === 'pending').length

  // Dynamic banner message (Módulo 3.1 — nunca un mensaje genérico fijo)
  const bannerState = !property ? 'no-property'
    : property.status === 'draft' ? 'draft'
    : property.status === 'published' ? 'published'
    : 'pending'

  return (
    <div className="space-y-4">

      {/* Dynamic Welcome Banner */}
      {bannerState === 'no-property' && (
        <div className="rounded-2xl p-5 text-white" style={{ background: 'linear-gradient(135deg, #1a3c34 0%, #2d6a4f 100%)' }}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[#9dc4b0] text-xs font-medium mb-1">Bienvenido/a, {profile?.name?.split(' ')[0]}</p>
              <h2 className="text-lg font-fraunces font-bold mb-2">Registra tu primera vivienda</h2>
              <p className="text-[#c4ddd4] text-sm mb-4">
                Para comenzar a intercambiar hogares con la comunidad Wellhouse necesitas registrar la tuya. Es gratis y tarda menos de 5 minutos.
              </p>
              <Link href="/properties/create"
                className="inline-flex items-center gap-1.5 bg-[#f0a500] text-[#1a1a1a] px-4 py-2 rounded-xl font-semibold text-sm hover:bg-[#d4920a] transition-colors">
                <PlusCircle className="w-4 h-4" /> Registrar mi vivienda
              </Link>
            </div>
            <Home className="w-16 h-16 text-[#2d6a4f] flex-shrink-0 hidden sm:block" />
          </div>
        </div>
      )}

      {bannerState === 'draft' && (
        <div className="rounded-2xl p-5 text-white" style={{ background: 'linear-gradient(135deg, #374151 0%, #4b5563 100%)' }}>
          <p className="text-gray-300 text-xs font-medium mb-1">Tienes un borrador pendiente</p>
          <h2 className="text-lg font-fraunces font-bold mb-2">Completa el registro de tu vivienda</h2>
          <p className="text-gray-300 text-sm mb-4">Tu vivienda aún no está publicada. Completa el wizard para que aparezca en el explorador.</p>
          <Link href="/properties/create"
            className="inline-flex items-center gap-1.5 bg-white text-gray-900 px-4 py-2 rounded-xl font-semibold text-sm hover:bg-gray-100 transition-colors">
            <Pencil className="w-4 h-4" /> Continuar registro
          </Link>
        </div>
      )}

      {bannerState === 'published' && (
        <div className="rounded-2xl p-5 text-white" style={{ background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)' }}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                <p className="text-emerald-300 text-xs font-medium">Vivienda publicada y visible</p>
              </div>
              <h2 className="text-lg font-fraunces font-bold mb-2">{property?.title}</h2>
              <p className="text-emerald-100 text-sm mb-4">{property?.city}, {property?.country}</p>
              <div className="flex items-center gap-2">
                <Link href={`/properties/${property?.id}`}
                  className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-white/30 transition-colors">
                  <Eye className="w-4 h-4" /> Ver como huésped
                </Link>
                <Link href="/properties/create"
                  className="inline-flex items-center gap-1.5 border border-white/30 text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-white/10 transition-colors">
                  <Pencil className="w-4 h-4" /> Editar
                </Link>
              </div>
            </div>
            <TrendingUp className="w-12 h-12 text-emerald-400/60 flex-shrink-0 hidden sm:block" />
          </div>
        </div>
      )}

      {bannerState === 'pending' && (
        <div className="rounded-2xl p-5 border border-amber-200 bg-amber-50">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-amber-600" />
            <p className="text-amber-700 text-xs font-medium">En revisión</p>
          </div>
          <h2 className="text-base font-semibold text-amber-900 mb-1">{property?.title}</h2>
          <p className="text-amber-700 text-sm">Tu vivienda está siendo revisada. Te notificaremos cuando esté aprobada.</p>
        </div>
      )}

      {/* ── KPI Cards — cada una clickable (Módulo 3.1) ──────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

        {/* WellPoints KPI */}
        <button onClick={() => onTabChange('wellpoints')}
          className="bg-white rounded-2xl border border-[#e8e4dc] p-4 text-left hover:shadow-md hover:border-amber-200 transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[#6b7280] text-xs font-medium">WellPoints</span>
            <Coins className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-3xl font-bold text-[#1a3c34]">{profile?.wellPoints ?? 0}</p>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs text-[#6b7280]">Puntos disponibles</span>
            <ArrowUpRight className="w-3 h-3 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </button>

        {/* Intercambios KPI */}
        <button onClick={() => onTabChange('exchanges')}
          className="bg-white rounded-2xl border border-[#e8e4dc] p-4 text-left hover:shadow-md hover:border-[#1a3c34]/20 transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[#6b7280] text-xs font-medium">Intercambios</span>
            <Repeat className="w-5 h-5 text-[#4a6b5e] group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-3xl font-bold text-[#1a3c34]">{exchangesDone}</p>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs text-[#6b7280]">
              {pendingExchanges > 0 ? `${pendingExchanges} pendiente${pendingExchanges > 1 ? 's' : ''}` : 'Total completados'}
            </span>
            <ArrowUpRight className="w-3 h-3 text-[#4a6b5e] opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </button>

        {/* Mi Vivienda KPI */}
        <button onClick={() => onTabChange('my-property')}
          className="bg-white rounded-2xl border border-[#e8e4dc] p-4 text-left hover:shadow-md hover:border-[#1a3c34]/20 transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[#6b7280] text-xs font-medium">Mi Vivienda</span>
            <Home className="w-5 h-5 text-[#4a6b5e] group-hover:scale-110 transition-transform" />
          </div>
          {loadingProperty ? (
            <div className="h-8 bg-[#f0ede8] rounded animate-pulse" />
          ) : property ? (
            <>
              <p className={`text-sm font-bold ${
                property.status === 'published' ? 'text-emerald-600' :
                property.status === 'pending_review' ? 'text-amber-500' : 'text-[#6b7280]'
              }`}>
                {property.status === 'published' ? 'Publicada' :
                 property.status === 'pending_review' ? 'En revisión' : 'Borrador'}
              </p>
              <p className="text-xs text-[#6b7280] mt-0.5 truncate">{property.city}</p>
            </>
          ) : (
            <>
              <p className="text-sm font-bold text-amber-500">Sin registrar</p>
              <p className="text-xs text-[#6b7280] mt-0.5">Toca para registrar →</p>
            </>
          )}
        </button>
      </div>

      {/* ── Gamification Progress (Módulo 4) ─────────────────────────── */}
      {nextLevel && (
        <div className="bg-white rounded-2xl border border-[#e8e4dc] p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" style={{ color: levelCfg.color }} />
              <span className="text-sm font-semibold text-[#1a3c34]">Progreso de nivel</span>
            </div>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full"
              style={{ color: levelCfg.color, background: levelCfg.color + '15' }}>
              {levelCfg.label}
            </span>
          </div>
          <div className="w-full h-2 bg-[#f0ede8] rounded-full overflow-hidden mb-2">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(100, (exchangesDone / nextLevel.minExchanges) * 100)}%`,
                background: `linear-gradient(90deg, ${levelCfg.color}, ${nextLevel.color})`,
              }}
            />
          </div>
          <p className="text-xs text-[#6b7280]">
            {nextLevel.minExchanges - exchangesDone > 0
              ? `Te faltan ${nextLevel.minExchanges - exchangesDone} intercambios para ser ${nextLevel.label} — ${property ? 'completa un intercambio para ganarlos' : 'primero registra tu vivienda'}`
              : `¡Listo para subir a ${nextLevel.label}!`}
          </p>
        </div>
      )}

      {/* ── WellPoints mini-ledger ────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#e8e4dc] p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[#1a3c34]">Historial de WellPoints</h2>
          <button onClick={() => onTabChange('wellpoints')}
            className="text-xs text-[#4a6b5e] hover:text-[#1a3c34] font-medium flex items-center gap-1 transition-colors">
            Ver todo <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        {transactions.length > 0 ? (
          <div className="divide-y divide-[#f0ede8]">
            {transactions.slice(0, 4).map((tx) => (
              <div key={tx.id} className="py-2.5 flex justify-between items-center text-sm">
                <div>
                  <p className="text-[#1a3c34] font-medium text-xs">{tx.description || 'Movimiento de puntos'}</p>
                  <p className="text-[10px] text-[#6b7280] mt-0.5">
                    {new Date(tx.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </p>
                </div>
                <span className={`font-bold text-sm ${tx.amount > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {tx.amount > 0 ? `+${tx.amount}` : tx.amount} WP
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <Coins className="w-8 h-8 mx-auto mb-2 text-[#cbd5cc]" />
            <p className="text-xs text-[#6b7280]">Tus movimientos de WellPoints aparecerán aquí</p>
          </div>
        )}
      </div>

      {/* ── Discover Carousel ──── */}
      <DiscoverCarousel />
    </div>
  )
}

// ─── DISCOVER CAROUSEL ────────────────────────────────────────────────────────
function DiscoverCarousel() {
  const [props, setProps] = useState<PropertyCardData[]>([])

  useEffect(() => {
    supabase
      .from('properties')
      .select('id, title, city, country, type, bedrooms, bathrooms, capacity, images')
      .eq('status', 'published').limit(8)
      .then(({ data }) => {
        if (data?.length) {
          setProps(data.map((p, i) => ({
            id: p.id,
            title: p.title,
            location: `${p.city || '—'}, ${p.country || '—'}`,
            type: p.type || 'Vivienda',
            bedrooms: p.bedrooms || 1,
            bathrooms: p.bathrooms || 1,
            capacity: p.capacity || 2,
            rating: 0, reviews: 0,
            image: Array.isArray(p.images) && p.images[0]
              ? p.images[0]
              : `https://images.unsplash.com/photo-${['1500382017468-9049fed747ef','1499793983690-e29da59ef1c2','1502672260266-1c1ef2d93688'][i % 3]}?auto=format&fit=crop&w=800&q=80`,
            verified: true,
            wellRank: Math.max(30, Math.min((p.capacity * 15) + (p.bedrooms * 20) + (p.bathrooms * 10), 300)),
          })))
        }
      })
  }, [])

  if (props.length === 0) return null

  return (
    <PropertyCarousel
      title="Descubre viviendas disponibles"
      subtitle="Solicita un intercambio con tus WellPoints"
      properties={props}
      viewAllHref="/search"
    />
  )
}

// ─── WELLPOINTS TAB (Módulo 3.2) ─────────────────────────────────────────────
function WellPointsTab({ profile, transactions }: { profile: UserProfile | null; transactions: any[] }) {
  const TX_ICONS: Record<string, any> = {
    welcome_bonus: <Sparkles className="w-4 h-4 text-amber-400" />,
    hosting_earned: <Home className="w-4 h-4 text-emerald-500" />,
    exchange_spent: <Repeat className="w-4 h-4 text-blue-500" />,
    profile_completion: <CheckCircle2 className="w-4 h-4 text-purple-500" />,
  }

  return (
    <div className="space-y-4">
      {/* Balance card */}
      <div className="bg-white rounded-2xl border border-[#e8e4dc] p-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center">
            <Coins className="w-7 h-7 text-amber-500" />
          </div>
          <div>
            <p className="text-xs text-[#6b7280] font-medium mb-0.5">Saldo disponible</p>
            <p className="text-4xl font-bold text-[#1a3c34]">{profile?.wellPoints ?? 0}</p>
            <p className="text-xs text-[#6b7280]">WellPoints</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-[#f0ede8] flex gap-2">
          <Link href="/how-it-works"
            className="flex-1 text-center py-2 bg-[#1a3c34] text-white rounded-xl text-sm font-semibold hover:bg-[#2d6a4f] transition-colors">
            Comprar WellPoints
          </Link>
          <Link href="/search"
            className="flex-1 text-center py-2 border border-[#e8e4dc] text-[#1a3c34] rounded-xl text-sm font-semibold hover:bg-[#f8f7f4] transition-colors">
            Usar en intercambio
          </Link>
        </div>
      </div>

      {/* Ledger */}
      <div className="bg-white rounded-2xl border border-[#e8e4dc] p-5">
        <h2 className="text-sm font-semibold text-[#1a3c34] mb-4">Historial de transacciones</h2>
        {transactions.length > 0 ? (
          <div className="divide-y divide-[#f0ede8]">
            {transactions.map((tx) => (
              <div key={tx.id} className="py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#f8f7f4] border border-[#e8e4dc] flex items-center justify-center flex-shrink-0">
                  {TX_ICONS[tx.type] ?? <Coins className="w-4 h-4 text-[#6b7280]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1a3c34] truncate">{tx.description || 'Movimiento de puntos'}</p>
                  <p className="text-xs text-[#6b7280]">
                    {new Date(tx.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                    {' · '}{tx.type === 'welcome_bonus' ? 'Bonus bienvenida' : tx.type === 'hosting_earned' ? 'Por hospitalidad' : tx.type === 'exchange_spent' ? 'Intercambio' : tx.type}
                  </p>
                </div>
                <span className={`font-bold text-sm flex-shrink-0 ${tx.amount > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount} WP
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 border-2 border-dashed border-[#e8e4dc] rounded-xl">
            <Coins className="w-10 h-10 mx-auto mb-3 text-[#cbd5cc]" />
            <p className="text-sm font-semibold text-[#1a3c34] mb-1">Sin transacciones aún</p>
            <p className="text-xs text-[#6b7280] max-w-xs mx-auto">
              Completa tu perfil, registra tu vivienda o hospeda a alguien para ganar tus primeros WellPoints.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── MY PROPERTY TAB (Módulo 3.3) ────────────────────────────────────────────
function MyPropertyTab({ property, loadingProperty }: { property: Property | null; loadingProperty: boolean }) {
  if (loadingProperty) {
    return (
      <div className="bg-white rounded-2xl border border-[#e8e4dc] p-6 space-y-3">
        <div className="h-5 bg-[#f0ede8] rounded w-1/3 animate-pulse" />
        <div className="h-4 bg-[#f0ede8] rounded w-2/3 animate-pulse" />
        <div className="h-4 bg-[#f0ede8] rounded w-1/2 animate-pulse" />
      </div>
    )
  }

  if (!property) {
    return (
      <div className="bg-white rounded-2xl border border-[#e8e4dc] p-6">
        <h2 className="text-base font-semibold text-[#1a3c34] mb-5">Mi Vivienda</h2>
        <div className="text-center py-12 border-2 border-dashed border-[#e8e4dc] rounded-2xl">
          <div className="w-16 h-16 rounded-2xl bg-[#f0ede8] flex items-center justify-center mx-auto mb-4">
            <Home className="w-8 h-8 text-[#cbd5cc]" />
          </div>
          <h3 className="text-base font-bold text-[#1a3c34] mb-2">Registra tu vivienda</h3>
          <p className="text-sm text-[#6b7280] mb-1 max-w-sm mx-auto">
            Para participar en la comunidad Wellhouse, primero debes registrar tu vivienda.
          </p>
          <p className="text-xs text-[#6b7280] mb-6 max-w-sm mx-auto">
            Es gratis, tarda unos minutos y te permite intercambiar con miles de hogares.
          </p>
          <Link href="/properties/create"
            className="inline-flex items-center gap-2 bg-[#1a3c34] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#2d6a4f] transition-colors">
            <PlusCircle className="w-4 h-4" /> Comenzar registro
          </Link>
        </div>
      </div>
    )
  }

  const statusMap: Record<string, { label: string; color: string; bg: string; Icon: any }> = {
    published:      { label: 'Publicada y visible', color: '#065f46', bg: '#ecfdf5', Icon: CheckCircle2 },
    pending_review: { label: 'Pendiente de aprobación', color: '#92400e', bg: '#fffbeb', Icon: Clock },
    draft:          { label: 'Borrador', color: '#374151', bg: '#f9fafb', Icon: Pencil },
  }
  const s = statusMap[property.status] ?? statusMap.draft

  return (
    <div className="bg-white rounded-2xl border border-[#e8e4dc] p-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold text-[#1a3c34]">Mi Vivienda</h2>
        <Link href="/properties/create"
          className="flex items-center gap-1.5 text-xs font-semibold text-[#1a3c34] border border-[#e8e4dc] px-3 py-1.5 rounded-lg hover:bg-[#f8f7f4] transition-colors">
          <Pencil className="w-3.5 h-3.5" /> Editar
        </Link>
      </div>

      <div className="bg-[#f8f7f4] rounded-xl p-4 mb-4">
        <h3 className="font-semibold text-[#1a3c34]">{property.title}</h3>
        <p className="text-sm text-[#6b7280] mt-1">{property.city}, {property.country} · {property.type}</p>
        <div className="flex items-center gap-1.5 mt-3 w-fit px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{ color: s.color, background: s.bg }}>
          <s.Icon className="w-3.5 h-3.5" />
          {s.label}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Vistas', value: '0' },
          { label: 'Consultas', value: '0' },
          { label: 'Intercambios', value: '0' },
          { label: 'Rating', value: '—' },
        ].map((stat) => (
          <div key={stat.label} className="text-center p-3 bg-[#f8f7f4] rounded-xl">
            <p className="text-2xl font-bold text-[#1a3c34]">{stat.value}</p>
            <p className="text-xs text-[#6b7280] mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <Link href={`/properties/${property.id}`}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-[#e8e4dc] rounded-xl text-sm font-semibold text-[#1a3c34] hover:bg-[#f8f7f4] transition-colors">
          <Eye className="w-4 h-4" /> Ver como huésped
        </Link>
      </div>
    </div>
  )
}

// ─── EXCHANGES TAB (Módulo 3.4) ────────────────────────────────────────────────
function ExchangesTab({ hasProperty, userId, exchanges }: { hasProperty: boolean; userId: string; exchanges: any[] }) {
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [list, setList] = useState(exchanges)

  useEffect(() => { setList(exchanges) }, [exchanges])

  const STATUS_CFG: Record<string, { label: string; color: string; bg: string; Icon: any }> = {
    pending:   { label: 'Pendiente',  color: '#92400e', bg: '#fffbeb', Icon: Clock },
    confirmed: { label: 'Confirmado', color: '#1e40af', bg: '#eff6ff', Icon: CheckCircle2 },
    completed: { label: 'Completado', color: '#065f46', bg: '#ecfdf5', Icon: CheckCircle2 },
    cancelled: { label: 'Cancelado',  color: '#991b1b', bg: '#fef2f2', Icon: XCircle },
  }

  const callAction = async (exchangeId: string, action: string) => {
    setActionLoading(exchangeId + action)
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch('/api/wellpoints/exchange', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
      body: JSON.stringify({ action, exchange_id: exchangeId }),
    })
    const json = await res.json()
    if (!res.ok) { alert(json.error || 'Error'); setActionLoading(null); return }
    const { data } = await supabase.from('exchanges').select('*')
      .or(`host_id.eq.${userId},guest_id.eq.${userId}`)
      .order('created_at', { ascending: false })
    setList(data || [])
    setActionLoading(null)
  }

  if (list.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#e8e4dc] p-6">
        <h2 className="text-base font-semibold text-[#1a3c34] mb-5">Intercambios</h2>
        <div className="text-center py-12 border-2 border-dashed border-[#e8e4dc] rounded-2xl">
          <div className="w-16 h-16 rounded-2xl bg-[#f0ede8] flex items-center justify-center mx-auto mb-4">
            <Repeat className="w-8 h-8 text-[#cbd5cc]" />
          </div>
          <h3 className="text-base font-bold text-[#1a3c34] mb-2">Sin intercambios aún</h3>
          <p className="text-sm text-[#6b7280] mb-6 max-w-sm mx-auto">
            {hasProperty ? 'Busca viviendas y solicita tu primer intercambio con WellPoints.' : 'Primero registra tu vivienda para poder intercambiar.'}
          </p>
          {hasProperty ? (
            <Link href="/search" className="inline-flex items-center gap-2 bg-[#1a3c34] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#2d6a4f] transition-colors">
              Buscar viviendas
            </Link>
          ) : (
            <Link href="/properties/create" className="inline-flex items-center gap-2 bg-[#1a3c34] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#2d6a4f] transition-colors">
              Registrar mi vivienda
            </Link>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-[#e8e4dc] p-5">
      <h2 className="text-base font-semibold text-[#1a3c34] mb-4">Intercambios</h2>
      <div className="space-y-3">
        {list.map((ex) => {
          const isHost = ex.host_id === userId
          const s = STATUS_CFG[ex.status] ?? { label: ex.status, color: '#374151', bg: '#f9fafb', Icon: Clock }
          const busy = actionLoading?.startsWith(ex.id)
          return (
            <div key={ex.id} className="border border-[#e8e4dc] rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-xs font-medium text-[#6b7280] flex items-center gap-1">
                      {isHost ? <Home className="w-3.5 h-3.5" /> : <Repeat className="w-3.5 h-3.5" />}
                      {isHost ? 'Eres anfitrión' : 'Eres huésped'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                      style={{ color: s.color, background: s.bg }}>
                      {s.label}
                    </span>
                  </div>
                  <p className="text-sm text-[#1a3c34] font-medium">
                    {new Date(ex.checkin_date).toLocaleDateString('es-ES')} → {new Date(ex.checkout_date).toLocaleDateString('es-ES')}
                    {' · '}<strong>{ex.nights} noches</strong>
                  </p>
                  <p className="text-xs text-[#6b7280] mt-0.5">
                    WellRank: {ex.wellrank_snapshot} WP/noche = {ex.wellrank_snapshot * ex.nights} WP totales
                  </p>
                </div>
                <div className="flex flex-col gap-1.5 shrink-0">
                  {isHost && ex.status === 'pending' && (
                    <button onClick={() => callAction(ex.id, 'confirm')} disabled={!!busy}
                      className="px-3 py-1.5 bg-[#1a3c34] text-white text-xs rounded-lg font-semibold hover:bg-[#2d6a4f] disabled:opacity-50">
                      {busy ? '…' : 'Confirmar'}
                    </button>
                  )}
                  {isHost && ex.status === 'confirmed' && (
                    <button onClick={() => callAction(ex.id, 'finalize')} disabled={!!busy}
                      className="px-3 py-1.5 bg-emerald-600 text-white text-xs rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50">
                      {busy ? '…' : 'Finalizar y acreditar WP'}
                    </button>
                  )}
                  {['pending', 'confirmed'].includes(ex.status) && (
                    <button onClick={() => callAction(ex.id, 'cancel')} disabled={!!busy}
                      className="px-3 py-1.5 border border-red-200 text-red-600 text-xs rounded-lg font-semibold hover:bg-red-50 disabled:opacity-50">
                      {busy ? '…' : 'Cancelar'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── MESSAGES TAB ────────────────────────────────────────────────────────────
function MessagesTab() {
  return (
    <div className="bg-white rounded-2xl border border-[#e8e4dc] p-6">
      <h2 className="text-base font-semibold text-[#1a3c34] mb-5">Mensajes</h2>
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-2xl bg-[#f0ede8] flex items-center justify-center mx-auto mb-4">
          <MessageCircle className="w-8 h-8 text-[#cbd5cc]" />
        </div>
        <h3 className="text-base font-bold text-[#1a3c34] mb-2">Sin mensajes aún</h3>
        <p className="text-sm text-[#6b7280] mb-5 max-w-xs mx-auto">Aquí aparecerán tus conversaciones con anfitriones y huéspedes.</p>
        <Link href="/messages"
          className="inline-flex items-center gap-2 border border-[#e8e4dc] text-[#1a3c34] px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#f8f7f4] transition-colors">
          Ir a Mensajes <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}

// ─── FAVORITES TAB (Módulo 3.5) ────────────────────────────────────────────────
function FavoritesTab() {
  return (
    <div className="bg-white rounded-2xl border border-[#e8e4dc] p-6">
      <h2 className="text-base font-semibold text-[#1a3c34] mb-5">Favoritos</h2>
      <div className="text-center py-12 border-2 border-dashed border-[#e8e4dc] rounded-2xl">
        <div className="w-16 h-16 rounded-2xl bg-[#f0ede8] flex items-center justify-center mx-auto mb-4">
          <Heart className="w-8 h-8 text-[#cbd5cc]" />
        </div>
        <h3 className="text-base font-bold text-[#1a3c34] mb-2">Sin viviendas guardadas</h3>
        <p className="text-sm text-[#6b7280] mb-6 max-w-xs mx-auto">
          Cuando guardes una vivienda tocando el corazón en el explorador, aparecerá aquí.
        </p>
        <Link href="/search"
          className="inline-flex items-center gap-2 bg-[#1a3c34] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#2d6a4f] transition-colors">
          Explorar viviendas <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}

// ─── REVIEWS TAB (Módulo 3.6) — dos pestañas ──────────────────────────────────
function ReviewsTab({ hasProperty }: { hasProperty: boolean }) {
  const [tab, setTab] = useState<'written' | 'received'>('written')

  return (
    <div className="bg-white rounded-2xl border border-[#e8e4dc] p-5">
      <h2 className="text-base font-semibold text-[#1a3c34] mb-4">Reseñas</h2>

      {/* Two-tab switcher */}
      <div className="flex bg-[#f8f7f4] rounded-xl p-1 mb-5">
        <button onClick={() => setTab('written')}
          className={`flex-1 text-xs font-semibold py-2 rounded-lg transition-colors ${tab === 'written' ? 'bg-white text-[#1a3c34] shadow-sm' : 'text-[#6b7280]'}`}>
          Reseñas que escribí
        </button>
        {hasProperty && (
          <button onClick={() => setTab('received')}
            className={`flex-1 text-xs font-semibold py-2 rounded-lg transition-colors ${tab === 'received' ? 'bg-white text-[#1a3c34] shadow-sm' : 'text-[#6b7280]'}`}>
            Sobre mi vivienda
          </button>
        )}
      </div>

      <div className="text-center py-10 border-2 border-dashed border-[#e8e4dc] rounded-2xl">
        <div className="w-16 h-16 rounded-2xl bg-[#f0ede8] flex items-center justify-center mx-auto mb-4">
          <Star className="w-8 h-8 text-[#cbd5cc]" />
        </div>
        {tab === 'written' ? (
          <>
            <h3 className="text-base font-bold text-[#1a3c34] mb-2">Sin reseñas escritas</h3>
            <p className="text-sm text-[#6b7280] max-w-xs mx-auto">
              Podrás dejar una reseña después de completar tu primer intercambio como huésped.
            </p>
          </>
        ) : (
          <>
            <h3 className="text-base font-bold text-[#1a3c34] mb-2">Sin reseñas recibidas</h3>
            <p className="text-sm text-[#6b7280] max-w-xs mx-auto">
              Las reseñas de tus huéspedes aparecerán aquí después de que completen un intercambio.
            </p>
          </>
        )}
      </div>
    </div>
  )
}

// ─── SETTINGS TAB ─────────────────────────────────────────────────────────────
function SettingsTab({ profile }: { profile: UserProfile | null }) {
  return (
    <div className="bg-white rounded-2xl border border-[#e8e4dc] p-5">
      <h2 className="text-base font-semibold text-[#1a3c34] mb-5">Configuración de cuenta</h2>
      <div className="space-y-4 max-w-md">
        <div>
          <label className="block text-xs font-medium text-[#4a6b5e] mb-1.5">Nombre</label>
          <input
            type="text"
            defaultValue={profile?.name}
            className="w-full px-4 py-2.5 border border-[#e8e4dc] rounded-xl text-sm text-[#1a3c34] bg-white focus:outline-none focus:ring-2 focus:ring-[#1a3c34]/20 focus:border-[#1a3c34] transition"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#4a6b5e] mb-1.5">Email</label>
          <input
            type="email"
            defaultValue={profile?.email}
            className="w-full px-4 py-2.5 border border-[#e8e4dc] rounded-xl text-sm text-[#6b7280] bg-[#f8f7f4] cursor-not-allowed"
            disabled
          />
          <p className="text-[10px] text-[#9ca3af] mt-1">El email no se puede cambiar por seguridad</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-[#4a6b5e] mb-1.5">Notificaciones</label>
          <Link href="/settings/notifications"
            className="flex items-center justify-between w-full px-4 py-2.5 border border-[#e8e4dc] rounded-xl text-sm text-[#1a3c34] hover:bg-[#f8f7f4] transition-colors">
            <span>Configurar notificaciones</span>
            <ChevronRight className="w-4 h-4 text-[#6b7280]" />
          </Link>
        </div>
        <button className="bg-[#1a3c34] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#2d6a4f] transition-colors">
          Guardar cambios
        </button>
      </div>
    </div>
  )
}
