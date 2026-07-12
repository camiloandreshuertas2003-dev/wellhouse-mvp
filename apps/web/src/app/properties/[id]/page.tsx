'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import PropertyGallery from '@/components/PropertyGallery'
import WellScoreBreakdown from '@/components/WellScoreBreakdown'
import AmenityIcon from '@/components/AmenityIcon'
import CategoryIcon from '@/components/CategoryIcon'
import {
  ChevronRight, Users, BedDouble, Bath, ArrowLeft, Share2, Heart,
  MessageCircle, CheckCircle2, RefreshCw, CreditCard, ChevronDown, X
} from 'lucide-react'

// WellScore formula
function calcWellScore(capacity: number, bedrooms: number, bathrooms: number) {
  return Math.max(30, Math.min((capacity * 15) + (bedrooms * 20) + (bathrooms * 10), 300))
}

// Parse structured description from combined field (legacy compat)
function parseDescription(raw: string | null): { space: string; area: string; directions: string } {
  if (!raw) return { space: '', area: '', directions: '' }
  const spaceMatch = raw.match(/El espacio:\s*([\s\S]*?)(?=\n\nLa zona:|$)/)
  const areaMatch = raw.match(/La zona:\s*([\s\S]*?)(?=\n\nCómo llegar:|$)/)
  const dirMatch = raw.match(/Cómo llegar:\s*([\s\S]*)/)
  return {
    space: spaceMatch ? spaceMatch[1].trim() : raw.trim(),
    area: areaMatch ? areaMatch[1].trim() : '',
    directions: dirMatch ? dirMatch[1].trim() : '',
  }
}

const CATEGORY_LABELS: Record<string, string> = {
  urbano: 'Urbano',
  playa: 'Playa y costa',
  montana: 'Montaña',
  finca: 'Fincas y campo',
  exclusivo: 'Exclusivo',
}

// Amenity display map: id → display label
const AMENITY_LABELS: Record<string, string> = {
  wifi: 'WiFi',
  kitchen: 'Cocina equipada',
  cocina: 'Cocina equipada',
  parking: 'Parqueadero',
  ac: 'Aire acondicionado',
  heating: 'Calefacción',
  washer: 'Lavadora',
  tv: 'Smart TV',
  pool: 'Piscina',
  gym: 'Gimnasio',
  garden: 'Jardín',
  balcony: 'Balcón',
  elevator: 'Ascensor',
  pets: 'Mascotas permitidas',
  workspace: 'Zona de trabajo',
  bbq: 'BBQ / Chimenea',
  'beach-access': 'Acceso a playa',
  'tour-cafetero': 'Tour cafetero',
  beds: 'Camas extra',
  'mountain-view': 'Vista a montaña',
  premium: 'Servicio premium',
}

