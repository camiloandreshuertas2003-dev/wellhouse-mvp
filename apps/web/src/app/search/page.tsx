'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import PropertyCard, { type PropertyCardData } from '@/components/PropertyCard'
import PropertyCarousel from '@/components/PropertyCarousel'
import CategoryTabs from '@/components/CategoryTabs'
import StoriesBar from '@/components/Stories/StoriesBar'
import { type HostStory } from '@/components/Stories/StoryViewer'

// ─── WellRank Calculator ─────────────────────────────────────────────────────
function calcWellRank(capacity: number, bedrooms: number, bathrooms: number): number {
  return Math.max(30, Math.min((capacity * 15) + (bedrooms * 20) + (bathrooms * 10), 300))
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
  { id: 'f1', title: 'Finca cafetera con vista al Nevado', location: 'Salento, Quindío', type: 'Finca cafetera', category: 'Fincas y campo', bedrooms: 3, bathrooms: 2, capacity: 6, rating: 4.9, reviews: 42, image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80', verified: true, wellRank: 160 },
  { id: 'p1', title: 'Casa frente al mar en Cartagena', location: 'Cartagena, Bolívar', type: 'Casa de playa', category: 'Playa y costa', bedrooms: 3, bathrooms: 2, capacity: 6, rating: 4.9, reviews: 61, image: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=800&q=80', verified: true, wellRank: 190 },
  { id: 'u1', title: 'Loft de diseño en El Poblado', location: 'Medellín, Antioquia', type: 'Loft', category: 'Urbano', bedrooms: 1, bathrooms: 1, capacity: 2, rating: 4.8, reviews: 39, image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80', verified: true, wellRank: 90 },
  { id: 'm1', title: 'Chalet en Sierra Nevada de Santa Marta', location: 'Santa Marta, Magdalena', type: 'Cabaña', category: 'Montaña', bedrooms: 2, bathrooms: 1, capacity: 4, rating: 4.9, reviews: 18, image: 'https://images.unsplash.com/photo-1486873249359-2731bd6dafc7?auto=format&fit=crop&w=800&q=80', verified: true, wellRank: 130 },
  { id: 'e1', title: 'Villa con piscina infinita en Santa Marta', location: 'Santa Marta, Magdalena', type: 'Villa', category: 'Exclusivo', bedrooms: 5, bathrooms: 4, capacity: 12, rating: 5.0, reviews: 71, image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80', verified: true, wellRank: 300 },
]

const FALLBACK_STORIES: HostStory[] = [
  {
    id: 's1',
    property_id: 'f1',
    user_id: 'mock-user-1',
    youtube_video_id: '5k_G7V6J7wM',
    thumbnail_url: 'https://img.youtube.com/vi/5k_G7V6J7wM/hqdefault.jpg',
    location_tags: 'Salento, Quindío',
    properties: {
      title: 'Finca cafetera con vista al Nevado',
      images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80'],
      users: { full_name: 'Carlos Mendoza' }
    }
  },
  {
    id: 's2',
    property_id: 'p1',
    user_id: 'mock-user-2',
    youtube_video_id: 'd26Z_W25q8s',
    thumbnail_url: 'https://img.youtube.com/vi/d26Z_W25q8s/hqdefault.jpg',
    location_tags: 'Cartagena, Bolívar',
    properties: {
      title: 'Casa frente al mar en Cartagena',
      images: ['https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=800&q=80'],
      users: { full_name: 'Ana María' }
    }
  },
  {
    id: 's3',
    property_id: 'u1',
    user_id: 'mock-user-3',
    youtube_video_id: 'n1Fq121G0o0',
    thumbnail_url: 'https://img.youtube.com/vi/n1Fq121G0o0/hqdefault.jpg',
    location_tags: 'Medellín, Antioquia',
    properties: {
      title: 'Loft de diseño en El Poblado',
      images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'],
      users: { full_name: 'Juan Pablo' }
    }
  }
]

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [filters, setFilters] = useState({ propertyType: '', bedrooms: '' })
  const [showFilters, setShowFilters] = useState(false)
  const [realProps, setRealProps] = useState<PropertyCardData[]>([])
  const [loading, setLoading] = useState(true)
  const [stories, setStories] = useState<HostStory[]>([])
  const [storiesLoading, setStoriesLoading] = useState(true)

  // Fetch host stories from Supabase
  useEffect(() => {
    async function loadStories() {
      try {
        setStoriesLoading(true)
        const { data, error } = await supabase
          .from('host_stories')
          .select(`
            id,
            property_id,
            user_id,
            youtube_video_id,
            thumbnail_url,
            location_tags,
            users:user_id (
              full_name:name
            ),
            properties (
              title,
              images
            )
          `)
          .order('created_at', { ascending: false })

        if (error) throw error
        if (data && data.length > 0) {
          setStories(data as any[])
        } else {
          setStories([])
        }
      } catch (err) {
        console.error('Error fetching stories:', err)
        setStories([])
      } finally {
        setStoriesLoading(false)
      }
    }
    loadStories()
  }, [])

  // Sort stories by matching location with search query
  const filteredStories = [...stories].sort((a, b) => {
    if (!debouncedQuery) return 0
    const q = debouncedQuery.toLowerCase()
    const aMatch = a.location_tags.toLowerCase().includes(q) || (a.properties?.title || '').toLowerCase().includes(q)
    const bMatch = b.location_tags.toLowerCase().includes(q) || (b.properties?.title || '').toLowerCase().includes(q)
    if (aMatch && !bMatch) return -1
    if (!aMatch && bMatch) return 1
    return 0
  })

  // Debounce query
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(t)
  }, [query])

  // Fetch published properties from Supabase
  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()

        let queryBuilder = supabase
          .from('properties')
          .select('id, user_id, title, city, country, type, bedrooms, bathrooms, capacity, images, available_from, available_to')
          .eq('status', 'published')
          .limit(PAGE_SIZE)

        // Hide user's own properties
        if (user) {
          queryBuilder = queryBuilder.neq('user_id', user.id)
        }

        // Filter out properties that are no longer available (available_to is in the past)
        const today = new Date().toISOString().split('T')[0]
        queryBuilder = queryBuilder.or(`available_to.gte.${today},available_to.is.null`)

        const { data, error } = await queryBuilder

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
            rating: 0, 
            reviews: 0,
            image: p.images?.[0] || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
            verified: false,
            isMock: false,
            wellRank: calcWellRank(p.capacity || 2, p.bedrooms || 1, p.bathrooms || 1),
          }))
          // Merge real DB properties with fallback properties, avoiding duplicate IDs
          setRealProps(dbProps)
        } else {
          // If no properties are registered/published yet, use test properties so the carousel is always populated
          setRealProps([])
        }
      } catch (err) {
        console.error('Error fetching properties, using fallback:', err)
        setRealProps([])
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const getCategoryProps = useCallback((catKey: string) => {
    return realProps.filter(p => {
      const type = (p.type || '').toLowerCase()
      const title = (p.title || '').toLowerCase()
      const location = (p.location || '').toLowerCase()

      const isPlaya = title.includes('playa') || title.includes('mar') || title.includes('costa') ||
                      location.includes('cartagena') || location.includes('santa marta') || location.includes('san andres') || location.includes('baru')

      if (catKey === 'playa') return isPlaya

      if (catKey === 'fincas') {
        return !isPlaya && (type === 'finca' || type === 'fincas y campo' || title.includes('finca') || title.includes('campo') || (type === 'casa' && title.includes('jardín')))
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

      {/* ── CONTENT AREA ── */}
      {stories.length > 0 && <StoriesBar stories={filteredStories} loading={storiesLoading} />}

      {/* "TODO" view: all category carousels */}
      {category === 'all' && !debouncedQuery && (
        <div className="divide-y divide-surface-mist">
          
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

      {/* FILTERED view */}
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
                  {category === "fincas" ? "Fincas y campo" : category === "playa" ? "Playa y costa" : category === "urbano" ? "Urbano" : category === "montana" ? "Montaña" : "Exclusivo"}
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-5">
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

