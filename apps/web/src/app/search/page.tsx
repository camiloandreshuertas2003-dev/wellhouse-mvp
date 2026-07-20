'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import PropertyCard, { type PropertyCardData } from '@/components/PropertyCard'
import { Sparkles, Search, SlidersHorizontal, ShieldCheck, Heart, Home, Waves, Mountain, Trees, Building, MapPin, Map, List } from 'lucide-react'
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

  // View mode: 'list' | 'map' | 'split'
  type ViewMode = 'list' | 'map' | 'split'
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [highlightedPinId, setHighlightedPinId] = useState<string | null>(null)
  const [visiblePinIds, setVisiblePinIds] = useState<string[] | null>(null)

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
      try {
        const { data: { user } } = await supabase.auth.getUser()

        let queryBuilder = supabase
          .from('properties')
          .select('id, user_id, title, city, country, type, bedrooms, bathrooms, capacity, images, available_from, available_to, wellrank, latitude, longitude, users(avatar_url)')
          .eq('status', 'published')

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
            image: p.images?.[0] || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
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

  const baseFilteredProps = activeProps.filter((p) => {
    const q = debouncedQuery.toLowerCase()
    const matchQ = !q || p.title.toLowerCase().includes(q) || p.location.toLowerCase().includes(q)
    const matchType = !propertyType || p.type.toLowerCase().includes(propertyType.toLowerCase())
    const matchGuests = !guestCount || p.capacity >= (guestCount as number)
    // Date filtering logic could be added here if available_from and available_to are parsed
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
  const searchKey = `${debouncedQuery}-${category}-${propertyType}-${guestCount}`

  const isSearchActive = category !== 'all' || !!debouncedQuery

  return (
    <div className="min-h-screen bg-[#fafafa] pb-24 md:pb-12">
      
      {/* Sticky Mobile Search Bar */}
      <div className="md:hidden sticky top-[60px] z-40 bg-[#fafafa]/90 backdrop-blur border-b border-surface-mist-dark p-2.5 shadow-sm flex flex-col gap-2">
        <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-full border border-surface-mist-dark">
          <Search className="w-3.5 h-3.5 text-gray-400" />
          <input 
            type="text" 
            placeholder="¿A dónde quieres ir?" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-base md:text-sm text-ink-teal-900 bg-transparent focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-[1.5] flex items-center bg-white px-3.5 py-2 rounded-full border border-surface-mist-dark" onClick={() => setShowDatePicker(true)}>
            <div className="w-full text-xs text-ink-teal-900 bg-transparent focus:outline-none truncate cursor-pointer text-center font-semibold text-[#0f766e]">
              {dateRange?.from ? (dateRange.to ? `${format(dateRange.from, 'd MMM', { locale: es })} - ${format(dateRange.to, 'd MMM', { locale: es })}` : format(dateRange.from, 'd MMM', { locale: es })) : "Fechas"}
            </div>
          </div>
          <div className="flex-1 flex items-center bg-white px-3.5 py-2 rounded-full border border-surface-mist-dark">
             <input type="number" placeholder="Huéspedes" value={guestCount} onChange={e => setGuestCount(e.target.value ? parseInt(e.target.value) : '')} className="w-full text-xs text-ink-teal-900 bg-transparent focus:outline-none text-center" />
          </div>
          <div className="flex-[1.2] flex items-center bg-white px-2 py-2 rounded-full border border-surface-mist-dark">
            <select
              className="w-full text-[11px] font-semibold text-ink-teal-900 bg-transparent focus:outline-none cursor-pointer"
              value={propertyType}
              onChange={e => setPropertyType(e.target.value)}
            >
              <option value="">Tipo</option>
              <option value="Finca">Finca</option>
              <option value="Casa">Casa</option>
              <option value="Apartamento">Apto</option>
              <option value="Loft">Loft</option>
              <option value="Cabaña">Cabaña</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mobile DatePicker Modal overlay */}
      {showDatePicker && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-4 shadow-2xl relative w-full max-w-[360px]">
            <button onClick={() => setShowDatePicker(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-surface-mist hover:bg-surface-mist-dark text-ink-teal-900 font-bold z-10">✕</button>
            <DayPicker
              mode="range"
              selected={dateRange}
              onSelect={setDateRange}
              locale={es}
              classNames={{
                selected: "bg-ink-teal-900 text-white hover:bg-ink-teal-900 hover:text-white",
                today: "font-bold text-accent-mango",
              }}
            />
            <button onClick={() => setShowDatePicker(false)} className="mt-4 w-full bg-ink-teal-900 text-white font-bold py-3 rounded-xl transition-colors active:bg-[#0d635c]">Aplicar fechas</button>
          </div>
        </div>
      )}

      {/* ── HERO BANNER SECTION ─────────────────────────────────────────── */}
      <div className="max-w-[1380px] mx-auto md:px-6">
        <div className="mx-4 md:mx-0 rounded-3xl md:rounded-none relative h-[200px] md:h-[350px] overflow-hidden bg-black mt-2">
          {/* Background Image (dynamic, with fade) */}
          <img 
            src={banners[activeBannerIndex]?.image_url || '/image_inicio_search.png'} 
            alt="Wellhouse" 
            className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-500 ${bannerFading ? 'opacity-0' : 'opacity-75'}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-black/15" />
          
          {/* Content Inside Hero */}
          <div className={`absolute inset-0 px-4 py-4 md:px-8 md:py-8 flex flex-col justify-end z-10 transition-opacity duration-500 ${bannerFading ? 'opacity-0' : 'opacity-100'}`}>
            <h1 className="font-fraunces font-bold text-xl md:text-[38px] text-white leading-tight max-w-[240px] md:max-w-xl">
              {banners[activeBannerIndex]?.title
                ? banners[activeBannerIndex].title
                : (<>No es una estadía, <br />es tu próxima <span className="italic font-normal text-[#14b8a6]">experiencia</span></>)
              }
            </h1>
            {banners[activeBannerIndex]?.subtitle && (
              <p className="text-white/70 text-xs md:text-sm mt-1 max-w-[240px] md:max-w-sm">
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
          <div className="flex-1 px-4 py-2 flex flex-col justify-center rounded-l-full hover:bg-surface-mist transition-colors cursor-text focus-within:bg-surface-mist group">
            <label className="text-[10px] font-bold text-ink-teal-900 uppercase tracking-wide cursor-text">Lugar</label>
            <input 
              type="text" 
              placeholder="¿A dónde vas?" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full text-sm text-ink-teal-900 bg-transparent focus:outline-none placeholder-text-muted-custom"
            />
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
                  classNames={{
                    selected: "bg-ink-teal-900 text-white hover:bg-ink-teal-900 hover:text-white",
                    today: "font-bold text-accent-mango",
                  }}
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

          <div className="px-4 py-2 flex items-center justify-between rounded-r-full hover:bg-surface-mist transition-colors cursor-pointer focus-within:bg-surface-mist w-[180px]">
            <div className="flex flex-col justify-center w-full">
              <label className="text-[10px] font-bold text-ink-teal-900 uppercase tracking-wide cursor-pointer">Tipo</label>
              <select
                className="w-full text-sm font-medium text-ink-teal-900 bg-transparent focus:outline-none cursor-pointer"
                value={propertyType}
                onChange={e => setPropertyType(e.target.value)}
              >
                <option value="">Cualquiera</option>
                <option value="Finca">Finca</option>
                <option value="Casa">Casa</option>
                <option value="Apartamento">Apartamento</option>
                <option value="Loft">Loft</option>
                <option value="Cabaña">Cabaña</option>
              </select>
            </div>
            <button 
              onClick={() => { setShowDatePicker(false); }}
              className="p-2.5 bg-accent-mango text-white rounded-full hover:bg-[#e07525] transition-colors ml-2 shadow-sm"
              aria-label="Buscar"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-end gap-2 ml-auto" id="results-container">
          {visiblePinIds && (
            <button
              onClick={() => setVisiblePinIds(null)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0f766e]/10 text-[#0f766e] text-xs font-bold hover:bg-[#0f766e]/20 transition-colors"
            >
              Zona seleccionada ✕
            </button>
          )}
          <div className="flex items-center gap-1 bg-white border border-surface-mist-dark rounded-full p-1">
          <button
            onClick={() => {
              setViewMode('list');
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
        {/* Mobile: all 6 in one row */}
        <div className="flex gap-1.5 sm:gap-2 sm:overflow-x-auto sm:no-scrollbar pb-2 justify-between sm:justify-start">
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

            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
              {realProps.map((p, idx) => (
                <PropertyCard key={p.id} property={p} variant="carousel" isPriority={idx < 4} />
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

    </div>
  )
}
