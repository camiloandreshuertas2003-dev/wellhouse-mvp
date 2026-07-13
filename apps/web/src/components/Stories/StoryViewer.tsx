'use client'

import React, { useState, useEffect } from 'react'

export interface HostStory {
  id: string
  property_id: string
  user_id: string
  youtube_video_id: string
  thumbnail_url: string
  location_tags: string
  properties?: {
    title: string
    images: string[]
    users?: {
      full_name: string
    }
  }
}

interface StoryViewerProps {
  stories: HostStory[]
  initialIndex: number
  onClose: () => void
}

export default function StoryViewer({ stories, initialIndex, onClose }: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const currentStory = stories[currentIndex]

  // Cambiar historia automáticamente después de 15 segundos si no interactúa
  useEffect(() => {
    const timer = setTimeout(() => {
      handleNext()
    }, 15000)
    return () => clearTimeout(timer)
  }, [currentIndex])

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      onClose() // Cerrar al llegar al final
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  if (!currentStory) return null

  const hostName = currentStory.properties?.users?.full_name || 'Anfitrión'
  const propertyTitle = currentStory.properties?.title || 'Increíble vivienda'

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center select-none md:p-4">
      {/* Container vertical tipo celular */}
      <div className="relative w-full h-full md:max-w-[420px] md:h-[85vh] md:rounded-[20px] overflow-hidden bg-black flex flex-col justify-between shadow-2xl">
        
        {/* Barra de progreso de historias (estilo Instagram) */}
        <div className="absolute top-3 left-0 right-0 z-30 flex gap-1 px-3">
          {stories.map((_, index) => {
            let width = 'w-0'
            if (index < currentIndex) width = 'w-full' // Completadas
            if (index === currentIndex) width = 'animate-story-progress' // En curso (15s)

            return (
              <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                <div className={`h-full bg-white transition-all duration-300 ${width}`} />
              </div>
            )
          })}
        </div>

        {/* Header de la historia (Información del anfitrión) */}
        <div className="absolute top-6 left-0 right-0 z-30 flex justify-between items-center px-4">
          <div className="flex items-center gap-3 text-white">
            <div className="w-10 h-10 rounded-full border-2 border-accent-mango overflow-hidden bg-surface-mist flex items-center justify-center text-lg font-bold">
              👤
            </div>
            <div>
              <p className="text-sm font-semibold leading-none drop-shadow">{hostName}</p>
              <p className="text-xs text-white/80 drop-shadow mt-0.5">{currentStory.location_tags}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center text-lg focus:outline-none transition-colors"
          >
            ✕
          </button>
        </div>

        {/* REPRODUCTOR DE YOUTUBE (Embed vertical para Shorts) */}
        <div className="flex-1 w-full bg-black relative">
          <iframe
            src={`https://www.youtube.com/embed/${currentStory.youtube_video_id}?autoplay=1&mute=0&controls=0&modestbranding=1&rel=0&playsinline=1&enablejsapi=1`}
            title="Host Story"
            className="w-full h-full object-cover"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />

          {/* Zonas de click invisible para navegar */}
          <div className="absolute inset-y-0 left-0 w-1/4 z-20 cursor-pointer" onClick={handlePrev} />
          <div className="absolute inset-y-0 right-0 w-1/4 z-20 cursor-pointer" onClick={handleNext} />
        </div>

        {/* Footer con el botón de ir a la vivienda */}
        <div className="absolute bottom-6 left-0 right-0 z-30 px-4 flex flex-col items-center gap-3">
          <div className="bg-black/60 backdrop-blur-md px-3 py-2 rounded-lg text-center max-w-[90%] border border-white/10">
            <p className="text-white text-xs font-semibold line-clamp-1">{propertyTitle}</p>
          </div>
          <a
            href={`/properties/${currentStory.property_id}`}
            onClick={onClose}
            className="w-full py-3 bg-accent-mango hover:bg-accent-mango-hover active:scale-95 text-white font-semibold text-center rounded-xl transition-all shadow-lg text-sm"
          >
            Ver Vivienda 🏡
          </a>
        </div>

      </div>
    </div>
  )
}
