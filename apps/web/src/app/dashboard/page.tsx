'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  LayoutDashboard, Home, Repeat, MessageCircle, Heart, Star,
  Settings, Coins, LogOut, Trash2, ChevronRight, Sparkles, MoreHorizontal,
  PlusCircle, Eye, Pencil, TrendingUp, CheckCircle2, Clock, XCircle, ArrowUpRight,
  Video, User, ShieldAlert, Trophy
} from 'lucide-react'
import PropertyCarousel from '@/components/PropertyCarousel'
import PropertyCard, { type PropertyCardData } from '@/components/PropertyCard'

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
  images?: string[]
  views?: number
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
function DashboardContent() {
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

    // Auto-complete login quest if not done
    try {
      const { data: questDone } = await supabase
        .from('user_quests')
        .select('quest_key')
        .eq('user_id', authUser.id)
        .eq('quest_key', 'login')
        .maybeSingle()
      
      if (!questDone) {
        await (supabase as any).rpc('complete_quest', {
          p_user_id: authUser.id,
          p_quest_key: 'login',
          p_reward_points: 50
        })
      }
    } catch (err) {
      console.error("Error auto-completing login quest:", err)
    }

    const memberSince = new Date(authUser.created_at)
      .toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })

    // WellPoints balance
    let userPoints = 0
    try {
      const { data } = await (supabase as any)
        .from('wellpoint_balances').select('current_balance')
        .eq('user_id', authUser.id).maybeSingle()
      if (data) userPoints = data.current_balance
    } catch { /* fallback */ }

    // Member level
    let userLevel = 'newcomer'
    try {
      const { data } = await (supabase as any)
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
        .select('name, bio, avatar_url, phone, is_verified, trust_index, role')
        .eq('id', authUser.id)
        .maybeSingle()
      
      if (!userData) {
        const name = authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Usuario'
        const defaultUser = {
          id: authUser.id, email: authUser.email || '',
          name, role: 'user', plan: 'free', status: 'active', trust_index: 0,
        }
        await (supabase as any).from('users').insert(defaultUser)
        meta = { name, bio: '', avatar_url: '', phone: '', is_verified: false, trust_index: 0 }
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
      .select('id, title, city, country, status, type, images, views')
      .eq('user_id', authUser.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    setProperty(propData || null)
    setLoadingProperty(false)
  }

  const searchParams = useSearchParams()

  useEffect(() => {
    fetchData()
  }, [router])

  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam) {
      setActiveTab(tabParam)
    } else {
      setActiveTab('overview')
    }
  }, [searchParams])

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
  ]
  const MORE_TABS = [
    { id: 'quests',     label: 'Mis Retos',      Icon: Sparkles },
    { id: 'stories',    label: 'Historias',      Icon: Video },
    { id: 'favorites',  label: 'Favoritos',      Icon: Heart },
    { id: 'reviews',    label: 'Reseñas',        Icon: Star },
    { id: 'settings',   label: 'Perfil',  Icon: User },
  ]
  const ALL_TABS = [...MAIN_TABS, ...MORE_TABS]

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-surface-mist flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-ink-teal-900 border-t-transparent rounded-full animate-spin" />
          <p className="text-ink-teal-900 font-semibold text-sm">Cargando tu panel…</p>
        </div>
      </div>
    )
  }

  const levelCfg = getLevelConfig(level)
  const levelIdx = LEVELS.findIndex(l => l.id === level)
  const nextLevel = LEVELS[levelIdx + 1]
  const exchangesDone = exchanges.filter(e => e.status === 'completed').length

  return (
    <div className="min-h-screen bg-surface-mist">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-24 md:pb-6">
        <div className="grid grid-cols-1 md:grid-cols-[80px_1fr] lg:grid-cols-[280px_1fr] gap-4 lg:gap-6 items-start">

          {/* ── Desktop Sidebar ───────────────────────────────────────────── */}
          <aside className="hidden md:flex flex-col sticky top-[57px] gap-3 w-full">

            {/* Nav (Módulo 2.1) */}
            <nav className="bg-white rounded-2xl border border-surface-mist-dark p-2">
              {ALL_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (tab.id === 'messages') router.push('/messages')
                    else setActiveTab(tab.id)
                  }}
                  className={`relative w-full flex items-center lg:justify-start justify-center gap-0 lg:gap-2.5 px-3 py-3 lg:py-2.5 rounded-xl text-left text-sm transition-colors mb-1 last:mb-0 ${
                    activeTab === tab.id
                      ? 'bg-ink-teal-900 text-white font-semibold shadow-sm'
                      : 'text-text-muted-custom hover:bg-surface-mist font-medium'
                  }`}
                  title={tab.label}
                >
                  <tab.Icon className="w-5 h-5 lg:w-4 lg:h-4 flex-shrink-0" />
                  <span className="hidden lg:inline-block">{tab.label}</span>
                  {tab.id === 'my-property' && !property && (
                    <>
                      <span className="hidden lg:inline-block ml-auto w-2 h-2 rounded-full bg-amber-400" />
                      <span className="lg:hidden absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-400" />
                    </>
                  )}
                </button>
              ))}
              {userMetadata?.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  className="relative w-full flex items-center lg:justify-start justify-center gap-0 lg:gap-2.5 px-3 py-3 lg:py-2.5 rounded-xl text-left text-sm transition-colors text-rose-600 hover:bg-rose-50 font-bold border border-dashed border-rose-200 mt-2"
                  title="Panel Administrador"
                >
                  <ShieldAlert className="w-5 h-5 lg:w-4 lg:h-4 flex-shrink-0" />
                  <span className="hidden lg:inline-block">Panel Administrador</span>
                </Link>
              )}
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
            {activeTab === 'favorites' && <FavoritesTab />}
            {activeTab === 'reviews' && <ReviewsTab hasProperty={!!property} />}
            {activeTab === 'settings' && (
              <SettingsTab userMetadata={userMetadata} userId={userId} onSave={fetchData} />
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0f766e]" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 relative">
      
      {/* ── Columna Izquierda (Métricas y Estado) ── */}
      <div className="lg:col-span-2 space-y-4 lg:space-y-6">
        
        {/* Dynamic Welcome Banner */}
        {bannerState === 'no-property' && (
          <div className="rounded-2xl p-5 text-white bg-gradient-to-br from-ink-teal-900 to-ink-teal-700 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-gray-300 text-xs font-medium mb-1">Bienvenido/a, {profile?.name?.split(' ')[0]}</p>
                <h2 className="text-lg font-fraunces font-bold mb-2">Registra tu primera vivienda</h2>
                <p className="text-gray-200 text-sm mb-4">
                  Para comenzar a intercambiar hogares con la comunidad Wellhouse necesitas registrar la tuya. Es gratis y tarda menos de 5 minutos.
                </p>
                <Link href="/properties/create"
                  className="inline-flex items-center gap-1.5 bg-white text-gray-900 px-4 py-2 rounded-xl font-semibold text-sm hover:bg-gray-100 transition-colors">
                  <PlusCircle className="w-4 h-4" /> Registrar mi vivienda
                </Link>
              </div>
              <Home className="w-16 h-16 text-white/20 flex-shrink-0" />
            </div>
          </div>
        )}

        {bannerState === 'draft' && (
          <div className="rounded-2xl p-5 text-white shadow-sm" style={{ background: 'linear-gradient(135deg, #374151 0%, #4b5563 100%)' }}>
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
          <div className="rounded-2xl p-5 text-white bg-gradient-to-br from-ink-teal-900 to-ink-teal-700 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-gray-300" />
                  <p className="text-gray-300 text-xs font-medium">Vivienda publicada y visible</p>
                </div>
                <h2 className="text-lg font-fraunces font-bold mb-2">{property?.title}</h2>
                <p className="text-gray-200 text-sm mb-4">{property?.city}, {property?.country}</p>
                <div className="flex items-center gap-2">
                  <Link href={`/properties/${property?.id}`}
                    className="inline-flex items-center gap-1.5 bg-white text-gray-900 px-4 py-2 rounded-xl font-semibold text-sm hover:bg-gray-100 transition-colors">
                    <Eye className="w-4 h-4" /> Ver como huésped
                  </Link>
                  <Link href="/properties/create"
                    className="inline-flex items-center gap-1.5 border border-white/30 text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-white/10 transition-colors">
                    <Pencil className="w-4 h-4" /> Editar
                  </Link>
                </div>
              </div>
              <TrendingUp className="w-12 h-12 text-white/20 flex-shrink-0 hidden sm:block" />
            </div>
          </div>
        )}

        {bannerState === 'pending' && (
          <div className="rounded-2xl p-5 border border-amber-200 bg-amber-50 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-amber-600" />
              <p className="text-amber-700 text-xs font-medium">En revisión</p>
            </div>
            <h2 className="text-base font-semibold text-amber-900 mb-1">{property?.title}</h2>
            <p className="text-amber-700 text-sm">Tu vivienda está siendo revisada. Te notificaremos cuando esté aprobada.</p>
          </div>
        )}

        {/* KPI Cards (3 columnas) */}
        <div className="grid grid-cols-3 gap-2 md:gap-4">
          <button onClick={() => onTabChange('wellpoints')}
            className="bg-white rounded-2xl border border-neutral-200 p-3 md:p-4 text-left shadow-sm hover:shadow-md hover:border-amber-200 transition-all flex flex-col justify-between group">
            <div className="w-full">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#6b7280] text-[10px] md:text-xs font-semibold">WellPoints</span>
                <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold text-[10px] flex-shrink-0">W</div>
              </div>
              <p className="text-xl md:text-3xl font-bold text-ink-teal-900 leading-none">{profile?.wellPoints ?? 0}</p>
              <p className="text-[9px] md:text-xs text-[#6b7280] mt-1 leading-tight">Puntos disponibles</p>
            </div>
            <div className="w-full mt-3 pt-2 border-t border-neutral-100 flex items-center justify-between text-[8px] md:text-xs font-bold text-[#0f766e] bg-surface-mist p-1.5 rounded-lg group-hover:bg-[#0f766e]/5 transition-colors">
              <span>Ver movimientos</span>
              <ChevronRight className="w-3 h-3 md:w-3.5 md:h-3.5" />
            </div>
          </button>

          <button onClick={() => onTabChange('exchanges')}
            className="bg-white rounded-2xl border border-neutral-200 p-3 md:p-4 text-left shadow-sm hover:shadow-md hover:border-[#0f766e]/30 transition-all flex flex-col justify-between group">
            <div className="w-full">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#6b7280] text-[10px] md:text-xs font-semibold">Intercambios</span>
                <Repeat className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              </div>
              <p className="text-xl md:text-3xl font-bold text-ink-teal-900 leading-none">{exchangesDone}</p>
              <p className="text-[9px] md:text-xs text-[#6b7280] mt-1 leading-tight">Total completados</p>
            </div>
            <div className="w-full mt-3 pt-2 border-t border-neutral-100 flex items-center justify-between text-[8px] md:text-xs font-bold text-[#0f766e] bg-surface-mist p-1.5 rounded-lg group-hover:bg-[#0f766e]/5 transition-colors">
              <span>Ver mis intercambios</span>
              <ChevronRight className="w-3 h-3 md:w-3.5 md:h-3.5" />
            </div>
          </button>

          <button onClick={() => onTabChange('my-property')}
            className="bg-white rounded-2xl border border-neutral-200 p-3 md:p-4 text-left shadow-sm hover:shadow-md hover:border-[#0f766e]/30 transition-all flex flex-col justify-between group">
            <div className="w-full">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#6b7280] text-[10px] md:text-xs font-semibold">Mi Vivienda</span>
                <Home className="w-4 h-4 text-gray-400 flex-shrink-0" />
              </div>
              {loadingProperty ? (
                <div className="h-6 bg-[#f0ede8] rounded animate-pulse" />
              ) : property ? (
                <>
                  <p className={`text-xs md:text-base font-bold truncate leading-none ${
                    property.status === 'published' ? 'text-blue-600' :
                    property.status === 'pending_review' ? 'text-amber-500' : 'text-[#6b7280]'
                  }`}>
                    {property.status === 'published' ? 'Publicada' :
                     property.status === 'pending_review' ? 'En revisión' : 'Borrador'}
                  </p>
                  <p className="text-[9px] md:text-xs text-[#6b7280] mt-1 leading-tight truncate">{property.city}</p>
                </>
              ) : (
                <>
                  <p className="text-xs md:text-base font-bold text-amber-500 leading-none">Sin registrar</p>
                  <p className="text-[9px] md:text-xs text-[#6b7280] mt-1 leading-tight">Toca para registrar</p>
                </>
              )}
            </div>
            <div className="w-full mt-3 pt-2 border-t border-neutral-100 flex items-center justify-between text-[8px] md:text-xs font-bold text-[#0f766e] bg-surface-mist p-1.5 rounded-lg group-hover:bg-[#0f766e]/5 transition-colors">
              <span>Ver vivienda</span>
              <ChevronRight className="w-3 h-3 md:w-3.5 md:h-3.5" />
            </div>
          </button>
        </div>

        {/* Gamification Progress */}
        {nextLevel && (
          <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none" style={{ background: `radial-gradient(circle, ${levelCfg.color} 0%, transparent 70%)` }} />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4" style={{ color: levelCfg.color }} />
                  <span className="text-sm font-bold text-ink-teal-900">Nivel Actual: {levelCfg.label}</span>
                </div>
                <p className="text-xs text-text-muted-custom mb-3">
                  {nextLevel.minExchanges - exchangesDone > 0
                    ? `¡A solo ${nextLevel.minExchanges - exchangesDone} intercambios de ser ${nextLevel.label}!`
                    : `¡Listo para subir a ${nextLevel.label}!`}
                </p>
                <div className="w-full h-2.5 bg-neutral-100 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(100, (exchangesDone / nextLevel.minExchanges) * 100)}%`,
                      background: `linear-gradient(90deg, ${levelCfg.color}, ${nextLevel.color})`,
                    }}
                  />
                </div>
              </div>
              <div className="hidden sm:block border-l border-neutral-200 pl-6 text-center shrink-0">
                <div className="text-3xl font-fraunces font-bold text-ink-teal-900 leading-none">{exchangesDone}<span className="text-lg text-text-muted-custom">/{nextLevel.minExchanges}</span></div>
                <div className="text-[10px] uppercase font-bold text-text-muted-custom mt-1">Intercambios</div>
              </div>
            </div>
          </div>
        )}

        {/* Discover Carousel */}
        <DiscoverCarousel />

      </div>

      {/* ── Columna Derecha (Próximos Pasos & Accesos Rápidos) ── */}
      <div className="lg:col-span-1 space-y-4 lg:space-y-6">
        
        {/* Next Step Card */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <ArrowUpRight className="w-4 h-4 text-accent-mango" />
            <h3 className="text-sm font-bold text-ink-teal-900 font-fraunces">Tu siguiente paso</h3>
          </div>
          <div className="mt-3">
            {bannerState === 'no-property' && (
              <p className="text-xs text-text-muted-custom mb-4 leading-relaxed">Aún no eres anfitrión. ¡Registra tu vivienda ahora mismo y gana tus primeros 50 WellPoints!</p>
            )}
            {bannerState === 'draft' && (
              <p className="text-xs text-text-muted-custom mb-4 leading-relaxed">Tienes un borrador pendiente de tu vivienda. Publícalo para unirte a la comunidad activa.</p>
            )}
            {bannerState === 'published' && exchangesDone === 0 && (
              <p className="text-xs text-text-muted-custom mb-4 leading-relaxed">Tu vivienda ya está visible. ¡El siguiente paso es solicitar tu primer intercambio para comenzar a viajar!</p>
            )}
            {bannerState === 'published' && exchangesDone > 0 && (
              <p className="text-xs text-text-muted-custom mb-4 leading-relaxed">Sigue acumulando intercambios excelentes y reseñas positivas para desbloquear el estatus de Superanfitrión.</p>
            )}
            {bannerState === 'pending' && (
              <p className="text-xs text-text-muted-custom mb-4 leading-relaxed">Estamos revisando tu vivienda. Mientras tanto, puedes explorar lugares a los que te gustaría ir.</p>
            )}
            
            <Link 
              href={bannerState === 'no-property' || bannerState === 'draft' ? '/properties/create' : '/'}
              className="w-full block text-center bg-[#f0fdfa] text-[#0f766e] border border-[#2dd4bf]/20 py-2.5 rounded-xl text-xs font-bold hover:bg-[#0f766e]/10 transition-colors"
            >
              {bannerState === 'no-property' ? 'Registrar vivienda' :
               bannerState === 'draft' ? 'Continuar registro' :
               'Explorar viviendas'}
            </Link>
          </div>
        </div>

        {/* Accesos rápidos (Swipeable on mobile) */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-ink-teal-900 mb-4 font-fraunces">Accesos rápidos</h3>
          <div 
            className="flex overflow-x-auto lg:grid lg:grid-cols-2 gap-3 pb-2 lg:pb-0 snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <style>{`.snap-x::-webkit-scrollbar { display: none; }`}</style>
            
            <Link href="/rankings" className="min-w-[100px] snap-center bg-surface-mist rounded-xl border border-neutral-200 p-3 flex flex-col items-center justify-center gap-2 hover:bg-neutral-100 transition-colors text-center group">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Trophy className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-ink-teal-900 leading-tight">Líderes</span>
            </Link>
            
            <button onClick={() => onTabChange('quests')} className="min-w-[100px] snap-center bg-surface-mist rounded-xl border border-neutral-200 p-3 flex flex-col items-center justify-center gap-2 hover:bg-neutral-100 transition-colors text-center group">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-ink-teal-900 leading-tight">Mis retos</span>
            </button>
            
            <button onClick={() => onTabChange('favorites')} className="min-w-[100px] snap-center bg-surface-mist rounded-xl border border-neutral-200 p-3 flex flex-col items-center justify-center gap-2 hover:bg-neutral-100 transition-colors text-center group">
              <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Heart className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-ink-teal-900 leading-tight">Favoritos</span>
            </button>
            
            <button onClick={() => onTabChange('stories')} className="min-w-[100px] snap-center bg-surface-mist rounded-xl border border-neutral-200 p-3 flex flex-col items-center justify-center gap-2 hover:bg-neutral-100 transition-colors text-center group">
              <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Video className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-ink-teal-900 leading-tight">Historias</span>
            </button>
          </div>
        </div>

        {/* WellPoints Historial */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-ink-teal-900 font-fraunces flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-500" /> Movimientos
            </h3>
            <button onClick={() => onTabChange('wellpoints')} className="text-[10px] font-bold text-[#0f766e] bg-[#0f766e]/10 px-2 py-1 rounded-full hover:bg-[#0f766e]/20 transition-colors">
              Ver todos
            </button>
          </div>
          
          <div className="space-y-3">
            {transactions.length > 0 ? (
              transactions.slice(0, 4).map((tx) => (
                <div key={tx.id} className="flex justify-between items-center text-xs pb-3 border-b border-neutral-100 last:border-0 last:pb-0">
                  <div>
                    <p className="text-ink-teal-900 font-medium text-[11px] leading-tight truncate max-w-[150px]">{tx.description || 'Puntos'}</p>
                    <p className="text-[9px] text-text-muted-custom mt-0.5">
                      {new Date(tx.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  <span className={`font-bold text-xs bg-surface-mist px-2 py-1 rounded-lg ${tx.amount > 0 ? 'text-blue-600' : 'text-red-500'}`}>
                    {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-6 bg-surface-mist rounded-xl">
                <p className="text-xs text-text-muted-custom">Aún no hay movimientos.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile Sticky CTA (Comprar WellPoints) ── */}
      <div className="lg:hidden fixed bottom-[72px] md:bottom-[76px] left-0 right-0 z-50 p-4 pointer-events-none flex justify-end">
        <button 
          onClick={() => onTabChange('wellpoints')} 
          className="pointer-events-auto bg-[#0f766e] text-white px-5 py-3.5 rounded-full shadow-lg shadow-[#0f766e]/20 font-inter font-bold text-sm flex items-center gap-2 hover:bg-[#0f766e]/90 transition-all active:scale-95 border-2 border-white"
        >
          <Coins className="w-4 h-4 text-amber-300" />
          Comprar WP
        </button>
      </div>

    </div>
  )
}

// ─── DISCOVER CAROUSEL ────────────────────────────────────────────────────────
function DiscoverCarousel() {
  const [props, setProps] = useState<PropertyCardData[]>([])

  useEffect(() => {
    async function loadProps() {
      const { data } = await supabase
        .from('properties')
        .select('id, title, city, country, type, bedrooms, bathrooms, capacity, images')
        .eq('status', 'published').limit(8)
      if (data?.length) {
        setProps(data.map((p: any, i) => ({
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
    }
    loadProps()
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
    welcome_bonus:      <Sparkles className="w-4 h-4 text-amber-400" />,
    WELCOME_BONUS:      <Sparkles className="w-4 h-4 text-amber-400" />,
    hosting_earned:     <Home className="w-4 h-4 text-blue-500" />,
    exchange_spent:     <Repeat className="w-4 h-4 text-blue-500" />,
    profile_completion: <CheckCircle2 className="w-4 h-4 text-purple-500" />,
    quest_completed:    <CheckCircle2 className="w-4 h-4 text-purple-500" />,
    RETO_COMPLETADO:    <CheckCircle2 className="w-4 h-4 text-purple-500" />,
  }

  return (
    <div className="space-y-4">
      {/* Balance card */}
      <div className="bg-white rounded-2xl border border-surface-mist-dark p-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center">
            <Coins className="w-7 h-7 text-amber-500" />
          </div>
          <div>
            <p className="text-xs text-[#6b7280] font-medium mb-0.5">Saldo disponible (Billetera)</p>
            <p className="text-4xl font-bold text-ink-teal-900">{profile?.wellPoints ?? 0}</p>
            <p className="text-xs text-[#6b7280]">WellPoints</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-[#f0ede8] flex gap-2">
          <Link href="/rankings"
            className="flex-1 text-center py-2 bg-ink-teal-900 text-white rounded-xl text-sm font-semibold hover:opacity-80 transition-opacity flex items-center justify-center gap-1.5">
            <TrendingUp className="w-4 h-4" /> Ver Tabla de Líderes
          </Link>
          <Link href="/search"
            className="flex-1 text-center py-2 border border-surface-mist-dark text-ink-teal-900 rounded-xl text-sm font-semibold hover:bg-surface-mist transition-colors">
            Usar en intercambio
          </Link>
        </div>
      </div>

      {/* Ledger */}
      <div className="bg-white rounded-2xl border border-surface-mist-dark p-5">
        <h2 className="text-sm font-semibold text-ink-teal-900 mb-4">Historial de transacciones</h2>
        {transactions.length > 0 ? (
          <div className="divide-y divide-[#f0ede8]">
            {transactions.map((tx) => (
              <div key={tx.id} className="py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-surface-mist border border-surface-mist-dark flex items-center justify-center flex-shrink-0">
                  {TX_ICONS[tx.type] ?? <Coins className="w-4 h-4 text-[#6b7280]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink-teal-900 truncate">{tx.description || 'Movimiento de puntos'}</p>
                  <p className="text-xs text-[#6b7280]">
                    {new Date(tx.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                    {' · '}{tx.type === 'welcome_bonus' ? 'Bonus bienvenida' : tx.type === 'hosting_earned' ? 'Por hospitalidad' : tx.type === 'exchange_spent' ? 'Intercambio' : tx.type}
                  </p>
                </div>
                <span className={`font-bold text-sm flex-shrink-0 ${tx.amount > 0 ? 'text-blue-600' : 'text-red-500'}`}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount} WP
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 border-2 border-dashed border-surface-mist-dark rounded-xl">
            <Coins className="w-10 h-10 mx-auto mb-3 text-[#cbd5cc]" />
            <p className="text-sm font-semibold text-ink-teal-900 mb-1">Sin transacciones aún</p>
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
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const [stats, setStats] = useState({
    views: property?.views || 0,
    consultas: 0,
    exchanges: 0,
    rating: '—'
  })

  useEffect(() => {
    if (!property) return
    const fetchStats = async () => {
      // 1. Fetch consultations (property_questions)
      const { count: qCount } = await supabase
        .from('property_questions')
        .select('*', { count: 'exact', head: true })
        .eq('property_id', property.id)

      // 2. Fetch exchanges
      const { count: eCount } = await supabase
        .from('exchanges')
        .select('*', { count: 'exact', head: true })
        .eq('host_property_id', property.id)

      // 3. Fetch reviews
      const { data: revs } = await supabase
        .from('reviews')
        .select('rating')
        .eq('property_id', property.id)

      let ratingStr = '—'
      if (revs && revs.length > 0) {
        const avg = revs.reduce((acc, curr: any) => acc + (curr.rating || 0), 0) / revs.length
        ratingStr = avg.toFixed(1)
      }

      setStats({
        views: property.views || 0,
        consultas: qCount || 0,
        exchanges: eCount || 0,
        rating: ratingStr
      })
    }
    fetchStats()
  }, [property])

  const handleDelete = async () => {
    if (!property) return
    const confirmed = window.confirm('¿Estás seguro de que deseas eliminar tu vivienda? Esta acción no se puede deshacer y borrará permanentemente todos los datos asociados a ella.')
    if (!confirmed) return

    setIsDeleting(true)
    try {
      const { error } = await (supabase as any).from('properties').delete().eq('id', property.id)
      if (error) throw error
      alert('Vivienda eliminada exitosamente.')
      window.location.reload()
    } catch (err: any) {
      console.error(err)
      alert('Error al eliminar la vivienda: ' + err.message)
    } finally {
      setIsDeleting(false)
    }
  }

  if (loadingProperty) {
    return (
      <div className="bg-white rounded-2xl border border-surface-mist-dark p-6 space-y-3">
        <div className="h-5 bg-[#f0ede8] rounded w-1/3 animate-pulse" />
        <div className="h-4 bg-[#f0ede8] rounded w-2/3 animate-pulse" />
        <div className="h-4 bg-[#f0ede8] rounded w-1/2 animate-pulse" />
      </div>
    )
  }

  if (!property) {
    return (
      <div className="bg-white rounded-2xl border border-surface-mist-dark p-6">
        <h2 className="text-base font-semibold text-ink-teal-900 mb-5">Mi Vivienda</h2>
        <div className="text-center py-12 border-2 border-dashed border-surface-mist-dark rounded-2xl">
          <div className="w-16 h-16 rounded-2xl bg-[#f0ede8] flex items-center justify-center mx-auto mb-4">
            <Home className="w-8 h-8 text-[#cbd5cc]" />
          </div>
          <h3 className="text-base font-bold text-ink-teal-900 mb-2">Registra tu vivienda</h3>
          <p className="text-sm text-[#6b7280] mb-1 max-w-sm mx-auto">
            Para participar en la comunidad Wellhouse, primero debes registrar tu vivienda.
          </p>
          <p className="text-xs text-[#6b7280] mb-6 max-w-sm mx-auto">
            Es gratis, tarda unos minutos y te permite intercambiar con miles de hogares.
          </p>
          <Link href="/properties/create"
            className="inline-flex items-center gap-2 bg-ink-teal-900 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#2d6a4f] transition-colors">
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
    <div className="bg-white rounded-2xl border border-surface-mist-dark p-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold text-ink-teal-900">Mi Vivienda</h2>
        <Link href="/properties/create"
          className="flex items-center gap-1.5 text-xs font-semibold text-ink-teal-900 border border-surface-mist-dark px-3 py-1.5 rounded-lg hover:bg-surface-mist transition-colors">
          <Pencil className="w-3.5 h-3.5" /> Editar
        </Link>
      </div>

      <div className="bg-surface-mist rounded-xl p-4 mb-4">
        <h3 className="font-semibold text-ink-teal-900">{property.title}</h3>
        <p className="text-sm text-[#6b7280] mt-1">{property.city}, {property.country} · {property.type}</p>
        <div className="flex items-center gap-1.5 mt-3 w-fit px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{ color: s.color, background: s.bg }}>
          <s.Icon className="w-3.5 h-3.5" />
          {s.label}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Vistas', value: stats.views },
          { label: 'Consultas', value: stats.consultas },
          { label: 'Intercambios', value: stats.exchanges },
          { label: 'Rating', value: stats.rating },
        ].map((stat) => (
          <div key={stat.label} className="text-center p-3 bg-surface-mist rounded-xl">
            <p className="text-2xl font-bold text-ink-teal-900">{stat.value}</p>
            <p className="text-xs text-[#6b7280] mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <Link href={`/properties/${property.id}`}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-surface-mist-dark rounded-xl text-sm font-semibold text-ink-teal-900 hover:bg-surface-mist transition-colors">
          <Eye className="w-4 h-4" /> Ver como huésped
        </Link>
        <button onClick={handleDelete} disabled={isDeleting}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 border border-red-200 bg-red-50 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors disabled:opacity-50">
          <Trash2 className="w-4 h-4" /> {isDeleting ? 'Eliminando...' : 'Eliminar'}
        </button>
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
    const { data } = await (supabase as any).from('exchanges').select('*')
      .or(`host_id.eq.${userId},guest_id.eq.${userId}`)
      .order('created_at', { ascending: false })
    setList(data || [])
    setActionLoading(null)
  }

  if (list.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-surface-mist-dark p-6">
        <h2 className="text-base font-semibold text-ink-teal-900 mb-5">Intercambios</h2>
        <div className="text-center py-12 border-2 border-dashed border-surface-mist-dark rounded-2xl">
          <div className="w-16 h-16 rounded-2xl bg-[#f0ede8] flex items-center justify-center mx-auto mb-4">
            <Repeat className="w-8 h-8 text-[#cbd5cc]" />
          </div>
          <h3 className="text-base font-bold text-ink-teal-900 mb-2">Sin intercambios aún</h3>
          <p className="text-sm text-[#6b7280] mb-6 max-w-sm mx-auto">
            {hasProperty ? 'Busca viviendas y solicita tu primer intercambio con WellPoints.' : 'Primero registra tu vivienda para poder intercambiar.'}
          </p>
          {hasProperty ? (
            <Link href="/search" className="inline-flex items-center gap-2 bg-ink-teal-900 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#2d6a4f] transition-colors">
              Buscar viviendas
            </Link>
          ) : (
            <Link href="/properties/create" className="inline-flex items-center gap-2 bg-ink-teal-900 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#2d6a4f] transition-colors">
              Registrar mi vivienda
            </Link>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-surface-mist-dark p-5">
      <h2 className="text-base font-semibold text-ink-teal-900 mb-4">Intercambios</h2>
      <div className="space-y-3">
        {list.map((ex) => {
          const isHost = ex.host_id === userId
          const s = STATUS_CFG[ex.status] ?? { label: ex.status, color: '#374151', bg: '#f9fafb', Icon: Clock }
          const busy = actionLoading?.startsWith(ex.id)
          return (
            <div key={ex.id} className="border border-surface-mist-dark rounded-xl p-4">
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
                  <p className="text-sm text-ink-teal-900 font-medium">
                    {new Date(ex.checkin_date).toLocaleDateString('es-ES')} → {new Date(ex.checkout_date).toLocaleDateString('es-ES')}
                    {' · '}<strong>{ex.nights} noches</strong>
                  </p>
                  <p className="text-xs text-[#6b7280] mt-0.5">
                    WellRank: {ex.wellrank_snapshot} WP/noche = {ex.wellrank_snapshot * ex.nights} WP totales
                  </p>
                  <div className="mt-2">
                    <Link href={`/users/${isHost ? ex.guest_id : ex.host_id}`}
                      className="text-xs font-semibold text-blue-700 hover:text-blue-800 underline">
                      Ver Perfil del {isHost ? 'Huésped' : 'Anfitrión'}
                    </Link>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 shrink-0">
                  {isHost && ex.status === 'pending' && (
                    <button onClick={() => callAction(ex.id, 'confirm')} disabled={!!busy}
                      className="px-3 py-1.5 bg-ink-teal-900 text-white text-xs rounded-lg font-semibold hover:bg-[#2d6a4f] disabled:opacity-50">
                      {busy ? '…' : 'Confirmar'}
                    </button>
                  )}
                  {isHost && ex.status === 'confirmed' && (
                    <button onClick={() => callAction(ex.id, 'finalize')} disabled={!!busy}
                      className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50">
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


// ─── FAVORITES TAB (Módulo 3.5) ────────────────────────────────────────────────
function FavoritesTab() {
  const [favorites, setFavorites] = useState<PropertyCardData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadFavs() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        
        const { data, error } = await supabase
          .from('favorites')
          .select('property_id, properties(id, title, city, country, type, bedrooms, bathrooms, capacity, images, wellrank, users(avatar_url))')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) throw error

        if (data) {
          const formatted = data.map((fav: any) => {
            const p = fav.properties
            return {
              id: p.id,
              title: p.title,
              location: `${p.city || '—'}, ${p.country || '—'}`,
              type: p.type || 'Vivienda',
              bedrooms: p.bedrooms || 1,
              bathrooms: p.bathrooms || 1,
              capacity: p.capacity || 2,
              rating: 0,
              reviews: 0,
              image: p.images?.[0] || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
              verified: false,
              isMock: false,
              wellRank: p.wellrank || 30,
              host_avatar: p.users?.avatar_url,
              isFavorite: true
            }
          })
          // Filter out any null properties in case of broken relations
          setFavorites(formatted.filter(p => p.id))
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadFavs()
  }, [])

  return (
    <div className="bg-white rounded-2xl border border-surface-mist-dark p-6">
      <h2 className="text-base font-semibold text-ink-teal-900 mb-5">Favoritos</h2>
      
      {loading ? (
        <div className="text-center py-12">
          <p className="text-sm text-text-muted-custom">Cargando tus favoritos...</p>
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-surface-mist-dark rounded-2xl">
          <div className="w-16 h-16 rounded-2xl bg-[#f0ede8] flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-[#cbd5cc]" />
          </div>
          <h3 className="text-base font-bold text-ink-teal-900 mb-2">Sin viviendas guardadas</h3>
          <p className="text-sm text-[#6b7280] mb-6 max-w-xs mx-auto">
            Cuando guardes una vivienda tocando el corazón en el explorador, aparecerá aquí.
          </p>
          <Link href="/search"
            className="inline-flex items-center gap-2 bg-ink-teal-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#2d6a4f] transition-colors">
            Explorar viviendas <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map(prop => (
            <PropertyCard key={prop.id} property={prop} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── REVIEWS TAB (Módulo 3.6) — dos pestañas ──────────────────────────────────
function ReviewsTab({ hasProperty }: { hasProperty: boolean }) {
  const [tab, setTab] = useState<'written' | 'received'>('written')

  return (
    <div className="bg-white rounded-2xl border border-surface-mist-dark p-5">
      <h2 className="text-base font-semibold text-ink-teal-900 mb-4">Reseñas</h2>

      {/* Two-tab switcher */}
      <div className="flex bg-surface-mist rounded-xl p-1 mb-5">
        <button onClick={() => setTab('written')}
          className={`flex-1 text-xs font-semibold py-2 rounded-lg transition-colors ${tab === 'written' ? 'bg-white text-ink-teal-900 shadow-sm' : 'text-[#6b7280]'}`}>
          Reseñas que escribí
        </button>
        {hasProperty && (
          <button onClick={() => setTab('received')}
            className={`flex-1 text-xs font-semibold py-2 rounded-lg transition-colors ${tab === 'received' ? 'bg-white text-ink-teal-900 shadow-sm' : 'text-[#6b7280]'}`}>
            Sobre mi vivienda
          </button>
        )}
      </div>

      <div className="text-center py-10 border-2 border-dashed border-surface-mist-dark rounded-2xl">
        <div className="w-16 h-16 rounded-2xl bg-[#f0ede8] flex items-center justify-center mx-auto mb-4">
          <Star className="w-8 h-8 text-[#cbd5cc]" />
        </div>
        {tab === 'written' ? (
          <>
            <h3 className="text-base font-bold text-ink-teal-900 mb-2">Sin reseñas escritas</h3>
            <p className="text-sm text-[#6b7280] max-w-xs mx-auto">
              Podrás dejar una reseña después de completar tu primer intercambio como huésped.
            </p>
          </>
        ) : (
          <>
            <h3 className="text-base font-bold text-ink-teal-900 mb-2">Sin reseñas recibidas</h3>
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
  const [languages, setLanguages] = useState<string>((userMetadata?.languages || []).join(', '))
  const [phone, setPhone] = useState(userMetadata?.phone || '')
  const [avatarUrl, setAvatarUrl] = useState(userMetadata?.avatar_url || '')
  const [isVerified, setIsVerified] = useState(userMetadata?.is_verified || false)
  const [trustIndex, setTrustIndex] = useState(userMetadata?.trust_index || 0) // New trust index
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [showCheckout, setShowCheckout] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)

    const [uploadingAvatar, setUploadingAvatar] = useState(false)
    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || e.target.files.length === 0) return
      const file = e.target.files[0]
      setUploadingAvatar(true)
      setMessage(null)
      try {
        const fileExt = file.name.split('.').pop()
        const filePath = `${userId}-${Math.random()}.${fileExt}`
  
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, file)
  
        if (uploadError) throw uploadError
  
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath)
  
        setAvatarUrl(publicUrl)
        setMessage('Foto cargada, recuerda hacer clic en Guardar cambios.')
      } catch (err: any) {
        setMessage('Error al subir foto: ' + err.message)
      } finally {
        setUploadingAvatar(false)
      }
    }


  const handleSave = async () => {
    if ((bio || '').trim().length < 100) {
      setMessage('Error: Tu presentación fraternal debe tener al menos 100 caracteres para transmitir confianza a la comunidad.')
      return
    }
    setSaving(true)
    setMessage(null)
    try {
      const { error: updateErr } = await (supabase as any)
        .from('users')
        .update({ 
          name, 
          bio, 
          languages: languages.split(',').map(l => l.trim()).filter(Boolean),
          phone, 
          avatar_url: avatarUrl 
        })
        .eq('id', userId)
      
      if (updateErr) throw updateErr
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
      const { error } = await (supabase as any)
        .from('users')
        .update({ is_verified: true, trust_index: 3 })
        .eq('id', userId)
      
      if (error) throw error

      // Call the RPC to give points
      await (supabase as any).rpc('complete_quest', {
        p_user_id: userId,
        p_quest_key: 'verify_identity',
        p_reward_points: 150
      })

      setIsVerified(true)
      setTrustIndex(3)
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
      <div className="bg-white rounded-2xl border border-surface-mist-dark p-6">
        <h2 className="text-base font-semibold text-ink-teal-900 mb-5">Perfil de Confianza</h2>
        {message && (
          <div className={`mb-4 p-3 rounded-xl text-xs font-medium ${message.includes('Error') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
            {message}
          </div>
        )}
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-medium text-text-muted-custom mb-1.5">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 border border-surface-mist-dark rounded-xl text-sm text-ink-teal-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#1a3c34]/20 focus:border-ink-teal-900 transition"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-muted-custom mb-1.5">Presentación Fraternal (Biografía)</label>
            <p className="text-[11px] text-[#6b7280] mb-2 leading-relaxed">
              Preséntate fraternalmente: comparte tu profesión, pasatiempos, cómo viajas y qué te motiva de esta comunidad. Esto aumentará la confianza para futuros intercambios.
            </p>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              placeholder="Hola, soy Camilo. Trabajo como arquitecto y me apasiona la fotografía. Viajo frecuentemente con mi familia y nuestro perro, buscando siempre conectar con la cultura local. Me emociona ser parte de la comunidad Wellhouse porque creo firmemente en la confianza mutua y en compartir experiencias auténticas. Prometo cuidar tu casa como si fuera la mía, y espero que tú también disfrutes de nuestro hogar."
              className="w-full px-4 py-2.5 border border-surface-mist-dark rounded-xl text-sm text-ink-teal-900 bg-white focus:outline-none focus:ring-2 focus:ring-ink-teal-900/20 focus:border-ink-teal-900 transition resize-none"
            />
            <div className="flex justify-between items-center mt-1">
              <span className="text-[10px] text-[#6b7280]">
                Mínimo 100 caracteres para inspirar confianza
              </span>
              <span className={`text-[10px] font-bold ${(bio || '').length < 100 ? 'text-red-500' : 'text-blue-600'}`}>
                {(bio || '').length} caracteres
              </span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-muted-custom mb-1.5">Idiomas que hablas</label>
            <input
              type="text"
              value={languages}
              onChange={(e) => setLanguages(e.target.value)}
              placeholder="Ej: Español, Inglés, Francés"
              className="w-full px-4 py-2.5 border border-surface-mist-dark rounded-xl text-sm text-ink-teal-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#1a3c34]/20 focus:border-ink-teal-900 transition"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-muted-custom mb-1.5">Teléfono de contacto</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+57 300 123 4567"
              className="w-full px-4 py-2.5 border border-surface-mist-dark rounded-xl text-sm text-ink-teal-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#1a3c34]/20 focus:border-ink-teal-900 transition"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-muted-custom mb-1.5">Foto de perfil</label>
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden bg-surface-mist-dark flex-shrink-0 group border border-surface-mist-dark">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-muted-custom bg-surface-mist-dark font-bold text-xl">
                      {name ? name.charAt(0).toUpperCase() : '?'}
                    </div>
                  )}
                  <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity">
                    <span className="text-[9px] font-bold text-white uppercase text-center leading-tight">
                      {uploadingAvatar ? '...' : <>Subir<br/>Foto</>}
                    </span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
                  </label>
                </div>
                <div className="text-xs text-text-muted-custom">
                  Haz clic en el círculo para subir una foto real desde tu galería.<br/>
                  <span className="text-[10px] text-[#6b7280]">Una foto donde se te vea la cara con buena luz genera más confianza que un logo o una foto de paisaje — los perfiles con foto real reciben más solicitudes de intercambio.</span>
                </div>
              </div>
          </div>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-ink-teal-900 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#2d6a4f] transition-colors disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>

      {/* Sección Verificación e Índice de Confianza */}
      <div className="bg-white rounded-2xl border border-surface-mist-dark p-6">
        <h2 className="text-base font-semibold text-ink-teal-900 mb-1">Tu Nivel de Confianza</h2>
        <p className="text-xs text-[#6b7280] mb-5 leading-relaxed">
          La confianza se construye con evidencia. Aquí puedes ver tu estado actual y cómo te verán otros usuarios.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="p-4 bg-surface-mist rounded-xl border border-surface-mist-dark">
            <h3 className="text-sm font-bold text-ink-teal-900 mb-3">Índice de Confianza</h3>
            <div className="flex items-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((dot) => (
                <div key={dot} className={`w-3 h-3 rounded-full ${isVerified && trustIndex > 0 && dot <= trustIndex ? 'bg-ink-teal-700' : (isVerified && trustIndex > 0 ? 'bg-gray-200' : 'bg-gray-200 border border-gray-300')}`} />
              ))}
            </div>
            <p className="text-[11px] text-[#6b7280] font-medium">
              {isVerified && trustIndex > 0 ? `Nivel ${trustIndex} de 5` : 'Miembro nuevo — aún sin historial de intercambios'}
            </p>
          </div>

          <div className="p-4 bg-surface-mist rounded-xl border border-surface-mist-dark">
            <h3 className="text-sm font-bold text-ink-teal-900 mb-3">Verificaciones Activas</h3>
            <ul className="space-y-2 text-xs text-ink-teal-900 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-ink-teal-700" /> Correo verificado
              </li>
              <li className="flex items-center gap-2">
                {phone ? <CheckCircle2 className="w-4 h-4 text-ink-teal-700" /> : <div className="w-4 h-4 rounded-full border border-gray-400" />} 
                {phone ? 'Teléfono verificado (no se muestra al público)' : 'Teléfono pendiente'}
              </li>
              <li className="flex items-center gap-2">
                {isVerified ? <CheckCircle2 className="w-4 h-4 text-ink-teal-700" /> : <div className="w-4 h-4 rounded-full border border-gray-400" />} 
                {isVerified ? 'Identidad verificada' : 'Identidad pendiente'}
              </li>
            </ul>
          </div>
        </div>

        {isVerified ? (
          <div className="flex items-center gap-2.5 p-4 bg-[#f0ede8] border border-[#d6d3d1] rounded-xl text-ink-teal-900 text-sm font-semibold">
            <CheckCircle2 className="w-5 h-5 text-ink-teal-700 inline-block shrink-0" /> 
            <div>
              <p>Cuenta Verificada Oficialmente</p>
              <p className="text-[11px] text-[#6b7280] font-normal mt-0.5">Tu perfil destaca como confiable para toda la comunidad.</p>
            </div>
          </div>
        ) : (
          <div className="border border-amber-200 bg-amber-50/50 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-sm text-ink-teal-900 mb-1">Verificación Oficial Wellhouse</p>
              <p className="text-xs text-[#6b7280] max-w-md leading-relaxed">Incluye verificación de identidad (KYC) y auditoría de tu vivienda. Desbloquea tu Índice de Confianza y gana 150 WP al instante.</p>
            </div>
            <button 
              onClick={() => setShowCheckout(true)}
              className="px-5 py-2.5 bg-ink-teal-900 hover:bg-ink-teal-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all shrink-0"
            >
              Verificar por $15 USD
            </button>
          </div>
        )}
      </div>

      {/* Modal de Checkout / Pago Simulado */}
      {showCheckout && (
        <div className="fixed inset-0 bg-ink-teal-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-surface-mist-dark max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-fraunces font-bold text-lg text-ink-teal-900">Verificación Wellhouse</h3>
              <button onClick={() => setShowCheckout(false)} className="text-[#6b7280] hover:text-ink-teal-900 text-sm">✕</button>
            </div>

            <div className="bg-surface-mist rounded-2xl p-4 mb-6 border border-surface-mist-dark space-y-3">
              <div className="flex justify-between text-sm text-ink-teal-900">
                <span>Verificación de Identidad (KYC)</span>
                <span className="font-semibold">$10.00 USD</span>
              </div>
              <div className="flex justify-between text-sm text-ink-teal-900">
                <span>Verificación de Propiedad / Casa</span>
                <span className="font-semibold">$5.00 USD</span>
              </div>
              <div className="h-px bg-surface-mist-dark" />
              <div className="flex justify-between text-base font-bold text-ink-teal-900">
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
                className="flex-1 py-3 border border-surface-mist-dark text-[#6b7280] rounded-xl text-xs font-bold hover:bg-surface-mist transition"
                disabled={paymentLoading}
              >
                Cancelar
              </button>
              <button 
                onClick={handlePaymentSuccess}
                className="flex-1 py-3 bg-ink-teal-900 hover:bg-[#2d6a4f] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
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
        .filter((q: any) => q.status === 'completed')
        .map((q: any) => q.quest_key)

      const defaultQuests: Quest[] = [
        {
          key: 'login',
          title: 'Inicia Sesión en Wellhouse',
          description: 'Crea tu cuenta e inicia sesión por primera vez para dar inicio a tu aventura en la comunidad.',
          reward: 50,
          status: completedKeys.includes('login') ? 'completed' : 'in_progress'
        },
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
    <div className="bg-white rounded-2xl border border-surface-mist-dark p-5">
      <h2 className="text-lg font-fraunces font-bold text-ink-teal-900 mb-1">Mis Retos de Bienvenida</h2>
      <p className="text-sm text-[#6b7280] mb-6">Completa estas tareas para recibir WellPoints extras y comenzar a intercambiar hogares.</p>
      
      <div className="space-y-4">
        {quests.map(quest => (
          <div key={quest.key} className={`border border-surface-mist-dark rounded-2xl p-5 flex items-start gap-4 transition-all ${quest.status === 'completed' ? 'bg-blue-50/50 border-blue-200' : 'bg-white'}`}>
            <div className="shrink-0 mt-0.5">
              {quest.status === 'completed' ? (
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">✓</div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#f0ede8] flex items-center justify-center text-[#cbd5cc] font-bold text-sm"><Clock className="w-4 h-4 text-[#cbd5cc]" /></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start gap-2 flex-wrap mb-1">
                <h3 className={`font-semibold text-sm ${quest.status === 'completed' ? 'text-blue-900' : 'text-ink-teal-900'}`}>
                  {quest.title}
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${quest.status === 'completed' ? 'bg-blue-200 text-blue-800' : 'bg-amber-100 text-amber-800'}`}>
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
      const { error: insertError } = await (supabase as any)
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
      <div className="bg-white rounded-2xl border border-surface-mist-dark p-8 text-center">
        <div className="w-16 h-16 bg-surface-mist rounded-full flex items-center justify-center mx-auto mb-4">
          <Home className="w-8 h-8 text-[#cbd5cc]" />
        </div>
        <h2 className="text-lg font-fraunces font-bold text-ink-teal-900 mb-2">Publica tu vivienda primero</h2>
        <p className="text-sm text-[#6b7280] max-w-sm mx-auto mb-6">
          Necesitas tener una vivienda registrada y publicada en la plataforma para poder subir historias de video y mostrárselas a los huéspedes.
        </p>
        <button
          onClick={() => window.location.href = '/properties/create'}
          className="px-5 py-2.5 bg-ink-teal-900 text-white font-semibold rounded-xl text-sm hover:bg-[#122b25] transition-colors"
        >
          Publicar mi Vivienda
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Explicación */}
      <div className="bg-white rounded-2xl border border-surface-mist-dark p-5">
        <h2 className="text-lg font-fraunces font-bold text-ink-teal-900 mb-1 flex items-center gap-1.5">
          Historias de Anfitriones <Video className="w-5 h-5 text-ink-teal-900" />
        </h2>
        <p className="text-sm text-[#6b7280] mb-4">
          Muestra tu casa y las actividades de tu zona con videos cortos tipo Instagram. Solo necesitas subir tu video a YouTube (puede ser oculto si quieres privacidad) y pegar el enlace aquí. <strong>Nota importante: El video debe tener una duración máxima de 1 minuto</strong>.
        </p>

        {/* Formulario */}
        <form onSubmit={handleAddStory} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ink-teal-900 mb-1">
              Enlace de YouTube Short o Video (Máx. 1 minuto)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="Ej: https://www.youtube.com/shorts/ABC123xyz"
                className="flex-1 px-4 py-2.5 border border-surface-mist-dark rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c34] bg-surface-mist"
                required
              />
              <button
                type="submit"
                disabled={adding || !youtubeUrl}
                className="px-5 py-2.5 bg-ink-teal-900 hover:bg-[#122b25] disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-colors"
              >
                {adding ? 'Guardando...' : 'Publicar'}
              </button>
            </div>
            <p className="text-[10px] text-[#6b7280] mt-1.5 flex items-center gap-1">
              <span className="w-3.5 h-3.5 text-[#6b7280] inline-block border border-[#6b7280] rounded-full text-center text-[9px] font-bold leading-[12px]">i</span> Acepta formatos como `youtube.com/shorts/...`, `youtu.be/...`, o `youtube.com/watch?v=...`. Tu video se reproducirá automáticamente en la máxima resolución HD posible.
            </p>
          </div>

          {error && <p className="text-xs text-red-600 font-semibold">{error}</p>}
          {success && <p className="text-xs text-blue-600 font-semibold">{success}</p>}
        </form>
      </div>

      {/* Grid de Historias Existentes */}
      <div className="bg-white rounded-2xl border border-surface-mist-dark p-5">
        <h3 className="font-fraunces font-bold text-sm text-ink-teal-900 mb-4">Tus Historias Publicadas</h3>
        
        {loading ? (
          <p className="text-xs text-[#6b7280]">Cargando tus historias...</p>
        ) : stories.length === 0 ? (
          <div className="text-center py-10">
            <Sparkles className="w-8 h-8 text-[#cbd5cc] mx-auto mb-2" />
            <p className="text-xs text-[#6b7280]">Aún no tienes historias publicadas. ¡Crea la primera arriba!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {stories.map((story) => (
              <div key={story.id} className="group relative aspect-[9/16] rounded-xl overflow-hidden bg-black border border-surface-mist-dark shadow-sm">
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