// Static mock data for demo — IDs match the search/page.tsx card IDs
// so clicking a card in the explorador opens the full detail page correctly
const MOCK_DATA: Record<string, any> = {
  // ─── FINCAS Y CAMPO ───────────────────────────────────────────────────────
  'f1': {
    title: 'Finca cafetera con vista al Nevado del Huila',
    type: 'Finca', category: 'finca', city: 'Salento', country: 'Colombia',
    bedrooms: 3, bathrooms: 2, capacity: 6,
    description: 'El espacio: Finca de 180m² rodeada de cultivos de café, con sala colonial, 3 habitaciones, cocina campesina equipada y terraza cubierta con hamacas y vista al nevado.\n\nLa zona: A 4 km del centro de Salento, con acceso a los senderos del Valle de Cocora. Zona cafetera Patrimonio de la Humanidad UNESCO, colibríes y palmas de cera a minutos.\n\nCómo llegar: Desde Armenia, bus directo a Salento (1h) y jeep willys desde el parque hasta la finca (15 min, $5.000 COP por persona).',
    amenities: ['wifi', 'kitchen', 'parking', 'garden', 'bbq', 'mountain-view', 'tour-cafetero'],
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1400&q=90',
      'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1549692520-acc6669e2f0c?auto=format&fit=crop&w=900&q=80',
    ],
    user_id: null, available_from: '2026-08-01', available_to: '2026-12-31',
  },
  // ─── PLAYA Y COSTA ────────────────────────────────────────────────────────
  'p1': {
    title: 'Casa frente al mar en Bocagrande, Cartagena',
    type: 'Casa de playa', category: 'playa', city: 'Cartagena', country: 'Colombia',
    bedrooms: 3, bathrooms: 2, capacity: 6,
    description: 'El espacio: Casa de dos pisos con acceso directo a playa privada, sala de estar abierta al mar, cocina americana integrada y 3 habitaciones con ventilación natural. Terraza en el piso superior con vista 360° al Caribe.\n\nLa zona: Bocagrande, a 10 min en taxi del Centro Histórico de Cartagena. Restaurantes de mariscos, centros de buceo y el mercado artesanal de Las Bóvedas a poca distancia.\n\nCómo llegar: Aeropuerto Rafael Núñez a 20 min en taxi. Desde la Terminal de Transportes, bus directo a Bocagrande en 15 min.',
    amenities: ['wifi', 'kitchen', 'ac', 'parking', 'pool', 'beach-access', 'balcony'],
    images: [
      'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1400&q=90',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1473116763269-25541077536d?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1545579133-99ab5ab189bd?auto=format&fit=crop&w=900&q=80',
    ],
    user_id: null, available_from: '2026-08-01', available_to: '2026-12-31',
  },
  // ─── URBANO ───────────────────────────────────────────────────────────────
  'u1': {
    title: 'Loft de diseño en El Poblado, Medellín',
    type: 'Loft', category: 'urbano', city: 'Medellín', country: 'Colombia',
    bedrooms: 1, bathrooms: 1, capacity: 2,
    description: 'El espacio: Loft de 55m² en el corazón de El Poblado. Diseño industrial con ladrillo expuesto, cocina americana equipada con máquina de espresso, escritorio de trabajo y Smart TV 55\'. Cama king size con ropa de cama premium.\n\nLa zona: El Poblado, a 5 min caminando de Parque Lleras, rodeado de restaurantes gourmet, bares y el metro cable que llega a la ladera oriental.\n\nCómo llegar: Metro Estación El Poblado a 700m. Aeropuerto Olaya Herrera (EOH) a 15 min en Uber.',
    amenities: ['wifi', 'kitchen', 'ac', 'tv', 'workspace', 'elevator'],
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1400&q=90',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=900&q=80',
    ],
    user_id: null, available_from: '2026-08-01', available_to: '2026-12-31',
  },
  // ─── MONTAÑA ──────────────────────────────────────────────────────────────
  'm1': {
    title: 'Chalet en el Parque Natural Chicamocha, Santander',
    type: 'Cabaña', category: 'montana', city: 'San Gil', country: 'Colombia',
    bedrooms: 2, bathrooms: 1, capacity: 4,
    description: 'El espacio: Cabaña de madera de 75m² con chimenea a leña, sala abierta con vista directa al Cañón del Chicamocha, cocina equipada y 2 habitaciones con ropa de cama de lana artesanal.\n\nLa zona: A 8 km del Parque Nacional del Chicamocha, con acceso a rapel, parapente y rafting en el río Fonce. San Gil, capital de los deportes extremos de Colombia, a 20 min.\n\nCómo llegar: Bus Bogotá–San Gil (6h) o vuelo a Bucaramanga + 2h en carro. Parqueadero privado en la cabaña.',
    amenities: ['wifi', 'bbq', 'parking', 'mountain-view', 'heating', 'pets'],
    images: [
      'https://images.unsplash.com/photo-1486873249359-2731bd6dafc7?auto=format&fit=crop&w=1400&q=90',
      'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80',
    ],
    user_id: null, available_from: '2026-08-01', available_to: '2026-12-31',
  },
  // ─── EXCLUSIVO ────────────────────────────────────────────────────────────
  'e1': {
    title: 'Villa con piscina infinita — Rodadero, Santa Marta',
    type: 'Villa', category: 'exclusivo', city: 'Santa Marta', country: 'Colombia',
    bedrooms: 5, bathrooms: 4, capacity: 12,
    description: 'El espacio: Villa de 380m² con piscina infinita con vista al mar, cocina gourmet con isla central, sala de cine privada, 5 suites con baños en mármol carrara y terraza panorámica. Servicio de mayordomo opcional bajo solicitud previa.\n\nLa zona: Rodadero Sur, a 2 km de la playa de El Rodadero y 25 min del Parque Nacional Natural Tayrona. Acceso a yates privados y tours de snorkel en Los Flamencos.\n\nCómo llegar: Aeropuerto Simón Bolívar (SMR) a 15 min en carro. Servicio de transfer privado disponible con reserva previa (+57 321 000 0000).',
    amenities: ['wifi', 'pool', 'parking', 'gym', 'premium', 'beach-access', 'workspace', 'tv', 'ac'],
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=90',
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1592595896551-12b371d546d5?auto=format&fit=crop&w=900&q=80',
    ],
    user_id: null, available_from: '2026-08-01', available_to: '2026-12-31',
  },
}

