'use client'

import React, { useRef } from 'react'
import Link from 'next/link'
import PropertyCard, { type PropertyCardData } from './PropertyCard'
import RowEndCard from './RowEndCard'
import CategoryIcon from './CategoryIcon'


interface PropertyCarouselProps {
  title: string
  subtitle?: string
  properties: PropertyCardData[]
  viewAllHref?: string
}

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

  const categorySlug = viewAllHref
    ? (viewAllHref.includes('category=') ? viewAllHref.split('category=')[1] : 'all')
    : 'all'

  return (
    <section
      className="py-4 md:py-8 bg-base-paper"
      aria-labelledby={`carousel-${title.replace(/\s/g, '-')}`}
    >
      {/* ── Header (always indented) ── */}
      <div className="px-4 md:px-6 lg:px-8 max-w-[1440px] mx-auto">
        <div className="flex items-end justify-between mb-3 md:mb-4">
          <div className="flex items-start gap-2.5">
            <div className="mt-1 text-ink-teal-500 flex-shrink-0">
              <CategoryIcon category={categorySlug} className="w-5 h-5 md:w-6 md:h-6 stroke-[1.8]" />
            </div>
            <div>
              <h2
                id={`carousel-${title.replace(/\s/g, '-')}`}
                className="font-fraunces font-semibold text-xl md:text-2xl text-ink-teal-900 leading-tight"
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
      </div>

      {/* ── Scroll strip ──
          Mobile: No padding on container, ml-4 on first item so the margin "scrolls away"
          Desktop: px-6 lg:px-8 max-w-[1440px] mx-auto (just like before) */}
      <div className="w-full overflow-hidden">
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scroll-smooth pb-3 snap-x snap-mandatory md:px-6 lg:px-8 md:max-w-[1440px] md:mx-auto"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {properties.map((p, i) => (
            <div 
              key={p.id} 
              className={`snap-start flex-shrink-0 ${i === 0 ? 'ml-4 md:ml-0' : ''}`}
            >
              <PropertyCard property={p} variant="carousel" />
            </div>
          ))}

          {viewAllHref && (
            <div className="snap-start flex-shrink-0 w-[72vw] max-w-[240px] sm:w-[200px] md:w-[195px] lg:w-[185px] xl:w-[180px]">
              <RowEndCard count={properties.length} categorySlug={categorySlug} />
            </div>
          )}
          
          {/* Spacer para dar margen derecho al llegar al final en móvil (gap-3 + w-1 = 16px) */}
          <div className="w-1 flex-shrink-0 md:hidden" aria-hidden="true" />
        </div>
      </div>
    </section>
  )
}
