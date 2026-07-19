'use client'

import { Marker, Popup, useMap } from 'react-map-gl/mapbox'
import { useState } from 'react'

export interface MapPinData {
  id: string
  latitude: number
  longitude: number
  price_wp: number
  title: string
  image: string
  isFavorite?: boolean
}

interface MapPinProps {
  pin: MapPinData
  isSelected: boolean
  onSelect: (pin: MapPinData | null) => void
}

export default function MapPin({ pin, isSelected, onSelect }: MapPinProps) {
  return (
    <Marker
      latitude={pin.latitude}
      longitude={pin.longitude}
      anchor="bottom"
      onClick={(e) => {
        e.originalEvent.stopPropagation()
        onSelect(isSelected ? null : pin)
      }}
    >
      <div
        className={`relative flex items-center justify-center font-mono font-bold text-[11px] px-2 py-1 rounded-full shadow-lg border-2 cursor-pointer transition-all duration-200 select-none
          ${isSelected
            ? 'bg-[#0f766e] text-white border-[#0d635c] scale-110 z-50'
            : 'bg-[#faf8f5] text-[#0d2826] border-[#0d2826] hover:bg-[#0f766e] hover:text-white hover:border-[#0d635c] hover:scale-105 z-10'
          }`}
        style={{ minWidth: 44 }}
      >
        {pin.isFavorite && (
          <span className="absolute -top-1.5 -right-1.5 text-[10px]">❤️</span>
        )}
        {pin.price_wp}
        <span className="text-[8px] ml-0.5 opacity-70">WP</span>
      </div>
    </Marker>
  )
}
