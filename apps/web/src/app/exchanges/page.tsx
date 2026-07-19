'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import {
  ArrowUpDown, Calendar, CheckCircle, XCircle, Clock, Home,
  User as UserIcon, AlertCircle, ArrowRight, ShieldCheck
} from 'lucide-react'

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  requested:   { label: 'Solicitado',   color: 'text-amber-700',  bg: 'bg-amber-50 border-amber-200' },
  countered:   { label: 'Contraoferta', color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200' },
  confirmed:   { label: 'Confirmado',   color: 'text-teal-700',   bg: 'bg-teal-50 border-teal-200' },
  in_progress: { label: 'En curso',     color: 'text-[#0f766e]',  bg: 'bg-[#f0fdf9] border-teal-200' },
  completed:   { label: 'Completado',   color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200' },
  closed:      { label: 'Cerrado',      color: 'text-gray-600',   bg: 'bg-gray-50 border-gray-200' },
  cancelled:   { label: 'Cancelado',    color: 'text-red-600',    bg: 'bg-red-50 border-red-200' },
  disputed:    { label: 'En disputa',   color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
  pending:     { label: 'Pendiente',    color: 'text-amber-700',  bg: 'bg-amber-50 border-amber-200' },
  accepted:    { label: 'Aceptado',     color: 'text-teal-700',   bg: 'bg-teal-50 border-teal-200' },
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${cfg.bg} ${cfg.color}`}>
      {cfg.label}
    </span>
  )
}

function ExchangeCard({ ex, userId }: { ex: any; userId: string }) {
  const isHost = ex.host_id === userId
  const other = isHost ? ex.guest : ex.host
  const property = ex.property
  const nights = ex.nights || 1
  const wpTotal = ex.wp_total || (nights * (ex.wp_per_night || ex.wellrank_snapshot || 0))
  const needsAction = isHost && ['requested', 'countered'].includes(ex.status)

  return (
    <Link href={`/exchanges/${ex.id}`} className="block group">
      <div className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${needsAction ? 'border-amber-300 ring-1 ring-amber-200' : 'border-surface-mist-dark'}`}>
        {needsAction && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
            <span className="text-xs font-bold text-amber-700">Necesita tu respuesta</span>
          </div>
        )}
        <div className="p-4 sm:p-5 flex gap-4 items-start">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-surface-mist overflow-hidden flex-shrink-0">
            {property?.photos?.[0]?.url
              ? <img src={property.photos[0].url} alt="" className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center"><Home className="w-7 h-7 text-gray-300" /></div>
            }
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div>
                <p className="text-[10px] font-bold text-text-muted-custom uppercase tracking-wide">
                  {isHost ? 'Eres anfitrion' : 'Eres huesped'}
                </p>
                <h3 className="font-fraunces font-bold text-sm text-ink-teal-900 leading-tight line-clamp-2">
                  {property?.title || 'Propiedad sin titulo'}
                </h3>
              </div>
              <StatusBadge status={ex.status} />
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-text-muted-custom mb-1">
              <Calendar className="w-3 h-3 flex-shrink-0" />
              {ex.checkin_date
                ? `${new Date(ex.checkin_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} -> ${new Date(ex.checkout_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} . ${nights} noches`
                : 'Fechas no definidas'}
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-surface-mist overflow-hidden flex items-center justify-center">
                  {other?.avatar_url
                    ? <img src={other.avatar_url} alt="" className="w-full h-full object-cover" />
                    : <UserIcon className="w-3.5 h-3.5 text-gray-400" />}
                </div>
                <span className="text-xs font-medium text-ink-teal-900">{other?.name || 'Usuario'}</span>
                {other?.is_verified && <ShieldCheck className="w-3 h-3 text-[#0f766e]" />}
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-wellpoint-gold">{wpTotal} WP</p>
                <p className="text-[10px] text-text-muted-custom">{ex.wp_per_night || ex.wellrank_snapshot} WP/noche</p>
              </div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-ink-teal-900 transition-colors flex-shrink-0 mt-1" />
        </div>
      </div>
    </Link>
  )
}

