'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard, Home, Repeat, MessageCircle, Heart, Star,
  Settings, Coins, LogOut, ChevronRight, Sparkles, MoreHorizontal,
  PlusCircle, Eye, Pencil, TrendingUp, CheckCircle2, Clock, XCircle, ArrowUpRight,
  Video
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
  const [userMetadata, setUserMetadata] = useState<any>(null)
  const [property, setProperty] = useState<Property | null>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [exchanges, setExchanges] = useState<any[]>([])
  const [level, setLevel] = useState<string>('newcomer')
  const [userId, setUserId] = useState<string>('')
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [loadingProperty, setLoadingProperty] = useState(true)

  // mobile "Más" sheet
  const [moreOpen, setMoreOpen] = useState(false)

  const fetchData = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) { router.push('/login'); return }
    setUserId(authUser.id)

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

    // Fetch / self-heal public.users fields
    let meta: any = null
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('name, bio, avatar_url, phone, is_verified')
        .eq('id', authUser.id)
        .maybeSingle()
      
      if (!userData) {
        const name = authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Usuario'
        const defaultUser = {
          id: authUser.id, email: authUser.email || '',
          name, role: 'user', plan: 'free', status: 'active',
        }
        await supabase.from('users').insert(defaultUser)
        meta = { name, bio: '', avatar_url: '', phone: '', is_verified: false }
      } else {
        meta = userData
      }
      setUserMetadata(meta)
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
      name: meta?.name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Usuario',
      email: authUser.email || '',
      memberSince,
      wellPoints: userPoints,
    })
    setLevel(userLevel)
    setTransactions(recentTrans)
    setLoadingProfile(false)

    // Property
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

  useEffect(() => {
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
    { id: 'quests',     label: 'Mis Retos',      Icon: Sparkles },
    { id: 'stories',    label: 'Historias',      Icon: Video },
    { id: 'favorites',  label: 'Favoritos',      Icon: Heart },
    { id: 'reviews',    label: 'Reseñas',        Icon: Star },
    { id: 'settings',   label: 'Configuración',  Icon: Settings },
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
      <div className="max-w-[1440px] mx-auto px-6 md:px-6 lg:px-8 py-3 pb-24 md:pb-6">
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
                <div className="pt-2">
                  <Link href="/rankings" className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-[#1a3c34] bg-[#f8f7f4] hover:bg-[#e8e4dc] transition-colors">
                    Ver Tabla de Líderes 🏆
                  </Link>
                </div>
              </div>
            </div>

            {/* Nav (Módulo 2.1 — Panel Admin retirado) */}
            <nav className="bg-white rounded-2xl border border-[#e8e4dc] p-2">
              {ALL_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (tab.id === 'messages') router.push('/messages')
                    else setActiveTab(tab.id)
                  }}
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
            {activeTab === 'quests' && (
              <QuestsTab userId={userId} onComplete={fetchData} />
            )}
            {activeTab === 'stories' && (
              <StoriesTab property={property} userId={userId} />
            )}
            {activeTab === 'messages' && <MessagesTab />}
            {activeTab === 'favorites' && <FavoritesTab />}
            {activeTab === 'reviews' && <ReviewsTab hasProperty={!!property} />}
            {activeTab === 'settings' && (
              <SettingsTab userMetadata={userMetadata} userId={userId} onSave={fetchData} />
            )}
          </main>
        </div>
      </div>

      {/* ── Mobile Bottom Tab Bar (Módulo 5) ──────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e8e4dc] z-50 md:hidden">
        <div className="flex items-center justify-around px-2 py-1">
          {MAIN_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'messages') router.push('/messages')
                else { setActiveTab(tab.id); setMoreOpen(false) }
              }}
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
function SettingsTab({ 
  userMetadata, 
  userId, 
  onSave 
}: { 
  userMetadata: any
  userId: string
  onSave: () => void 
}) {
  const [name, setName] = useState(userMetadata?.name || '')
  const [bio, setBio] = useState(userMetadata?.bio || '')
  const [phone, setPhone] = useState(userMetadata?.phone || '')
  const [avatarUrl, setAvatarUrl] = useState(userMetadata?.avatar_url || '')
  const [isVerified, setIsVerified] = useState(userMetadata?.is_verified || false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [showCheckout, setShowCheckout] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    try {
      const { error } = await supabase
        .from('users')
        .update({ name, bio, phone, avatar_url: avatarUrl })
        .eq('id', userId)
      
      if (error) throw error
      setMessage('Perfil guardado exitosamente.')
      onSave()
    } catch (err: any) {
      setMessage('Error al guardar: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handlePaymentSuccess = async () => {
    setPaymentLoading(true)
    try {
      // Simular transacción de pago de $15 USD
      const { error } = await supabase
        .from('users')
        .update({ is_verified: true })
        .eq('id', userId)
      
      if (error) throw error
      setIsVerified(true)
      setShowCheckout(false)
      setMessage('¡Pago procesado con éxito! Tu cuenta y tu vivienda asociada han sido verificadas oficialmente. Recibiste +150 WP.')
      onSave()
    } catch (err: any) {
      setMessage('Error en el pago: ' + err.message)
    } finally {
      setPaymentLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Sección Configuración */}
      <div className="bg-white rounded-2xl border border-[#e8e4dc] p-5">
        <h2 className="text-base font-semibold text-[#1a3c34] mb-5">Configuración de cuenta</h2>
        {message && (
          <div className={`mb-4 p-3 rounded-xl text-xs font-medium ${message.includes('Error') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
            {message}
          </div>
        )}
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-medium text-[#4a6b5e] mb-1.5">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 border border-[#e8e4dc] rounded-xl text-sm text-[#1a3c34] bg-white focus:outline-none focus:ring-2 focus:ring-[#1a3c34]/20 focus:border-[#1a3c34] transition"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#4a6b5e] mb-1.5">Biografía / Descripción corta</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Cuéntanos un poco sobre ti y tus preferencias de viaje..."
              className="w-full px-4 py-2.5 border border-[#e8e4dc] rounded-xl text-sm text-[#1a3c34] bg-white focus:outline-none focus:ring-2 focus:ring-[#1a3c34]/20 focus:border-[#1a3c34] transition resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#4a6b5e] mb-1.5">Teléfono de contacto</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+57 300 123 4567"
              className="w-full px-4 py-2.5 border border-[#e8e4dc] rounded-xl text-sm text-[#1a3c34] bg-white focus:outline-none focus:ring-2 focus:ring-[#1a3c34]/20 focus:border-[#1a3c34] transition"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#4a6b5e] mb-1.5">Foto de perfil (URL)</label>
            <input
              type="text"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://ejemplo.com/foto.jpg"
              className="w-full px-4 py-2.5 border border-[#e8e4dc] rounded-xl text-sm text-[#1a3c34] bg-white focus:outline-none focus:ring-2 focus:ring-[#1a3c34]/20 focus:border-[#1a3c34] transition"
            />
          </div>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-[#1a3c34] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#2d6a4f] transition-colors disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>

      {/* Sección Verificación */}
      <div className="bg-white rounded-2xl border border-[#e8e4dc] p-5">
        <h2 className="text-base font-semibold text-[#1a3c34] mb-3">Verificación de Identidad y Vivienda</h2>
        <p className="text-xs text-[#6b7280] mb-5 leading-relaxed">
          Para garantizar la máxima seguridad en nuestra comunidad, ofrecemos una verificación oficial. Al verificar tu identidad y tu vivienda asociada, obtendrás el sello de verificación oficial y desbloquearás una recompensa masiva de 150 WP.
        </p>

        {isVerified ? (
          <div className="flex items-center gap-2.5 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm font-semibold">
            <span className="text-lg">🛡️</span> Cuenta y Vivienda Verificadas Oficialmente
          </div>
        ) : (
          <div className="border border-amber-200 bg-amber-50/50 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-sm text-[#1a3c34] mb-1">Verificación Total (Pago Único)</p>
              <p className="text-xs text-[#6b7280]">Incluye verificación de identidad (KYC) y auditoría de tu vivienda.</p>
            </div>
            <button 
              onClick={() => setShowCheckout(true)}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-[#1a1a1a] font-bold text-xs rounded-xl shadow-sm transition-all shrink-0"
            >
              Verificar por $15 USD
            </button>
          </div>
        )}
      </div>

      {/* Modal de Checkout / Pago Simulado */}
      {showCheckout && (
        <div className="fixed inset-0 bg-[#1a3c34]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[#e8e4dc] max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-fraunces font-bold text-lg text-[#1a3c34]">Verificación Wellhouse</h3>
              <button onClick={() => setShowCheckout(false)} className="text-[#6b7280] hover:text-[#1a3c34] text-sm">✕</button>
            </div>

            <div className="bg-[#f8f7f4] rounded-2xl p-4 mb-6 border border-[#e8e4dc] space-y-3">
              <div className="flex justify-between text-sm text-[#1a3c34]">
                <span>Verificación de Identidad (KYC)</span>
                <span className="font-semibold">$10.00 USD</span>
              </div>
              <div className="flex justify-between text-sm text-[#1a3c34]">
                <span>Verificación de Propiedad / Casa</span>
                <span className="font-semibold">$5.00 USD</span>
              </div>
              <div className="h-px bg-[#e8e4dc]" />
              <div className="flex justify-between text-base font-bold text-[#1a3c34]">
                <span>Total a Pagar</span>
                <span className="text-amber-600">$15.00 USD</span>
              </div>
            </div>

            <p className="text-xs text-[#6b7280] mb-6 leading-relaxed">
              Al hacer clic en "Confirmar Pago", simularás el pago a través de nuestra pasarela de pagos. Al instante se verificará tu cuenta de usuario y tu propiedad.
            </p>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowCheckout(false)}
                className="flex-1 py-3 border border-[#e8e4dc] text-[#6b7280] rounded-xl text-xs font-bold hover:bg-[#f8f7f4] transition"
                disabled={paymentLoading}
              >
                Cancelar
              </button>
              <button 
                onClick={handlePaymentSuccess}
                className="flex-1 py-3 bg-[#1a3c34] hover:bg-[#2d6a4f] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
                disabled={paymentLoading}
              >
                {paymentLoading ? 'Procesando...' : 'Confirmar Pago'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── QUESTS TAB ──────────────────────────────────────────────────────────────
interface Quest {
  key: string
  title: string
  description: string
  reward: number
  status: 'completed' | 'in_progress'
}

function QuestsTab({ userId, onComplete }: { userId: string, onComplete: () => void }) {
  const [quests, setQuests] = useState<Quest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchQuests = async () => {
      const { data: userQuests } = await supabase
        .from('user_quests')
        .select('quest_key, status')
        .eq('user_id', userId)
      
      const completedKeys = (userQuests || [])
        .filter(q => q.status === 'completed')
        .map(q => q.quest_key)

      const defaultQuests: Quest[] = [
        {
          key: 'complete_profile',
          title: 'Completa tu Perfil',
          description: 'Añade tu nombre, biografía y foto (avatar) en la pestaña de Configuración.',
          reward: 50,
          status: completedKeys.includes('complete_profile') ? 'completed' : 'in_progress'
        },
        {
          key: 'list_property',
          title: 'Registra tu primera Vivienda',
          description: 'Añade tu casa o apartamento con fotos y detalles en "Mi Vivienda" o mediante el formulario de registro.',
          reward: 150,
          status: completedKeys.includes('list_property') ? 'completed' : 'in_progress'
        },
        {
          key: 'verify_identity',
          title: 'Verificación Total (Identidad y Casa)',
          description: 'Desbloquea el sello de verificación oficial realizando el pago único de verificación ($15 USD) en Configuración.',
          reward: 150,
          status: completedKeys.includes('verify_identity') ? 'completed' : 'in_progress'
        }
      ]

      setQuests(defaultQuests)
      setLoading(false)
    }
    fetchQuests()
  }, [userId])

  if (loading) return <div className="text-center py-10">Cargando retos...</div>

  return (
    <div className="bg-white rounded-2xl border border-[#e8e4dc] p-5">
      <h2 className="text-lg font-fraunces font-bold text-[#1a3c34] mb-1">Mis Retos de Bienvenida</h2>
      <p className="text-sm text-[#6b7280] mb-6">Completa estas tareas para recibir WellPoints extras y comenzar a intercambiar hogares.</p>
      
      <div className="space-y-4">
        {quests.map(quest => (
          <div key={quest.key} className={`border border-[#e8e4dc] rounded-2xl p-5 flex items-start gap-4 transition-all ${quest.status === 'completed' ? 'bg-emerald-50/50 border-emerald-200' : 'bg-white'}`}>
            <div className="shrink-0 mt-0.5">
              {quest.status === 'completed' ? (
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-sm">✓</div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#f0ede8] flex items-center justify-center text-[#cbd5cc] font-bold text-sm">⏳</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start gap-2 flex-wrap mb-1">
                <h3 className={`font-semibold text-sm ${quest.status === 'completed' ? 'text-emerald-900' : 'text-[#1a3c34]'}`}>
                  {quest.title}
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${quest.status === 'completed' ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  +{quest.reward} WP
                </span>
              </div>
              <p className="text-xs text-[#6b7280] leading-relaxed">
                {quest.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── STORIES TAB (Módulo Historias de YouTube Shorts) ────────────────────────
function StoriesTab({ property, userId }: { property: Property | null; userId: string }) {
  const [stories, setStories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const fetchStories = async () => {
    if (!property) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('host_stories')
        .select('*')
        .eq('property_id', property.id)
        .order('created_at', { ascending: false })
      if (data) setStories(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStories()
  }, [property])

  const handleAddStory = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!property) return

    const videoId = getYouTubeId(youtubeUrl)
    if (!videoId) {
      setError('Enlace de YouTube no válido. Debe ser un video normal o un Short.')
      return
    }

    setAdding(true)
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    const locationTags = `${property.city}, ${property.country}`

    try {
      const { error: insertError } = await supabase
        .from('host_stories')
        .insert({
          property_id: property.id,
          user_id: userId,
          youtube_url: youtubeUrl,
          youtube_video_id: videoId,
          thumbnail_url: thumbnailUrl,
          location_tags: locationTags
        })

      if (insertError) throw insertError

      setSuccess('¡Tu historia de YouTube Short ha sido publicada! Ahora aparecerá en la página de búsqueda.')
      setYoutubeUrl('')
      fetchStories()
    } catch (err: any) {
      setError('Error al guardar: ' + (err.message || err))
    } finally {
      setAdding(false)
    }
  }

  const handleDeleteStory = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta historia?')) return
    try {
      const { error } = await supabase
        .from('host_stories')
        .delete()
        .eq('id', id)
      if (error) throw error
      fetchStories()
    } catch (err: any) {
      alert('Error al eliminar: ' + err.message)
    }
  }

  if (!property) {
    return (
      <div className="bg-white rounded-2xl border border-[#e8e4dc] p-8 text-center">
        <div className="w-16 h-16 bg-[#f8f7f4] rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
          🏡
        </div>
        <h2 className="text-lg font-fraunces font-bold text-[#1a3c34] mb-2">Publica tu vivienda primero</h2>
        <p className="text-sm text-[#6b7280] max-w-sm mx-auto mb-6">
          Necesitas tener una vivienda registrada y publicada en la plataforma para poder subir historias de video y mostrárselas a los huéspedes.
        </p>
        <button
          onClick={() => window.location.href = '/properties/create'}
          className="px-5 py-2.5 bg-[#1a3c34] text-white font-semibold rounded-xl text-sm hover:bg-[#122b25] transition-colors"
        >
          Publicar mi Vivienda
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Explicación */}
      <div className="bg-white rounded-2xl border border-[#e8e4dc] p-5">
        <h2 className="text-lg font-fraunces font-bold text-[#1a3c34] mb-1">Historias de Anfitriones 🎥</h2>
        <p className="text-sm text-[#6b7280] mb-4">
          Muestra tu casa y las actividades de tu zona con videos cortos tipo Instagram. Solo necesitas subir tu video a YouTube (puede ser oculto si quieres privacidad) y pegar el enlace aquí. <strong>Nota importante: El video debe tener una duración máxima de 1 minuto</strong>.
        </p>

        {/* Formulario */}
        <form onSubmit={handleAddStory} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1a3c34] mb-1">
              Enlace de YouTube Short o Video (Máx. 1 minuto)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="Ej: https://www.youtube.com/shorts/ABC123xyz"
                className="flex-1 px-4 py-2.5 border border-[#cbd5cc] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c34] bg-[#f8f7f4]"
                required
              />
              <button
                type="submit"
                disabled={adding || !youtubeUrl}
                className="px-5 py-2.5 bg-[#1a3c34] hover:bg-[#122b25] disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-colors"
              >
                {adding ? 'Guardando...' : 'Publicar'}
              </button>
            </div>
            <p className="text-[10px] text-[#6b7280] mt-1.5 flex items-center gap-1">
              <span>ℹ️</span> Acepta formatos como `youtube.com/shorts/...`, `youtu.be/...`, o `youtube.com/watch?v=...`. Tu video se reproducirá automáticamente en la máxima resolución HD posible.
            </p>
          </div>

          {error && <p className="text-xs text-red-600 font-semibold">{error}</p>}
          {success && <p className="text-xs text-emerald-600 font-semibold">{success}</p>}
        </form>
      </div>

      {/* Grid de Historias Existentes */}
      <div className="bg-white rounded-2xl border border-[#e8e4dc] p-5">
        <h3 className="font-fraunces font-bold text-sm text-[#1a3c34] mb-4">Tus Historias Publicadas</h3>
        
        {loading ? (
          <p className="text-xs text-[#6b7280]">Cargando tus historias...</p>
        ) : stories.length === 0 ? (
          <div className="text-center py-10">
            <span className="text-3xl block mb-2">✨</span>
            <p className="text-xs text-[#6b7280]">Aún no tienes historias publicadas. ¡Crea la primera arriba!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {stories.map((story) => (
              <div key={story.id} className="group relative aspect-[9/16] rounded-xl overflow-hidden bg-black border border-[#e8e4dc] shadow-sm">
                <img
                  src={story.thumbnail_url}
                  alt="YouTube Thumbnail"
                  className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Overlay de Degradado */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                {/* Botón de Eliminar */}
                <button
                  onClick={() => handleDeleteStory(story.id)}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-600/90 text-white flex items-center justify-center hover:bg-red-700 transition-colors shadow-md text-xs font-bold"
                  title="Eliminar historia"
                >
                  ✕
                </button>

                {/* Info */}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <p className="text-[10px] font-bold text-amber-400 leading-none">Shorts</p>
                  <p className="text-xs font-semibold mt-1 truncate">{property.city}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
