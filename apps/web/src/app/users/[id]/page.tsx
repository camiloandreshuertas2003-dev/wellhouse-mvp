'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import PropertyCard, { PropertyCardData } from '@/components/PropertyCard'
import { type HostStory } from '@/components/Stories/StoryViewer'
import StoryViewer from '@/components/Stories/StoryViewer'
import { Play } from 'lucide-react'

// Dummy calculation for wellRank if not set
const calcWellRank = (c: number, b: number, ba: number) => Math.max(30, Math.min((c * 15) + (b * 20) + (ba * 10), 300))

export default function UserProfilePage() {
  const { id } = useParams()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [property, setProperty] = useState<PropertyCardData | null>(null)
  const [stories, setStories] = useState<HostStory[]>([])
  
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null)

  useEffect(() => {
    async function loadUser() {
      if (!id || typeof id !== 'string') return
      
      try {
        // 1. Fetch User Profile
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', id)
          .maybeSingle()

        if (userError) throw userError
        
        if (!userData) {
          // Si el perfil no existe, paramos aquí
          setLoading(false)
          return
        }
        setUser(userData)

        // 2. Fetch User Property (if any published)
        const { data: propData, error: propError } = await supabase
          .from('properties')
          .select('id, title, city, country, type, bedrooms, bathrooms, capacity, rating, reviews, images, wellrank')
          .eq('user_id', id)
          .eq('status', 'published')
          .limit(1)
          .maybeSingle()

        if (!propError && propData) {
          setProperty({
            id: propData.id,
            title: propData.title,
            location: `${propData.city || ''}, ${propData.country || ''}`.replace(/^, /, ''),
            type: propData.type || 'Alojamiento',
            category: 'Urbano',
            bedrooms: propData.bedrooms || 1,
            bathrooms: propData.bathrooms || 1,
            capacity: propData.capacity || 2,
            rating: propData.rating || 0,
            reviews: propData.reviews || 0,
            image: (propData.images && propData.images.length > 0) ? propData.images[0] : 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2',
            verified: userData.is_verified || false,
            wellRank: propData.wellrank || calcWellRank(propData.capacity || 2, propData.bedrooms || 1, propData.bathrooms || 1),
            isMock: false
          })
        }

        // 3. Fetch User Stories
        const { data: storyData, error: storyError } = await supabase
          .from('host_stories')
          .select('id, property_id, user_id, youtube_video_id, thumbnail_url, location_tags, properties(title, images), users(full_name, name, avatar_url)')
          .eq('user_id', id)

        if (!storyError && storyData) {
          const formatted = storyData.map((s: any) => ({
            id: s.id,
            property_id: s.property_id,
            user_id: s.user_id,
            youtube_video_id: s.youtube_video_id,
            thumbnail_url: s.thumbnail_url,
            location_tags: s.location_tags,
            properties: {
              title: s.properties?.title || 'Vivienda',
              images: s.properties?.images || []
            },
            users: {
              full_name: s.users?.full_name || s.users?.name || 'Usuario',
              avatar_url: s.users?.avatar_url
            }
          }))
          setStories(formatted)
        }

      } catch (err) {
        console.error('Error fetching profile:', err)
      } finally {
        setLoading(false)
      }
    }
    loadUser()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-base-paper flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-ink-teal-900 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-base-paper flex flex-col items-center justify-center text-center p-4">
        <h1 className="text-2xl font-bold font-fraunces text-ink-teal-900 mb-2">Usuario no encontrado</h1>
        <p className="text-ink-teal-600 mb-6">El perfil que buscas no existe o ha sido eliminado.</p>
        <button onClick={() => router.back()} className="px-6 py-2 bg-ink-teal-900 text-white rounded-full">
          Volver
        </button>
      </div>
    )
  }

  const initial = (user.full_name || user.name || 'U').charAt(0).toUpperCase()
  const avatar = user.avatar_url
  
  return (
    <div className="min-h-screen bg-base-paper pb-20">
      {/* Header */}
      <div className="bg-white border-b border-surface-mist-dark sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <button onClick={() => router.back()} className="text-ink-teal-700 hover:text-ink-teal-900 transition-colors font-medium text-sm flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Volver
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-surface-mist p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start mb-8">
          
          <div className="w-full md:w-1/3 flex flex-col items-center text-center">
            <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-surface-mist-dark bg-surface-mist flex items-center justify-center">
              {avatar ? (
                <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-bold text-ink-teal-900">{initial}</span>
              )}
            </div>
            <h1 className="text-2xl font-bold font-fraunces text-ink-teal-900">{user.full_name || user.name}</h1>
            {user.is_verified && (
              <span className="inline-flex items-center gap-1.5 mt-2 text-sm text-emerald-700 font-medium bg-emerald-50 px-3 py-1 rounded-full">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Perfil Verificado
              </span>
            )}
            <p className="text-sm text-ink-teal-600 mt-3 font-medium">Miembro de Wellhouse</p>
          </div>

          <div className="w-full md:w-2/3 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-ink-teal-900 mb-2">Sobre mí</h2>
              <p className="text-ink-teal-700 text-sm leading-relaxed whitespace-pre-line">
                {user.bio || 'Este usuario aún no ha escrito una biografía.'}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-surface-mist">
              <div>
                <p className="text-xs text-ink-teal-600 font-medium mb-1">Ubicación</p>
                <p className="text-sm font-semibold text-ink-teal-900">
                  {property ? property.location : (user.city ? user.city : 'No especificada')}
                </p>
              </div>
              <div>
                <p className="text-xs text-ink-teal-600 font-medium mb-1">Vivienda</p>
                <p className="text-sm font-semibold text-ink-teal-900">
                  {property ? '1 Publicada' : 'No publicada'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Historias publicadas */}
        {stories.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold font-fraunces text-ink-teal-900 mb-4">Historias publicadas</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
              {stories.map((story, i) => (
                <button
                  key={story.id}
                  onClick={() => setActiveStoryIndex(i)}
                  className="snap-start shrink-0 w-32 md:w-40 group focus:outline-none"
                >
                  <div className="aspect-[9/16] rounded-xl overflow-hidden relative border-2 border-transparent group-hover:border-ink-teal-400 transition-all duration-300 transform group-hover:scale-[1.02] shadow-sm">
                    <img 
                      src={story.thumbnail_url} 
                      alt="Story thumbnail"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center transform group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 text-white ml-0.5" />
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Vivienda publicada */}
        {property && (
          <div>
            <h2 className="text-xl font-bold font-fraunces text-ink-teal-900 mb-4">La vivienda de {user.full_name?.split(' ')[0] || user.name?.split(' ')[0] || 'este usuario'}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <PropertyCard property={property} />
            </div>
          </div>
        )}
      </div>

      {activeStoryIndex !== null && (
        <StoryViewer
          stories={stories}
          initialIndex={activeStoryIndex}
          onClose={() => setActiveStoryIndex(null)}
          // Aquí no mostramos dislike button ya que estamos en el perfil directamente
        />
      )}
    </div>
  )
}
