'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import {
  Wifi, ChefHat, Car, Snowflake, Thermometer, WashingMachine, Tv,
  Waves, Dumbbell, Trees, Mountain, ArrowUp, PawPrint, Laptop, Flame,
  Umbrella, Coffee, BedDouble, Star, Home, MapPin, Bed, Camera, Edit3, Send,
  Building, Tent, Palmtree, Map as MapIcon, Sparkles, Search
} from 'lucide-react'
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api'
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete'

const Map = GoogleMap as any
const MapMarker = Marker as any

// No more fake wellrank calculations
interface FormData {
  title: string
  type: string
  category: string
  description_space: string
  description_area: string
  description_directions: string
  description_host: string
  rules: string
  address: string
  city: string
  country: string
  postalCode: string
  bedrooms: string
  bathrooms: string
  capacity: string
  beds: string
  areaSqm: string
  availableFrom: string
  availableTo: string
  minStay: string
  maxStay: string
  latitude: number | null
  longitude: number | null
}

const STEPS = [
  { n: 1, label: 'Tipo', Icon: Home },
  { n: 2, label: 'Ubicación', Icon: MapPin },
  { n: 3, label: 'Detalles', Icon: Bed },
  { n: 4, label: 'Fotos', Icon: Camera },
  { n: 5, label: 'Descripción', Icon: Edit3 },
  { n: 6, label: 'Publicar', Icon: Send },
]

const AMENITIES = [
  { id: 'wifi', name: 'WiFi', Icon: Wifi },
  { id: 'kitchen', name: 'Cocina', Icon: ChefHat },
  { id: 'parking', name: 'Parqueadero', Icon: Car },
  { id: 'ac', name: 'A/A', Icon: Snowflake },
  { id: 'heating', name: 'Calefacción', Icon: Thermometer },
  { id: 'washer', name: 'Lavadora', Icon: WashingMachine },
  { id: 'tv', name: 'Smart TV', Icon: Tv },
  { id: 'pool', name: 'Piscina', Icon: Waves },
  { id: 'gym', name: 'Gimnasio', Icon: Dumbbell },
  { id: 'garden', name: 'Jardín', Icon: Trees },
  { id: 'balcony', name: 'Balcón', Icon: Mountain },
  { id: 'elevator', name: 'Ascensor', Icon: ArrowUp },
  { id: 'pets', name: 'Mascotas OK', Icon: PawPrint },
  { id: 'workspace', name: 'Escritorio', Icon: Laptop },
  { id: 'bbq', name: 'BBQ / Chimenea', Icon: Flame },
  { id: 'beach-access', name: 'Acceso playa', Icon: Umbrella },
  { id: 'tour-cafetero', name: 'Tour cafetero', Icon: Coffee },
  { id: 'beds', name: 'Camas extra', Icon: BedDouble },
  { id: 'mountain-view', name: 'Vista montaña', Icon: Mountain },
  { id: 'premium', name: 'Premium', Icon: Star },
]

const PROPERTY_TYPES = [
  { id: 'Apartamento', label: 'Apartamento', Icon: Building, desc: 'Piso en edificio' },
  { id: 'Casa', label: 'Casa', Icon: Home, desc: 'Vivienda independiente' },
  { id: 'Estudio', label: 'Estudio', Icon: Bed, desc: 'Espacio compacto' },
  { id: 'Loft', label: 'Loft', Icon: Home, desc: 'Espacio abierto' },
  { id: 'Villa', label: 'Villa', Icon: Palmtree, desc: 'Lujo y privacidad' },
  { id: 'Cabaña', label: 'Cabaña', Icon: Tent, desc: 'Naturaleza y paz' },
]

