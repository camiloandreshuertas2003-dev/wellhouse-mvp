'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import PropertyCard, { type PropertyCardData } from '@/components/PropertyCard'
import PropertyCarousel from '@/components/PropertyCarousel'
import CategoryTabs from '@/components/CategoryTabs'

// ─── WellScore Calculator ─────────────────────────────────────────────────────
function calcWellScore(capacity: number, bedrooms: number, bathrooms: number): number {
  return Math.max(30, Math.min((capacity * 15) + (bedrooms * 20) + (bathrooms * 10), 300))
}

// ─── Editorial mock data (8 per section) ─────────────────────────────────────
// ─── Editorial mock data (8 per section) ─────────────────────────────────────
const FINCAS: PropertyCardData[] = [
  { id: 'f1', title: 'Finca cafetera con vista al Nevado', location: 'Salento, Quindío', type: 'Finca cafetera', category: 'Fincas y campo', bedrooms: 3, bathrooms: 2, capacity: 6, rating: 4.9, reviews: 42, image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80', verified: true, wellScore: 160 },
  { id: 'f2', title: 'Casa de campo rodeada de bambú', location: 'Filandia, Quindío', type: 'Casa de campo', category: 'Fincas y campo', bedrooms: 2, bathrooms: 1, capacity: 4, rating: 4.8, reviews: 28, image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80', verified: true, wellScore: 120 },
  { id: 'f3', title: 'Finca ganadera en los Llanos', location: 'Villavicencio, Meta', type: 'Finca ganadera', category: 'Fincas y campo', bedrooms: 4, bathrooms: 2, capacity: 10, rating: 4.7, reviews: 19, image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80', verified: true, wellScore: 200 },
  { id: 'f4', title: 'Refugio entre montañas de Boyacá', location: 'Villa de Leyva, Boyacá', type: 'Casa de campo', category: 'Fincas y campo', bedrooms: 3, bathrooms: 2, capacity: 7, rating: 4.9, reviews: 35, image: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80', verified: true, wellScore: 175 },
  { id: 'f5', title: 'Hacienda colonial en Cundinamarca', location: 'Guatavita, Cundinamarca', type: 'Finca cafetera', category: 'Fincas y campo', bedrooms: 5, bathrooms: 3, capacity: 12, rating: 5.0, reviews: 51, image: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=800&q=80', verified: true, wellScore: 250 },
  { id: 'f6', title: 'Parcela con piscina natural en Pereira', location: 'Pereira, Risaralda', type: 'Finca cafetera', category: 'Fincas y campo', bedrooms: 3, bathrooms: 2, capacity: 6, rating: 4.6, reviews: 14, image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80', verified: false, wellScore: 145 },
  { id: 'f7', title: 'Cabaña de bambú en el Eje Cafetero', location: 'Montenegro, Quindío', type: 'Cabaña', category: 'Fincas y campo', bedrooms: 1, bathrooms: 1, capacity: 3, rating: 4.8, reviews: 22, image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80', verified: true, wellScore: 85 },
  { id: 'f8', title: 'Finca ecológica con senderos naturales', location: 'Anserma, Caldas', type: 'Finca cafetera', category: 'Fincas y campo', bedrooms: 2, bathrooms: 1, capacity: 5, rating: 4.7, reviews: 17, image: 'https://images.unsplash.com/photo-1549692520-acc6669e2f0c?auto=format&fit=crop&w=800&q=80', verified: true, wellScore: 130 },
]

const PLAYAS: PropertyCardData[] = [
  { id: 'p1', title: 'Casa frente al mar en Cartagena', location: 'Cartagena, Bolívar', type: 'Casa de playa', category: 'Playa y costa', bedrooms: 3, bathrooms: 2, capacity: 6, rating: 4.9, reviews: 61, image: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=800&q=80', verified: true, wellScore: 190 },
  { id: 'p2', title: 'Cabaña costera en Capurganá', location: 'Acandí, Chocó', type: 'Cabaña costera', category: 'Playa y costa', bedrooms: 2, bathrooms: 1, capacity: 5, rating: 5.0, reviews: 33, image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', verified: true, wellScore: 140 },
  { id: 'p3', title: 'Apartamento con terraza al Caribe', location: 'Santa Marta, Magdalena', type: 'Apartamento', category: 'Playa y costa', bedrooms: 2, bathrooms: 2, capacity: 4, rating: 4.8, reviews: 44, image: 'https://images.unsplash.com/photo-1473116763269-25541077536d?auto=format&fit=crop&w=800&q=80', verified: true, wellScore: 155 },
  { id: 'p4', title: 'Loft moderno en Bocagrande', location: 'Cartagena, Bolívar', type: 'Loft', category: 'Playa y costa', bedrooms: 1, bathrooms: 1, capacity: 2, rating: 4.7, reviews: 18, image: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=800&q=80', verified: false, wellScore: 80 },
  { id: 'p5', title: 'Villa privada en Barú', location: 'Barú, Bolívar', type: 'Villa', category: 'Playa y costa', bedrooms: 4, bathrooms: 3, capacity: 9, rating: 5.0, reviews: 27, image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80', verified: true, wellScore: 240 },
  { id: 'p6', title: 'Bungalow en Playa Blanca', location: 'Tolú, Sucre', type: 'Cabaña costera', category: 'Playa y costa', bedrooms: 2, bathrooms: 1, capacity: 4, rating: 4.6, reviews: 11, image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=800&q=80', verified: true, wellScore: 110 },
  { id: 'p7', title: 'Penthouse con vista al Pacífico', location: 'Nuquí, Chocó', type: 'Apartamento', category: 'Playa y costa', bedrooms: 3, bathrooms: 2, capacity: 6, rating: 4.9, reviews: 9, image: 'https://images.unsplash.com/photo-1545579133-99ab5ab189bd?auto=format&fit=crop&w=800&q=80', verified: true, wellScore: 200 },
  { id: 'p8', title: 'Casa colonial cerca del Rodadero', location: 'Santa Marta, Magdalena', type: 'Casa de playa', category: 'Playa y costa', bedrooms: 3, bathrooms: 2, capacity: 7, rating: 4.7, reviews: 22, image: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=800&q=80', verified: false, wellScore: 165 },
]

const URBANO: PropertyCardData[] = [
  { id: 'u1', title: 'Loft de diseño en El Poblado', location: 'Medellín, Antioquia', type: 'Loft', category: 'Urbano', bedrooms: 1, bathrooms: 1, capacity: 2, rating: 4.8, reviews: 39, image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80', verified: true, wellScore: 90 },
  { id: 'u2', title: 'Apartamento moderno en Chapinero', location: 'Bogotá, Cundinamarca', type: 'Apartamento', category: 'Urbano', bedrooms: 2, bathrooms: 1, capacity: 4, rating: 4.7, reviews: 26, image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80', verified: true, wellScore: 120 },
  { id: 'u3', title: 'Casa colonial en La Candelaria', location: 'Bogotá, Cundinamarca', type: 'Casa de ciudad', category: 'Urbano', bedrooms: 3, bathrooms: 2, capacity: 6, rating: 4.5, reviews: 15, image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80', verified: false, wellScore: 155 },
  { id: 'u4', title: 'Estudio ejecutivo en Laureles', location: 'Medellín, Antioquia', type: 'Apartamento', category: 'Urbano', bedrooms: 1, bathrooms: 1, capacity: 2, rating: 4.6, reviews: 20, image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80', verified: true, wellScore: 70 },
  { id: 'u5', title: 'Penthouse con terraza en Usaquén', location: 'Bogotá, Cundinamarca', type: 'Apartamento', category: 'Urbano', bedrooms: 3, bathrooms: 2, capacity: 5, rating: 4.9, reviews: 48, image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80', verified: true, wellScore: 175 },
  { id: 'u6', title: 'Loft con jardín en Cali', location: 'Cali, Valle del Cauca', type: 'Loft', category: 'Urbano', bedrooms: 2, bathrooms: 1, capacity: 4, rating: 4.7, reviews: 31, image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80', verified: true, wellScore: 115 },
  { id: 'u7', title: 'Casa histórica en Popayán', location: 'Popayán, Cauca', type: 'Casa de ciudad', category: 'Urbano', bedrooms: 4, bathrooms: 2, capacity: 8, rating: 4.4, reviews: 8, image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80', verified: false, wellScore: 190 },
  { id: 'u8', title: 'Apartamento en Barranquilla', location: 'Barranquilla, Atlántico', type: 'Apartamento', category: 'Urbano', bedrooms: 2, bathrooms: 1, capacity: 4, rating: 4.6, reviews: 12, image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80', verified: true, wellScore: 100 },
]

const MONTANA: PropertyCardData[] = [
  { id: 'm1', title: 'Chalet en Sierra Nevada de Santa Marta', location: 'Santa Marta, Magdalena', type: 'Cabaña', category: 'Montaña', bedrooms: 2, bathrooms: 1, capacity: 4, rating: 4.9, reviews: 18, image: 'https://images.unsplash.com/photo-1486873249359-2731bd6dafc7?auto=format&fit=crop&w=800&q=80', verified: true, wellScore: 130 },
  { id: 'm2', title: 'Refugio andino en El Cocuy', location: 'El Cocuy, Boyacá', type: 'Refugio', category: 'Montaña', bedrooms: 3, bathrooms: 2, capacity: 6, rating: 4.8, reviews: 14, image: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=800&q=80', verified: true, wellScore: 155 },
  { id: 'm3', title: 'Casa de campo en Salento', location: 'Salento, Quindío', type: 'Casa de campo', category: 'Montaña', bedrooms: 2, bathrooms: 1, capacity: 5, rating: 4.7, reviews: 22, image: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=800&q=80', verified: true, wellScore: 120 },
  { id: 'm4', title: 'Cabaña panorámica en Manizales', location: 'Manizales, Caldas', type: 'Cabaña', category: 'Montaña', bedrooms: 1, bathrooms: 1, capacity: 3, rating: 4.9, reviews: 31, image: 'https://images.unsplash.com/photo-1549692520-acc6669e2f0c?auto=format&fit=crop&w=800&q=80', verified: true, wellScore: 95 },
  { id: 'm5', title: 'Finca en las montañas de Mérida', location: 'Medellin, Antioquia', type: 'Finca', category: 'Montaña', bedrooms: 3, bathrooms: 2, capacity: 7, rating: 4.6, reviews: 9, image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80', verified: false, wellScore: 170 },
  { id: 'm6', title: 'Casa alpina en La Calera', location: 'La Calera, Cundinamarca', type: 'Casa de campo', category: 'Montaña', bedrooms: 4, bathrooms: 2, capacity: 8, rating: 4.8, reviews: 26, image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80', verified: true, wellScore: 195 },
  { id: 'm7', title: 'Posada rural en Génova', location: 'Génova, Quindío', type: 'Cabaña', category: 'Montaña', bedrooms: 2, bathrooms: 1, capacity: 4, rating: 4.7, reviews: 11, image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80', verified: true, wellScore: 110 },
  { id: 'm8', title: 'Villa en las alturas de Bogotá', location: 'Bogotá, Cundinamarca', type: 'Villa', category: 'Montaña', bedrooms: 5, bathrooms: 3, capacity: 10, rating: 5.0, reviews: 7, image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80', verified: true, wellScore: 245 },
]

const EXCLUSIVO: PropertyCardData[] = [
  { id: 'e1', title: 'Villa con piscina infinita en Santa Marta', location: 'Santa Marta, Magdalena', type: 'Villa', category: 'Exclusivo', bedrooms: 5, bathrooms: 4, capacity: 12, rating: 5.0, reviews: 71, image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80', verified: true, wellScore: 300 },
  { id: 'e2', title: 'Casa panorámica en Manizales', location: 'Manizales, Caldas', type: 'Villa', category: 'Exclusivo', bedrooms: 4, bathrooms: 3, capacity: 10, rating: 4.9, reviews: 33, image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80', verified: true, wellScore: 260 },
  { id: 'e3', title: 'Hacienda boutique con spa privado', location: 'Montenegro, Quindío', type: 'Villa', category: 'Exclusivo', bedrooms: 6, bathrooms: 5, capacity: 14, rating: 5.0, reviews: 19, image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80', verified: true, wellScore: 300 },
  { id: 'e4', title: 'Casa flotante en el Amazonas', location: 'Leticia, Amazonas', type: 'Villa', category: 'Exclusivo', bedrooms: 3, bathrooms: 2, capacity: 6, rating: 4.8, reviews: 7, image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80', verified: true, wellScore: 220 },
  { id: 'e5', title: 'Mansión colonial restaurada en Mompox', location: 'Mompox, Bolívar', type: 'Villa', category: 'Exclusivo', bedrooms: 7, bathrooms: 5, capacity: 16, rating: 4.9, reviews: 14, image: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=800&q=80', verified: true, wellScore: 290 },
  { id: 'e6', title: 'Finca de lujo en la sabana bogotana', location: 'Sopó, Cundinamarca', type: 'Villa', category: 'Exclusivo', bedrooms: 5, bathrooms: 4, capacity: 12, rating: 5.0, reviews: 28, image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80', verified: true, wellScore: 275 },
  { id: 'e7', title: 'Chalet de montaña en El Cocuy', location: 'El Cocuy, Boyacá', type: 'Villa', category: 'Exclusivo', bedrooms: 4, bathrooms: 3, capacity: 9, rating: 4.7, reviews: 5, image: 'https://images.unsplash.com/photo-1592595896551-12b371d546d5?auto=format&fit=crop&w=800&q=80', verified: true, wellScore: 240 },
  { id: 'e8', title: 'Casita privada en Isla Mucura', location: 'San Bernardo del Viento, Córdoba', type: 'Villa', category: 'Exclusivo', bedrooms: 2, bathrooms: 2, capacity: 4, rating: 5.0, reviews: 11, image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80', verified: true, wellScore: 200 },
]

const CATEGORY_MAP: Record<string, { label: string; data: PropertyCardData[] }> = {
  fincas:    { label: 'Fincas y campo',  data: FINCAS },
  playa:     { label: 'Playa y costa',   data: PLAYAS },
  urbano:    { label: 'Urbano',          data: URBANO },
  montana:   { label: 'Montaña',         data: MONTANA },
  exclusivo: { label: 'Exclusivo',       data: EXCLUSIVO },
}

const CATEGORY_SUBTITLES: Record<string, string> = {
  fincas:    'El Eje, los Llanos, Boyacá — pon pausa a la ciudad',
  playa:     'Caribe, Pacífico y archipiélagos colombianos',
  urbano:    'Apartamentos y lofts en las ciudades más vibrantes',
  montana:   'Refugios de montaña y cabañas andinas',
  exclusivo: 'Villas y mansiones para una experiencia única',
}

const PAGE_SIZE = 24

const FALLBACK_REAL_PROPS: PropertyCardData[] = [
  { id: 'f1', title: 'Finca cafetera con vista al Nevado', location: 'Salento, Quindío', type: 'Finca cafetera', category: 'Fincas y campo', bedrooms: 3, bathrooms: 2, capacity: 6, rating: 4.9, reviews: 42, image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80', verified: true, wellScore: 160 },
  { id: 'p1', title: 'Casa frente al mar en Cartagena', location: 'Cartagena, Bolívar', type: 'Casa de playa', category: 'Playa y costa', bedrooms: 3, bathrooms: 2, capacity: 6, rating: 4.9, reviews: 61, image: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=800&q=80', verified: true, wellScore: 190 },
  { id: 'u1', title: 'Loft de diseño en El Poblado', location: 'Medellín, Antioquia', type: 'Loft', category: 'Urbano', bedrooms: 1, bathrooms: 1, capacity: 2, rating: 4.8, reviews: 39, image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80', verified: true, wellScore: 90 },
  { id: 'm1', title: 'Chalet en Sierra Nevada de Santa Marta', location: 'Santa Marta, Magdalena', type: 'Cabaña', category: 'Montaña', bedrooms: 2, bathrooms: 1, capacity: 4, rating: 4.9, reviews: 18, image: 'https://images.unsplash.com/photo-1486873249359-2731bd6dafc7?auto=format&fit=crop&w=800&q=80', verified: true, wellScore: 130 },
  { id: 'e1', title: 'Villa con piscina infinita en Santa Marta', location: 'Santa Marta, Magdalena', type: 'Villa', category: 'Exclusivo', bedrooms: 5, bathrooms: 4, capacity: 12, rating: 5.0, reviews: 71, image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80', verified: true, wellScore: 300 },
]

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [filters, setFilters] = useState({ propertyType: '', bedrooms: '' })
  const [showFilters, setShowFilters] = useState(false)
  const [realProps, setRealProps] = useState<PropertyCardData[]>([])
  const [loading, setLoading] = useState(true)

  // Debounce query
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(t)
  }, [query])

  // Fetch published properties from Supabase
  useEffect(() => {
    async function loadData() {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('id, title, city, country, type, bedrooms, bathrooms, capacity, images')
          .eq('status', 'published')
          .limit(PAGE_SIZE)

        if (error) throw error

        if (data?.length) {
          const dbProps = data.map((p, i) => ({
            id: p.id,
            title: p.title,
            location: `${p.city || '—'}, ${p.country || '—'}`,
            type: p.type || 'Vivienda',
            category: undefined, // Will be classified dynamically in getCategoryProps
            bedrooms: p.bedrooms || 1,
            bathrooms: p.bathrooms || 1,
            capacity: p.capacity || 2,
            rating: 4.8, 
            reviews: 0,
            image: p.images?.[0] || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
            verified: true,
            isMock: false,
            wellScore: calcWellScore(p.capacity || 2, p.bedrooms || 1, p.bathrooms || 1),
          }))
          // Merge real DB properties with fallback properties, avoiding duplicate IDs
          const combined = [...dbProps, ...FALLBACK_REAL_PROPS.filter(m => !dbProps.some(d => d.id === m.id))]
          setRealProps(combined)
        } else {
          // If no properties are registered/published yet, use test properties so the carousel is always populated
          setRealProps(FALLBACK_REAL_PROPS)
        }
      } catch (err) {
        console.error('Error fetching properties, using fallback:', err)
        setRealProps(FALLBACK_REAL_PROPS)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Filter helper to combine real and mock properties per category
  const getCategoryProps = useCallback((catKey: string) => {
    const mockData = CATEGORY_MAP[catKey]?.data ?? []
    const matchReal = realProps.filter(p => {
      const type = (p.type || '').toLowerCase()
      const title = (p.title || '').toLowerCase()
      const location = (p.location || '').toLowerCase()

      const isPlaya = title.includes('playa') || title.includes('mar') || title.includes('costa') ||
                      location.includes('cartagena') || location.includes('santa marta') || location.includes('san andres') || location.includes('baru')

      if (catKey === 'playa') return isPlaya

      if (catKey === 'fincas') {
        return !isPlaya && (type === 'finca' || type === 'fincas y campo' || title.includes('finca') || title.includes('campo') || type === 'casa' && title.includes('jardín'))
      }
      if (catKey === 'montana') {
        return !isPlaya && (type === 'cabaña' || type === 'refugio' || title.includes('cabaña') || title.includes('montaña'))
      }
      if (catKey === 'exclusivo') {
        return !isPlaya && (type === 'villa' || type === 'penthouse' || title.includes('lujo') || title.includes('exclusivo'))
      }
      if (catKey === 'urbano') {
        return !isPlaya && (type === 'apartamento' || type === 'loft' || type === 'estudio' || type === 'casa' || type === 'urban')
      }
      return false
    })
    return [...matchReal, ...mockData]
  }, [realProps])

  // Determine what to show in filtered view (non-"all" category)
  const activeProps = category !== 'all' ? getCategoryProps(category) : realProps

  // Apply search/filter to target data
  const filtered = activeProps.filter((p) => {
    const q = debouncedQuery.toLowerCase()
    const matchQ = !q || p.title.toLowerCase().includes(q) || p.location.toLowerCase().includes(q)
    const matchType = !filters.propertyType || p.type.toLowerCase().includes(filters.propertyType.toLowerCase())
    const matchBeds = !filters.bedrooms || p.bedrooms >= parseInt(filters.bedrooms)
    return matchQ && matchType && matchBeds
  })

  return (
    <div className="min-h-screen bg-base-paper pb-20 md:pb-0">

      {/* ── Sticky Search + Categories bar ─────────────────────────────── */}
      <div className="bg-white border-b border-surface-mist-dark sticky top-16 z-30 shadow-shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8">

          {/* Search row */}
          <div className="flex items-center gap-3 py-2.5">
            <div className="flex-1 relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted-custom" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                id="search-input"
                type="search"
                placeholder="¿Dónde quieres quedarte? Eje, Costa, Llano…"
                className="w-full pl-9 pr-9 py-2.5 border border-surface-mist-dark rounded-radius-sm font-inter text-sm text-ink-teal-900 placeholder:text-text-muted-custom bg-base-paper focus:outline-none focus:ring-2 focus:ring-ink-teal-500 focus:border-transparent transition-all"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoComplete="off"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted-custom hover:text-ink-teal-900 transition-colors"
                  aria-label="Limpiar búsqueda"
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              )}
            </div>
            <button
              id="filters-toggle"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2.5 rounded-radius-sm border font-inter font-medium text-sm transition-all min-h-[40px] ${
                showFilters
                  ? 'bg-ink-teal-900 text-white border-ink-teal-900'
                  : 'border-surface-mist-dark text-ink-teal-700 hover:border-ink-teal-500 bg-white'
              }`}
              aria-expanded={showFilters}
            >
              <svg width="15" height="15" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path d="M2 4h14M5 9h8M8 14h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span className="hidden sm:inline">Filtros</span>
            </button>
          </div>

          {/* Filter Drawer */}
          {showFilters && (
            <div className="pb-3 border-t border-surface-mist grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
              <div>
                <label htmlFor="filter-type" className="block text-xs font-inter font-medium text-ink-teal-700 mb-1">Tipo de vivienda</label>
                <select
                  id="filter-type"
                  className="w-full px-3 py-2 border border-surface-mist-dark rounded-radius-sm font-inter text-sm text-ink-teal-900 bg-white focus:outline-none focus:ring-2 focus:ring-ink-teal-500"
                  value={filters.propertyType}
                  onChange={(e) => setFilters({ ...filters, propertyType: e.target.value })}
                >
                  <option value="">Todos</option>
                  <option value="Finca">Finca</option>
                  <option value="Casa">Casa</option>
                  <option value="Apartamento">Apartamento</option>
                  <option value="Loft">Loft</option>
                  <option value="Villa">Villa</option>
                  <option value="Cabaña">Cabaña</option>
                </select>
              </div>
              <div>
                <label htmlFor="filter-bedrooms" className="block text-xs font-inter font-medium text-ink-teal-700 mb-1">Mín. habitaciones</label>
                <select
                  id="filter-bedrooms"
                  className="w-full px-3 py-2 border border-surface-mist-dark rounded-radius-sm font-inter text-sm text-ink-teal-900 bg-white focus:outline-none focus:ring-2 focus:ring-ink-teal-500"
                  value={filters.bedrooms}
                  onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value })}
                >
                  <option value="">Cualquiera</option>
                  {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}+</option>)}
                </select>
              </div>
              <div className="flex items-end col-span-2">
                <button
                  onClick={() => { setFilters({ propertyType: '', bedrooms: '' }); setQuery(''); setCategory('all') }}
                  className="w-full px-3 py-2 text-sm font-inter text-ink-teal-700 border border-surface-mist-dark rounded-radius-sm hover:bg-surface-mist transition-colors"
                >
                  Limpiar filtros
                </button>
              </div>
            </div>
          )}

          {/* Category Tabs */}
          <div className="pb-2">
            <CategoryTabs
              active={category}
              onSelect={(cat) => { setCategory(cat); setQuery('') }}
            />
          </div>
        </div>
      </div>

      {/* ── CONTENT AREA ───────────────────────────────────────────────── */}

      {/* "TODO" view: show all category carousels (exactly like the screenshot) */}
      {category === 'all' && !debouncedQuery && (
        <div className="divide-y divide-surface-mist">
          {/* Real properties from Supabase (if any) */}
          {!loading && realProps.length > 0 && (
            <PropertyCarousel
              title="Viviendas disponibles ahora"
              subtitle="Recién publicadas y listas para recibir huéspedes"
              properties={realProps}
              viewAllHref="/search?category=all"
            />
          )}

          {/* Editorial carousels — always shown */}
          <PropertyCarousel
            title="Fincas y campo"
            subtitle={CATEGORY_SUBTITLES.fincas}
            properties={getCategoryProps('fincas')}
            viewAllHref="/search?category=fincas"
          />
          <PropertyCarousel
            title="Playa y costa"
            subtitle={CATEGORY_SUBTITLES.playa}
            properties={getCategoryProps('playa')}
            viewAllHref="/search?category=playa"
          />
          <PropertyCarousel
            title="Urbano"
            subtitle={CATEGORY_SUBTITLES.urbano}
            properties={getCategoryProps('urbano')}
            viewAllHref="/search?category=urbano"
          />
          <PropertyCarousel
            title="Montaña"
            subtitle={CATEGORY_SUBTITLES.montana}
            properties={getCategoryProps('montana')}
            viewAllHref="/search?category=montana"
          />
          <PropertyCarousel
            title="Exclusivo"
            subtitle={CATEGORY_SUBTITLES.exclusivo}
            properties={getCategoryProps('exclusivo')}
            viewAllHref="/search?category=exclusivo"
          />
        </div>
      )}

      {/* FILTERED view: specific category OR search query → show grid */}
      {(category !== 'all' || debouncedQuery) && (
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 py-6">

          {/* Section header */}
          <div className="flex items-center justify-between mb-5">
            <p className="font-fraunces font-semibold text-xl text-ink-teal-900">
              {debouncedQuery ? (
                <>
                  Resultados para <span className="text-accent-mango">&ldquo;{debouncedQuery}&rdquo;</span>
                </>
              ) : (
                <>
                  {CATEGORY_MAP[category]?.label}
                  <span className="font-inter font-normal text-text-muted-custom text-base ml-2">
                    — {CATEGORY_SUBTITLES[category]}
                  </span>
                </>
              )}
            </p>
            <button
              onClick={() => { setCategory('all'); setQuery('') }}
              className="text-sm font-inter text-ink-teal-500 hover:text-ink-teal-900 transition-colors flex items-center gap-1"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Todas las categorías
            </button>
          </div>

          {/* Grid */}
          {filtered.length === 0 ? (
            <div className="text-center py-24 flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-radius-full bg-surface-mist flex items-center justify-center">
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none" className="text-ink-teal-500" aria-hidden="true">
                  <rect x="4" y="8" width="28" height="22" rx="4" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  <circle cx="13" cy="17" r="3.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  <path d="M4 26l9-9 5 5 5-5 13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <p className="font-fraunces font-semibold text-xl text-ink-teal-900">Sin resultados</p>
                <p className="font-inter text-text-muted-custom text-sm mt-1">Prueba con otra búsqueda o categoría</p>
              </div>
              <button
                onClick={() => { setQuery(''); setCategory('all'); setFilters({ propertyType: '', bedrooms: '' }) }}
                className="px-5 py-2.5 bg-accent-mango text-white font-inter font-medium text-sm rounded-radius-sm hover:bg-accent-mango-hover transition-colors"
              >
                Ver todas las viviendas
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-5">
              {filtered.map((p) => (
                <PropertyCard key={p.id} property={p} variant="grid" />
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  )
}
