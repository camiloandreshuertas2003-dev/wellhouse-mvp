'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import WellScoreRing from './WellScoreRing'
import CategoryIcon from './CategoryIcon'

export interface PropertyCardData {
  id: string
  title: string
  location: string
  type: string
  category?: string
  bedrooms: number
  bathrooms: number
  capacity: number
  rating: number
  reviews: number
  image: string
  verified: boolean
  isMock?: boolean
  wellScore: number
}

interface PropertyCardProps {
  property: PropertyCardData
  /** 'grid' = search results grid view, 'carousel' = sliding category row card */
  variant?: 'grid' | 'carousel'
}

/**
 * PropertyCard — single reusable card component for grids, carousels, and search results.
 * Matches the requested screenshot: square images with highly rounded corners (rounded-[16px]),
 * transparent container background (no card shadow/border), heart button overlay,
 * and a "Favorito entre huéspedes" pill badge.
 */
export default function PropertyCard({ property, variant = 'grid' }: PropertyCardProps) {
  const [imgError, setImgError] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  
  // High-density responsive width supporting ~7 visible cards on large displays
  const widthClass = variant === 'carousel'
    ? 'w-[72vw] max-w-[240px] sm:w-[210px] md:w-[195px] lg:w-[185px] xl:w-[180px]'
    : 'w-full'

  return (
    <div className={`relative group flex flex-col bg-transparent flex-shrink-0 ${widthClass}`}>
      {/* Clickable Image Link wrapper */}
      <Link href={`/properties/${property.id}`} className="focus:outline-none">
        {/* Image Container with rounded-[16px] matching reference screenshot */}
        <div className="relative aspect-square bg-surface-mist overflow-hidden flex-shrink-0 rounded-[16px] shadow-sm">
          {imgError ? (
            <div className="w-full h-full flex items-center justify-center relative bg-surface-mist text-ink-teal-500/15 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <CategoryIcon category={property.category || property.type} className="w-24 h-24 stroke-[1.2]" />
              </div>
              <div className="relative z-10 flex flex-col items-center gap-1 text-ink-teal-700">
                <CategoryIcon category={property.category || property.type} className="w-6 h-6 stroke-[1.8]" />
                <span className="text-[10px] font-inter font-semibold uppercase tracking-wider">Sin fotos</span>
              </div>
            </div>
          ) : (
            <img
              src={property.image}
              alt={property.title}
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
              onError={() => setImgError(true)}
              loading="lazy"
            />
          )}

          {/* "Favorito entre huéspedes" badge overlay at top-left — matches reference screenshot */}
          {property.verified && (
            <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-radius-full text-[10px] font-inter font-bold text-neutral-800 shadow-sm border border-neutral-100/50">
              Favorito entre huéspedes
            </div>
          )}

          {/* WellScore Ring overlay (44px) at bottom-2 right-2 */}
          <div className="absolute bottom-2.5 right-2.5">
            <WellScoreRing value={property.wellScore} wp={property.wellScore} size={44} />
          </div>
        </div>
      </Link>

      {/* Heart overlay button in top-right — matches reference screenshot */}
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setIsLiked(!isLiked)
        }}
        className="absolute top-2.5 right-2.5 z-10 p-1 text-white hover:scale-110 transition-transform focus:outline-none"
        aria-label={isLiked ? "Quitar de favoritos" : "Guardar en favoritos"}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 32 32"
          fill={isLiked ? "#E11D48" : "rgba(0, 0, 0, 0.45)"}
          stroke="white"
          strokeWidth="2"
          className="transition-colors drop-shadow-md"
        >
          <path d="M16 28.268c-.412 0-.816-.164-1.116-.456l-10.4-10.1C2.08 15.355 1 12.247 1 9.07 1 4.62 4.62 1 9.07 1c2.518 0 4.887 1.182 6.4 3.197C16.983 2.182 19.352 1 21.87 1c4.45 0 8.07 3.62 8.07 8.07 0 3.177-1.08 6.285-3.484 8.643l-10.4 10.1c-.3.292-.704.456-1.116.456z" />
        </svg>
      </button>

      {/* Card Body — ultra-clean minimalist 2-line layout matching reference screenshot */}
      <Link href={`/properties/${property.id}`} className="mt-2.5 flex flex-col gap-0.5 min-w-0 focus:outline-none">
        {/* Line 1: Title (semi-bold/medium, text-sm, neutral-950) */}
        <h3 className="font-inter font-semibold text-neutral-900 text-sm leading-snug line-clamp-1 group-hover:text-accent-mango transition-colors">
          {property.title}
        </h3>

        {/* Line 2: Details: Location/Nights/Wellpoints Rate + Rating */}
        <p className="text-text-muted-custom font-inter text-xs leading-normal line-clamp-1 flex items-center justify-between">
          <span>
            {property.location.split(',')[0]} · {property.wellScore} WP por noche
          </span>
          <span className="flex items-center gap-0.5 font-semibold text-neutral-800 shrink-0 ml-1">
            <svg width="9" height="9" viewBox="0 0 14 14" fill="none" className="text-wellpoint-gold flex-shrink-0">
              <path d="M7 1.5l1.545 3.13L12 5.13l-2.5 2.435.59 3.44L7 9.27l-3.09 1.735.59-3.44L2 5.13l3.455-.5L7 1.5z" fill="currentColor"/>
            </svg>
            {property.reviews > 0 ? property.rating.toFixed(1) : '5.0'}
          </span>
        </p>
      </Link>
    </div>
  )
}