const PROPERTY_CATEGORIES = [
  { id: 'urbano', label: 'Urbano', desc: 'Ciudad, barrio cultural', Icon: Building },
  { id: 'playa', label: 'Playa y costa', desc: 'A orillas del mar', Icon: Palmtree },
  { id: 'montana', label: 'Montaña', desc: 'Andes, paisaje de altura', Icon: Mountain },
  { id: 'finca', label: 'Fincas y campo', desc: 'Finca cafetera, rural', Icon: MapIcon },
  { id: 'exclusivo', label: 'Exclusivo', desc: 'Villa, lujo premium', Icon: Sparkles },
]

const libraries: ("places" | "drawing" | "geometry" | "visualization")[] = ['places']

export default function CreatePropertyPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [propertyId, setPropertyId] = useState<string | null>(null)
  const [photos, setPhotos] = useState<string[]>([])
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [amenities, setAmenities] = useState<string[]>([])

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries,
  })

  const [form, setForm] = useState<FormData>({
    title: '', type: '', category: '', description_space: '', description_area: '',
    description_directions: '', description_host: '', rules: '', address: '', city: '', country: '',
    postalCode: '', bedrooms: '', bathrooms: '', capacity: '', beds: '',
    areaSqm: '', availableFrom: '', availableTo: '', minStay: '2',
    maxStay: '30',
    latitude: null,
    longitude: null,
  })

  useEffect(() => {
    setMounted(true)
    const initUserAndProperty = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        
        // Fetch existing property to edit
        const { data: prop } = await supabase
          .from('properties')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (prop) {
          setPropertyId(prop.id)
          
          // Parse description
          const desc = prop.description || ''
          const spaceMatch = desc.match(/El espacio:\s*([\s\S]*?)(?=\n\nLa zona:|$)/)
          const areaMatch = desc.match(/La zona:\s*([\s\S]*?)(?=\n\nCómo llegar:|$)/)
          const dirMatch = desc.match(/Cómo llegar:\s*([\s\S]*?)(?=\n\nEl anfitrión:|$)/)
          const hostMatch = desc.match(/El anfitrión:\s*([\s\S]*)/)

          setForm(f => ({
            ...f,
            title: prop.title || '',
            type: prop.type || '',
            country: prop.country || '',
            city: prop.city || '',
            address: prop.address || '',
            capacity: prop.capacity?.toString() || '',
            bedrooms: prop.bedrooms?.toString() || '',
            bathrooms: prop.bathrooms?.toString() || '',
            availableFrom: prop.available_from || '',
            availableTo: prop.available_to || '',
            minStay: prop.min_stay?.toString() || '',
            maxStay: prop.max_stay?.toString() || '',
            rules: prop.rules || '',
            description_space: spaceMatch ? spaceMatch[1].trim() : (desc && !desc.includes('El espacio:') ? desc : ''),
            description_area: areaMatch ? areaMatch[1].trim() : '',
            description_directions: dirMatch ? dirMatch[1].trim() : '',
            description_host: hostMatch ? hostMatch[1].trim() : '',
            latitude: prop.latitude || null,
            longitude: prop.longitude || null,
          }))
          setAmenities(prop.amenities || [])
          setPhotos(prop.images || [])
        }
      } else {
        router.push('/login')
      }
    }
    initUserAndProperty()
  }, [router])

  const set = (field: keyof FormData, value: string | number | null) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const toggleAmenity = (id: string) =>
    setAmenities(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id])

  const uploadPhotos = useCallback(async (files: FileList) => {
    if (!userId) return
    setUploadingPhoto(true)
    setError(null)
    const newUrls: string[] = []
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const ext = file.name.split('.').pop()
        const rand = Math.random().toString(36).substring(2, 7)
        const path = `properties/${userId}/${Date.now()}_${i}_${rand}.${ext}`
        const { error: upErr } = await supabase.storage.from('property-photos').upload(path, file)
        if (upErr) throw upErr
        const { data } = supabase.storage.from('property-photos').getPublicUrl(path)
        newUrls.push(data.publicUrl)
      }
      setPhotos(prev => [...prev, ...newUrls].slice(0, 8))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir algunas fotos')
    } finally {
      setUploadingPhoto(false)
    }
  }, [userId])

  const movePhoto = useCallback((index: number, direction: 'left' | 'right') => {
    setPhotos(prev => {
      const next = [...prev]
      const targetIndex = direction === 'left' ? index - 1 : index + 1
      if (targetIndex >= 0 && targetIndex < next.length) {
        const temp = next[index]
        next[index] = next[targetIndex]
        next[targetIndex] = temp
      }
      return next
    })
  }, [])

  if (!mounted) return (
    <div className="min-h-screen bg-base-paper flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-ink-teal-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const handlePublish = async () => {
    if (!userId) return
    if (!form.availableFrom || !form.availableTo) {
      setError('Debes definir el período de disponibilidad antes de publicar.')
      return
    }
    if (!form.title || !form.city || !form.country) {
      setError('Completa título, ciudad y país antes de publicar.')
      return
    }
    setSaving(true)
    setError(null)

    const combinedDescription = [
      form.description_space && `El espacio: ${form.description_space}`,
      form.description_area && `La zona: ${form.description_area}`,
      form.description_directions && `Cómo llegar: ${form.description_directions}`,
      form.description_host && `El anfitrión: ${form.description_host}`,
    ].filter(Boolean).join('\n\n') || form.title

    try {
      try { await supabase.auth.refreshSession() } catch {}

      const { error: saveErr } = await supabase.rpc('upsert_property', {
        p_property_id:    propertyId,
        p_user_id:        userId,
        p_title:          form.title,
        p_description:    combinedDescription,
        p_type:           form.type || null,
        p_country:        form.country,
        p_city:           form.city,
        p_address:        form.address || null,
        p_capacity:       form.capacity ? parseInt(form.capacity) : null,
        p_bedrooms:       form.bedrooms ? parseInt(form.bedrooms) : null,
        p_bathrooms:      form.bathrooms ? parseInt(form.bathrooms) : null,
        p_amenities:      amenities,
        p_images:         photos,
        p_available_from: form.availableFrom || null,
        p_available_to:   form.availableTo || null,
        p_min_stay:       parseInt(form.minStay) || 2,
        p_max_stay:       parseInt(form.maxStay) || 30,
        p_rules:          form.rules || null,
        p_status:         'published',
        p_wellrank:       0, // The property starts with 0 WellRank
        p_latitude:       form.latitude,
        p_longitude:      form.longitude,
      })

      if (saveErr) {
        throw new Error(saveErr.message || 'Error al guardar la vivienda')
      }

      // Automatically award 100 WellPoints only if it's a new property (propertyId is null)
      if (!propertyId) {
        await fetch('/api/wellpoints/onboarding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId })
        })
      }

      router.push('/dashboard?published=true')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al publicar')
      setSaving(false)
    }
  }

  const progressPct = Math.min(((step - 1) / (STEPS.length - 1)) * 100, 100)

  return (
    <div className="min-h-screen bg-[#f8f7f4] font-inter text-ink-teal-900 pb-20">
      {/* Top bar */}
      <div className="bg-white border-b border-[#e8e4dc] sticky top-0 z-40">
        <div className="max-w-[1440px] mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-sm font-medium text-[#6b7280] hover:text-[#1a3c34] transition-colors">
            ← Cancelar
          </Link>
          <div className="font-fraunces font-bold text-xl text-[#1a3c34]">
            Registro de Vivienda
          </div>
          <div className="text-sm font-medium text-[#10b981] bg-[#10b981]/10 px-3 py-1 rounded-full border border-[#10b981]/20">
            Paso {step} de 6
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-[#e8e4dc] w-full">
          <div className="h-full bg-[#10b981] transition-all duration-500 ease-in-out" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 mt-8">
        {/* Step indicators */}
        <div className="flex justify-between md:justify-center md:gap-10 mb-12 overflow-x-auto pb-4 hide-scrollbar">
          {STEPS.map(s => {
            const isCompleted = step > s.n;
            const isCurrent = step === s.n;
            return (
              <div key={s.n} className={`flex flex-col items-center gap-2 min-w-[60px] ${!isCurrent && !isCompleted ? 'opacity-40' : ''}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isCompleted ? 'bg-[#10b981]/10 border-[#10b981] text-[#10b981]' : isCurrent ? 'bg-[#1a3c34] border-[#1a3c34] text-white' : 'bg-white border-[#cbd5cc] text-[#6b7280]'}`}>
                  <s.Icon className="w-4 h-4" />
                </div>
                <span className={`text-[11px] font-semibold uppercase tracking-wider ${isCurrent ? 'text-[#1a3c34]' : 'text-[#6b7280]'}`}>{s.label}</span>
              </div>
            )
          })}
        </div>

        {/* Main content */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> {error}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-[#e8e4dc] p-6 md:p-10 mb-8">
          {step === 1 && <Step1Type form={form} set={set} />}
          {step === 2 && isLoaded && <Step2Location form={form} set={set} isLoaded={isLoaded} loadError={loadError} />}
          {step === 2 && !isLoaded && !loadError && <div className="text-center py-10 text-gray-500">Cargando buscador y mapa...</div>}
          {step === 2 && loadError && <div className="text-center py-10 text-red-500">Error cargando mapa</div>}
          {step === 3 && <Step3Details form={form} set={set} amenities={amenities} toggleAmenity={toggleAmenity} />}
          {step === 4 && <Step4Photos photos={photos} onUpload={uploadPhotos} uploading={uploadingPhoto} onRemove={(url) => setPhotos(p => p.filter(x => x !== url))} onMove={movePhoto} />}
          {step === 5 && <Step5Description form={form} set={set} />}
          {step === 6 && <Step6Review form={form} photos={photos} set={set} />}
        </div>

        <div className="flex justify-between items-center mt-8">
          <button 
            className="px-6 py-3 rounded-xl font-medium text-[#4a6b5e] hover:bg-[#e8e4dc] transition-colors disabled:opacity-30 border border-[#cbd5cc] bg-white" 
            onClick={() => setStep(s => Math.max(1, s - 1))} 
            disabled={step === 1}
          >
            ← Anterior
          </button>
          {step < 6 ? (
            <button 
              className="px-8 py-3 rounded-xl font-bold text-white bg-[#1a3c34] hover:bg-[#122a24] transition-all shadow-md shadow-[#1a3c34]/20" 
              onClick={() => setStep(s => Math.min(6, s + 1))}
            >
              Siguiente →
            </button>
          ) : (
            <button 
              className="px-8 py-3 rounded-xl font-bold text-white bg-[#10b981] hover:bg-[#059669] transition-all shadow-md shadow-[#10b981]/20 disabled:opacity-50" 
              onClick={handlePublish} 
              disabled={saving}
            >
              {saving ? '⏳ Publicando...' : '🚀 Completar Registro'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function Step1Type({ form, set }: { form: FormData; set: (f: keyof FormData, v: string) => void }) {
  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-fraunces font-bold text-[#1a3c34] mb-2">¿Qué tipo de vivienda es?</h2>
      <p className="text-[#6b7280] mb-8">El tipo y categoría determinan dónde aparece tu vivienda en el explorador.</p>

      <div className="mb-3 text-sm font-bold text-[#4a6b5e] uppercase tracking-wide">Tipo de vivienda *</div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
        {PROPERTY_TYPES.map(t => (
          <div 
            key={t.id} 
            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all text-center ${form.type === t.id ? 'border-[#10b981] bg-[#10b981]/5 shadow-sm' : 'border-[#e8e4dc] bg-white hover:border-[#cbd5cc]'}`} 
            onClick={() => set('type', t.id)}
          >
            <div className={`mx-auto w-12 h-12 flex items-center justify-center rounded-full mb-3 ${form.type === t.id ? 'bg-[#10b981]/10 text-[#10b981]' : 'bg-[#f8f7f4] text-[#1a3c34]'}`}>
              <t.Icon className="w-6 h-6" />
            </div>
            <div className="font-bold text-[#1a3c34] text-sm">{t.label}</div>
            <div className="text-[#6b7280] text-xs mt-1">{t.desc}</div>
          </div>
        ))}
      </div>

      <div className="mb-3 text-sm font-bold text-[#4a6b5e] uppercase tracking-wide">Categoría principal *</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {PROPERTY_CATEGORIES.map(cat => (
          <div
            key={cat.id}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 ${form.category === cat.id ? 'border-[#10b981] bg-[#10b981]/5' : 'border-[#e8e4dc] bg-white hover:border-[#cbd5cc]'}`}
            onClick={() => set('category', cat.id)}
          >
            <div className={`p-2 rounded-lg ${form.category === cat.id ? 'bg-[#10b981]/10 text-[#10b981]' : 'bg-[#f8f7f4] text-[#4a6b5e]'}`}>
              <cat.Icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-[#1a3c34] text-sm">{cat.label}</div>
              <div className="text-[#6b7280] text-xs">{cat.desc}</div>
            </div>
            {form.category === cat.id && (
              <div className="text-[#10b981]">
                <Sparkles className="w-5 h-5" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function Step2Location({ form, set, isLoaded, loadError }: { form: FormData; set: (f: keyof FormData, v: string | number | null) => void; isLoaded: boolean; loadError: Error | undefined }) {
  const inputClass = "w-full p-4 bg-white border border-[#cbd5cc] rounded-xl font-inter text-[#1a3c34] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#10b981]/50 focus:border-[#10b981] transition-all"
  const labelClass = "block text-xs font-bold text-[#4a6b5e] uppercase tracking-wide mb-2"

  const {
    ready,
    value,
    setValue,
    suggestions: { status, data },
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      // componentRestrictions: { country: 'co' }
    },
    debounce: 300,
    defaultValue: form.address,
  });

  const handleSelect = async (address: string) => {
    setValue(address, false);
    clearSuggestions();
    try {
      const results = await getGeocode({ address });
      const { lat, lng } = await getLatLng(results[0]);
      
      set('address', address);
      set('latitude', lat);
      set('longitude', lng);

      // Try to parse city and country
      const addressComponents = results[0].address_components;
      let city = '';
      let country = '';
      let postalCode = '';

      addressComponents.forEach((component: any) => {
        if (component.types.includes('locality')) {
          city = component.long_name;
        } else if (component.types.includes('country')) {
          country = component.long_name;
        } else if (component.types.includes('postal_code')) {
          postalCode = component.long_name;
        }
      });

      if (city) set('city', city);
      if (country) set('country', country);
      if (postalCode) set('postalCode', postalCode);

    } catch (error) {
      console.error("Error: ", error);
    }
  };

  const center = {
    lat: form.latitude || 4.7110, // Default to Colombia center if null
    lng: form.longitude || -74.0721
  };

  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-fraunces font-bold text-[#1a3c34] mb-2">¿Dónde está ubicada?</h2>
      <p className="text-[#6b7280] mb-8">Busca tu dirección. La ubicación exacta se revelará a tus huéspedes solo cuando el intercambio esté confirmado.</p>
      
      <div className="space-y-6">
        <div className="relative">
          <label className={labelClass}>Buscador de dirección</label>
          <div className="relative">
            <Search className="absolute left-4 top-4 text-[#9ca3af] w-5 h-5" />
            <input 
              className={`${inputClass} pl-12`} 
              value={value} 
              onChange={e => setValue(e.target.value)} 
              disabled={!ready}
              placeholder="Empieza a escribir tu dirección..." 
            />
          </div>
          {status === "OK" && (
            <ul className="absolute z-10 w-full bg-white border border-[#cbd5cc] rounded-xl mt-1 shadow-lg max-h-60 overflow-y-auto">
              {data.map(({ place_id, description }) => (
                <li
                  key={place_id}
                  onClick={() => handleSelect(description)}
                  className="p-3 hover:bg-[#f8f7f4] cursor-pointer text-[#1a3c34] border-b border-[#f3f4f6] last:border-0"
                >
                  {description}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* The map */}
        <div className="h-[300px] w-full rounded-xl overflow-hidden border border-[#cbd5cc] bg-gray-100">
          {loadError ? (
            <div className="w-full h-full flex items-center justify-center text-red-500">Error cargando mapa</div>
          ) : !isLoaded ? (
            <div className="w-full h-full flex items-center justify-center">Cargando mapa...</div>
          ) : (
            <Map
              mapContainerStyle={{ width: '100%', height: '100%' }}
              center={center}
              zoom={form.latitude ? 15 : 5}
              options={{ disableDefaultUI: true, zoomControl: true }}
              onClick={(e: any) => {
                if (e.latLng) {
                  set('latitude', e.latLng.lat());
                  set('longitude', e.latLng.lng());
                }
              }}
            >
              {form.latitude && form.longitude && (
                <MapMarker position={{ lat: form.latitude, lng: form.longitude }} draggable onDragEnd={(e: any) => {
                  if (e.latLng) {
                    set('latitude', e.latLng.lat());
                    set('longitude', e.latLng.lng());
                  }
                }} />
              )}
            </Map>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#e8e4dc]">
          <div>
            <label className={labelClass}>País *</label>
            <input className={inputClass} value={form.country} onChange={e => set('country', e.target.value)} placeholder="Ej: Colombia" />
          </div>
          <div>
            <label className={labelClass}>Ciudad *</label>
            <input className={inputClass} value={form.city} onChange={e => set('city', e.target.value)} placeholder="Ej: Medellín" />
          </div>
        </div>
      </div>
    </div>
  )
}

function Step3Details({ form, set, amenities, toggleAmenity }: {
  form: FormData; set: (f: keyof FormData, v: string) => void
  amenities: string[]; toggleAmenity: (id: string) => void
}) {
  const Counter = ({ field, label }: { field: keyof FormData; label: string }) => (
    <div className="text-center p-4 border border-[#e8e4dc] rounded-2xl bg-[#f8f7f4]">
      <label className="block text-xs font-bold text-[#4a6b5e] uppercase tracking-wide mb-3">{label}</label>
      <div className="flex items-center justify-center gap-4">
        <button onClick={() => set(field, String(Math.max(0, (Number(form[field]) || 0) - 1)))}
          className="w-10 h-10 rounded-full border border-[#cbd5cc] bg-white text-[#1a3c34] font-bold text-lg hover:border-[#10b981] hover:text-[#10b981] transition-all flex items-center justify-center">−</button>
        <span className="font-bold text-2xl text-[#1a3c34] min-w-[2rem] text-center">{form[field] || '0'}</span>
        <button onClick={() => set(field, String((Number(form[field]) || 0) + 1))}
          className="w-10 h-10 rounded-full border border-[#cbd5cc] bg-white text-[#1a3c34] font-bold text-lg hover:border-[#10b981] hover:text-[#10b981] transition-all flex items-center justify-center">+</button>
      </div>
    </div>
  )

  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-fraunces font-bold text-[#1a3c34] mb-2">Capacidad y comodidades</h2>
      <p className="text-[#6b7280] mb-8">Cuéntanos sobre los espacios de tu vivienda.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <Counter field="capacity" label="Huéspedes" />
        <Counter field="bedrooms" label="Habitaciones" />
        <Counter field="bathrooms" label="Baños" />
        <Counter field="beds" label="Camas" />
      </div>

      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-bold text-[#4a6b5e] uppercase tracking-wide">Amenidades incluidas</span>
        <span className="text-xs font-medium text-[#6b7280]">{amenities.length} seleccionadas</span>
      </div>
      
      <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
        {AMENITIES.map(a => {
          const selected = amenities.includes(a.id)
          return (
            <div
              key={a.id}
              className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center gap-2 text-center ${selected ? 'border-[#10b981] bg-[#10b981]/5 text-[#10b981]' : 'border-[#e8e4dc] bg-white text-[#6b7280] hover:border-[#cbd5cc]'}`}
              onClick={() => toggleAmenity(a.id)}
            >
              <a.Icon className="w-6 h-6" strokeWidth={selected ? 2 : 1.5} />
              <div className="text-[10px] font-bold uppercase tracking-wider">{a.name}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Step4Photos({ photos, onUpload, uploading, onRemove, onMove }: {
  photos: string[]; onUpload: (f: FileList) => void; uploading: boolean; onRemove: (url: string) => void; onMove: (idx: number, dir: 'left' | 'right') => void
}) {
  const handleFiles = (files: FileList | null) => { if (!files) return; onUpload(files) }

  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-fraunces font-bold text-[#1a3c34] mb-2">Fotos de tu vivienda</h2>
      <p className="text-[#6b7280] mb-6">Añade al menos 3 fotos de buena calidad. La primera foto será la portada de tu anuncio.</p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {photos.map((url, i) => (
          <div key={i} className="relative aspect-[4/3] rounded-xl overflow-hidden border border-[#e8e4dc] group">
            <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
            <button onClick={() => onRemove(url)} className="absolute top-2 right-2 bg-white/90 rounded-full w-8 h-8 flex items-center justify-center text-red-500 hover:bg-red-50 hover:text-red-600 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
              &times;
            </button>
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-6 flex justify-between items-center">
              <span className="text-white text-xs font-bold">{i === 0 ? 'Portada' : `${i + 1}°`}</span>
              <div className="flex gap-1">
                <button type="button" disabled={i === 0} onClick={() => onMove(i, 'left')} className="w-6 h-6 bg-white/20 rounded flex items-center justify-center text-white disabled:opacity-30">◀</button>
                <button type="button" disabled={i === photos.length - 1} onClick={() => onMove(i, 'right')} className="w-6 h-6 bg-white/20 rounded flex items-center justify-center text-white disabled:opacity-30">▶</button>
              </div>
            </div>
          </div>
        ))}
        {photos.length < 8 && (
          <label className="aspect-[4/3] rounded-xl border-2 border-dashed border-[#cbd5cc] bg-[#f8f7f4] flex flex-col items-center justify-center cursor-pointer hover:border-[#10b981] hover:bg-[#10b981]/5 transition-all text-[#6b7280] hover:text-[#10b981]">
            <input type="file" accept="image/*" multiple hidden onChange={e => handleFiles(e.target.files)} disabled={uploading} />
            {uploading ? (
              <div className="w-8 h-8 border-4 border-current border-t-transparent rounded-full animate-spin mb-2" />
            ) : (
              <Camera className="w-8 h-8 mb-2" />
            )}
            <div className="text-sm font-medium">{uploading ? 'Subiendo...' : 'Añadir fotos'}</div>
          </label>
        )}
      </div>
    </div>
  )
}

function Step5Description({ form, set }: { form: FormData; set: (f: keyof FormData, v: string) => void }) {
  const inputClass = "w-full p-4 bg-white border border-[#cbd5cc] rounded-xl font-inter text-[#1a3c34] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#10b981]/50 focus:border-[#10b981] transition-all"
  const labelClass = "block text-xs font-bold text-[#4a6b5e] uppercase tracking-wide mb-2"
  
  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-fraunces font-bold text-[#1a3c34] mb-2">Describe tu espacio</h2>
      <p className="text-[#6b7280] mb-8">Escribe un título atractivo y destaca lo mejor de la vivienda.</p>

      <div className="space-y-6">
        <div>
          <label className={labelClass}>Título de la vivienda *</label>
          <input
            className={inputClass}
            value={form.title}
            onChange={e => set('title', e.target.value)}
            placeholder="Ej: Penthouse con terraza y vista al mar"
            maxLength={80}
          />
        </div>

        <div>
          <label className={labelClass}>El Espacio</label>
          <textarea
            className={`${inputClass} min-h-[100px] resize-y`}
            value={form.description_space}
            onChange={e => set('description_space', e.target.value)}
            placeholder="Describe el interior, distribución y ambiente..."
          />
        </div>

        <div>
          <label className={labelClass}>La Zona (Barrio / Entorno)</label>
          <textarea
            className={`${inputClass} min-h-[100px] resize-y`}
            value={form.description_area}
            onChange={e => set('description_area', e.target.value)}
            placeholder="¿Qué hay cerca? Parques, restaurantes, transporte..."
          />
        </div>

        <div>
          <label className={labelClass}>Conoce al Anfitrión</label>
          <textarea
            className={`${inputClass} min-h-[100px] resize-y`}
            value={form.description_host}
            onChange={e => set('description_host', e.target.value)}
            placeholder="¿A qué te dedicas? ¿Cuáles son tus hobbies? Cuéntales a los huéspedes quién eres."
          />
        </div>

        <div>
          <label className={labelClass}>Reglas de la casa</label>
          <textarea
            className={`${inputClass} min-h-[100px] resize-y`}
            value={form.rules}
            onChange={e => set('rules', e.target.value)}
            placeholder="Ej: No fumar adentro, máximo 2 mascotas..."
          />
        </div>
      </div>
    </div>
  )
}

function Step6Review({ form, photos, set }: {
  form: FormData; photos: string[]; set?: (f: keyof FormData, v: string) => void
}) {
  const setFn = set || (() => {})
  const inputClass = "w-full px-3 py-2 bg-white border border-[#cbd5cc] rounded-lg font-inter text-sm text-[#1a3c34] focus:outline-none focus:ring-2 focus:ring-[#10b981]/50 focus:border-[#10b981]"

  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-fraunces font-bold text-[#1a3c34] mb-2">Paso final: Disponibilidad</h2>
      <p className="text-[#6b7280] mb-8">Define cuándo estás dispuesto a intercambiar y revisa tu solicitud.</p>

      <div className="bg-[#f8f7f4] border border-[#e8e4dc] rounded-2xl p-6 mb-8">
        <h3 className="text-sm font-bold text-[#4a6b5e] uppercase tracking-wide mb-4">Fechas Disponibles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-[#6b7280] mb-1">Desde</label>
            <input type="date" className={inputClass} value={form.availableFrom} onChange={e => setFn('availableFrom', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#6b7280] mb-1">Hasta</label>
            <input type="date" className={inputClass} value={form.availableTo} onChange={e => setFn('availableTo', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#6b7280] mb-1">Estancia mínima (noches)</label>
            <input type="number" min="1" className={inputClass} value={form.minStay} onChange={e => setFn('minStay', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#6b7280] mb-1">Estancia máxima (noches)</label>
            <input type="number" min="1" className={inputClass} value={form.maxStay} onChange={e => setFn('maxStay', e.target.value)} />
          </div>
        </div>
      </div>

      <div className="p-5 bg-surface-mist border border-accent-mango/30 rounded-2xl flex gap-4 text-ink-teal-900 mt-8 mb-6 shadow-sm">
        <Sparkles className="w-6 h-6 flex-shrink-0 text-accent-mango" />
        <div>
          <h4 className="font-fraunces font-bold text-lg mb-1">¡Tu viaje comienza aquí!</h4>
          <p className="font-inter text-sm text-text-muted-custom">Completa tu registro para publicar tu vivienda. ¡Recuerda que al completar los retos de anfitrión podrás ganar WellPoints para tu primer intercambio!</p>
        </div>
      </div>
    </div>
  )
}
