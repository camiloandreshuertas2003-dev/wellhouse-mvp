'use client'

import React, { useState } from 'react'
import StoryViewer, { type HostStory } from './StoryViewer'

interface StoriesBarProps {
  stories: HostStory[]
}

export default function StoriesBar({ stories }: StoriesBarProps) {
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null)

  if (!stories || stories.length === 0) {
    return null // Ocultar si no hay historias
  }

  return (
    <div className="w-full bg-white border-b border-surface-mist-dark py-4 px-6 md:px-8 lg:px-8">
      <div className="max-w-[1440px] mx-auto">
        <h3 className="font-fraunces font-bold text-sm text-ink-teal-900 mb-3 flex items-center gap-1.5">
          <span>✨</span> Experiencias de Anfitriones
        </h3>

        {/* Contenedor horizontal scrollable */}
        <div className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-1">
          {stories.map((story, index) => {
            const hostName = story.properties?.users?.full_name?.split(' ')[0] || 'Anfitrión'
            const cityName = story.location_tags.split(',')[0].trim()

            return (
              <button
                key={story.id}
                onClick={() => setActiveStoryIndex(index)}
                className="flex flex-col items-center flex-shrink-0 focus:outline-none group"
              >
                {/* Círculo estilo Instagram */}
                <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-accent-mango via-primary-cobalt to-ink-teal-500 group-hover:scale-105 transition-transform duration-200 shadow-sm">
                  <div className="w-full h-full rounded-full border-2 border-white overflow-hidden bg-base-paper">
                    <img
                      src={story.thumbnail_url}
                      alt={hostName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback por si la miniatura de YouTube falla
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=150&q=80'
                      }}
                    />
                  </div>
                </div>

                {/* Nombre de la ciudad */}
                <span className="text-[11px] font-semibold text-ink-teal-900 mt-2 group-hover:text-primary-cobalt transition-colors">
                  {cityName}
                </span>
                {/* Nombre del anfitrión */}
                <span className="text-[9px] text-text-muted-custom leading-tight">
                  {hostName}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Visor de Historias */}
      {activeStoryIndex !== null && (
        <StoryViewer
          stories={stories}
          initialIndex={activeStoryIndex}
          onClose={() => setActiveStoryIndex(null)}
        />
      )}
    </div>
  )
}
