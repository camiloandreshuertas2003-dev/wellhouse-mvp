'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import PropertyGallery from '@/components/PropertyGallery'
import WellRankBreakdown from '@/components/WellRankBreakdown'
import AmenityIcon from '@/components/AmenityIcon'
import CategoryIcon from '@/components/CategoryIcon'
import {
  ChevronRight, Users, BedDouble, Bath, ArrowLeft, Share2, Heart,
  MessageCircle, CheckCircle2, RefreshCw, CreditCard, ChevronDown, X, Sparkles, MapPin, Compass
} from 'lucide-react'
import { GoogleMap, useLoadScript, Circle } from '@react-google-maps/api'

const Map = GoogleMap as any
const MapCircle = Circle as any

const libraries: ("places" | "drawing" | "geometry" | "visualization")[] = ['places']

// WellRank formula
function calcWellRank(capacity: number, bedrooms: number, bathrooms: number) {
  return Math.max(30, Math.min((capacity * 15) + (bedrooms * 20) + (bathrooms * 10), 300))
}

// Parse structured description from combined field (legacy compat)
function parseDescription(raw: string | null): { space: string; area: string; directions: string; host: string } {
  if (!raw) return { space: '', area: '', directions: '', host: '' }
  const spaceMatch = raw.match(/El espacio:\s*([\s\S]*?)(?=\n\nLa zona:|$)/)
  const areaMatch = raw.match(/La zona:\s*([\s\S]*?)(?=\n\nCómo llegar:|$)/)
  const dirMatch = raw.match(/Cómo llegar:\s*([\s\S]*?)(?=\n\nEl anfitrión:|$)/)
  const hostMatch = raw.match(/El anfitrión:\s*([\s\S]*)/)
  return {
    space: spaceMatch ? spaceMatch[1].trim() : (raw && !raw.includes('El espacio:') ? raw.trim() : ''),
    area: areaMatch ? areaMatch[1].trim() : '',
    directions: dirMatch ? dirMatch[1].trim() : '',
    host: hostMatch ? hostMatch[1].trim() : ''
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

export default function PropertyPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { id } = params
  
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries,
  })

  const [property, setProperty] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)

  // Booking panel state
  const [checkin, setCheckin] = useState('')
  const [checkout, setCheckout] = useState('')
  const [initialMessage, setInitialMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [bookError, setBookError] = useState('')

  // Mobile booking modal
  const [bookingModalOpen, setBookingModalOpen] = useState(false)

  // AI Local Guide
  const [generatingGuide, setGeneratingGuide] = useState(false)
  const [guideError, setGuideError] = useState('')

  // Description expand state
  const [spaceExpanded, setSpaceExpanded] = useState(false)
  const [areaExpanded, setAreaExpanded] = useState(false)
  const [dirExpanded, setDirExpanded] = useState(false)
  const [hostExpanded, setHostExpanded] = useState(false)

  const MOCK_IDS = Object.keys(MOCK_DATA)
  const isMock = MOCK_IDS.includes(params.id)

  const [questions, setQuestions] = useState<any[]>([])
  const [newQuestion, setNewQuestion] = useState('')
  const [asking, setAsking] = useState(false)
  const [answeringId, setAnsweringId] = useState<string | null>(null)
  const [answerText, setAnswerText] = useState('')

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
      
      // Load questions
      if (data) {
        const { data: qData } = await supabase
          .from('property_questions')
          .select('*, users:user_id(full_name:name, email)')
          .eq('property_id', data.id)
          .order('created_at', { ascending: true })
        if (qData) setQuestions(qData)
      }
      
      setLoading(false)
    }
    load()
  }, [params.id, isMock])

  const handleAskQuestion = async () => {
    if (!newQuestion.trim() || !currentUser) return
    setAsking(true)

    if (isMock) {
      const mockQ = {
        id: 'mock-q-' + Date.now(),
        property_id: params.id,
        user_id: currentUser.id,
        question: newQuestion.trim(),
        created_at: new Date().toISOString(),
        users: {
          full_name: currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'Tú'
        }
      }
      setQuestions(prev => [...prev, mockQ])
      setNewQuestion('')
      setAsking(false)
      return
    }

    const { data, error } = await supabase.from('property_questions').insert({
      property_id: property.id,
      user_id: currentUser.id,
      question: newQuestion.trim()
    }).select('*, users:user_id(full_name:name, email)').single()
    
    if (!error && data) {
      setQuestions(prev => [...prev, data])
      setNewQuestion('')
    }
    setAsking(false)
  }

  const handleAnswerQuestion = async (qId: string) => {
    if (!answerText.trim() || !currentUser) return

    if (isMock) {
      setQuestions(prev => prev.map(q => q.id === qId ? {
        ...q,
        answer: answerText.trim(),
        answered_at: new Date().toISOString()
      } : q))
      setAnsweringId(null)
      setAnswerText('')
      return
    }
    
    const { error } = await supabase.from('property_questions').update({
      answer: answerText.trim(),
      answered_at: new Date().toISOString()
    }).eq('id', qId)

    if (!error) {
      setQuestions(prev => prev.map(q => q.id === qId ? { ...q, answer: answerText.trim(), answered_at: new Date().toISOString() } : q))
      setAnsweringId(null)
      setAnswerText('')
    }
  }

  const nights = checkin && checkout
    ? Math.max(0, Math.round((new Date(checkout).getTime() - new Date(checkin).getTime()) / 86400000))
    : 0

  const wellRank = property
    ? calcWellRank(property.capacity || 2, property.bedrooms || 1, property.bathrooms || 1)
    : 0

  const totalWP = wellRank * nights

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
    
    // Check availability
    if (property?.available_from && checkin < property.available_from) {
      setBookError(`La propiedad está disponible a partir del ${property.available_from}`); return
    }
    if (property?.available_to && checkout > property.available_to) {
      setBookError(`La propiedad solo está disponible hasta el ${property.available_to}`); return
    }

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
      wellrank_snapshot: wellRank,
      status: 'pending',
    })
    
    // Create conversation if it doesn't exist
    let conversationId = null;
    if (!insertError && property.user_id) {
      const [u1, u2] = [user.id, property.user_id].sort()
      const { data: conv } = await supabase.from('conversations')
        .select('id').eq('user_one_id', u1).eq('user_two_id', u2).maybeSingle()
      
      if (!conv) {
        const { data: newConv } = await supabase.from('conversations').insert({ user_one_id: u1, user_two_id: u2 }).select().single()
        conversationId = newConv?.id
      } else {
        conversationId = conv.id
      }
      
      // Insert the initial free message
      if (conversationId && initialMessage.trim()) {
        await supabase.from('messages').insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: initialMessage.trim(),
          is_priority: false // The first message is free and not priority unless they are priority, but we'll default to false for simplicity or we can check.
        })
        
        await supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', conversationId)
      }
    }

    setSubmitting(false)
    if (insertError) { setBookError(insertError.message); return }
    setSubmitted(true)
    setBookingModalOpen(false)
  }

  const handleGenerateGuide = async () => {
    if (!property || isMock) return
    setGeneratingGuide(true)
    setGuideError('')
    try {
      const res = await fetch('/api/properties/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: property.id,
          city: property.city,
          country: property.country
        })
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      
      // Update local state
      setProperty({ ...property, local_guide: data.data })
    } catch (err: any) {
      setGuideError(err.message || 'Error al generar la guía')
    } finally {
      setGeneratingGuide(false)
    }
  }

  const isOwner = currentUser?.id === property?.user_id
  const hasLocalGuide = !!property?.local_guide

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
  const renderBookingForm = () => (
    <div className="space-y-4">
      {/* Price */}
      <div>
        <p className="font-plex font-bold text-3xl text-ink-teal-900">
          {wellRank} <span className="font-inter text-base font-normal text-text-muted-custom">WP/noche</span>
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
          {property?.available_from && property?.available_to && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 my-2">
              <p className="font-inter text-xs font-semibold text-blue-800">
                📅 Disponible del {new Date(property.available_from).toLocaleDateString('es-ES')} al {new Date(property.available_to).toLocaleDateString('es-ES')}
              </p>
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="block font-inter text-xs font-semibold text-ink-teal-900 mb-1">Check-in</label>
              <input
                type="date"
                value={checkin}
                onChange={e => setCheckin(e.target.value)}
                min={property?.available_from && property.available_from > new Date().toISOString().split('T')[0] ? property.available_from : new Date().toISOString().split('T')[0]}
                max={property?.available_to || undefined}
                className="w-full px-3 py-2.5 border border-neutral-200 rounded-radius-sm font-inter text-sm text-ink-teal-900 focus:ring-2 focus:ring-accent-mango focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block font-inter text-xs font-semibold text-ink-teal-900 mb-1">Check-out</label>
              <input
                type="date"
                value={checkout}
                onChange={e => setCheckout(e.target.value)}
                min={checkin || (property?.available_from && property.available_from > new Date().toISOString().split('T')[0] ? property.available_from : new Date().toISOString().split('T')[0])}
                max={property?.available_to || undefined}
                className="w-full px-3 py-2.5 border border-neutral-200 rounded-radius-sm font-inter text-sm text-ink-teal-900 focus:ring-2 focus:ring-accent-mango focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block font-inter text-xs font-semibold text-ink-teal-900 mb-1">Mensaje para el anfitrión (Gratis)</label>
            <textarea
              value={initialMessage}
              onChange={e => setInitialMessage(e.target.value)}
              placeholder="¡Hola! Me encantaría hospedarme en tu casa..."
              rows={3}
              className="w-full px-3 py-2.5 border border-neutral-200 rounded-radius-sm font-inter text-sm text-ink-teal-900 focus:ring-2 focus:ring-accent-mango focus:border-transparent outline-none transition-all resize-none"
            />
          </div>

          {nights > 0 && (
            <div className="bg-accent-mango/5 border border-accent-mango/20 rounded-radius-sm p-3">
              <div className="flex justify-between font-inter text-sm mb-1">
                <span className="text-text-muted-custom">{wellRank} WP × {nights} noches</span>
                <span className="font-bold text-ink-teal-900">{totalWP} WP</span>
              </div>
              <p className="font-inter text-xs text-text-muted-custom">WellRank™ bloqueado al confirmar</p>
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
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-8 pt-20 sm:pt-10 pb-24 lg:pb-8">

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
              
              {desc.host && (
                <div className="mt-8 pt-8 border-t border-surface-mist">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-primary-cobalt/10 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary-cobalt" />
                    </div>
                    <div>
                      <h2 className="font-fraunces font-semibold text-xl text-ink-teal-900">Conoce a tu anfitrión</h2>
                      <p className="text-sm text-text-muted-custom font-inter">Anfitrión verificado</p>
                    </div>
                  </div>
                  <DescSection title="Sobre mí" text={desc.host} expanded={hostExpanded} onToggle={() => setHostExpanded(p => !p)} />
                </div>
              )}
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

            {/* WellRank Breakdown */}
            <div className="border-t border-surface-mist pt-8">
              <WellRankBreakdown
                total={wellRank}
                bedrooms={property.bedrooms}
                bathrooms={property.bathrooms}
                capacity={property.capacity}
                hasPhotos={images.length >= 3}
                isVerified={isMock ? true : false}
                hasCalendar={!!(property.available_from && property.available_to)}
                reviewCount={isMock ? 12 : 0}
              />
            </div>

            {/* Map section */}
            <div className="border-t border-surface-mist pt-8">
              <h2 className="font-fraunces font-semibold text-xl text-ink-teal-900 mb-4">Dónde vas a estar</h2>
              <div className="h-64 w-full bg-surface-mist rounded-[16px] flex items-center justify-center mb-8 overflow-hidden relative">
                {loadError ? (
                  <div className="text-red-500 font-inter text-sm">Error al cargar el mapa.</div>
                ) : !isLoaded ? (
                  <div className="text-text-muted-custom font-inter text-sm">Cargando mapa...</div>
                ) : property.latitude && property.longitude ? (
                  <Map
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    center={{ lat: property.latitude, lng: property.longitude }}
                    zoom={13}
                    options={{ disableDefaultUI: true, zoomControl: true, gestureHandling: 'cooperative' }}
                  >
                    {/* Draw a circle instead of an exact marker for privacy, like Airbnb does */}
                    <MapCircle
                      center={{ lat: property.latitude, lng: property.longitude }}
                      radius={800}
                      options={{
                        fillColor: '#F59346', // accent-mango
                        fillOpacity: 0.35,
                        strokeColor: '#F59346',
                        strokeOpacity: 0.8,
                        strokeWeight: 2,
                      }}
                    />
                  </Map>
                ) : (
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
                  </div>
                )}
                <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
                  <span className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow-sm font-inter text-xs text-ink-teal-900 border border-surface-mist-dark">
                    La ubicación exacta se revela al confirmar el intercambio
                  </span>
                </div>
              </div>
              
              {/* AI Local Guide Section */}
              <div className="bg-gradient-to-br from-[#F5F8F7] to-white border border-[#E0EBE8] rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                  <Sparkles size={120} />
                </div>
                
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div>
                    <h3 className="font-fraunces font-semibold text-2xl text-ink-teal-900 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-accent-mango" />
                      Guía Local de Wellhouse
                    </h3>
                    <p className="font-inter text-sm text-text-muted-custom mt-1">
                      Generada con IA para ofrecerte las mejores experiencias en {property.city}
                    </p>
                  </div>
                  
                  {isOwner && !hasLocalGuide && !isMock && (
                    <button
                      onClick={handleGenerateGuide}
                      disabled={generatingGuide}
                      className="bg-accent-mango text-white px-4 py-2 rounded-xl font-inter font-medium text-sm flex items-center gap-2 hover:bg-[#e07525] transition-colors disabled:opacity-50"
                    >
                      {generatingGuide ? (
                        <><RefreshCw className="w-4 h-4 animate-spin" /> Generando...</>
                      ) : (
                        <><Sparkles className="w-4 h-4" /> Generar Guía</>
                      )}
                    </button>
                  )}
                </div>

                {guideError && (
                  <p className="text-red-500 text-sm mb-4 font-inter">{guideError}</p>
                )}

                {hasLocalGuide ? (
                  <div className="grid md:grid-cols-2 gap-8 relative z-10">
                    <div>
                      <h4 className="font-inter font-semibold text-ink-teal-900 mb-4 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-accent-mango" /> Lugares Imperdibles
                      </h4>
                      <div className="space-y-4">
                        {property.local_guide?.spots?.map((spot: any, i: number) => (
                          <div key={i} className="bg-white p-4 rounded-xl border border-surface-mist shadow-sm">
                            <h5 className="font-inter font-semibold text-ink-teal-900 text-sm">{spot.name}</h5>
                            <p className="font-inter text-xs text-text-muted-custom mt-1 mb-2">{spot.description}</p>
                            <span className="inline-block bg-[#F5F8F7] text-ink-teal-900 text-[10px] font-medium px-2 py-1 rounded-full">
                              {spot.distance}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-inter font-semibold text-ink-teal-900 mb-4 flex items-center gap-2">
                        <Compass className="w-4 h-4 text-accent-mango" /> Tips de Viaje Locales
                      </h4>
                      <div className="space-y-4">
                        {property.local_guide?.tips?.map((tip: any, i: number) => (
                          <div key={i} className="bg-[#113B3A] text-white p-4 rounded-xl shadow-sm">
                            <h5 className="font-inter font-semibold text-sm mb-1">{tip.title}</h5>
                            <p className="font-inter text-xs text-white/80">{tip.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 relative z-10 bg-white/50 rounded-xl backdrop-blur-sm border border-white/40">
                    <Compass className="w-8 h-8 text-surface-mist mx-auto mb-2" />
                    <p className="font-inter text-sm text-text-muted-custom">
                      Aún no hay una guía local para esta propiedad.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Q&A Section */}
            <div className="border-t border-surface-mist pt-8">
              <h2 className="font-fraunces font-semibold text-xl text-ink-teal-900 mb-6">Preguntas y respuestas</h2>
              
              <div className="space-y-6 mb-8">
                {questions.length === 0 ? (
                  <p className="font-inter text-sm text-text-muted-custom italic">Nadie ha preguntado todavía. ¡Sé el primero!</p>
                ) : (
                  questions.map(q => (
                    <div key={q.id} className="bg-surface-mist rounded-xl p-5">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-inter font-medium text-ink-teal-900">{q.question}</p>
                        <span className="font-inter text-xs text-text-muted-custom">
                          {new Date(q.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="font-inter text-xs text-text-muted-custom mb-3">Preguntado por: {q.users?.full_name || q.users?.email || 'Usuario'}</p>
                      
                      {q.answer ? (
                        <div className="bg-white rounded-lg p-4 border border-neutral-200 mt-3 relative">
                          <div className="absolute -top-2 left-4 w-4 h-4 bg-white border-t border-l border-neutral-200 transform rotate-45"></div>
                          <p className="font-inter text-sm text-ink-teal-900 relative z-10">{q.answer}</p>
                          <p className="font-inter text-xs text-text-muted-custom mt-2 relative z-10">Respuesta del anfitrión el {new Date(q.answered_at).toLocaleDateString()}</p>
                        </div>
                      ) : (
                        currentUser && (property.user_id === currentUser.id || isMock) && (
                          <div className="mt-4 border-t border-neutral-200 pt-4">
                            {answeringId === q.id ? (
                              <div className="flex flex-col sm:flex-row gap-2 w-full">
                                <input
                                  type="text"
                                  value={answerText}
                                  onChange={e => setAnswerText(e.target.value)}
                                  placeholder="Escribe tu respuesta..."
                                  className="flex-1 px-4 py-2.5 border border-neutral-200 rounded-xl font-inter text-sm focus:outline-none focus:border-accent-mango focus:ring-1 focus:ring-accent-mango bg-white"
                                />
                                <div className="flex gap-2 justify-end sm:justify-start">
                                  <button
                                    onClick={() => handleAnswerQuestion(q.id)}
                                    className="px-5 py-2.5 bg-ink-teal-900 text-white rounded-xl text-xs font-semibold hover:bg-ink-teal-800 transition-colors whitespace-nowrap"
                                  >
                                    Responder
                                  </button>
                                  <button
                                    onClick={() => { setAnsweringId(null); setAnswerText(''); }}
                                    className="px-5 py-2.5 text-text-muted-custom text-xs font-semibold hover:text-ink-teal-900 transition-colors"
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => setAnsweringId(q.id)}
                                className="text-sm font-semibold text-accent-mango hover:underline"
                              >
                                Responder a esta pregunta
                              </button>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  ))
                )}
              </div>

              {currentUser && (property.user_id !== currentUser.id || isMock) && (
                <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
                  <h3 className="font-inter font-semibold text-sm text-ink-teal-900 mb-3">Pregúntale al anfitrión</h3>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={newQuestion}
                      onChange={e => setNewQuestion(e.target.value)}
                      placeholder="Ej: ¿Hay supermercados cerca?"
                      className="flex-1 px-4 py-2.5 border border-neutral-200 rounded-xl font-inter text-sm focus:outline-none focus:border-accent-mango focus:ring-1 focus:ring-accent-mango bg-base-paper"
                    />
                    <button
                      onClick={handleAskQuestion}
                      disabled={asking || !newQuestion.trim()}
                      className="px-6 py-2.5 bg-accent-mango text-white rounded-xl text-sm font-semibold hover:bg-accent-mango-hover disabled:opacity-50 transition-all active:scale-95 whitespace-nowrap"
                    >
                      {asking ? 'Enviando...' : 'Preguntar'}
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* ─ Right column: Sticky booking panel (desktop only) ─ */}
          <div className="hidden lg:block">
            <div className="sticky top-24 bg-white border border-neutral-200 rounded-[20px] shadow-lg p-6">
              {renderBookingForm()}
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile: Fixed bottom booking bar ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-200 px-4 py-3 flex items-center justify-between gap-4 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
        <div>
          <p className="font-plex font-bold text-lg text-ink-teal-900">{wellRank} WP<span className="font-inter text-sm font-normal text-text-muted-custom">/noche</span></p>
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
            {renderBookingForm()}
          </div>
        </div>
      )}
    </div>
  )
}
