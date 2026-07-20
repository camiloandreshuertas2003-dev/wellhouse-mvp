'use client'

import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { HeartOff } from 'lucide-react'
import Link from 'next/link'

export interface HostStory {
  id: string
  property_id: string
  user_id: string
  youtube_video_id: string
  thumbnail_url: string
  location_tags: string
  users?: {
    full_name: string
  }
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
  onStoryRemoved?: (storyId: string) => void
}

export default function StoryViewer({ stories, initialIndex, onClose, onStoryRemoved }: StoryViewerProps) {
  const [activeStories, setActiveStories] = useState(stories)
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [timeLeft, setTimeLeft] = useState(60)
  const currentStory = activeStories[currentIndex]
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const handleIframeLoad = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      // Force play and unmute via YouTube Iframe API postMessage command
      setTimeout(() => {
        iframeRef.current?.contentWindow?.postMessage(
          JSON.stringify({ event: 'command', func: 'playVideo', args: '' }),
          '*'
        )
        iframeRef.current?.contentWindow?.postMessage(
          JSON.stringify({ event: 'command', func: 'unMute', args: '' }),
          '*'
        )
      }, 300)
    }
  }

  // Cambiar historia automáticamente después de 60 segundos si no interactúa
  useEffect(() => {
    setTimeLeft(60)
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          handleNext()
          return 60
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [currentIndex])

  const handleNext = () => {
    if (currentIndex < activeStories.length - 1) {
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

  const handleDislike = async () => {
    if (!currentStory) return;
    
    // Attempt to save to DB (silently fail if not logged in or error)
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await (supabase as any).from('story_dislikes').insert({
          user_id: session.user.id,
          story_id: currentStory.id
        });
      }
    } catch (e) {
      console.error(e);
    }

    if (onStoryRemoved) {
      onStoryRemoved(currentStory.id);
    }

    // Skip to next or close if it's the last one
    if (activeStories.length === 1) {
      onClose();
    } else {
      // Remove from activeStories
      const newStories = [...activeStories];
      newStories.splice(currentIndex, 1);
      setActiveStories(newStories);
      
      // If we are at the end, go back one, otherwise keep currentIndex which will now point to the next item
      if (currentIndex >= newStories.length) {
        setCurrentIndex(newStories.length - 1);
      }
    }
  }

  if (!currentStory) return null

  const hostName = currentStory.users?.full_name || currentStory.properties?.users?.full_name || 'Anfitrión'
  const propertyTitle = currentStory.properties?.title || 'Increíble vivienda'

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center select-none md:p-4 animate-in fade-in duration-300">
      {/* Container vertical tipo celular */}
      <div className="relative w-full h-full md:max-w-[420px] md:h-[85vh] md:rounded-[20px] overflow-hidden bg-black flex flex-col justify-between shadow-2xl">
        
        {/* Barra de progreso de historias (estilo Instagram) */}
        <div className="absolute top-3 left-0 right-0 z-30 flex gap-1 px-3">
          {stories.map((_, index) => {
            let widthStyle = '0%'
            if (index < currentIndex) widthStyle = '100%'
            if (index === currentIndex) widthStyle = `${((60 - timeLeft) / 60) * 100}%`

            return (
              <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white transition-all duration-1000 ease-linear" 
                  style={{ width: widthStyle }}
                />
              </div>
            )
          })}
        </div>

        {/* Header de la historia (Información del anfitrión) */}
        <div className="absolute top-6 left-0 right-0 z-30 flex justify-between items-center px-4">
          <Link href={`/users/${currentStory.user_id}`} onClick={onClose} className="flex items-center gap-3 text-white hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-full border-2 border-accent-mango overflow-hidden bg-surface-mist flex items-center justify-center text-lg font-bold">
              👤
            </div>
            <div>
              <p className="text-sm font-semibold leading-none drop-shadow">{hostName}</p>
              <p className="text-xs text-white/80 drop-shadow mt-0.5">{currentStory.location_tags}</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <span className="bg-black/60 backdrop-blur-sm border border-white/10 px-2.5 py-1 rounded-full text-[10px] font-bold text-white tracking-wider flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></span>
              {timeLeft}s
            </span>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center text-lg focus:outline-none transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* REPRODUCTOR DE YOUTUBE (Embed vertical para Shorts) */}
        <div className="flex-1 w-full bg-black relative">
          <iframe
            ref={iframeRef}
            key={currentStory.id}
            src={`https://www.youtube.com/embed/${currentStory.youtube_video_id}?autoplay=1&mute=0&controls=0&modestbranding=1&rel=0&playsinline=1&enablejsapi=1&vq=hd1080`}
            title="Host Story"
            className="w-full h-full object-cover"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            onLoad={handleIframeLoad}
          />

          {/* Botón de No me gusta / Ocultar */}
          <div className="absolute top-1/2 right-4 -translate-y-1/2 z-30">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDislike();
              }}
              className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-sm transition-transform active:scale-95 border border-white/20 shadow-lg"
              title="No me interesa este video"
            >
              <HeartOff className="w-5 h-5 text-white/90" />
            </button>
          </div>

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
