'use client'

import { useRef, useState, useCallback } from 'react'
import Map, { NavigationControl } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'

import MapPin, { type MapPinData } from './MapPin'
import PropertyPreviewCard from './PropertyPreviewCard'

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

// Grayscale Mapbox style for clean look
const MAP_STYLE = 'mapbox://styles/mapbox/light-v11'

interface SearchMapViewProps {
  pins: MapPinData[]
  highlightedId?: string | null
  onVisiblePinsChange?: (ids: string[]) => void
  className?: string
}

export default function SearchMapView({
  pins,
  highlightedId,
  onVisiblePinsChange,
  className = '',
}: SearchMapViewProps) {
  const mapRef = useRef<any>(null)
  const [selectedPin, setSelectedPin] = useState<MapPinData | null>(null)
  const [viewport, setViewport] = useState({
    latitude: 4.7110,   // Colombia center
    longitude: -74.0721,
    zoom: 5.5,
  })
  const [showSearchHere, setShowSearchHere] = useState(false)

  // When map moves, show the "search here" button
  const handleMove = useCallback((evt: any) => {
    setViewport(evt.viewState)
    setShowSearchHere(true)
  }, [])

  // "Search here" — filter pins to those visible in the current viewport
  const handleSearchHere = useCallback(() => {
    if (!mapRef.current) return
    const bounds = mapRef.current.getBounds()
    const visibleIds = pins
      .filter(p =>
        p.latitude >= bounds.getSouth() &&
        p.latitude <= bounds.getNorth() &&
        p.longitude >= bounds.getWest() &&
        p.longitude <= bounds.getEast()
      )
      .map(p => p.id)
    onVisiblePinsChange?.(visibleIds)
    setShowSearchHere(false)
  }, [pins, onVisiblePinsChange])

  if (!MAPBOX_TOKEN || MAPBOX_TOKEN === 'your_mapbox_public_token') {
    return (
      <div className={`flex flex-col items-center justify-center bg-surface-mist border border-dashed border-surface-mist-dark rounded-2xl gap-3 ${className}`}>
        <div className="text-3xl">🗺️</div>
        <p className="text-sm font-bold text-ink-teal-900">Vista de Mapa</p>
        <p className="text-xs text-text-muted-custom text-center max-w-[200px]">
          Configura tu token de Mapbox en <code className="text-[10px] bg-gray-100 px-1 rounded">.env.local</code> para activar el mapa
        </p>
        <code className="text-[10px] bg-ink-teal-900 text-white px-3 py-1.5 rounded-lg">
          NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1...
        </code>
      </div>
    )
  }

  return (
    <div className={`relative rounded-2xl overflow-hidden ${className}`}>
      <Map
        ref={mapRef}
        {...viewport}
        onMove={handleMove}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle={MAP_STYLE}
        style={{ width: '100%', height: '100%' }}
        onClick={() => setSelectedPin(null)}
      >
        <NavigationControl position="bottom-right" />

        {pins.map(pin => (
          <MapPin
            key={pin.id}
            pin={pin}
            isSelected={selectedPin?.id === pin.id || highlightedId === pin.id}
            onSelect={setSelectedPin}
          />
        ))}
      </Map>

      {/* "Buscar en esta zona" button */}
      {showSearchHere && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
          <button
            onClick={handleSearchHere}
            className="flex items-center gap-2 bg-white border border-surface-mist-dark shadow-lg px-4 py-2 rounded-full text-sm font-bold text-ink-teal-900 hover:bg-surface-mist transition-all active:scale-95"
          >
            🔍 Buscar en esta zona
          </button>
        </div>
      )}

      {/* Pin count badge */}
      <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm border border-surface-mist-dark rounded-full px-3 py-1">
        <span className="text-xs font-bold text-ink-teal-900">{pins.length} viviendas</span>
      </div>

      {/* Property preview card on pin select */}
      {selectedPin && (
        <PropertyPreviewCard
          pin={selectedPin}
          onClose={() => setSelectedPin(null)}
        />
      )}
    </div>
  )
}
