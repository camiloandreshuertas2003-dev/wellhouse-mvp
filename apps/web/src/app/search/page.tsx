'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import PropertyCard, { type PropertyCardData } from '@/components/PropertyCard'
import { Sparkles, Search, SlidersHorizontal, ShieldCheck, Heart, Home, Waves, Mountain, Trees, Building, MapPin } from 'lucide-react'
import Link from 'next/link'

import StoryViewer from '@/components/Stories/StoryViewer'

// ─── WellRank Calculator ─────────────────────────────────────────────────────
function calcWellRank(capacity: number, bedrooms: number, bathrooms: number): number {
  return Math.max(30, Math.min((capacity * 15) + (bedrooms * 20) + (bathrooms * 10), 300))
}

const CATEGORY_TABS = [
  { id: 'all', label: 'Todo', icon: (active: boolean) => <Home className={`w-[13px] h-[13px] ${active ? 'text-[#0f766e]' : 'text-[#6b7280]'}`} /> },
  { id: 'playa', label: 'Playa', icon: (active: boolean) => <Waves className={`w-[13px] h-[13px] ${active ? 'text-[#0f766e]' : 'text-[#6b7280]'}`} /> },
  { id: 'montana', label: 'Montaña', icon: (active: boolean) => <Mountain className={`w-[13px] h-[13px] ${active ? 'text-[#0f766e]' : 'text-[#6b7280]'}`} /> },
  { id: 'fincas', label: 'Campo', icon: (active: boolean) => <Trees className={`w-[13px] h-[13px] ${active ? 'text-[#0f766e]' : 'text-[#6b7280]'}`} /> },
  { id: 'urbano', label: 'Ciudad', icon: (active: boolean) => <Building className={`w-[13px] h-[13px] ${active ? 'text-[#0f766e]' : 'text-[#6b7280]'}`} /> },
  { id: 'exclusivo', label: 'Nuevas', icon: (active: boolean) => <Sparkles className={`w-[13px] h-[13px] ${active ? 'text-[#0f766e]' : 'text-[#6b7280]'}`} /> },
]

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [filters, setFilters] = useState({ propertyType: '', bedrooms: '', city: '' })
  const [draftFilters, setDraftFilters] = useState({ propertyType: '', bedrooms: '', city: '' })
  const [showFilters, setShowFilters] = useState(false)
  const [realProps, setRealProps] = useState<PropertyCardData[]>([])
  const [loading, setLoading] = useState(true)
  const [stories, setStories] = useState<any[]>([])
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null)

  // Fetch host stories from Supabase
  useEffect(() => {
    async function loadStories() {
      try {
        const { data, error } = await supabase
          .from('host_stories')
          .select(`
            id,
            property_id,
            user_id,
            youtube_video_id,
            thumbnail_url,
            location_tags,
            users (
              name,
              avatar_url
            ),
            properties (
              title
            )
          `)
          .order('created_at', { ascending: false })

        if (error) throw error
        if (data) setStories(data)
      } catch (err) {
        console.error('Error fetching stories:', err)
      }
    }
    loadStories()
  }, [])

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
          .select('id, user_id, title, city, country, type, bedrooms, bathrooms, capacity, images, available_from, available_to, wellrank, users(avatar_url)')
          .eq('status', 'published')

        // Hide user's own properties
        if (user) {
          queryBuilder = queryBuilder.neq('user_id', user.id)
        }

        const { data, error } = await queryBuilder
        if (error) throw error

        if (data?.length) {
          const dbProps = data.map((p: any) => ({
            id: p.id,
            title: p.title,
            location: `${p.city || '—'}, ${p.country || '—'}`,
            type: p.type || 'Vivienda',
            category: undefined,
            bedrooms: p.bedrooms || 1,
            bathrooms: p.bathrooms || 1,
            capacity: p.capacity || 2,
            rating: 0, 
            reviews: 0,
            image: p.images?.[0] || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
            verified: false,
            isMock: false,
            wellRank: p.wellrank || calcWellRank(p.capacity || 2, p.bedrooms || 1, p.bathrooms || 1),
            host_avatar: p.users?.avatar_url
          }))
          setRealProps(dbProps)
        } else {
          setRealProps([])
        }
      } catch (err) {
        console.error('Error fetching properties:', err)
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
                      location.includes('cartagena') || location.includes('santa marta') || location.includes('barcelona') || location.includes('tulum')

      if (catKey === 'playa') return isPlaya

      if (catKey === 'fincas') {
        return !isPlaya && (type === 'finca' || type === 'casa ecológica' || title.includes('finca') || title.includes('campo') || (type === 'casa' && title.includes('jardín')) || location.includes('salento'))
      }
      if (catKey === 'montana') {
        return !isPlaya && (type === 'cabaña' || type === 'refugio' || title.includes('cabaña') || title.includes('montaña') || location.includes('salento') || location.includes('chiloé'))
      }
      if (catKey === 'exclusivo') {
        return !isPlaya && (type === 'villa' || type === 'penthouse' || title.includes('lujo') || title.includes('exclusivo'))
      }
      if (catKey === 'urbano') {
        return !isPlaya && (type === 'apartamento' || type === 'loft' || type === 'estudio' || type === 'casa' || type === 'urban' || location.includes('medellín'))
      }
      return false
    })
  }, [realProps])

  const activeProps = category !== 'all' ? getCategoryProps(category) : realProps

  const filteredProps = activeProps.filter((p) => {
    const q = debouncedQuery.toLowerCase()
    const matchQ = !q || p.title.toLowerCase().includes(q) || p.location.toLowerCase().includes(q)
    const matchType = !filters.propertyType || p.type.toLowerCase().includes(filters.propertyType.toLowerCase())
    const matchBeds = !filters.bedrooms || p.bedrooms >= parseInt(filters.bedrooms)
    const matchCity = !filters.city || p.location.toLowerCase().includes(filters.city.toLowerCase())
    return matchQ && matchType && matchBeds && matchCity
  })

  return (
    <div className="min-h-screen bg-[#fafafa] pb-24 md:pb-12">
      
      {/* Sticky Mobile Search Bar */}
      <div className="md:hidden sticky top-[60px] z-40 bg-[#fafafa]/90 backdrop-blur border-b border-surface-mist-dark p-2.5 flex items-center gap-2 shadow-sm">
        <div className="flex-1 flex items-center gap-2 bg-white px-3.5 py-2 rounded-full border border-surface-mist-dark">
          <Search className="w-3.5 h-3.5 text-gray-400" />
          <input 
            type="text" 
            placeholder="¿A dónde quieres ir?" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-xs text-ink-teal-900 bg-transparent focus:outline-none"
          />
        </div>
        <button 
          onClick={() => { setDraftFilters(filters); setShowFilters(!showFilters); }}
          className="p-2.5 bg-[#0f766e] text-white rounded-full hover:bg-[#0d635c] transition-all flex-shrink-0"
          aria-label="Filtros"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* ── HERO BANNER SECTION ─────────────────────────────────────────── */}
      <div className="max-w-[1380px] mx-auto md:px-6">
        <div className="mx-4 md:mx-0 rounded-3xl md:rounded-none relative h-[200px] md:h-[350px] overflow-hidden bg-black mt-2">
          {/* Background Image */}
          <img 
            src="/image_inicio_search.png" 
            alt="Wellhouse" 
            className="absolute inset-0 w-full h-full object-cover opacity-75 object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-black/15" />
          
          {/* Content Inside Hero */}
          <div className="absolute inset-0 px-4 py-4 md:px-8 md:py-8 flex flex-col justify-end z-10">
            <h1 className="font-fraunces font-bold text-xl md:text-[38px] text-white leading-tight max-w-[240px] md:max-w-xl">
              No es una estadía, <br />
              es tu próxima <span className="italic font-normal text-[#14b8a6]">experiencia</span>
            </h1>

            {/* Search Pill Bar */}
            <div className="mt-4 hidden md:flex items-center gap-3 bg-white p-1.5 rounded-full shadow-lg max-w-lg w-full">
              <div className="flex-1 flex items-center gap-2 pl-2">
                <Search className="w-3.5 h-3.5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="¿A dónde quieres ir?" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full font-inter text-[11px] sm:text-xs text-ink-teal-900 placeholder-gray-400 bg-transparent focus:outline-none"
                />
              </div>
              <button 
                onClick={() => { setDraftFilters(filters); setShowFilters(!showFilters); }}
                className="p-2 bg-[#0f766e] text-white rounded-full hover:bg-[#0d635c] transition-colors"
                aria-label="Filtros"
              >
                <SlidersHorizontal className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Drawer */}
      {showFilters && (
        <div className="max-w-[1280px] mx-auto px-4 sm:px-5 md:px-6 mt-4">
          <div className="bg-white p-4 rounded-2xl border border-surface-mist-dark shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-muted-custom uppercase tracking-wide mb-1.5">Tipo de vivienda</label>
              <select
                className="w-full p-2.5 border border-surface-mist-dark rounded-xl font-inter text-sm text-ink-teal-900 focus:outline-none bg-white h-[42px]"
                value={draftFilters.propertyType}
                onChange={(e) => setDraftFilters({ ...draftFilters, propertyType: e.target.value })}
              >
                <option value="">Todos</option>
                <option value="Finca">Finca</option>
                <option value="Casa">Casa</option>
                <option value="Apartamento">Apartamento</option>
                <option value="Loft">Loft</option>
                <option value="Cabaña">Cabaña</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-text-muted-custom uppercase tracking-wide mb-1.5">Habitaciones mínimas</label>
              <select
                className="w-full p-2.5 border border-surface-mist-dark rounded-xl font-inter text-sm text-ink-teal-900 focus:outline-none bg-white h-[42px]"
                value={draftFilters.bedrooms}
                onChange={(e) => setDraftFilters({ ...draftFilters, bedrooms: e.target.value })}
              >
                <option value="">Cualquiera</option>
                {[1, 2, 3, 4].map(n => <option key={n} value={n.toString()}>{n}+ habitaciones</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-text-muted-custom uppercase tracking-wide mb-1.5">Ciudad</label>
              <input
                type="text"
                placeholder="Ej: Medellín, Cali..."
                className="w-full p-2 border border-surface-mist-dark rounded-xl font-inter text-sm text-ink-teal-900 focus:outline-none focus:ring-1 focus:ring-[#0f766e] bg-white h-[42px]"
                value={draftFilters.city}
                onChange={(e) => setDraftFilters({ ...draftFilters, city: e.target.value })}
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={() => {
                  const cleared = { propertyType: '', bedrooms: '', city: '' }
                  setDraftFilters(cleared)
                  setFilters(cleared)
                  setQuery('')
                  setCategory('all')
                  setShowFilters(false)
                }}
                className="flex-1 py-2.5 text-xs font-bold text-ink-teal-900 border border-surface-mist-dark rounded-xl hover:bg-surface-mist transition-colors h-[42px]"
              >
                Limpiar
              </button>
              <button
                onClick={() => {
                  setFilters(draftFilters)
                  setShowFilters(false)
                }}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-[#0f766e] rounded-xl hover:bg-[#0d635c] transition-colors h-[42px]"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── CATEGORY BADGES (Scroll Horizontal) ─────────────────────────── */}
      <div className="max-w-[1380px] mx-auto px-4 sm:px-5 md:px-6 mt-5">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {CATEGORY_TABS.map(tab => {
            const isActive = category === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => { setCategory(tab.id); setQuery('') }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-xs sm:text-sm font-bold transition-all flex-shrink-0 h-[42px] ${
                  isActive 
                    ? 'bg-[#f0fdfa] border-[#0f766e] text-[#0f766e]' 
                    : 'bg-white border-surface-mist-dark text-text-muted-custom hover:bg-surface-mist'
                }`}
              >
                <span>{tab.icon(isActive)}</span>
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── DEFAULT / HOME STATE (Category === 'all' and no active query) ── */}
      {category === 'all' && !debouncedQuery ? (
        <div className="max-w-[1380px] mx-auto px-4 sm:px-5 md:px-6 mt-8 space-y-10">
          
          {/* SECTION 1: Host Stories ("Inspírate con experiencias reales") */}
          {stories.length > 0 && (
            <div>
              <div className="flex justify-between items-end mb-4">
                <div>
                  <h2 className="font-fraunces font-bold text-lg sm:text-xl md:text-[22px] text-ink-teal-900">
                    Inspírate con experiencias reales
                  </h2>
                </div>
                <button 
                  onClick={() => setCategory('playa')} 
                  className="text-xs sm:text-sm font-bold text-[#0f766e] hover:underline"
                >
                  Ver todas →
                </button>
              </div>

              {/* Stories Cards Grid / Horizontal Scroll */}
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                {stories.map((story, idx) => (
                  <div 
                    key={story.id} 
                    onClick={() => setActiveStoryIndex(idx)}
                    className="relative w-[120px] md:w-[170px] aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-900 shadow-sm flex-shrink-0 group cursor-pointer"
                  >
                    <img 
                      src={story.thumbnail_url} 
                      alt="" 
                      className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-102 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/20" />
                    
                    {/* Top Left Host Avatar */}
                    {story.users?.avatar_url && (
                      <div className="absolute top-2 left-2 w-6 h-6 rounded-full border border-white shadow-md overflow-hidden bg-gray-200">
                        <img src={story.users.avatar_url} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}

                    {/* Bottom Info Overlay */}
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                      <span className="inline-flex items-center gap-0.5 bg-[#0f766e]/85 px-1.5 py-0.5 rounded-full text-[8px] font-bold tracking-wide uppercase mb-1">
                        <MapPin className="w-2 h-2 text-white" /> {story.location_tags}
                      </span>
                      <h4 className="font-fraunces font-bold text-[10px] md:text-xs leading-snug line-clamp-2">
                        {story.properties?.title || 'Trato cerrado'}
                      </h4>
                      <p className="text-[9px] md:text-[10px] text-gray-300 font-inter mt-0.5">
                        {story.users?.name || 'Anfitrión'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 2: Available Properties ("Hogares disponibles para intercambiar") */}
          <div>
            <div className="flex justify-between items-end mb-4">
              <div>
                <h2 className="font-fraunces font-bold text-lg sm:text-xl md:text-[22px] text-ink-teal-900">
                  Hogares disponibles para intercambiar
                </h2>
              </div>
              <button 
                onClick={() => setCategory('playa')} 
                className="text-xs sm:text-sm font-bold text-[#0f766e] hover:underline"
              >
                Ver todos →
              </button>
            </div>

            {/* Properties Horizontal Scroll */}
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
              {realProps.map(p => (
                <PropertyCard key={p.id} property={p} variant="carousel" />
              ))}
            </div>
          </div>

          {/* SECTION 3: Trust Banner ("Viaja con confianza") */}
          <div className="bg-[#f0fdfa] rounded-2xl border border-[#ccfbf1] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#0f766e]/10 flex items-center justify-center text-[#0f766e] flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-fraunces font-bold text-sm sm:text-base text-ink-teal-900">Viaja con confianza</h4>
                <p className="text-xs text-text-muted-custom font-inter mt-0.5">
                  Perfiles verificados, reseñas reales y soporte 24/7 para tu tranquilidad.
                </p>
              </div>
            </div>
            <Link 
              href="/how-it-works"
              className="bg-[#0f766e] hover:bg-[#0d635c] text-white font-inter font-bold text-xs sm:text-sm px-5 py-2.5 rounded-full transition-colors self-start sm:self-center"
            >
              Conocer más
            </Link>
          </div>

        </div>
      ) : (
        /* ── FILTERED STATE (Category is active, or user is searching) ── */
        <div className="max-w-[1380px] mx-auto px-4 sm:px-5 md:px-6 mt-8">
          <div className="flex justify-between items-center mb-5">
            <p className="font-fraunces font-semibold text-lg md:text-xl text-ink-teal-900">
              {debouncedQuery ? (
                <>
                  Resultados para <span className="text-[#0f766e] font-bold">&ldquo;{debouncedQuery}&rdquo;</span>
                </>
              ) : (
                <>
                  {category === "fincas" ? "Campo" : category === "playa" ? "Playa y costa" : category === "urbano" ? "Ciudad" : category === "montana" ? "Montaña" : "Nuevas"}
                </>
              )}
            </p>
            <button
              onClick={() => { setCategory('all'); setQuery('') }}
              className="text-xs sm:text-sm font-bold text-[#0f766e] hover:underline"
            >
              Limpiar búsqueda
            </button>
          </div>

          {filteredProps.length === 0 ? (
            <div className="text-center py-16">
              <p className="font-fraunces text-base text-[#6b7280]">No encontramos resultados que coincidan.</p>
              <button
                onClick={() => { setQuery(''); setCategory('all') }}
                className="mt-3 bg-[#0f766e] hover:bg-[#0d635c] text-white font-bold text-sm px-6 py-2.5 rounded-full"
              >
                Ver todo
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
              {filteredProps.map(p => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          )}
        </div>
      )}
      {activeStoryIndex !== null && (
        <StoryViewer
          stories={stories.map(s => ({
            id: s.id,
            property_id: s.property_id,
            user_id: s.user_id,
            youtube_video_id: s.youtube_video_id,
            thumbnail_url: s.thumbnail_url,
            location_tags: s.location_tags,
            users: {
              full_name: s.users?.name || 'Anfitrión'
            },
            properties: {
              title: s.properties?.title || 'Vivienda',
              images: [],
              users: {
                full_name: s.users?.name || 'Anfitrión'
              }
            }
          }))}
          initialIndex={activeStoryIndex}
          onClose={() => setActiveStoryIndex(null)}
        />
      )}

    </div>
  )
}
