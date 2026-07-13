'use client'

import React, { useState } from 'react'
import StoryViewer, { type HostStory } from './StoryViewer'

interface StoriesBarProps {
  stories: HostStory[]
  loading?: boolean
}

export const STORY_CATEGORIES = [
  { id: 'urbano', label: 'Urbano', img: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=300&q=80', keywords: ['Apartamento', 'Loft', 'Estudio'] },
  { id: 'playa', label: 'Playa y costa', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80', keywords: ['playa'] },
  { id: 'montana', label: 'Montaña', img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=300&q=80', keywords: ['Cabaña'] },
  { id: 'finca', label: 'Fincas y campo', img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=300&q=80', keywords: ['Casa', 'Finca'] },
  { id: 'exclusivo', label: 'Exclusivo', img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=300&q=80', keywords: ['Villa'] },
]

// Helper function to guess the category of a story based on type or title
export function getStoryCategory(story: HostStory): string {
  const type = (story.properties as any)?.type || '';
  const title = (story.properties?.title || '').toLowerCase();
  
  if (type === 'Villa' || title.includes('villa')) return 'exclusivo';
  if (type === 'Casa' || type === 'Finca' || title.includes('finca') || title.includes('casa')) return 'finca';
  if (type === 'Cabaña' || title.includes('cabaña') || title.includes('montaña')) return 'montana';
  if (type === 'Apartamento' || type === 'Loft' || type === 'Estudio' || title.includes('apartamento') || title.includes('loft')) return 'urbano';
  if (title.includes('playa') || title.includes('mar') || title.includes('costa')) return 'playa';
  
  return 'urbano'; // Fallback
}

export default function StoriesBar({ stories, loading }: StoriesBarProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  
  // Categorize stories
  const storiesByCategory: Record<string, HostStory[]> = {
    urbano: [],
    playa: [],
    montana: [],
    finca: [],
    exclusivo: []
  };

  if (stories) {
    stories.forEach(story => {
      const cat = getStoryCategory(story);
      if (storiesByCategory[cat]) {
        storiesByCategory[cat].push(story);
      }
    });
  }

  if (loading) {
    return (
      <div className="w-full bg-white border-b border-surface-mist-dark py-5 px-4 md:px-8 lg:px-8">
        <div className="max-w-[1440px] mx-auto">
          <h3 className="font-inter font-bold text-sm text-ink-teal-900 mb-4 animate-pulse">
            <div className="w-48 h-4 bg-neutral-200 rounded-full"></div>
          </h3>
          <div className="flex gap-5 overflow-x-auto no-scrollbar scroll-smooth pb-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex flex-col items-center flex-shrink-0 animate-pulse">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full p-[2px] bg-neutral-200">
                  <div className="w-full h-full rounded-full border-2 border-white bg-neutral-300"></div>
                </div>
                <div className="w-16 h-3 bg-neutral-200 rounded-full mt-2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Filter categories that have stories, or show all for better UX
  // Let's show all, but visually indicate if they are empty
  const availableCategories = STORY_CATEGORIES.filter(cat => storiesByCategory[cat.id]?.length > 0);

  if (!availableCategories || availableCategories.length === 0) {
    return null // Ocultar si no hay historias
  }

  return (
    <div className="w-full bg-white border-b border-surface-mist-dark py-5 px-4 md:px-8 lg:px-8">
      <div className="max-w-[1440px] mx-auto">
        <h3 className="font-fraunces font-bold text-lg text-ink-teal-900 mb-4 tracking-tight">
          Experiencias de Anfitriones
        </h3>

        {/* Contenedor horizontal scrollable */}
        <div className="flex gap-5 overflow-x-auto no-scrollbar scroll-smooth pb-2">
          {availableCategories.map((category) => {
            const hasStories = storiesByCategory[category.id].length > 0;

            return (
              <button
                key={category.id}
                onClick={() => {
                  if (hasStories) {
                    setActiveCategory(category.id);
                  }
                }}
                className={`flex flex-col items-center flex-shrink-0 focus:outline-none group ${!hasStories ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {/* Círculo estilo Instagram Destacadas */}
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full p-[2px] bg-gradient-to-tr from-accent-mango via-primary-cobalt to-ink-teal-500 group-hover:scale-105 transition-transform duration-200 shadow-sm">
                  <div className="w-full h-full rounded-full border-2 border-white overflow-hidden bg-base-paper">
                    <img
                      src={category.img}
                      alt={category.label}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Etiqueta de la categoría */}
                <span className="text-[12px] md:text-[13px] font-semibold text-ink-teal-900 mt-2 group-hover:text-primary-cobalt transition-colors">
                  {category.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Visor de Historias */}
      {activeCategory !== null && (
        <StoryViewer
          stories={storiesByCategory[activeCategory]}
          initialIndex={0}
          onClose={() => setActiveCategory(null)}
          onStoryRemoved={(storyId) => {
            // This is handled upstream by reloading or we can just close the viewer if empty
            // For now, if they dislike, the viewer automatically skips to next.
          }}
        />
      )}
    </div>
  )
}
