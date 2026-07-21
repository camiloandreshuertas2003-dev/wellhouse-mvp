'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import PropertyCard, { type PropertyCardData } from '@/components/PropertyCard'
import { Sparkles, Search, ShieldCheck, Heart, Home, Waves, Mountain, Trees, Building, MapPin, Map, List } from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import StoryViewer from '@/components/Stories/StoryViewer'
import { DayPicker, DateRange } from 'react-day-picker'
import { es } from 'date-fns/locale'
import { format } from 'date-fns'
import 'react-day-picker/dist/style.css'
// Dynamic import for map (client-only, avoids SSR issues with mapbox-gl)
const SearchMapView = dynamic(() => import('@/components/Map/SearchMapView'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center bg-surface-mist rounded-2xl h-full">
      <div className="w-6 h-6 border-4 border-[#0f766e] border-t-transparent rounded-full animate-spin" />
    </div>
  )
})

// ─── WellRank Calculator ─────────────────────────────────────────────────────
function calcWellRank(capacity: number, bedrooms: number, bathrooms: number): number {
  return Math.max(30, Math.min((capacity * 15) + (bedrooms * 20) + (bathrooms * 10), 300))
}

const CATEGORY_TABS = [
  { id: 'all', label: 'Todo', icon: (active: boolean) => <Home className={`w-[18px] h-[18px] sm:w-[13px] sm:h-[13px] ${active ? 'text-[#0f766e]' : 'text-[#6b7280]'}`} /> },
  { id: 'playa', label: 'Playa', icon: (active: boolean) => <Waves className={`w-[18px] h-[18px] sm:w-[13px] sm:h-[13px] ${active ? 'text-[#0f766e]' : 'text-[#6b7280]'}`} /> },
  { id: 'montana', label: 'Montaña', icon: (active: boolean) => <Mountain className={`w-[18px] h-[18px] sm:w-[13px] sm:h-[13px] ${active ? 'text-[#0f766e]' : 'text-[#6b7280]'}`} /> },
  { id: 'fincas', label: 'Campo', icon: (active: boolean) => <Trees className={`w-[18px] h-[18px] sm:w-[13px] sm:h-[13px] ${active ? 'text-[#0f766e]' : 'text-[#6b7280]'}`} /> },
  { id: 'urbano', label: 'Ciudad', icon: (active: boolean) => <Building className={`w-[18px] h-[18px] sm:w-[13px] sm:h-[13px] ${active ? 'text-[#0f766e]' : 'text-[#6b7280]'}`} /> },
  { id: 'exclusivo', label: 'Nuevas', icon: (active: boolean) => <Sparkles className={`w-[18px] h-[18px] sm:w-[13px] sm:h-[13px] ${active ? 'text-[#0f766e]' : 'text-[#6b7280]'}`} /> },
]