export default function PropertyDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [property, setProperty] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)

  // Booking panel state
  const [checkin, setCheckin] = useState('')
  const [checkout, setCheckout] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [bookError, setBookError] = useState('')

  // Mobile booking modal
  const [bookingModalOpen, setBookingModalOpen] = useState(false)

  // Description expand state
  const [spaceExpanded, setSpaceExpanded] = useState(false)
  const [areaExpanded, setAreaExpanded] = useState(false)
  const [dirExpanded, setDirExpanded] = useState(false)

  const MOCK_IDS = Object.keys(MOCK_DATA)
  const isMock = MOCK_IDS.includes(params.id)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)

      if (isMock) {
        setProperty(MOCK_DATA[params.id] || null)
        setLoading(false)
        return
      }
      const { data } = await supabase
        .from('properties')
        .select('*')
        .eq('id', params.id)
        .maybeSingle()
      setProperty(data)
      setLoading(false)
    }
    load()
  }, [params.id])

  const nights = checkin && checkout
    ? Math.max(0, Math.round((new Date(checkout).getTime() - new Date(checkin).getTime()) / 86400000))
    : 0

  const wellScore = property
    ? calcWellScore(property.capacity || 2, property.bedrooms || 1, property.bathrooms || 1)
    : 0

  const totalWP = wellScore * nights

  const images = property?.images?.length
    ? property.images
    : [`/images/property-${((parseInt(params.id.replace(/\D/g, '') || '1')) % 6) + 1}.jpg`]

  const desc = parseDescription(property?.description)
  const catLabel = CATEGORY_LABELS[property?.category] || property?.type || 'Vivienda'
  const amenitiesList: string[] = property?.amenities || []

  const handleRequest = async () => {
    setBookError('')
    if (!checkin || !checkout || nights < 1) { setBookError('Selecciona fechas válidas'); return }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    if (property?.user_id === user.id) { setBookError('No puedes solicitar tu propia vivienda'); return }

    const { data: bal } = await supabase
      .from('wellpoint_balances')
      .select('current_balance')
      .eq('user_id', user.id)
      .maybeSingle()

    const balance = bal?.current_balance ?? 100
    if (balance < totalWP) {
      setBookError(`Necesitas ${totalWP} WP pero tienes ${balance} WP. Hospeda a alguien para ganar más.`)
      return
    }

    setSubmitting(true)
    const { error: insertError } = await supabase.from('exchanges').insert({
      host_id: property.user_id,
      guest_id: user.id,
      host_property_id: isMock ? null : params.id,
      checkin_date: checkin,
      checkout_date: checkout,
      nights,
      wellscore_snapshot: wellScore,
      status: 'pending',
    })

    setSubmitting(false)
    if (insertError) { setBookError(insertError.message); return }
    setSubmitted(true)
    setBookingModalOpen(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-mist flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-accent-mango border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-surface-mist flex flex-col items-center justify-center gap-4">
        <p className="font-fraunces text-xl font-semibold text-ink-teal-900">Vivienda no encontrada</p>
        <Link href="/search" className="font-inter text-sm text-accent-mango hover:underline">← Volver al explorador</Link>
      </div>
    )
  }

  // ── Booking form (shared between sidebar & modal) ──────────────────────────
  const BookingForm = () => (
    <div className="space-y-4">
      {/* Price */}
      <div>
        <p className="font-plex font-bold text-3xl text-ink-teal-900">
          {wellScore} <span className="font-inter text-base font-normal text-text-muted-custom">WP/noche</span>
        </p>
        <p className="font-inter text-xs text-text-muted-custom mt-0.5">Intercambio con WellPoints</p>
      </div>

      {/* Exchange type chips */}
      <div className="flex gap-2">
        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-mist rounded-full font-inter text-xs font-medium text-ink-teal-900">
          <RefreshCw className="w-3 h-3" /> Recíproco
        </span>
        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-mist rounded-full font-inter text-xs font-medium text-ink-teal-900">
          <CreditCard className="w-3 h-3" /> WP comprados
        </span>
      </div>

      {submitted ? (
        <div className="text-center py-6">
          <CheckCircle2 className="w-12 h-12 text-signal-green mx-auto mb-3" />
          <p className="font-fraunces font-semibold text-lg text-ink-teal-900 mb-1">¡Solicitud enviada!</p>
          <p className="font-inter text-sm text-text-muted-custom mb-4">El anfitrión la confirmará desde su dashboard.</p>
          <Link href="/dashboard" className="font-inter text-sm font-semibold text-accent-mango hover:underline">
            Ver en mi dashboard →
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            <div>
              <label className="block font-inter text-xs font-semibold text-ink-teal-900 mb-1">Check-in</label>
              <input
                type="date"
                value={checkin}
                onChange={e => setCheckin(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2.5 border border-neutral-200 rounded-radius-sm font-inter text-sm text-ink-teal-900 focus:ring-2 focus:ring-accent-mango focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block font-inter text-xs font-semibold text-ink-teal-900 mb-1">Check-out</label>
              <input
                type="date"
                value={checkout}
                onChange={e => setCheckout(e.target.value)}
                min={checkin || new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2.5 border border-neutral-200 rounded-radius-sm font-inter text-sm text-ink-teal-900 focus:ring-2 focus:ring-accent-mango focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          {nights > 0 && (
            <div className="bg-accent-mango/5 border border-accent-mango/20 rounded-radius-sm p-3">
              <div className="flex justify-between font-inter text-sm mb-1">
                <span className="text-text-muted-custom">{wellScore} WP × {nights} noches</span>
                <span className="font-bold text-ink-teal-900">{totalWP} WP</span>
              </div>
              <p className="font-inter text-xs text-text-muted-custom">WellScore™ bloqueado al confirmar</p>
            </div>
          )}

          {bookError && <p className="font-inter text-sm text-red-600">{bookError}</p>}

          <button
            onClick={handleRequest}
            disabled={submitting || nights < 1}
            className="w-full bg-accent-mango text-white py-3 rounded-radius-sm font-inter font-semibold hover:bg-accent-mango/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Enviando…' : 'Solicitar intercambio'}
          </button>

          <p className="font-inter text-center text-xs text-text-muted-custom">
            Los WP se descuentan solo cuando el anfitrión confirma y se finaliza el hospedaje.
          </p>

          {!isMock && property?.user_id && currentUser && property.user_id !== currentUser.id && (
            <button
              onClick={async () => {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) { router.push('/login'); return }
                const [u1, u2] = [user.id, property.user_id].sort()
                let { data: conv } = await supabase.from('conversations').select('id').eq('user_one_id', u1).eq('user_two_id', u2).maybeSingle()
                if (!conv) {
                  const { data: newConv } = await supabase.from('conversations').insert({ user_one_id: u1, user_two_id: u2 }).select('id').single()
                  conv = newConv
                }
                if (conv) router.push(`/messages?chat=${conv.id}`)
              }}
              className="w-full border border-neutral-200 text-ink-teal-900 py-2.5 rounded-radius-sm font-inter font-medium hover:bg-surface-mist transition-colors text-sm flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Consultar al anfitrión
            </button>
          )}
        </>
      )}
    </div>
  )

  // ── Collapsible text section ───────────────────────────────────────────────
  const DescSection = ({ title, text, expanded, onToggle }: {
    title: string; text: string; expanded: boolean; onToggle: () => void
  }) => {
    if (!text) return null
    const truncated = text.length > 200
    const displayText = (!truncated || expanded) ? text : text.slice(0, 200) + '…'

    return (
      <div className="border-b border-surface-mist pb-5 last:border-0">
        <h3 className="font-inter font-semibold text-base text-ink-teal-900 mb-2">{title}</h3>
        <p className="font-inter text-sm text-text-muted-custom leading-relaxed">{displayText}</p>
        {truncated && (
          <button
            onClick={onToggle}
            className="mt-2 font-inter text-sm font-semibold text-ink-teal-900 flex items-center gap-1 hover:text-accent-mango transition-colors"
          >
            {expanded ? 'Leer menos' : 'Leer más'}
            <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ── Page content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 lg:pb-8">

        {/* ── Breadcrumb ── */}
        <nav className="flex items-center gap-1.5 mb-4 font-inter text-sm text-text-muted-custom">
          <Link href="/search" className="flex items-center gap-1 hover:text-ink-teal-900 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Explorar
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="flex items-center gap-1.5">
            <CategoryIcon category={property.category || 'urbano'} className="w-3.5 h-3.5" />
            {catLabel}
          </span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-ink-teal-900 font-medium truncate max-w-[200px]">{property.city}</span>
        </nav>

        {/* ── Title row ── */}
        <div className="flex items-start justify-between mb-4 gap-4">
          <h1 className="font-fraunces font-semibold text-2xl sm:text-3xl text-ink-teal-900 leading-tight max-w-2xl">
            {property.title}
          </h1>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button className="flex items-center gap-1.5 font-inter text-sm font-medium text-ink-teal-900 px-3 py-2 border border-neutral-200 rounded-radius-sm hover:bg-surface-mist transition-colors">
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Compartir</span>
            </button>
            <button className="flex items-center gap-1.5 font-inter text-sm font-medium text-ink-teal-900 px-3 py-2 border border-neutral-200 rounded-radius-sm hover:bg-surface-mist transition-colors">
              <Heart className="w-4 h-4" />
              <span className="hidden sm:inline">Guardar</span>
            </button>
          </div>
        </div>

        {/* ── Meta line ── */}
        <div className="flex flex-wrap items-center gap-2 mb-6 font-inter text-sm text-text-muted-custom">
          <span>{property.city}, {property.country}</span>
        </div>

        {/* ── Gallery ── */}
        <div className="mb-8">
          <PropertyGallery
            images={images}
            title={property.title}
            isOwner={!!(currentUser && property.user_id === currentUser.id)}
          />
        </div>

        {/* ── Main 2-col layout ── */}
        <div className="grid lg:grid-cols-[1fr_380px] gap-12">

          {/* ─ Left column ─ */}
          <div className="space-y-8">

            {/* Quick stats */}
            <div className="flex flex-wrap items-center gap-6 pb-6 border-b border-surface-mist">
              <div className="flex items-center gap-2 font-inter text-sm text-ink-teal-900">
                <Users className="w-5 h-5 text-text-muted-custom" />
                <span><strong>{property.capacity || '—'}</strong> huéspedes</span>
              </div>
              <div className="flex items-center gap-2 font-inter text-sm text-ink-teal-900">
                <BedDouble className="w-5 h-5 text-text-muted-custom" />
                <span><strong>{property.bedrooms || '—'}</strong> habitaciones</span>
              </div>
              <div className="flex items-center gap-2 font-inter text-sm text-ink-teal-900">
                <Bath className="w-5 h-5 text-text-muted-custom" />
                <span><strong>{property.bathrooms || '—'}</strong> baños</span>
              </div>
              <div className="flex items-center gap-2">
                <CategoryIcon category={property.category || 'urbano'} className="w-5 h-5 text-text-muted-custom" />
                <span className="font-inter text-sm text-ink-teal-900">{catLabel}</span>
              </div>
            </div>

            {/* Structured description */}
            <div className="space-y-5">
              <h2 className="font-fraunces font-semibold text-xl text-ink-teal-900">Sobre esta vivienda</h2>
              <DescSection title="El espacio" text={desc.space} expanded={spaceExpanded} onToggle={() => setSpaceExpanded(p => !p)} />
              <DescSection title="La zona" text={desc.area} expanded={areaExpanded} onToggle={() => setAreaExpanded(p => !p)} />
              <DescSection title="Cómo llegar" text={desc.directions} expanded={dirExpanded} onToggle={() => setDirExpanded(p => !p)} />
            </div>

            {/* Amenities grid */}
            {amenitiesList.length > 0 && (
              <div className="border-t border-surface-mist pt-8">
                <h2 className="font-fraunces font-semibold text-xl text-ink-teal-900 mb-5">
                  Lo que ofrece este lugar
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {amenitiesList.map((slug: string) => (
                    <div key={slug} className="flex items-center gap-3 font-inter text-sm text-ink-teal-900">
                      <AmenityIcon slug={slug} className="w-5 h-5 text-text-muted-custom flex-shrink-0" strokeWidth={1.5} />
                      <span>{AMENITY_LABELS[slug] || slug}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* WellScore Breakdown */}
            <div className="border-t border-surface-mist pt-8">
              <WellScoreBreakdown
                total={wellScore}
                bedrooms={property.bedrooms}
                bathrooms={property.bathrooms}
                capacity={property.capacity}
                hasPhotos={images.length >= 3}
                isVerified={true}
                hasCalendar={!!(property.available_from && property.available_to)}
                reviewCount={12}
              />
            </div>

            {/* Placeholder map section */}
            <div className="border-t border-surface-mist pt-8">
              <h2 className="font-fraunces font-semibold text-xl text-ink-teal-900 mb-4">Dónde vas a estar</h2>
              <div className="h-48 bg-surface-mist rounded-[16px] flex items-center justify-center">
                <div className="text-center">
                  <p className="font-inter text-sm font-medium text-text-muted-custom">{property.city}, {property.country}</p>
                  <a
                    href={`https://maps.google.com?q=${encodeURIComponent(`${property.city}, ${property.country}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block font-inter text-sm font-semibold text-accent-mango hover:underline"
                  >
                    Ver en Google Maps →
                  </a>
                  <p className="font-inter text-xs text-text-muted-custom mt-1">La ubicación exacta se revela al confirmar el intercambio</p>
                </div>
              </div>
            </div>

          </div>

          {/* ─ Right column: Sticky booking panel (desktop only) ─ */}
          <div className="hidden lg:block">
            <div className="sticky top-24 bg-white border border-neutral-200 rounded-[20px] shadow-lg p-6">
              <BookingForm />
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile: Fixed bottom booking bar ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-200 px-4 py-3 flex items-center justify-between gap-4 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
        <div>
          <p className="font-plex font-bold text-lg text-ink-teal-900">{wellScore} WP<span className="font-inter text-sm font-normal text-text-muted-custom">/noche</span></p>
          {submitted && <p className="font-inter text-xs text-signal-green font-semibold">✓ Solicitud enviada</p>}
        </div>
        <button
          onClick={() => setBookingModalOpen(true)}
          className="bg-accent-mango text-white px-6 py-2.5 rounded-radius-sm font-inter font-semibold hover:bg-accent-mango/90 transition-colors"
        >
          Solicitar
        </button>
      </div>

      {/* ── Mobile: Booking modal ── */}
      {bookingModalOpen && (
        <div className="lg:hidden fixed inset-0 z-[100] flex flex-col">
          <div className="absolute inset-0 bg-black/50" onClick={() => setBookingModalOpen(false)} />
          <div className="relative mt-auto bg-white rounded-t-[24px] p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-fraunces font-semibold text-lg text-ink-teal-900">Solicitar intercambio</h2>
              <button onClick={() => setBookingModalOpen(false)} className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-mist">
                <X className="w-5 h-5 text-ink-teal-900" />
              </button>
            </div>
            <BookingForm />
          </div>
        </div>
      )}
    </div>
  )
}
