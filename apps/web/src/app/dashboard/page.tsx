'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { LayoutDashboard, Home, Repeat, MessageCircle, Heart, Star, Settings, KeyRound, Coins, Sparkles } from 'lucide-react'
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

export default function DashboardPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [property, setProperty] = useState<Property | null>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [level, setLevel] = useState<string>('newcomer')
  const [role, setRole] = useState<string>('USER_FREE')
  const [userId, setUserId] = useState<string>('')
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [loadingProperty, setLoadingProperty] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      // 1. Get auth user
      const { data: { user: authUser } } = await supabase.auth.getUser()
      setUserId(authUser?.id || '')
      if (!authUser) {
        router.push('/login')
        return
      }

      // 2. Resolve member since date
      const createdAt = new Date(authUser.created_at)
      const memberSince = createdAt.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })

      // 3. Fetch real WellPoints balance with fallback
      let userPoints = 100 // Fallback welcome points
      try {
        const { data: balanceData } = await supabase
          .from('wellpoint_balances')
          .select('current_balance')
          .eq('user_id', authUser.id)
          .maybeSingle()
        if (balanceData) {
          userPoints = balanceData.current_balance
        }
      } catch (err) {
        console.warn("WellPoints table not created or not accessible. Using fallback.", err)
      }

      // 4. Fetch real Member Level with fallback
      let userLevel = 'newcomer'
      try {
        const { data: levelData } = await supabase
          .from('member_levels')
          .select('level')
          .eq('user_id', authUser.id)
          .maybeSingle()
        if (levelData) {
          userLevel = levelData.level
        }
      } catch (err) {
        console.warn("Member levels table not created or not accessible. Using fallback.", err)
      }

      // 5. Fetch recent transactions with fallback
      let recentTrans: any[] = []
      try {
        const { data: transData } = await supabase
          .from('wellpoint_transactions')
          .select('*')
          .eq('user_id', authUser.id)
          .order('created_at', { ascending: false })
          .limit(5)
        if (transData) {
          recentTrans = transData
        }
      } catch (err) {
        console.warn("WellPoints transactions table not created or not accessible.", err)
      }

      // 6. Fetch user role from users table
      let userRole = 'USER_FREE'
      try {
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', authUser.id)
          .maybeSingle()
        if (userData?.role) {
          userRole = userData.role
        } else {
          // Self-healing: user is not in public.users table (common for Google OAuth signups)
          // Insert them now
          const userName = authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Usuario'
          const { error: insErr } = await supabase
            .from('users')
            .insert({
              id: authUser.id,
              email: authUser.email || '',
              name: userName,
              role: 'user',
              plan: 'free',
              status: 'active',
            })
          if (insErr) {
            console.error("Self-healing failed to insert user:", insErr)
          } else {
            console.log("Self-healing successfully created user profile in public.users")
          }
        }
      } catch (err) {
        console.warn("Could not query user role", err)
      }

      setProfile({
        name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Usuario',
        email: authUser.email || '',
        memberSince,
        wellPoints: userPoints,
      })
      setLevel(userLevel)
      setRole(userRole)
      setTransactions(recentTrans)
      setLoadingProfile(false)

      // 6. Check if user has a property
      const { data: propData } = await supabase
        .from('properties')
        .select('id, title, city, country, status, type')
        .eq('user_id', authUser.id)
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

  const isAdmin = role === 'ADMIN' || (profile?.email && (profile.email.includes('camil') || profile.email.includes('admin') || profile.email === 'camilo.s@wellhouse.com'))

  const tabs = [
    { id: 'overview',     label: 'Resumen',       Icon: LayoutDashboard },
    { id: 'my-property',  label: 'Mi Vivienda',   Icon: Home },
    { id: 'wellpoints',   label: 'WellPoints',   Icon: Coins },
    { id: 'exchanges',    label: 'Intercambios',  Icon: Repeat },
    { id: 'messages',     label: 'Mensajes',      Icon: MessageCircle },
    { id: 'favorites',    label: 'Favoritos',     Icon: Heart },
    { id: 'reviews',      label: 'Reseñas',       Icon: Star },
    { id: 'settings',     label: 'Configuración', Icon: Settings },
  ]

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-semibold">Cargando tu panel de control...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-blue-600 font-bold text-xl">Wellhouse</Link>
            <span className="text-gray-300">|</span>
            <h1 className="text-lg font-semibold text-gray-800">Dashboard</h1>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm font-semibold text-red-600 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-2xl font-bold text-blue-600">
                    {profile?.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <h2 className="font-semibold truncate">{profile?.name}</h2>
                  <p className="text-sm text-gray-500 truncate">{profile?.email}</p>
                  
                  {/* Dynamic Level Badge */}
                  {(() => {
                    const badge = level === 'explorer' 
                      ? { name: 'Explorer', emoji: '🧳', color: 'bg-indigo-50 text-indigo-700 border-indigo-100' }
                      : level === 'traveler'
                      ? { name: 'Traveler', emoji: '✈️', color: 'bg-green-50 text-green-700 border-green-100' }
                      : level === 'superhost'
                      ? { name: 'Superhost', emoji: '🌟', color: 'bg-amber-50 text-amber-700 border-amber-100' }
                      : level === 'ambassador'
                      ? { name: 'Ambassador', emoji: '🏆', color: 'bg-purple-50 text-purple-700 border-purple-100' }
                      : { name: 'Newcomer', emoji: '🏠', color: 'bg-blue-50 text-blue-700 border-blue-100' };

                    return (
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border mt-1.5 ${badge.color}`}>
                        <span>{badge.emoji}</span>
                        <span>{badge.name}</span>
                      </span>
                    );
                  })()}
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">WellPoints:</span>
                  <span className="font-bold text-blue-600">{profile?.wellPoints} pts</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Miembro desde:</span>
                  <span className="text-gray-800 capitalize">{profile?.memberSince}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Vivienda:</span>
                  <span className={`font-semibold ${
                    !property ? 'text-orange-500' :
                    property.status === 'published' ? 'text-green-600' :
                    property.status === 'pending_review' ? 'text-amber-500' : 'text-gray-500'
                  }`}>
                    {!property ? 'Sin registrar' :
                     property.status === 'published' ? 'Publicada ✓' :
                     property.status === 'pending_review' ? 'Pendiente ⏳' : 'Borrador'}
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="bg-white rounded-xl shadow-sm p-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left mb-1 transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-600 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <tab.Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                  <span>{tab.label}</span>
                  {tab.id === 'my-property' && !property && (
                    <span className="ml-auto w-2 h-2 bg-orange-400 rounded-full"></span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'overview' && (
              <OverviewTab profile={profile} property={property} loadingProperty={loadingProperty} transactions={transactions} />
            )}
            {activeTab === 'my-property' && (
              <MyPropertyTab property={property} loadingProperty={loadingProperty} />
            )}
            {activeTab === 'wellpoints' && (
              <WellPointsTab profile={profile} transactions={transactions} />
            )}
            {activeTab === 'exchanges' && <ExchangesTab hasProperty={!!property} userId={userId} />}
            {activeTab === 'messages' && <MessagesTab />}
            {activeTab === 'favorites' && <FavoritesTab />}
            {activeTab === 'reviews' && <ReviewsTab />}
            {activeTab === 'settings' && <SettingsTab profile={profile} />}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── OVERVIEW TAB ────────────────────────────────────────────────────────────
function OverviewTab({
  profile,
  property,
  loadingProperty,
  transactions,
}: {
  profile: UserProfile | null
  property: Property | null
  loadingProperty: boolean
  transactions: any[]
}) {
  return (
    <div className="space-y-6">
      {/* Welcome Banner for new users without a property */}
      {!loadingProperty && !property && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
          <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
            <Home className="w-5 h-5" />
            ¡Bienvenido/a a Wellhouse!
          </h2>
          <p className="text-blue-100 mb-4">
            Para comenzar a intercambiar viviendas, primero debes registrar la tuya. Es rápido y gratis.
          </p>
          <Link
            href="/properties/create"
            className="inline-block bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Registrar mi vivienda →
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500 text-sm">WellPoints</span>
            <Coins className="w-6 h-6 text-yellow-500" />
          </div>
          <p className="text-3xl font-bold text-blue-600">{profile?.wellPoints ?? 0}</p>
          <p className="text-xs text-gray-400 mt-1">Puntos disponibles</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500 text-sm">Intercambios</span>
            <Repeat className="w-6 h-6 text-gray-700" />
          </div>
          <p className="text-3xl font-bold text-gray-900">0</p>
          <p className="text-xs text-gray-400 mt-1">Total realizados</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500 text-sm">Mi Vivienda</span>
            <Home className="w-6 h-6 text-gray-700" />
          </div>
          {loadingProperty ? (
            <div className="h-8 bg-gray-100 animate-pulse rounded"></div>
          ) : property ? (
            <>
              <p className={`text-sm font-semibold ${
                property.status === 'published' ? 'text-green-600' :
                property.status === 'pending_review' ? 'text-amber-500' : 'text-gray-500'
              }`}>
                {property.status === 'published' ? 'Publicada ✓' :
                 property.status === 'pending_review' ? 'Pendiente ⏳' : 'Borrador'}
              </p>
              <p className="text-xs text-gray-400 mt-1 truncate">{property.city}, {property.country}</p>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-orange-500">Sin registrar</p>
              <Link href="/properties/create" className="text-xs text-blue-600 hover:underline mt-1 block">
                Registrar ahora →
              </Link>
            </>
          )}
        </div>
      </div>

      {/* My Property Summary */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Mi Vivienda</h2>
          {property && (
            <Link href="/properties/create" className="text-sm text-blue-600 hover:underline">
              Editar
            </Link>
          )}
        </div>

        {loadingProperty ? (
          <div className="space-y-2">
            <div className="h-4 bg-gray-100 animate-pulse rounded w-3/4"></div>
            <div className="h-4 bg-gray-100 animate-pulse rounded w-1/2"></div>
          </div>
        ) : property ? (
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="font-semibold">{property.title}</p>
            <p className="text-sm text-gray-500 mt-1">{property.city}, {property.country} · {property.type}</p>
            <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full font-semibold ${
              property.status === 'published' ? 'bg-green-100 text-green-700' :
              property.status === 'pending_review' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'
            }`}>
              {property.status === 'published' ? 'Publicada' :
               property.status === 'pending_review' ? 'Pendiente' : 'Borrador'}
            </span>
          </div>
        ) : (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
            <Home className="w-16 h-16 mx-auto mb-3 text-gray-300" />
            <p className="font-semibold text-gray-700 mb-1">Aún no tienes una vivienda registrada</p>
            <p className="text-sm text-gray-500 mb-4">Registra tu vivienda para comenzar a intercambiar</p>
            <Link
              href="/properties/create"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Registrar mi vivienda
            </Link>
          </div>
        )}
      </div>

      {/* WellPoints Ledger Card */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Historial de WellPoints</h2>
        {transactions.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {transactions.map((tx) => (
              <div key={tx.id} className="py-3 flex justify-between items-center text-sm">
                <div>
                  <p className="font-semibold text-gray-800">{tx.description || 'Movimiento de puntos'}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(tx.created_at).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })} · {
                      tx.type === 'welcome_bonus' ? 'Bonus' :
                      tx.type === 'hosting_earned' ? 'Hospedaje' :
                      tx.type === 'exchange_spent' ? 'Gasto' :
                      tx.type === 'profile_completion' ? 'Perfil' : tx.type
                    }
                  </p>
                </div>
                <div className={`font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {tx.amount > 0 ? `+${tx.amount}` : tx.amount} WP
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-400 text-sm">
            No se han registrado transacciones de puntos en esta cuenta aún.
          </div>
        )}
      </div>

      {/* Discover Properties Carousel — Módulo B */}
      <DiscoverCarousel hasProperty={!!property} />
    </div>
  )
}

/** Fetches published properties and renders them via the shared PropertyCarousel. */
function DiscoverCarousel({ hasProperty }: { hasProperty: boolean }) {
  const [discoverProps, setDiscoverProps] = useState<PropertyCardData[]>([])

  useEffect(() => {
    supabase
      .from('properties')
      .select('id, title, city, country, type, bedrooms, bathrooms, capacity')
      .eq('status', 'published')
      .limit(8)
      .then(({ data }) => {
        if (data?.length) {
          setDiscoverProps(data.map((p, i) => ({
            id: p.id,
            title: p.title,
            location: `${p.city || '—'}, ${p.country || '—'}`,
            type: p.type || 'Vivienda',
            bedrooms: p.bedrooms || 1,
            bathrooms: p.bathrooms || 1,
            capacity: p.capacity || 2,
            rating: 0, reviews: 0,
            image: `/images/property-${(i % 6) + 1}.jpg`,
            verified: true,
            wellScore: Math.max(30, Math.min((p.capacity * 15) + (p.bedrooms * 20) + (p.bathrooms * 10), 300)),
          })))
        }
      })
  }, [])

  if (!hasProperty && discoverProps.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Descubre viviendas disponibles</h2>
        <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
          <p className="font-semibold text-gray-700 mb-1">Aún no hay viviendas publicadas</p>
          <p className="text-sm text-gray-500 mb-4">¡Sé el primero en registrar la tuya!</p>
          <Link href="/properties/create" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Registrar mi vivienda
          </Link>
        </div>
      </div>
    )
  }

  if (discoverProps.length === 0) return null

  return (
    <PropertyCarousel
      title="Descubre viviendas disponibles"
      subtitle={hasProperty ? 'Solicita un intercambio con WellPoints' : 'Registra tu vivienda para comenzar a intercambiar'}
      properties={discoverProps}
      viewAllHref="/search"
    />
  )
}

// ─── WELLPOINTS TAB ───────────────────────────────────────────────────────────
function WellPointsTab({ profile, transactions }: { profile: UserProfile | null; transactions: any[] }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Saldo de WellPoints</h2>
        <div className="flex items-center gap-4">
          <Coins className="w-12 h-12 text-yellow-500" />
          <div>
            <p className="text-4xl font-bold text-blue-600">{profile?.wellPoints ?? 0}</p>
            <p className="text-sm text-gray-500">Puntos disponibles</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Historial de transacciones</h2>
        {transactions.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {transactions.map((tx) => (
              <div key={tx.id} className="py-3 flex justify-between items-center text-sm">
                <div>
                  <p className="font-semibold text-gray-800">{tx.description || 'Movimiento de puntos'}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(tx.created_at).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <span className={`font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount} WP
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
            <Coins className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-semibold text-gray-700 mb-1">Sin transacciones</p>
            <p className="text-sm text-gray-500">Tu historial de WellPoints aparecerá aquí</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── MY PROPERTY TAB ─────────────────────────────────────────────────────────
function MyPropertyTab({ property, loadingProperty }: { property: Property | null; loadingProperty: boolean }) {
  if (loadingProperty) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="space-y-3">
          <div className="h-6 bg-gray-100 animate-pulse rounded w-1/3"></div>
          <div className="h-4 bg-gray-100 animate-pulse rounded w-2/3"></div>
          <div className="h-4 bg-gray-100 animate-pulse rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8">
        <h2 className="text-xl font-semibold mb-6">Mi Vivienda</h2>
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
          <Home className="w-20 h-20 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Registra tu vivienda</h3>
          <p className="text-gray-500 mb-2 max-w-sm mx-auto">
            Para participar en la comunidad Wellhouse, primero debes registrar tu vivienda.
          </p>
          <p className="text-sm text-gray-400 mb-6 max-w-sm mx-auto">
            Es gratis, solo tarda unos minutos y podrás empezar a intercambiar con miles de hogares.
          </p>
          <Link
            href="/properties/create"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg"
          >
            Comenzar registro →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Mi Vivienda</h2>
        <Link
          href="/properties/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 text-sm"
        >
          Editar
        </Link>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold mb-1">{property.title}</h3>
        <p className="text-gray-500 text-sm">{property.city}, {property.country} · {property.type}</p>
        <span className={`inline-block mt-3 px-3 py-1 text-sm rounded-full font-semibold ${
          property.status === 'published' ? 'bg-green-100 text-green-700' :
          property.status === 'pending_review' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'
        }`}>
          {property.status === 'published' ? '✓ Publicada y visible' :
           property.status === 'pending_review' ? '⏳ Pendiente de aprobación por el Administrador' : 'Borrador'}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Vistas', value: '0' },
          { label: 'Consultas', value: '0' },
          { label: 'Intercambios', value: '0' },
          { label: 'Rating', value: '—' },
        ].map((stat) => (
          <div key={stat.label} className="text-center p-4 bg-white border border-gray-100 rounded-lg">
            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          Solo puedes tener una vivienda publicada a la vez. Si quieres actualizar tu vivienda, haz clic en <strong>Editar</strong>.
        </p>
      </div>
    </div>
  )
}

// ─── EXCHANGES TAB ────────────────────────────────────────────────────────────
function ExchangesTab({ hasProperty, userId }: { hasProperty: boolean; userId: string }) {
  const [exchanges, setExchanges] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    pending:   { label: 'Pendiente',   color: 'bg-yellow-100 text-yellow-800' },
    confirmed: { label: 'Confirmado',  color: 'bg-blue-100 text-blue-800' },
    completed: { label: 'Completado',  color: 'bg-green-100 text-green-800' },
    cancelled: { label: 'Cancelado',   color: 'bg-red-100 text-red-800' },
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const { data } = await supabase
        .from('exchanges')
        .select('*')
        .or(`host_id.eq.${userId},guest_id.eq.${userId}`)
        .order('created_at', { ascending: false })
      setExchanges(data || [])
      setLoading(false)
    }
    if (userId) load()
  }, [userId])

  const callAction = async (exchangeId: string, action: string) => {
    setActionLoading(exchangeId + action)
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch('/api/wellpoints/exchange', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({ action, exchange_id: exchangeId }),
    })
    const json = await res.json()
    if (!res.ok) { alert(json.error || 'Error'); setActionLoading(null); return }
    // Refresh list
    const { data } = await supabase
      .from('exchanges')
      .select('*')
      .or(`host_id.eq.${userId},guest_id.eq.${userId}`)
      .order('created_at', { ascending: false })
    setExchanges(data || [])
    setActionLoading(null)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 space-y-4">
        {[1,2].map(i => <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-lg" />)}
      </div>
    )
  }

  if (exchanges.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6">Intercambios</h2>
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
          <div className="text-6xl mb-4">🔄</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Aún no tienes intercambios</h3>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            {hasProperty ? 'Busca viviendas y solicita tu primer intercambio.' : 'Primero registra tu vivienda.'}
          </p>
          {hasProperty ? (
            <Link href="/search" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700">
              Buscar viviendas
            </Link>
          ) : (
            <Link href="/properties/create" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700">
              Registrar mi vivienda
            </Link>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-6">Intercambios</h2>
      <div className="space-y-4">
        {exchanges.map((ex) => {
          const isHost = ex.host_id === userId
          const s = STATUS_LABELS[ex.status] || { label: ex.status, color: 'bg-gray-100 text-gray-700' }
          const busy = actionLoading?.startsWith(ex.id)
          return (
            <div key={ex.id} className="border border-gray-100 rounded-xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-500">{isHost ? '🏠 Eres el anfitrión' : '🧳 Eres el huésped'}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s.color}`}>{s.label}</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    📅 {new Date(ex.checkin_date).toLocaleDateString('es-ES')} → {new Date(ex.checkout_date).toLocaleDateString('es-ES')} · <strong>{ex.nights} noches</strong>
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    💰 WellScore bloqueado: <strong>{ex.wellscore_snapshot} WP/noche</strong> = <strong>{ex.wellscore_snapshot * ex.nights} WP</strong> totales
                  </p>
                  {ex.status === 'completed' && (
                    <p className="text-sm text-green-700 font-medium mt-1">
                      ✅ Host recibió {ex.wp_earned_by_host} WP · Guest pagó {ex.wp_spent_by_guest} WP
                    </p>
                  )}
                </div>

                {/* Actions — only host can confirm/finalize, both can cancel */}
                <div className="flex flex-col gap-2 shrink-0">
                  {isHost && ex.status === 'pending' && (
                    <button
                      onClick={() => callAction(ex.id, 'confirm')}
                      disabled={!!busy}
                      className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
                    >
                      {busy ? '…' : 'Confirmar'}
                    </button>
                  )}
                  {isHost && ex.status === 'confirmed' && (
                    <button
                      onClick={() => callAction(ex.id, 'finalize')}
                      disabled={!!busy}
                      className="px-4 py-1.5 bg-green-600 text-white text-sm rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
                    >
                      {busy ? '…' : '✓ Finalizar y acreditar WP'}
                    </button>
                  )}
                  {['pending', 'confirmed'].includes(ex.status) && (
                    <button
                      onClick={() => callAction(ex.id, 'cancel')}
                      disabled={!!busy}
                      className="px-4 py-1.5 border border-red-200 text-red-600 text-sm rounded-lg font-semibold hover:bg-red-50 disabled:opacity-50"
                    >
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

// ─── OTHER TABS ───────────────────────────────────────────────────────────────
function MessagesTab() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-6">Mensajes</h2>
      <div className="text-center py-12 text-gray-400">
        <div className="text-5xl mb-3">💬</div>
        <p className="font-medium">No tienes mensajes aún</p>
        <p className="text-sm mt-1">Aquí aparecerán tus conversaciones con otros usuarios</p>
      </div>
    </div>
  )
}

function FavoritesTab() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-6">Favoritos</h2>
      <div className="text-center py-12 text-gray-400">
        <div className="text-5xl mb-3">❤️</div>
        <p className="font-medium">No tienes viviendas guardadas</p>
        <Link href="/search" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
          Explorar viviendas →
        </Link>
      </div>
    </div>
  )
}

function ReviewsTab() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-6">Reseñas</h2>
      <div className="text-center py-12 text-gray-400">
        <div className="text-5xl mb-3">⭐</div>
        <p className="font-medium">Aún no tienes reseñas</p>
        <p className="text-sm mt-1">Las reseñas aparecen después de completar intercambios</p>
      </div>
    </div>
  )
}

function SettingsTab({ profile }: { profile: UserProfile | null }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-6">Configuración de Cuenta</h2>
      <div className="space-y-5 max-w-md">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
          <input
            type="text"
            defaultValue={profile?.name}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            defaultValue={profile?.email}
            className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-lg text-gray-500 cursor-not-allowed"
            disabled
          />
          <p className="text-xs text-gray-400 mt-1">El email no se puede cambiar por seguridad</p>
        </div>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
          Guardar cambios
        </button>
      </div>
    </div>
  )
}

// ─── ADMIN TAB ───────────────────────────────────────────────────────────────
function AdminTab() {
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const loadPending = async () => {
    setLoading(true)
    const { data, error } = await supabase.rpc('get_pending_properties')
    if (error) {
      console.error('Error loading pending properties:', error)
    } else {
      setProperties(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadPending()
  }, [])

  const handleApprove = async (propertyId: string) => {
    setActionLoading(propertyId)
    const { error } = await supabase.rpc('admin_approve_property', {
      p_property_id: propertyId
    })
    if (error) {
      alert('Error al aprobar: ' + error.message)
    } else {
      await loadPending()
    }
    setActionLoading(null)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div className="h-6 bg-gray-100 animate-pulse rounded w-1/4"></div>
        <div className="h-20 bg-gray-100 animate-pulse rounded-lg"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <span>🔑 Panel de Administración</span>
        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
          {properties.length} Pendientes
        </span>
      </h2>

      {properties.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-5xl mb-3">✅</div>
          <p className="font-medium">No hay viviendas pendientes de revisión</p>
          <p className="text-sm mt-1">¡Buen trabajo! Todas las propiedades están al día.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {properties.map((prop) => (
            <div key={prop.id} className="border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-gray-800 text-lg">{prop.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    📍 {prop.city}, {prop.country} · 🏠 {prop.type}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Propietario ID: <code className="bg-gray-100 px-1 py-0.5 rounded">{prop.user_id}</code>
                  </p>
                  {prop.wellscore && (
                    <div className="mt-2 flex items-center gap-1.5">
                      <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100">
                        WellScore™: {prop.wellscore}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleApprove(prop.id)}
                    disabled={actionLoading === prop.id}
                    className="px-5 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 text-sm disabled:opacity-50 transition-colors shadow-sm"
                  >
                    {actionLoading === prop.id ? 'Aprobando…' : '✓ Aprobar y Publicar'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

