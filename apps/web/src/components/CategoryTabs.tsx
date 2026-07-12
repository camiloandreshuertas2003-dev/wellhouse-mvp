'use client'

import React, { useRef } from 'react'
import Link from 'next/link'
import CategoryIcon from './CategoryIcon'

const CATEGORIES = [
  { id: 'all',         label: 'Todo' },
  { id: 'fincas',      label: 'Fincas y campo' },
  { id: 'playa',       label: 'Playa y costa' },
  { id: 'urbano',      label: 'Urbano' },
  { id: 'montana',     label: 'Montaña' },
  { id: 'exclusivo',   label: 'Exclusivo' },
]

interface CategoryTabsProps {
  active?: string
  onSelect?: (id: string) => void
  /** If true, wraps each category in a link to /search?category=X */
  asLinks?: boolean
}

/**
 * CategoryTabs — horizontal scrollable tab bar for property categories.
 * Mobile: swipe/scroll. Desktop: mouse scroll + arrow fade indicators.
 * Uses CategoryIcon line vector SVGs instead of native OS emojis (Módulo E).
 */
export default function CategoryTabs({ active = 'all', onSelect, asLinks = false }: CategoryTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollLeft = () => scrollRef.current?.scrollBy({ left: -200, behavior: 'smooth' })
  const scrollRight = () => scrollRef.current?.scrollBy({ left: 200, behavior: 'smooth' })

  return (
    <div className="relative flex items-center">
      {/* Left fade + arrow button */}
      <button
        onClick={scrollLeft}
        className="hidden md:flex absolute left-0 z-10 w-9 h-9 bg-base-paper/90 backdrop-blur-sm border border-surface-mist-dark rounded-radius-full items-center justify-center shadow-shadow-sm hover:shadow-shadow-md transition-all text-ink-teal-700 hover:bg-white -translate-x-1"
        aria-label="Categorías anteriores"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Scrollable tabs */}
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scroll-smooth scrollbar-none px-1 py-1 md:px-8 w-full"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        role="tablist"
        aria-label="Categorías de vivienda"
      >
        {CATEGORIES.map((cat) => {
          const isActive = active === cat.id
          const baseClass = `
            flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-radius-full
            font-inter font-medium text-sm whitespace-nowrap transition-all duration-200
            min-h-[44px] border
            ${isActive
              ? 'bg-ink-teal-900 text-white border-ink-teal-900 shadow-shadow-sm'
              : 'bg-white text-ink-teal-700 border-surface-mist-dark hover:border-ink-teal-500 hover:text-ink-teal-900'
            }
          `

          const iconElement = (
            <CategoryIcon 
              category={cat.id} 
              className={`w-4 h-4 ${isActive ? 'text-white' : 'text-ink-teal-500'}`} 
              strokeWidth={1.8} 
            />
          )

          if (asLinks) {
            return (
              <Link
                key={cat.id}
                href={cat.id === 'all' ? '/search' : `/search?category=${cat.id}`}
                className={baseClass}
                role="tab"
                aria-selected={isActive}
              >
                {iconElement}
                {cat.label}
              </Link>
            )
          }

          return (
            <button
              key={cat.id}
              onClick={() => onSelect?.(cat.id)}
              className={baseClass}
              role="tab"
              aria-selected={isActive}
            >
              {iconElement}
              {cat.label}
            </button>
          )
        })}
      </div>

      {/* Right fade + arrow button */}
      <button
        onClick={scrollRight}
        className="hidden md:flex absolute right-0 z-10 w-9 h-9 bg-base-paper/90 backdrop-blur-sm border border-surface-mist-dark rounded-radius-full items-center justify-center shadow-shadow-sm hover:shadow-shadow-md transition-all text-ink-teal-700 hover:bg-white translate-x-1"
        aria-label="Más categorías"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  )
}