export default function ExchangesPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [exchanges, setExchanges] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'all' | 'host' | 'guest' | 'needs_response'>('all')

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/login'); return }
      const { data: profile } = await supabase.from('users').select('*').eq('id', data.user.id).maybeSingle()
      setUser(profile || data.user)
      fetchExchanges(data.user.id)
    })
  }, [])

  const fetchExchanges = useCallback(async (uid: string) => {
    setLoading(true)
    const { data } = await supabase
      .from('exchanges')
      .select(`*, property:properties(id, title, city, wellrank, photos:property_photos(url)), host:users!exchanges_host_id_fkey(id, name, avatar_url, trust_index, is_verified), guest:users!exchanges_guest_id_fkey(id, name, avatar_url, trust_index, is_verified)`)
      .or(`host_id.eq.${uid},guest_id.eq.${uid}`)
      .order('created_at', { ascending: false })
    setExchanges(data || [])
    setLoading(false)
  }, [])

  const filtered = exchanges.filter(ex => {
    if (tab === 'host') return ex.host_id === user?.id
    if (tab === 'guest') return ex.guest_id === user?.id
    if (tab === 'needs_response') return ex.host_id === user?.id && ['requested', 'countered'].includes(ex.status)
    return true
  })

  const needsResponseCount = exchanges.filter(ex => ex.host_id === user?.id && ['requested', 'countered'].includes(ex.status)).length

  const TABS = [
    { key: 'all', label: 'Todos', count: exchanges.length },
    { key: 'host', label: 'Soy anfitrion', count: exchanges.filter(e => e.host_id === user?.id).length },
    { key: 'guest', label: 'Soy huesped', count: exchanges.filter(e => e.guest_id === user?.id).length },
    { key: 'needs_response', label: 'Necesitan respuesta', count: needsResponseCount, urgent: true },
  ]

  return (
    <div className="min-h-screen bg-[#fafafa] pb-24 md:pb-10">
      <div className="bg-white border-b border-surface-mist-dark">
        <div className="max-w-3xl mx-auto px-4 py-5">
          <h1 className="font-fraunces font-bold text-xl text-ink-teal-900">Mis Intercambios</h1>
          <p className="text-xs text-text-muted-custom mt-0.5">Gestiona todas tus propuestas y estadias confirmadas</p>
        </div>
      </div>
      <div className="bg-white border-b border-surface-mist-dark sticky top-[60px] z-30">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex gap-0 overflow-x-auto">
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key as any)}
                className={`flex-shrink-0 px-4 py-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${tab === t.key ? 'border-ink-teal-900 text-ink-teal-900' : 'border-transparent text-text-muted-custom hover:text-ink-teal-900'}`}>
                {t.label}
                {t.count > 0 && (
                  <span className={`rounded-full text-[10px] font-bold px-1.5 py-0.5 ${(t as any).urgent && t.count > 0 ? 'bg-amber-100 text-amber-700' : 'bg-surface-mist text-text-muted-custom'}`}>
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-6">
        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-surface-mist-dark p-5 animate-pulse">
                <div className="flex gap-4"><div className="w-24 h-24 bg-surface-mist rounded-xl flex-shrink-0" /><div className="flex-1 space-y-2"><div className="h-3 bg-surface-mist rounded w-1/3" /><div className="h-4 bg-surface-mist rounded w-2/3" /></div></div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto bg-surface-mist rounded-2xl flex items-center justify-center mb-4">
              <ArrowUpDown className="w-8 h-8 text-gray-300" />
            </div>
            <p className="font-semibold text-ink-teal-900 text-sm">{tab === 'needs_response' ? 'No tienes solicitudes pendientes' : 'No tienes intercambios aqui'}</p>
            {tab !== 'needs_response' && (
              <Link href="/search" className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-ink-teal-900 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition">
                Explorar viviendas
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(ex => <ExchangeCard key={ex.id} ex={ex} userId={user?.id} />)}
          </div>
        )}
      </div>
    </div>
  )
}
