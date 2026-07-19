'use client'

import { useRef, useState, useCallback } from 'react'
import Map, { NavigationControl } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'

import MapPin, { type MapPinData } from './MapPin'
import PropertyPreviewCard from './PropertyPreviewCard'
import ClusterBadge from './ClusterBadge'
import useSupercluster from 'use-supercluster'
import { Source, Layer } from 'react-map-gl/mapbox'
import * as turf from '@turf/helpers'
import booleanPointInPolygon from '@turf/boolean-point-in-polygon'

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
  const [bounds, setBounds] = useState<[number, number, number, number] | null>(null)
  const [showSearchHere, setShowSearchHere] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawnPolygon, setDrawnPolygon] = useState<number[][]>([])
  const [finishedPolygon, setFinishedPolygon] = useState<number[][] | null>(null)
  const drawTimer = useRef<NodeJS.Timeout | null>(null)

  // Long press detection
  const handlePointerDown = useCallback((e: any) => {
    // Only allow drawing on left click or touch
    if (e.originalEvent?.button !== 0 && e.originalEvent?.type !== 'touchstart') return
    
    drawTimer.current = setTimeout(() => {
      setIsDrawing(true)
      setDrawnPolygon([[e.lngLat.lng, e.lngLat.lat]])
      setFinishedPolygon(null)
    }, 500)
  }, [])

  const handlePointerMove = useCallback((e: any) => {
    if (isDrawing) {
      setDrawnPolygon(prev => [...prev, [e.lngLat.lng, e.lngLat.lat]])
    } else if (drawTimer.current) {
      // If they move before long-press triggers, cancel it
      clearTimeout(drawTimer.current)
      drawTimer.current = null
    }
  }, [isDrawing])

  const handlePointerUp = useCallback(() => {
    if (drawTimer.current) {
      clearTimeout(drawTimer.current)
      drawTimer.current = null
    }
    if (isDrawing) {
      setIsDrawing(false)
      if (drawnPolygon.length > 2) {
        // Close polygon
        const closed = [...drawnPolygon, drawnPolygon[0]]
        setFinishedPolygon(closed)
        setShowSearchHere(true)
      } else {
        setDrawnPolygon([])
      }
    }
  }, [isDrawing, drawnPolygon])

  // When map moves normally
  const handleMove = useCallback((evt: any) => {
    setViewport(evt.viewState)
    if (!isDrawing && !finishedPolygon) {
      setShowSearchHere(true)
    }
    if (mapRef.current) {
      const b = mapRef.current.getBounds()
      setBounds([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()])
    }
  }, [isDrawing, finishedPolygon])

  // Prepare data for clustering
  const points = pins.map(pin => ({
    type: 'Feature' as const,
    properties: { cluster: false, ...pin },
    geometry: {
      type: 'Point' as const,
      coordinates: [pin.longitude, pin.latitude]
    }
  }))

  const { clusters, supercluster } = useSupercluster({
    points,
    bounds: bounds || [-180, -85, 180, 85],
    zoom: viewport.zoom,
    options: { radius: 60, maxZoom: 16 }
  })

  // "Search here" — filter pins to those visible in the current viewport or polygon
  const handleSearchHere = useCallback(() => {
    if (finishedPolygon) {
      // Filter by polygon
      const poly = turf.polygon([finishedPolygon])
      const visibleIds = pins.filter(p => {
        const pt = turf.point([p.longitude, p.latitude])
        return booleanPointInPolygon(pt, poly)
      }).map(p => p.id)
      onVisiblePinsChange?.(visibleIds)
      setShowSearchHere(false)
    } else if (mapRef.current) {
      // Filter by bounds
      const b = mapRef.current.getBounds()
      const visibleIds = pins
        .filter(p =>
          p.latitude >= b.getSouth() &&
          p.latitude <= b.getNorth() &&
          p.longitude >= b.getWest() &&
          p.longitude <= b.getEast()
        )
        .map(p => p.id)
      onVisiblePinsChange?.(visibleIds)
      setShowSearchHere(false)
    }
  }, [pins, onVisiblePinsChange, finishedPolygon])

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
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
        dragPan={!isDrawing}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle={MAP_STYLE}
        style={{ width: '100%', height: '100%' }}
        onClick={() => setSelectedPin(null)}
      >
        <NavigationControl position="bottom-right" />

        {/* Drawn Polygon */}
        {(drawnPolygon.length > 0 || finishedPolygon) && (
          <Source
            id="drawn-polygon"
            type="geojson"
            data={{
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'Polygon',
                coordinates: [finishedPolygon || [...drawnPolygon, drawnPolygon[0]]]
              }
            }}
          >
            <Layer
              id="drawn-polygon-fill"
              type="fill"
              paint={{ 'fill-color': '#0f766e', 'fill-opacity': 0.15 }}
            />
            <Layer
              id="drawn-polygon-stroke"
              type="line"
              paint={{ 'line-color': '#0f766e', 'line-width': 2, 'line-dasharray': [2, 2] }}
            />
          </Source>
        )}

        {clusters.map(cluster => {
          const [longitude, latitude] = cluster.geometry.coordinates
          const { cluster: isCluster, point_count: pointCount } = cluster.properties

          if (isCluster) {
            return (
              <ClusterBadge
                key={`cluster-${cluster.id}`}
                latitude={latitude}
                longitude={longitude}
                pointCount={pointCount}
                onClick={() => {
                  const expansionZoom = Math.min(
                    supercluster.getClusterExpansionZoom(cluster.id as number),
                    20
                  )
                  mapRef.current?.flyTo({
                    center: [longitude, latitude],
                    zoom: expansionZoom,
                    duration: 500
                  })
                }}
              />
            )
          }

          const pin = cluster.properties as MapPinData
          return (
            <MapPin
              key={pin.id}
              pin={pin}
              isSelected={selectedPin?.id === pin.id || highlightedId === pin.id}
              onSelect={setSelectedPin}
            />
          )
        })}
      </Map>

      {/* "Buscar en esta zona" button */}
      {showSearchHere && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
          <button
            onClick={handleSearchHere}
            className="flex items-center gap-2 bg-white border border-surface-mist-dark shadow-lg px-4 py-2 rounded-full text-sm font-bold text-ink-teal-900 hover:bg-surface-mist transition-all active:scale-95"
          >
            🔍 Buscar en esta zona
          </button>
          {finishedPolygon && (
            <button
              onClick={() => {
                setFinishedPolygon(null)
                setDrawnPolygon([])
                setShowSearchHere(false)
                onVisiblePinsChange?.([]) // clear filter
              }}
              className="text-xs bg-white/90 px-3 py-1 rounded-full text-gray-500 hover:text-gray-800 shadow border border-gray-200"
            >
              ✕ Borrar zona
            </button>
          )}
        </div>
      )}

      {/* Drawing instruction (only shown initially) */}
      {!hasScrolled && !finishedPolygon && !isDrawing && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 bg-black/75 backdrop-blur-sm text-white text-[10px] md:text-xs font-medium px-4 py-2 rounded-full shadow-lg flex items-center gap-2 pointer-events-none animate-in fade-in duration-500">
          <span className="text-sm">✏️</span>
          <span>Mantén presionado y dibuja la zona</span>
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
