'use client'

import React, { useRef } from 'react'
import Link from 'next/link'
import PropertyCard, { type PropertyCardData } from './PropertyCard'
import RowEndCard from './RowEndCard'
import CategoryIcon from './CategoryIcon'


interface PropertyCarouselProps {
  title: string // Strictly mandatory (Módulo C)
  subtitle?: string
  properties: PropertyCardData[]
  viewAllHref?: string
}

/**
 * PropertyCarousel — high-density horizontal scrollable editorial row (Módulo A).
 * Automatically wraps cards with fixed pixel widths and peeking on mobile.
 * Appends a custom brand RowEndCard at the end.
 */
export default function PropertyCarousel({
  title,
  subtitle,
  properties,
  viewAllHref,
}: PropertyCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: 'left' | 'right') => {
    const amount = scrollRef.current?.offsetWidth ?? 320
    scrollRef.current?.scrollBy({
      left: dir === 'left' ? -amount * 0.75 : amount * 0.75,
      behavior: 'smooth',
    })
  }

  if (properties.length === 0) return null

  // Extract category slug from viewAllHref for RowEndCard redirection
  const categorySlug = viewAllHref 
    ? (viewAllHref.includes('category=') ? viewAllHref.split('category=')[1] : 'all')
    : 'all'

  return (
    <section className="py-8 bg-base-paper" aria-labelledby={`carousel-${title.replace(/\s/g, '-')}`}>
      <div className="max-w-[1440px] mx-auto px-6 md:px-6 lg:px-8">
        {/* Header Row */}
        <div className="flex items-end justify-between mb-4">
          <div className="flex items-start gap-2.5">
            <div className="mt-1 text-ink-teal-500 flex-shrink-0">
              <CategoryIcon category={categorySlug} className="w-6 h-6 stroke-[1.8]" />
            </div>
            <div>
              <h2
                id={`carousel-${title.replace(/\s/g, '-')}`}
                className="font-fraunces font-semibold text-2xl text-ink-teal-900 leading-tight"
              >
                {title}
              </h2>
              {subtitle && (
                <p className="font-inter text-text-muted-custom text-sm mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              {/* Desktop-only arrow navigation */}
              <button
                onClick={() => scroll('left')}
                className="hidden md:flex w-7 h-7 border border-surface-mist-dark rounded-radius-full items-center justify-center text-ink-teal-700 hover:bg-surface-mist hover:border-ink-teal-500 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-mango"
                aria-label={`Deslizar ${title} a la izquierda`}
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button
                onClick={() => scroll('right')}
                className="hidden md:flex w-7 h-7 border border-surface-mist-dark rounded-radius-full items-center justify-center text-ink-teal-700 hover:bg-surface-mist hover:border-ink-teal-500 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-mango"
                aria-label={`Deslizar ${title} a la derecha`}
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            {viewAllHref && (
              <Link
                href={viewAllHref}
                className="font-inter font-semibold text-sm text-accent-mango hover:text-accent-mango-hover transition-colors whitespace-nowrap ml-1"
              >
                Ver todo →
              </Link>
            )}
          </div>
        </div>

        {/* Scrollable Container (Módulo A.1 & Módulo D: peeking on mobile and snap-align) */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scroll-smooth pb-3 scrollbar-none -mx-6 px-6 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {properties.map((p) => (
            <div key={p.id} className="snap-start flex-shrink-0">
              <PropertyCard property={p} variant="carousel" />
            </div>
          ))}
          
          {/* RowEndCard as a custom brand closer card at the end of the row (Módulo A.3) */}
          {viewAllHref && (
            <div className="snap-start flex-shrink-0 w-[72vw] max-w-[240px] sm:w-[200px] md:w-[195px] lg:w-[185px] xl:w-[180px]">
              <RowEndCard count={properties.length} categorySlug={categorySlug} />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
