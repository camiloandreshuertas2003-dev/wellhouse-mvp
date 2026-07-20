'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import {
  ArrowLeft, Calendar, Home, User as UserIcon, ShieldCheck,
  CheckCircle, Clock, AlertCircle, MessageCircle, Star,
  XCircle, Coins, ArrowRight, Lock
} from 'lucide-react'

const STEPS = [
  { key: 'requested',   label: 'Solicitado' },
  { key: 'confirmed',   label: 'Confirmado' },
  { key: 'in_progress', label: 'En curso' },
  { key: 'completed',   label: 'Completado' },
  { key: 'closed',      label: 'Cerrado' },
]

function getStepIndex(status: string): number {
  const idx = STEPS.findIndex(s => s.key === status)
  return idx === -1 ? 0 : idx
}

function Stepper({ status }: { status: string }) {
  const current = getStepIndex(status)
  const isCancelled = status === 'cancelled'
  return (
    <div className="flex items-center w-full overflow-x-auto py-1">
      {STEPS.map((step, i) => (
        <div key={step.key} className="flex items-center flex-1 min-w-0">
          <div className="flex flex-col items-center min-w-[56px]">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              isCancelled ? 'bg-gray-200 text-gray-400' :
              i < current ? 'bg-[#0f766e] text-white' :
              i === current ? 'bg-ink-teal-900 text-white ring-2 ring-ink-teal-900/30' :
              'bg-surface-mist text-gray-400 border border-surface-mist-dark'
            }`}>
              {i < current && !isCancelled ? '✓' : i + 1}
            </div>
            <span className={`text-[9px] font-semibold mt-1 text-center leading-tight whitespace-nowrap ${i <= current && !isCancelled ? 'text-ink-teal-900' : 'text-gray-400'}`}>
              {step.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-0.5 mx-1 ${i < current && !isCancelled ? 'bg-[#0f766e]' : 'bg-surface-mist-dark'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

function TrustDots({ score }: { score: number }) {
  const filled = Math.round((score / 100) * 5)
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <div key={i} className={`w-2.5 h-2.5 rounded-full ${i <= filled ? 'bg-[#0f766e]' : 'bg-gray-200'}`} />
      ))}
    </div>
  )
}

export default function ExchangeDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [exchange, setExchange] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/login'); return }
      const { data: profile } = await (supabase as any).from('users').select('*').eq('id', data.user.id).maybeSingle()
      setUser(profile || data.user)
      fetchExchange(params.id)
    })
  }, [params.id])

  const fetchExchange = async (id: string) => {
    setLoading(true)
    const { data } = await supabase
      .from('exchanges')
      .select('*, property:properties(id, title, city, wellrank, photos:property_photos(url), user_id), host:users!exchanges_host_id_fkey(id, name, avatar_url, trust_index, is_verified, bio, created_at), guest:users!exchanges_guest_id_fkey(id, name, avatar_url, trust_index, is_verified, bio, created_at)')
      .eq('id', id)
      .maybeSingle()
    setExchange(data)
    setLoading(false)
  }

  const handleCancel = async () => {
    if (!exchange) return
    if (!confirm('Confirmas que quieres cancelar este intercambio?')) return
    setActing(true)
    const { data, error } = await (supabase as any).rpc('cancel_exchange', { p_exchange_id: exchange.id, p_reason: 'Cancelado por usuario' })
    setActing(false)
    if (data?.success) {
      setMsg('Intercambio cancelado. Los WP fueron devueltos al huesped.')
      fetchExchange(exchange.id)
    } else {
      setMsg('Error: ' + (data?.error || error?.message || 'No se pudo cancelar'))
    }
  }

  const handleComplete = async () => {
    if (!exchange) return
    if (!confirm('Confirmas que el intercambio se completo exitosamente? Esto liberara los WellPoints al anfitrion.')) return
    setActing(true)
    const { data, error } = await (supabase as any).rpc('complete_exchange', { p_exchange_id: exchange.id })
    setActing(false)
    if (data?.success) {
      setMsg('Intercambio cerrado! Los WellPoints fueron liberados al anfitrion.')
      fetchExchange(exchange.id)
    } else {
      setMsg('Error: ' + (data?.error || error?.message))
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
      <div className="text-sm font-semibold text-ink-teal-900 animate-pulse">Cargando intercambio...</div>
    </div>
  )

  if (!exchange) return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
      <div className="text-center">
        <p className="font-semibold text-ink-teal-900">Intercambio no encontrado</p>
        <Link href="/exchanges" className="text-sm text-[#0f766e] mt-2 inline-block">Volver</Link>
      </div>
    </div>
  )

  const isHost = exchange.host_id === user?.id
  const other = isHost ? exchange.guest : exchange.host
  const property = exchange.property
  const nights = exchange.nights || 1
  const wpTotal = exchange.wp_total || (nights * (exchange.wp_per_night || 0))
  const isCancelled = exchange.status === 'cancelled'
  const canCancel = ['requested', 'countered', 'confirmed'].includes(exchange.status)
  const canComplete = isHost && ['confirmed', 'in_progress', 'completed'].includes(exchange.status)
  const isConfirmedOrMore = ['confirmed', 'in_progress', 'completed'].includes(exchange.status)

  return (
    <div className="min-h-screen bg-[#fafafa] pb-24 md:pb-10">
      <div className="bg-white border-b border-surface-mist-dark">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 hover:bg-surface-mist rounded-full transition">
            <ArrowLeft className="w-5 h-5 text-ink-teal-900" />
          </button>
          <div>
            <h1 className="font-fraunces font-bold text-base text-ink-teal-900 leading-tight line-clamp-1">
              {property?.title || 'Detalle del intercambio'}
            </h1>
            <p className="text-[11px] text-text-muted-custom">{isHost ? 'Tu vivienda fue solicitada' : 'Tu solicitud de estadia'}</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
        {msg && <div className="bg-[#f0fdf9] border border-teal-200 rounded-xl px-4 py-3 text-sm text-[#0f766e] font-medium">{msg}</div>}

        {!isCancelled && (
          <div className="bg-white rounded-2xl border border-surface-mist-dark p-4 sm:p-5">
            <p className="text-xs font-bold text-text-muted-custom uppercase tracking-wide mb-3">Estado del intercambio</p>
            <Stepper status={exchange.status} />
          </div>
        )}

        {isCancelled && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3 items-start">
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-700 text-sm">Intercambio cancelado</p>
              {exchange.cancel_reason && <p className="text-xs text-red-600 mt-0.5">{exchange.cancel_reason}</p>}
              {wpTotal > 0 && <p className="text-xs text-red-600 mt-1">Los {wpTotal} WP fueron devueltos al huesped.</p>}
            </div>
          </div>
        )}

        {isHost && !isCancelled && (
          <div className="bg-white rounded-2xl border border-surface-mist-dark overflow-hidden">
            <div className="bg-surface-mist px-4 py-3 border-b border-surface-mist-dark">
              <p className="text-xs font-bold text-ink-teal-900 uppercase tracking-wide">Quien solicita tu vivienda</p>
            </div>
            <div className="p-4 flex gap-4 items-start">
              <div className="w-14 h-14 rounded-full bg-surface-mist overflow-hidden flex items-center justify-center flex-shrink-0">
                {other?.avatar_url ? <img src={other.avatar_url} alt="" className="w-full h-full object-cover" /> : <UserIcon className="w-7 h-7 text-gray-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-fraunces font-bold text-ink-teal-900">{other?.name}</h3>
                  {other?.is_verified && <ShieldCheck className="w-4 h-4 text-[#0f766e]" />}
                </div>
                {other?.trust_index != null && (
                  <div className="flex items-center gap-2 mt-1">
                    <TrustDots score={other.trust_index} />
                    <span className="text-xs text-text-muted-custom">{other.trust_index}% indice de confianza</span>
                  </div>
                )}
                {other?.created_at && <p className="text-[11px] text-text-muted-custom mt-1">Miembro desde {new Date(other.created_at).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</p>}
                {other?.bio && <p className="text-xs text-text-muted-custom mt-1 line-clamp-2">{other.bio}</p>}
                <Link href={`/users/${other?.id}`} className="text-xs text-[#0f766e] font-semibold mt-1 inline-block hover:underline">Ver perfil completo</Link>
              </div>
            </div>
            {['requested', 'countered'].includes(exchange.status) && (
              <div className="border-t border-surface-mist-dark p-4 space-y-2">
                <button onClick={() => router.push('/messages?conversation_id=' + exchange.conversation_id)}
                  className="w-full py-3 bg-ink-teal-900 text-white font-bold rounded-xl text-sm hover:opacity-90 transition flex items-center justify-center gap-2">
                  <MessageCircle className="w-4 h-4" /> Responder en el chat
                </button>
                <p className="text-[11px] text-center text-text-muted-custom">Acepta o rechaza desde el chat para que quede registrado</p>
              </div>
            )}
          </div>
        )}

        {!isHost && (
          <div className="bg-white rounded-2xl border border-surface-mist-dark p-4 flex gap-4 items-center">
            <div className="w-12 h-12 rounded-full bg-surface-mist overflow-hidden flex items-center justify-center flex-shrink-0">
              {other?.avatar_url ? <img src={other.avatar_url} alt="" className="w-full h-full object-cover" /> : <UserIcon className="w-6 h-6 text-gray-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm text-ink-teal-900">{other?.name}</h3>
                {other?.is_verified && <ShieldCheck className="w-3.5 h-3.5 text-[#0f766e]" />}
              </div>
              <p className="text-[11px] text-text-muted-custom">Anfitrion</p>
              <Link href={`/users/${other?.id}`} className="text-xs text-[#0f766e] font-semibold hover:underline">Ver perfil</Link>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-surface-mist-dark overflow-hidden">
          <div className="flex gap-4 p-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-surface-mist overflow-hidden flex items-center justify-center flex-shrink-0">
              {property?.photos?.[0]?.url ? <img src={property.photos[0].url} alt="" className="w-full h-full object-cover" /> : <Home className="w-8 h-8 text-gray-300" />}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-fraunces font-bold text-ink-teal-900 text-sm leading-tight">{property?.title}</h3>
              <p className="text-xs text-text-muted-custom mt-0.5">{property?.city}</p>
              <Link href={`/properties/${property?.id}`} className="text-xs text-[#0f766e] font-semibold mt-1 inline-block hover:underline">Ver propiedad</Link>
            </div>
          </div>
          <div className="border-t border-surface-mist-dark px-4 py-3 grid grid-cols-3 gap-3 text-center">
            <div><p className="text-[10px] text-text-muted-custom uppercase tracking-wide">Check-in</p><p className="text-xs font-bold text-ink-teal-900 mt-0.5">{exchange.checkin_date ? new Date(exchange.checkin_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : '--'}</p></div>
            <div><p className="text-[10px] text-text-muted-custom uppercase tracking-wide">Noches</p><p className="text-xs font-bold text-ink-teal-900 mt-0.5">{nights}</p></div>
            <div><p className="text-[10px] text-text-muted-custom uppercase tracking-wide">Check-out</p><p className="text-xs font-bold text-ink-teal-900 mt-0.5">{exchange.checkout_date ? new Date(exchange.checkout_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : '--'}</p></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-surface-mist-dark p-4">
          <div className="flex items-center gap-2 mb-3">
            <Coins className="w-4 h-4 text-wellpoint-gold" />
            <p className="text-xs font-bold text-ink-teal-900 uppercase tracking-wide">WellPoints del intercambio</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface-mist rounded-xl p-3 text-center"><p className="text-[10px] text-text-muted-custom">Por noche</p><p className="text-base font-bold text-wellpoint-gold">{exchange.wp_per_night || exchange.wellrank_snapshot}</p></div>
            <div className="bg-surface-mist rounded-xl p-3 text-center"><p className="text-[10px] text-text-muted-custom">Total</p><p className="text-base font-bold text-wellpoint-gold">{wpTotal}</p></div>
          </div>
          {isConfirmedOrMore && (
            <div className="mt-3 flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl p-3">
              <Lock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-700">{isHost ? wpTotal + ' WP en escrow, se liberan al cerrar el intercambio.' : 'Tus ' + wpTotal + ' WP estan retenidos como garantia hasta completar la estadia.'}</p>
            </div>
          )}
          {exchange.status === 'closed' && (
            <div className="mt-3 flex items-start gap-2 bg-teal-50 border border-teal-100 rounded-xl p-3">
              <CheckCircle className="w-4 h-4 text-[#0f766e] flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-[#0f766e]">{isHost ? wpTotal + ' WP transferidos a tu saldo.' : 'Intercambio cerrado. WP liberados al anfitrion.'}</p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {exchange.conversation_id && (
            <Link href={'/messages?conversation_id=' + exchange.conversation_id}
              className="flex items-center justify-between w-full bg-white border border-surface-mist-dark rounded-2xl px-4 py-3.5 hover:bg-surface-mist/50 transition">
              <div className="flex items-center gap-2"><MessageCircle className="w-4 h-4 text-[#0f766e]" /><span className="text-sm font-semibold text-ink-teal-900">Ir a la conversacion</span></div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>
          )}
          {['completed', 'closed'].includes(exchange.status) && (
            <Link href={'/reviews/write?exchange_id=' + exchange.id + '&user_id=' + other?.id}
              className="flex items-center justify-between w-full bg-white border border-surface-mist-dark rounded-2xl px-4 py-3.5 hover:bg-surface-mist/50 transition">
              <div className="flex items-center gap-2"><Star className="w-4 h-4 text-wellpoint-gold" /><span className="text-sm font-semibold text-ink-teal-900">Dejar resena</span></div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>
          )}
          {canComplete && (
            <button onClick={handleComplete} disabled={acting}
              className="w-full py-3.5 bg-[#0f766e] text-white font-bold rounded-2xl text-sm hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4" />
              {acting ? 'Procesando...' : 'Marcar como completado y liberar WP'}
            </button>
          )}
          {canCancel && (
            <button onClick={handleCancel} disabled={acting}
              className="w-full py-3 border border-red-200 text-red-600 font-semibold rounded-2xl text-sm hover:bg-red-50 transition disabled:opacity-50">
              {acting ? 'Cancelando...' : 'Cancelar intercambio'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
