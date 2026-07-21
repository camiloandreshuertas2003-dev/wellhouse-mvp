'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { MapPin, Users, BedDouble, Bath, Heart } from 'lucide-react'
import { supabase } from '@/lib/supabase'

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
  wellRank: number
  host_avatar?: string
  isFavorite?: boolean
}

interface PropertyCardProps {
  property: PropertyCardData
  variant?: 'grid' | 'carousel'
  isPriority?: boolean
}

export default function PropertyCard({ property, variant = 'grid', isPriority = false }: PropertyCardProps) {
  const [imgError, setImgError] = useState(false)
  const [isLiked, setIsLiked] = useState(property.isFavorite || false)

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const nextState = !isLiked
    setIsLiked(nextState)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      if (nextState) {
        await (supabase as any).from('favorites').insert({
          user_id: user.id,
          property_id: property.id
        })
      } else {
        await (supabase as any).from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('property_id', property.id)
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      setIsLiked(!nextState) // revert on error
    }
  }

  const widthClass = variant === 'carousel'
    ? 'w-[220px] md:w-[270px] flex-shrink-0'
    : 'w-full'

  return (
    <div className={`relative flex flex-col bg-white rounded-2xl border border-surface-mist-dark overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 ${widthClass}`}>
      {/* Clickable Image wrapper */}
      <Link href={`/properties/${property.id}`} className="relative aspect-[4/3] w-full block overflow-hidden bg-surface-mist group">
        {imgError ? (
          <div className="w-full h-full flex items-center justify-center bg-surface-mist text-text-muted-custom">
            <span className="text-xs font-semibold">Sin imagen</span>
          </div>
        ) : (
          <img
            src={property.image}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
            onError={() => setImgError(true)}
            loading={isPriority ? "eager" : "lazy"}
          />
        )}

        {/* Heart overlay button top-right */}
        <button
          onClick={toggleFavorite}
          className="absolute top-2.5 right-2.5 z-20 p-1.5 bg-black/35 backdrop-blur-md hover:bg-black/50 transition-colors rounded-full text-white"
          aria-label={isLiked ? "Quitar de favoritos" : "Guardar en favoritos"}
        >
          <Heart
            className={`w-3.5 h-3.5 transition-colors ${isLiked ? 'fill-rose-500 stroke-rose-500' : 'stroke-white'}`}
            strokeWidth={2.5}
          />
        </button>

        {/* WellPoints badge — bottom-right of image */}
        <div className="absolute bottom-2.5 right-2.5 z-10 flex items-center gap-0.5 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full shadow-md">
          <span className="text-[#2dd4bf] font-bold text-[11px] leading-none">{property.wellRank}</span>
          <span className="text-white/80 text-[9px] font-semibold leading-none">WP</span>
        </div>

        {/* Host Avatar overlapping the bottom-left of the image */}
        {property.host_avatar && (
          <div className="absolute bottom-2.5 left-2.5 z-10 w-7 h-7 rounded-full border-2 border-white shadow-md overflow-hidden bg-gray-200">
            <img src={property.host_avatar} alt="" className="w-full h-full object-cover" />
          </div>
        )}
      </Link>

      {/* Card Content — compact */}
      <div className="px-3 py-2.5 flex flex-col flex-1">
        {/* Location tag with map-pin */}
        <div className="flex items-center gap-1 text-[#0f766e] text-[10px] font-semibold mb-0.5">
          <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
          <span className="truncate">{property.location}</span>
        </div>

        {/* Property Title */}
        <Link href={`/properties/${property.id}`} className="focus:outline-none">
          <h3 className="font-fraunces font-bold text-ink-teal-900 text-xs md:text-sm leading-snug line-clamp-2 hover:text-[#0f766e] transition-colors mb-1.5">
            {property.title}
          </h3>
        </Link>

        {/* Features row */}
        <div className="flex items-center gap-2 text-text-muted-custom text-[10px] font-inter">
          <span className="flex items-center gap-0.5">
            <Users className="w-2.5 h-2.5" />
            {property.capacity}
          </span>
          <span className="text-gray-300">·</span>
          <span className="flex items-center gap-0.5">
            <BedDouble className="w-2.5 h-2.5" />
            {property.bedrooms}
          </span>
          <span className="text-gray-300">·</span>
          <span className="flex items-center gap-0.5">
            <Bath className="w-2.5 h-2.5" />
            {property.bathrooms}
          </span>
        </div>
      </div>
    </div>
  )
}