interface HeroBanner {
  id: string
  title: string
  subtitle: string
  image_url: string
  is_active: boolean
  order_index: number
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [propertyType, setPropertyType] = useState('')
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [guestCount, setGuestCount] = useState<number | ''>('')
  const [realProps, setRealProps] = useState<PropertyCardData[]>([])
  const [loading, setLoading] = useState(true)
  const [stories, setStories] = useState<any[]>([])
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null)

  const [showMobileSearchModal, setShowMobileSearchModal] = useState(false)
  const [showFiltersModal, setShowFiltersModal] = useState(false)

  const [showLocationDropdown, setShowLocationDropdown] = useState(false)
  const [activeSearch, setActiveSearch] = useState<{ query: string, dateRange?: DateRange, guestCount?: number | '' } | null>(null)
  const [searchError, setSearchError] = useState<string | null>(null)

  const uniqueLocations = Array.from(new Set(realProps.map(p => p.location.split(',')[0].trim()))).filter(loc => loc !== '—').sort()

  // View mode: 'list' | 'map' | 'split'
  type ViewMode = 'list' | 'map' | 'split'
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [highlightedPinId, setHighlightedPinId] = useState<string | null>(null)
  const [visiblePinIds, setVisiblePinIds] = useState<string[] | null>(null)
  
  const [searchAsMapMoves, setSearchAsMapMoves] = useState(true)
  const [mapBounds, setMapBounds] = useState<{ sw_lat: number, ne_lat: number, sw_lng: number, ne_lng: number } | null>(null)
  const [isMapLoading, setIsMapLoading] = useState(false)

  // Hero banner state
  const [banners, setBanners] = useState<HeroBanner[]>([])
  const [activeBannerIndex, setActiveBannerIndex] = useState(0)
  const [bannerFading, setBannerFading] = useState(false)

  // Fetch hero banners from Supabase
  useEffect(() => {
    async function loadBanners() {
      try {
        const { data, error } = await supabase
          .from('hero_banners')
          .select('*')
          .eq('is_active', true)
          .order('order_index', { ascending: true })
        if (!error && data && data.length > 0) {
          setBanners(data)
        }
      } catch (err) {
        console.error('Error fetching banners:', err)
      }
    }
    loadBanners()
  }, [])

  // Rotate banners every 10s with a fade effect
  useEffect(() => {
    if (banners.length <= 1) return
    const interval = setInterval(() => {
      setBannerFading(true)
      setTimeout(() => {
        setActiveBannerIndex(prev => (prev + 1) % banners.length)
        setBannerFading(false)
      }, 500)
    }, 10000)
    return () => clearInterval(interval)
  }, [banners.length])

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
      setIsMapLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()

        let queryBuilder = supabase
          .from('properties')
          .select('id, user_id, title, city, country, type, bedrooms, bathrooms, capacity, images, available_from, available_to, wellrank, latitude, longitude, users(avatar_url), property_photos(url, is_cover, order)')
          .in('status', ['published', 'available'])

        if (searchAsMapMoves && mapBounds) {
          queryBuilder = queryBuilder
            .gte('latitude', mapBounds.sw_lat)
            .lte('latitude', mapBounds.ne_lat)
            .gte('longitude', mapBounds.sw_lng)
            .lte('longitude', mapBounds.ne_lng)
        }

        // Hide user's own properties
        if (user) {
          queryBuilder = queryBuilder.neq('user_id', user.id)
        }

        const { data, error } = await queryBuilder
        if (error) throw error

        let favSet = new Set<string>()
        if (user) {
          try {
            const { data: favs } = await (supabase as any).from('favorites').select('property_id').eq('user_id', user.id)
            if (favs) {
              favs.forEach((f: any) => favSet.add(f.property_id))
            }
          } catch (err) {
            console.error('Error fetching favorites', err)
          }
        }

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
            image: (() => {
              // Prefer images array, then cover photo from property_photos, then default
              if (p.images?.[0]) return p.images[0]
              const coverPhoto = p.property_photos?.find((ph: any) => ph.is_cover)?.url
              if (coverPhoto) return coverPhoto
              const firstPhoto = p.property_photos?.sort((a: any, b: any) => a.order - b.order)?.[0]?.url
              if (firstPhoto) return firstPhoto
              return 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80'
            })(),
            verified: false,
            isMock: false,
            wellRank: p.wellrank || calcWellRank(p.capacity || 2, p.bedrooms || 1, p.bathrooms || 1),
            host_avatar: p.users?.avatar_url,
            isFavorite: favSet.has(p.id),
            latitude: p.latitude,
            longitude: p.longitude,
          }))
          setRealProps(dbProps)
        } else {
          setRealProps([])
        }
      } catch (err) {
        console.error('Error loading properties:', err)
      } finally {
        setLoading(false)
        setIsMapLoading(false)
      }
    }
    loadData()
  }, [searchAsMapMoves, mapBounds])

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

  const executeSearch = () => {
    setSearchError(null)
    if (!query.trim()) {
      setSearchError("Por favor, ingresa un destino.")
      setTimeout(() => setSearchError(null), 3000)
      return
    }
    if (!dateRange?.from || !dateRange?.to) {
      setSearchError("Por favor, selecciona fechas de llegada y salida.")
      setShowDatePicker(true)
      setTimeout(() => setSearchError(null), 3000)
      return
    }
    if (!guestCount) {
      setSearchError("Por favor, ingresa la cantidad de huéspedes.")
      setTimeout(() => setSearchError(null), 3000)
      return
    }
    
    setActiveSearch({ query, dateRange, guestCount })
    setShowDatePicker(false)
    setShowLocationDropdown(false)
    setShowMobileSearchModal(false)
  }

  const activeProps = category !== 'all' ? getCategoryProps(category) : realProps

  const normalize = (str: string) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")

  const baseFilteredProps = activeProps.filter((p) => {
    const q = activeSearch ? normalize(activeSearch.query) : ''
    const pTitle = normalize(p.title || '')
    const pLoc = normalize(p.location || '')
    
    let matchQ = !q || pTitle.includes(q) || pLoc.includes(q)
    
    // Fuzzy logic: if simple includes fails, check if any word from query exists in location
    if (!matchQ && q.trim().length > 0) {
       const queryWords = q.split(' ').filter(w => w.length > 2)
       if (queryWords.length > 0) {
         matchQ = queryWords.some(w => pLoc.includes(w) || pTitle.includes(w))
       }
    }

    const currentGuestCount = activeSearch ? activeSearch.guestCount : null
    const matchType = !propertyType || (p.type || '').toLowerCase().includes(propertyType.toLowerCase())
    const matchGuests = !currentGuestCount || p.capacity >= (currentGuestCount as number)
    return matchQ && matchType && matchGuests
  })

  const listProps = baseFilteredProps.filter(p => !visiblePinIds || visiblePinIds.includes(p.id))

  // Build map pins from base filtered results so the map always shows everything available for current filters
  const mapPins = baseFilteredProps
    .filter((p: any) => p.latitude && p.longitude)
    .map((p: any) => ({
      id: p.id,
      latitude: p.latitude,
      longitude: p.longitude,
      price_wp: p.wellRank || 100,
      title: p.title,
      image: p.image,
      isFavorite: p.isFavorite,
    }))
    
  // searchKey is used to trigger map re-centering when search filters change
  const searchKey = activeSearch ? `${activeSearch.query}-${category}-${propertyType}-${activeSearch.guestCount}` : `${category}-${propertyType}`

  const isSearchActive = category !== 'all' || activeSearch !== null

  return (
    <div className="min-h-screen bg-[#fafafa] pb-24 md:pb-12">
      
      {/* ── Mega-Search Trigger (Mobile) ──────────────── */}
      <div className="md:hidden sticky top-[60px] z-40 bg-[#fafafa]/90 backdrop-blur border-b border-surface-mist-dark p-3 shadow-sm">
        <div className="flex gap-2 items-center">
          <button 
            onClick={() => setShowMobileSearchModal(true)}
            className="flex-1 flex items-center bg-white px-4 py-3 rounded-full border border-surface-mist-dark shadow-sm min-w-0"
          >
            <Search className="w-5 h-5 text-ink-teal-900 mr-3 flex-shrink-0" />
            <div className="flex flex-col items-start flex-1 text-left min-w-0">
              <span className="text-sm font-bold text-ink-teal-900 truncate w-full">{query || '¿A dónde quieres ir?'}</span>
              <span className="text-[10px] text-text-muted-custom truncate w-full">
                {dateRange?.from ? 'Fechas añadidas' : 'Fechas'} · {guestCount ? `${guestCount} huéspedes` : 'Huéspedes'}
              </span>
            </div>
          </button>
          
          <div className="flex bg-surface-mist border border-neutral-200 rounded-full p-1 shadow-inner flex-shrink-0">
            <button
              onClick={() => {
                setViewMode('list')
                setTimeout(() => window.dispatchEvent(new Event('resize')), 100)
              }}
              className={`p-2.5 rounded-full transition-all ${
                viewMode === 'list' ? 'bg-white text-ink-teal-900 shadow-sm' : 'text-text-muted-custom hover:text-ink-teal-900'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                setViewMode('map')
                setTimeout(() => window.dispatchEvent(new Event('resize')), 100)
              }}
              className={`p-2.5 rounded-full transition-all ${
                viewMode === 'map' ? 'bg-white text-ink-teal-900 shadow-sm' : 'text-text-muted-custom hover:text-ink-teal-900'
              }`}
            >
              <Map className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>



      {/* ── HERO BANNER SECTION ─────────────────────────────────────────── */}
      <div className="max-w-[1380px] mx-auto md:px-6">
        <div className="mx-4 md:mx-0 rounded-3xl md:rounded-none relative h-[120px] md:h-[240px] overflow-hidden bg-black mt-2">
          {/* Background Image (dynamic, with fade) */}
          <img 
            src={banners[activeBannerIndex]?.image_url || '/image_inicio_search.png'} 
            alt="Wellhouse" 
            className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-500 ${bannerFading ? 'opacity-0' : 'opacity-75'}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-black/15" />
          
          {/* Content Inside Hero */}
          <div className={`absolute inset-0 px-4 py-4 md:px-8 md:py-8 flex flex-col justify-end z-10 transition-opacity duration-500 ${bannerFading ? 'opacity-0' : 'opacity-100'}`}>
            <h1 className="font-fraunces font-bold text-xl md:text-[38px] text-white leading-tight max-w-[300px] sm:max-w-sm md:max-w-xl">
              {banners[activeBannerIndex]?.title
                ? banners[activeBannerIndex].title
                : (<>No es una estadía, <br />es tu próxima <span className="italic font-normal text-[#14b8a6]">experiencia</span></>)
              }
            </h1>
            {banners[activeBannerIndex]?.subtitle && (
              <p className="text-white/70 text-xs md:text-sm mt-1 max-w-[300px] sm:max-w-sm md:max-w-sm">
                {banners[activeBannerIndex].subtitle}
              </p>
            )}

          </div>

          {/* Dot indicators */}
          {banners.length > 1 && (
            <div className="absolute bottom-3 right-4 flex items-center gap-1.5 z-10">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setBannerFading(true); setTimeout(() => { setActiveBannerIndex(i); setBannerFading(false); }, 400) }}
                  className={`rounded-full transition-all duration-300 ${i === activeBannerIndex ? 'w-5 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/40'}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>


      {/* ── VIEW TOGGLE (Lista / Mapa) ──────────────── */}
      <div className="max-w-[1380px] mx-auto px-3 sm:px-5 md:px-6 mt-3 flex items-center justify-between gap-2">
        <div className="hidden md:flex flex-1 max-w-4xl items-center bg-white rounded-full border border-surface-mist-dark shadow-sm divide-x divide-surface-mist-dark relative">
          <div className="flex-1 px-4 py-2 flex flex-col justify-center rounded-l-full hover:bg-surface-mist transition-colors cursor-text focus-within:bg-surface-mist group relative">
            <label className="text-[10px] font-bold text-ink-teal-900 uppercase tracking-wide cursor-text">Lugar</label>
            <input 
              type="text" 
              placeholder="¿A dónde vas?" 
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setShowLocationDropdown(true)
              }}
              onFocus={() => setShowLocationDropdown(true)}
              onBlur={() => setTimeout(() => setShowLocationDropdown(false), 200)}
              className="w-full text-sm text-ink-teal-900 bg-transparent focus:outline-none placeholder-text-muted-custom"
            />
            {showLocationDropdown && (query.length > 0 || uniqueLocations.length > 0) && (
              <div className="absolute top-[120%] left-0 w-[300px] bg-white border border-surface-mist-dark rounded-3xl shadow-2xl z-50 max-h-64 overflow-y-auto overflow-x-hidden p-3">
                <p className="text-xs font-bold text-text-muted-custom uppercase px-3 py-2 mb-1">Destinos recomendados</p>
                {uniqueLocations
                  .filter(loc => normalize(loc).includes(normalize(query)))
                  .map((loc, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setQuery(loc)
                        setShowLocationDropdown(false)
                      }}
                      className="w-full text-left px-4 py-3 text-sm font-medium text-ink-teal-900 hover:bg-surface-mist rounded-2xl flex items-center gap-3 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-surface-mist flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-4 h-4 text-[#0f766e]" />
                      </div>
                      {loc}
                    </button>
                  ))}
                {uniqueLocations.filter(loc => normalize(loc).includes(normalize(query))).length === 0 && (
                  <p className="text-sm text-text-muted-custom px-4 py-3">No hay destinos sugeridos</p>
                )}
              </div>
            )}
          </div>

          <div 
            className="px-4 py-2 flex flex-col justify-center hover:bg-surface-mist transition-colors cursor-pointer focus-within:bg-surface-mist w-[200px]"
            onClick={() => setShowDatePicker(!showDatePicker)}
          >
            <label className="text-[10px] font-bold text-ink-teal-900 uppercase tracking-wide cursor-pointer">Fechas</label>
            <div className="w-full text-sm text-ink-teal-900 bg-transparent focus:outline-none truncate cursor-pointer font-medium text-[#0f766e]">
              {dateRange?.from ? (dateRange.to ? `${format(dateRange.from, 'd MMM', { locale: es })} - ${format(dateRange.to, 'd MMM', { locale: es })}` : format(dateRange.from, 'd MMM', { locale: es })) : <span className="text-text-muted-custom font-normal">Añade fechas</span>}
            </div>
            {/* Desktop DatePicker Dropdown */}
            {showDatePicker && (
              <div 
                className="absolute top-[120%] left-1/4 mt-2 bg-white rounded-3xl p-4 shadow-2xl border border-surface-mist-dark z-50 cursor-auto"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex justify-end mb-2">
                  <button onClick={() => setShowDatePicker(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-mist hover:bg-surface-mist-dark text-ink-teal-900 font-bold">✕</button>
                </div>
                <DayPicker
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  locale={es}
                  numberOfMonths={2}
                  pagedNavigation
                  className="p-2"
                  classNames={{
                    months: "flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6",
                    month: "space-y-3",
                    caption: "flex justify-center pt-1 relative items-center mb-2",
                    caption_label: "text-sm font-bold text-ink-teal-900",
                    nav: "space-x-1 flex items-center",
                    nav_button: "h-7 w-7 bg-transparent hover:bg-surface-mist rounded-full flex items-center justify-center p-0 opacity-70 hover:opacity-100 transition-colors",
                    nav_button_previous: "absolute left-1",
                    nav_button_next: "absolute right-1",
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex",
                    head_cell: "text-text-muted-custom w-8 font-semibold text-[10px] uppercase tracking-wider",
                    row: "flex w-full mt-1",
                    cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
                    day: "h-8 w-8 p-0 font-medium rounded-full hover:bg-surface-mist hover:text-ink-teal-900 transition-colors cursor-pointer",
                    day_selected: "bg-[#0f766e] text-white hover:bg-ink-teal-900 hover:text-white focus:bg-[#0f766e] focus:text-white",
                    day_today: "font-bold text-accent-mango",
                    day_outside: "text-gray-300 opacity-50",
                    day_disabled: "text-gray-200 opacity-50",
                    day_range_middle: "bg-surface-mist text-ink-teal-900 rounded-none hover:rounded-none",
                    day_range_end: "rounded-r-full bg-ink-teal-900 text-white",
                    day_range_start: "rounded-l-full bg-ink-teal-900 text-white"
                  } as any}
                />
              </div>
            )}
          </div>

          <div className="px-4 py-2 flex flex-col justify-center hover:bg-surface-mist transition-colors cursor-text focus-within:bg-surface-mist w-[120px]">
             <label className="text-[10px] font-bold text-ink-teal-900 uppercase tracking-wide cursor-text">Quién</label>
             <input 
               type="number" 
               placeholder="¿Cuántos?" 
               value={guestCount}
               onChange={(e) => setGuestCount(e.target.value ? parseInt(e.target.value) : '')}
               className="w-full text-sm text-ink-teal-900 bg-transparent focus:outline-none placeholder-text-muted-custom"
             />
          </div>

          <div className="px-4 py-2 flex items-center justify-end rounded-r-full hover:bg-surface-mist transition-colors w-[80px]">
            <button 
              onClick={executeSearch}
              className="p-2.5 bg-accent-mango text-white rounded-full hover:bg-[#e07525] transition-colors shadow-sm relative"
              aria-label="Buscar"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Error de validación flotante */}
        {searchError && (
          <div className="absolute top-[110%] left-1/2 -translate-x-1/2 bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg z-50 animate-in fade-in slide-in-from-top-2">
            {searchError}
          </div>
        )}
        
        <div className="flex items-center justify-end gap-2 ml-auto" id="results-container">
          {visiblePinIds && (
            <button
              onClick={() => setVisiblePinIds(null)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0f766e]/10 text-[#0f766e] text-xs font-bold hover:bg-[#0f766e]/20 transition-colors"
            >
              Zona seleccionada ✕
            </button>
          )}
          <div className="hidden md:flex items-center gap-1 bg-white border border-surface-mist-dark rounded-full p-1">
          <button
            onClick={() => {
              setViewMode('list');
              setTimeout(() => window.dispatchEvent(new Event('resize')), 100)
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              viewMode === 'list' ? 'bg-ink-teal-900 text-white' : 'text-text-muted-custom hover:text-ink-teal-900'
            }`}
          >
            <List className="w-3.5 h-3.5" /> Lista
          </button>
          <button
            onClick={() => {
              setViewMode('map');
              setTimeout(() => window.dispatchEvent(new Event('resize')), 100)
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              viewMode === 'map' ? 'bg-ink-teal-900 text-white' : 'text-text-muted-custom hover:text-ink-teal-900'
            }`}
          >
            <Map className="w-3.5 h-3.5" /> Mapa
          </button>
          <button
            onClick={() => {
              setViewMode('split');
              setTimeout(() => window.dispatchEvent(new Event('resize')), 100)
            }}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              viewMode === 'split' ? 'bg-ink-teal-900 text-white' : 'text-text-muted-custom hover:text-ink-teal-900'
            }`}
          >
            <List className="w-3 h-3" /><Map className="w-3 h-3" /> Ambas
          </button>
        </div>
      </div>
      </div>
      {/* ── CATEGORY BADGES ─────────────────────────── */}
      <div className="max-w-[1380px] mx-auto px-3 sm:px-5 md:px-6 mt-4">
        <div className="flex items-center gap-2">
          {/* Categories Scroll */}
          <div className="flex gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-2 flex-1 justify-between sm:justify-start">
            {CATEGORY_TABS.map(tab => {
              const isActive = category === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => { setCategory(tab.id); setQuery('') }}
                  className={`flex flex-col items-center justify-center gap-0.5 sm:gap-1.5 py-2 px-0 sm:px-4 sm:py-2 rounded-xl sm:rounded-full border text-[9px] sm:text-sm font-bold transition-all flex-1 sm:flex-none sm:flex-shrink-0 sm:h-[42px] min-w-0 sm:min-w-fit ${
                    isActive 
                      ? 'bg-[#f0fdfa] border-[#0f766e] text-[#0f766e]' 
                      : 'bg-white border-surface-mist-dark text-text-muted-custom hover:bg-surface-mist'
                  }`}
                >
                  {tab.icon(isActive)}
                  <span className="leading-tight">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── CATÁLOGO ESTILO NETFLIX ─────────────────────────────── */}
      {category === 'all' && !debouncedQuery && viewMode === 'list' ? (
        <div className="max-w-[1380px] mx-auto px-4 sm:px-5 md:px-6 mt-6 space-y-10 pb-10">

          {/* Stories row (if any) */}
          {stories.length > 0 && (
            <div>
              <h2 className="font-fraunces font-bold text-base sm:text-lg text-ink-teal-900 mb-3">
                ✨ Historias de anfitriones
              </h2>
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                {stories.map((story, idx) => (
                  <div
                    key={story.id}
                    onClick={() => setActiveStoryIndex(idx)}
                    className="relative w-[110px] md:w-[150px] aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-900 shadow-sm flex-shrink-0 group cursor-pointer"
                  >
                    <img src={story.thumbnail_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/10" />
                    {story.users?.avatar_url && (
                      <div className="absolute top-2 left-2 w-6 h-6 rounded-full border border-white shadow overflow-hidden bg-gray-200">
                        <img src={story.users.avatar_url} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                      <span className="inline-flex items-center gap-0.5 bg-[#0f766e]/85 px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase mb-1">
                        <MapPin className="w-2 h-2" /> {story.location_tags}
                      </span>
                      <h4 className="font-fraunces font-bold text-[10px] md:text-xs leading-snug line-clamp-2">{story.properties?.title || 'Trato cerrado'}</h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Netflix-style rows per category */}
          {[
            { id: 'playa', label: 'Playa y Costa', Icon: Waves },
            { id: 'urbano', label: 'Ciudad', Icon: Building },
            { id: 'montana', label: 'Montaña', Icon: Mountain },
            { id: 'fincas', label: 'Campo y Fincas', Icon: Trees },
            { id: 'exclusivo', label: 'Exclusivo', Icon: Sparkles },
          ].map(({ id, label, Icon }) => {
            const catProps = getCategoryProps(id)
            if (catProps.length === 0) return null
            return (
              <div key={id}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-[#0f766e]" />
                    <h2 className="font-fraunces font-bold text-base sm:text-lg text-ink-teal-900">{label}</h2>
                  </div>
                  <button
                    onClick={() => setCategory(id)}
                    className="text-xs sm:text-sm font-bold text-[#0f766e] hover:underline whitespace-nowrap"
                  >
                    Ver todos →
                  </button>
                </div>
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-3">
                  {catProps.map((p, idx) => (
                    <PropertyCard key={p.id} property={p} variant="carousel" isPriority={idx < 4} />
                  ))}
                </div>
              </div>
            )
          })}


        </div>
      ) : (
        /* ── FILTERED STATE ─────────────────────────── */
        <div className="max-w-[1380px] mx-auto px-4 sm:px-5 md:px-6 mt-6">
          <div className="flex justify-between items-center mb-5">
            <p className="font-fraunces font-semibold text-lg md:text-xl text-ink-teal-900">
              {debouncedQuery ? (
                <>Resultados para <span className="text-[#0f766e] font-bold">&ldquo;{debouncedQuery}&rdquo;</span></>
              ) : (
                <>{category === 'fincas' ? 'Campo' : category === 'playa' ? 'Playa y costa' : category === 'urbano' ? 'Ciudad' : category === 'montana' ? 'Montaña' : 'Nuevas'}</>
              )}
            </p>
            <button
              onClick={() => { setCategory('all'); setQuery(''); setVisiblePinIds(null) }}
              className="text-xs sm:text-sm font-bold text-[#0f766e] hover:underline"
            >
              Limpiar búsqueda
            </button>
          </div>

          {/* MAP-ONLY VIEW */}
          {viewMode === 'map' && (
            <SearchMapView
              pins={mapPins}
              highlightedId={highlightedPinId}
              onVisiblePinsChange={setVisiblePinIds}
              searchKey={searchKey}
              query={debouncedQuery}
              searchAsMapMoves={searchAsMapMoves}
              onSearchAsMapMovesChange={setSearchAsMapMoves}
              onMapBoundsChange={setMapBounds}
              isMapLoading={isMapLoading}
              className="h-[calc(100vh-280px)] min-h-[400px] w-full rounded-2xl"
            />
          )}

          {/* SPLIT VIEW (desktop: left list, right map sticky) */}
          {viewMode === 'split' && (
            <div className="flex gap-5">
              <div className="flex-1 min-w-0">
                {listProps.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="font-fraunces text-base text-[#6b7280]">No encontramos resultados en esta zona.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {listProps.map((p, idx) => (
                      <div
                        key={p.id}
                        onMouseEnter={() => setHighlightedPinId(p.id)}
                        onMouseLeave={() => setHighlightedPinId(null)}
                      >
                        <PropertyCard property={p} isPriority={idx < 4} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="hidden md:block w-[45%] shrink-0">
                <div className="sticky top-24 h-[calc(100vh-120px)]">
                  <SearchMapView
                    pins={mapPins}
                    highlightedId={highlightedPinId}
                    onVisiblePinsChange={setVisiblePinIds}
                    searchKey={searchKey}
                    query={debouncedQuery}
                    searchAsMapMoves={searchAsMapMoves}
                    onSearchAsMapMovesChange={setSearchAsMapMoves}
                    onMapBoundsChange={setMapBounds}
                    isMapLoading={isMapLoading}
                    className="h-full w-full rounded-2xl"
                  />
                </div>
              </div>
            </div>
          )}

          {/* LIST VIEW (default) */}
          {viewMode === 'list' && (
            listProps.length === 0 ? (
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
                {listProps.map((p, idx) => (
                  <div
                    key={p.id}
                    onMouseEnter={() => setHighlightedPinId(p.id)}
                    onMouseLeave={() => setHighlightedPinId(null)}
                  >
                    <PropertyCard property={p} isPriority={idx < 4} />
                  </div>
                ))}
              </div>
            )
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

      {/* ── MOBILE SEARCH MODAL ─────────────────────────── */}
      {showMobileSearchModal && (
        <div className="md:hidden fixed inset-0 z-50 bg-[#fafafa] flex flex-col animate-in slide-in-from-bottom-full duration-300">
          <div className="flex items-center justify-between p-4 border-b border-surface-mist-dark bg-white">
            <button onClick={() => setShowMobileSearchModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-mist text-ink-teal-900 font-bold">✕</button>
            <span className="font-bold text-ink-teal-900">Buscar hospedaje</span>
            <div className="w-8" />
          </div>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
            <div className="bg-white rounded-3xl p-4 shadow-sm border border-surface-mist-dark">
              <h2 className="text-xl font-bold text-ink-teal-900 mb-4">¿A dónde quieres ir?</h2>
              <div className="relative flex items-center bg-surface-mist px-4 py-3 rounded-2xl">
                <Search className="w-5 h-5 text-text-muted-custom mr-2" />
                <input 
                  type="text" 
                  placeholder="Destino" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full text-base text-ink-teal-900 bg-transparent focus:outline-none"
                />
              </div>
              {query.length > 0 && (
                <div className="mt-4 flex flex-col gap-2">
                  {uniqueLocations.filter(loc => normalize(loc).includes(normalize(query))).map((loc, idx) => (
                    <button key={idx} onClick={() => setQuery(loc)} className="flex items-center gap-3 p-2 hover:bg-surface-mist rounded-xl text-left">
                      <div className="w-10 h-10 rounded-full bg-surface-mist-dark flex items-center justify-center"><MapPin className="w-5 h-5 text-[#0f766e]" /></div>
                      <span className="font-medium text-ink-teal-900">{loc}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="bg-white rounded-3xl p-4 shadow-sm border border-surface-mist-dark overflow-x-auto">
              <h2 className="text-xl font-bold text-ink-teal-900 mb-4">¿Cuándo?</h2>
              <div className="flex justify-center">
                <DayPicker
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  locale={es}
                  numberOfMonths={1}
                  className="p-1 max-w-[280px] mx-auto"
                  classNames={{
                    months: "flex flex-col space-y-4",
                    month: "space-y-3",
                    caption: "flex justify-center pt-1 relative items-center mb-2",
                    caption_label: "text-sm font-bold text-ink-teal-900",
                    nav: "space-x-1 flex items-center",
                    nav_button: "h-8 w-8 bg-surface-mist hover:bg-surface-mist-dark rounded-full flex items-center justify-center p-0 opacity-70 transition-colors",
                    nav_button_previous: "absolute left-1",
                    nav_button_next: "absolute right-1",
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex justify-between",
                    head_cell: "text-text-muted-custom w-9 font-semibold text-[10px] uppercase tracking-wider",
                    row: "flex w-full mt-1 justify-between",
                    cell: "text-center text-sm p-0 relative",
                    day: "h-9 w-9 p-0 font-medium text-ink-teal-900 hover:bg-surface-mist rounded-full transition-colors",
                    day_selected: "bg-ink-teal-900 text-white hover:bg-ink-teal-900 hover:text-white font-bold",
                    day_today: "text-accent-mango font-bold",
                    day_outside: "text-gray-300 opacity-50",
                    day_disabled: "text-gray-200 opacity-50",
                    day_range_middle: "bg-surface-mist text-ink-teal-900 rounded-none",
                    day_range_end: "rounded-r-full bg-ink-teal-900 text-white",
                    day_range_start: "rounded-l-full bg-ink-teal-900 text-white"
                  } as any}
                />
              </div>
            </div>

            <div className="bg-white rounded-3xl p-4 shadow-sm border border-surface-mist-dark">
              <h2 className="text-xl font-bold text-ink-teal-900 mb-4">¿Quiénes?</h2>
              <div className="flex items-center justify-between">
                <span className="font-medium text-ink-teal-900">Huéspedes</span>
                <div className="flex items-center gap-4">
                  <button onClick={() => setGuestCount(Math.max(1, (guestCount as number || 1) - 1))} className="w-8 h-8 rounded-full border border-surface-mist-dark flex items-center justify-center text-ink-teal-900">-</button>
                  <span className="w-4 text-center font-bold">{guestCount || 0}</span>
                  <button onClick={() => setGuestCount((guestCount as number || 0) + 1)} className="w-8 h-8 rounded-full border border-surface-mist-dark flex items-center justify-center text-ink-teal-900">+</button>
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 bg-white border-t border-surface-mist-dark flex items-center justify-between">
            <button onClick={() => { setQuery(''); setDateRange(undefined); setGuestCount(''); setActiveSearch(null) }} className="font-bold text-ink-teal-900 underline">Limpiar</button>
            <div className="flex flex-col items-end relative">
              <button onClick={executeSearch} className="bg-accent-mango text-white font-bold py-3 px-8 rounded-xl shadow-md">Buscar</button>
              {searchError && <span className="text-red-500 text-xs font-bold mt-1 absolute -top-5 right-0 whitespace-nowrap">{searchError}</span>}
            </div>
          </div>
        </div>
      )}

      {/* ── FILTERS MODAL (Desktop & Mobile) ─────────────────────────── */}
      {showFiltersModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 shadow-2xl relative w-full max-w-md flex flex-col max-h-[90vh]">
            <button onClick={() => setShowFiltersModal(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-surface-mist hover:bg-surface-mist-dark text-ink-teal-900 font-bold z-10">✕</button>
            <h2 className="text-xl font-bold text-ink-teal-900 mb-6">Filtros Avanzados</h2>
            
            <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-6">
              <div>
                <h3 className="font-bold text-ink-teal-900 mb-3">Tipo de vivienda</h3>
                <div className="grid grid-cols-2 gap-2">
                  {['Cualquiera', 'Casa', 'Apartamento', 'Finca', 'Loft', 'Cabaña'].map(t => {
                    const isSelected = t === 'Cualquiera' ? propertyType === '' : propertyType === t
                    return (
                      <button 
                        key={t}
                        onClick={() => setPropertyType(t === 'Cualquiera' ? '' : t)}
                        className={`p-3 rounded-xl border font-semibold text-sm transition-colors ${isSelected ? 'border-[#0f766e] bg-[#f0fdfa] text-[#0f766e]' : 'border-surface-mist-dark text-text-muted-custom hover:border-ink-teal-900'}`}
                      >
                        {t}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="hidden md:block">
                <h3 className="font-bold text-ink-teal-900 mb-3">Capacidad</h3>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-text-muted-custom">Huéspedes mínimos</span>
                  <div className="flex items-center gap-4">
                    <button onClick={() => setGuestCount(Math.max(1, (guestCount as number || 1) - 1))} className="w-8 h-8 rounded-full border border-surface-mist-dark flex items-center justify-center text-ink-teal-900">-</button>
                    <span className="w-4 text-center font-bold text-ink-teal-900">{guestCount || 0}</span>
                    <button onClick={() => setGuestCount((guestCount as number || 0) + 1)} className="w-8 h-8 rounded-full border border-surface-mist-dark flex items-center justify-center text-ink-teal-900">+</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-surface-mist-dark pt-4">
              <button onClick={() => { setPropertyType(''); setGuestCount(''); }} className="font-bold text-ink-teal-900 underline">Limpiar</button>
              <button onClick={() => setShowFiltersModal(false)} className="bg-ink-teal-900 text-white font-bold py-3 px-8 rounded-xl shadow-md">Mostrar resultados</button>
            </div>
          </div>
        </div>
      )}



    </div>
  )
}
