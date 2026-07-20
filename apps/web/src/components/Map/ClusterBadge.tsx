'use client'

import { Marker } from 'react-map-gl/mapbox'

interface ClusterBadgeProps {
  latitude: number
  longitude: number
  pointCount: number
  onClick: () => void
}

export default function ClusterBadge({ latitude, longitude, pointCount, onClick }: ClusterBadgeProps) {
  // Scale size based on point count, between 32px and 48px
  const size = Math.min(48, Math.max(32, 28 + (pointCount * 1.5)))

  return (
    <Marker
      latitude={latitude}
      longitude={longitude}
      anchor="center"
      onClick={(e: any) => {
        e.originalEvent.stopPropagation()
        onClick()
      }}
    >
      <div
        className="flex items-center justify-center bg-[#0f766e] text-white font-bold rounded-full shadow-lg border-2 border-white cursor-pointer hover:scale-110 transition-transform"
        style={{
          width: size,
          height: size,
          fontSize: size > 40 ? 14 : 12
        }}
      >
        {pointCount}
      </div>
    </Marker>
  )
}
