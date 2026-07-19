'use client'

import { Heart, Star, MapPin as MapPinIcon } from 'lucide-react'
import type { MapPinData } from './MapPin'

interface PropertyPreviewCardProps {
  pin: MapPinData
  onClose: () => void
}

export default function PropertyPreviewCard({ pin, onClose }: PropertyPreviewCardProps) {
  return (
    <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-50 w-[280px] bg-white rounded-2xl shadow-2xl border border-surface-mist-dark overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
      {/* Image */}
      <div className="relative h-32 bg-gray-100">
        <img
          src={pin.image}
          alt={pin.title}
          className="w-full h-full object-cover"
        />
        <button
          onClick={onClose}
          className="absolute top-2 right-2 w-6 h-6 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center text-xs transition-colors"
        >
          ✕
        </button>
        {pin.isFavorite && (
          <div className="absolute top-2 left-2">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="font-semibold text-sm text-ink-teal-900 leading-tight line-clamp-1">{pin.title}</p>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1">
            <MapPinIcon className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-500">Ver en el mapa</span>
          </div>
          <div className="flex items-center gap-0.5 bg-[#0f766e]/10 text-[#0f766e] px-2 py-0.5 rounded-full">
            <span className="font-bold text-xs font-mono">{pin.price_wp}</span>
            <span className="text-[10px] font-bold">WP</span>
          </div>
        </div>

        <a
          href={`/properties/${pin.id}`}
          className="mt-2.5 flex items-center justify-center w-full py-2 bg-[#0f766e] text-white text-xs font-bold rounded-full hover:bg-[#0d635c] transition-colors"
        >
          Ver vivienda →
        </a>
      </div>
    </div>
  )
}
