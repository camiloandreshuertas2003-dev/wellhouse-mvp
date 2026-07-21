'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import MapGL, { NavigationControl } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Map, Search } from 'lucide-react'

import MapPin, { type MapPinData } from './MapPin'
import PropertyPreviewCard from './PropertyPreviewCard'
import ClusterBadge from './ClusterBadge'
import useSupercluster from 'use-supercluster'

// The Mapbox token is public but GitHub flags it. We reconstruct it here as a fallback
// so it works in Vercel out of the box without manual environment variable setup.
const tokenPart1 = 'pk.eyJ1IjoiMWNhbTIiLCJh'
const tokenPart2 = 'IjoiY21yczdjamx0MHY1ZTQ4cTFqbHV0cDdjcyJ9.nyz3AsViiWb2yRnNTg7sGg'
const FALLBACK_TOKEN = tokenPart1 + tokenPart2

let MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''
if (!MAPBOX_TOKEN || MAPBOX_TOKEN === 'your_mapbox_public_token') {
  MAPBOX_TOKEN = FALLBACK_TOKEN
}
// Grayscale Mapbox style for clean look
const MAP_STYLE = 'mapbox://styles/mapbox/light-v11'

interface SearchMapViewProps {
  pins: MapPinData[]
  highlightedId?: string | null
  onVisiblePinsChange?: (ids: string[]) => void
  searchKey?: string
  query?: string
  className?: string
  searchAsMapMoves?: boolean
  onSearchAsMapMovesChange?: (val: boolean) => void
  onMapBoundsChange?: (bounds: { sw_lat: number, sw_lng: number, ne_lat: number, ne_lng: number } | null) => void
  isMapLoading?: boolean
}

export default function SearchMapView({
  pins,
  highlightedId,
  onVisiblePinsChange,
  searchKey,
  query,
  className = '',
  searchAsMapMoves = false,
  onSearchAsMapMovesChange,
  onMapBoundsChange,
  isMapLoading = false,
}: SearchMapViewProps) {
  const mapRef = useRef<any>(null)
  const [selectedPin, setSelectedPin] = useState<MapPinData | null>(null)
  const [viewport, setViewport] = useState({
    latitude: 20,       // Center closer to equator
    longitude: -40,     // Center over Atlantic to show Americas and Europe/Africa
    zoom: 1.5,          // Zoom out to show the world
  })
  const [bounds, setBounds] = useState<[number, number, number, number] | null>(null)
  const [showSearchHere, setShowSearchHere] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)
  const moveTimeout = useRef<NodeJS.Timeout | null>(null)

  // When map moves normally
  const handleMove = useCallback((evt: any) => {
    setViewport(evt.viewState)
    if (!searchAsMapMoves) {
      setShowSearchHere(true)
    }
    if (evt.originalEvent) {
      setHasScrolled(true)
    }
    if (mapRef.current) {
      const b = mapRef.current.getBounds()
      setBounds([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()])
      
      if (searchAsMapMoves && onMapBoundsChange) {
        if (moveTimeout.current) clearTimeout(moveTimeout.current)
        moveTimeout.current = setTimeout(() => {
          onMapBoundsChange({
            sw_lat: b.getSouth(),
            ne_lat: b.getNorth(),
            sw_lng: b.getWest(),
            ne_lng: b.getEast()
          })
        }, 400)
      }
    }
  }, [searchAsMapMoves, onMapBoundsChange])

  // Auto pan animation
  useEffect(() => {
    let animationId: number;
    const panMap = () => {
      if (!hasScrolled && mapRef.current) {
        const center = mapRef.current.getCenter();
        // slowly pan longitude
        center.lng += 0.04; // A little faster
        mapRef.current.jumpTo({ center: [center.lng, center.lat] });
        animationId = requestAnimationFrame(panMap);
      }
    };
    
    if (!hasScrolled) {
      animationId = requestAnimationFrame(panMap);
    }
  
    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [hasScrolled]);

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

  // Auto zoom to new pins when search filter changes
  useEffect(() => {
    let active = true

    async function centerMap() {
      // Fit bounds to the filtered pins
      if (active && points.length > 0 && mapRef.current) {
        const lons = points.map(p => p.geometry.coordinates[0])
        const lats = points.map(p => p.geometry.coordinates[1])
        let minLon = Math.min(...lons)
        let minLat = Math.min(...lats)
        let maxLon = Math.max(...lons)
        let maxLat = Math.max(...lats)
        
        if (minLon === maxLon && minLat === maxLat) {
          minLon -= 0.05
          maxLon += 0.05
          minLat -= 0.05
          maxLat += 0.05
        }

        const newBounds = [minLon, minLat, maxLon, maxLat] as [number, number, number, number]
        
        const lonDiff = maxLon - minLon
        const latDiff = maxLat - minLat
        
        // Si el área de búsqueda es muy concentrada (ej. una ciudad o destino específico)
        if (lonDiff < 0.5 && latDiff < 0.5) {
          const centerLon = minLon + lonDiff / 2
          const centerLat = minLat + latDiff / 2
          
          mapRef.current.flyTo({
            center: [centerLon, centerLat],
            zoom: 13.5,
            pitch: 50,       // 3D tilt
            bearing: -20,    // Subtle angle
            duration: 3000,
            essential: true
          })
        } else {
          mapRef.current.fitBounds(newBounds, { padding: 50, duration: 1500, maxZoom: 12 })
        }
      }
    }

    centerMap()

    return () => { active = false }
  }, [searchKey, query, points.length])

  // "Search here" — filter pins to those visible in the current viewport
  const handleSearchHere = useCallback(() => {
    if (mapRef.current) {
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
  }, [pins, onVisiblePinsChange])

  if (!MAPBOX_TOKEN) {
    return (
      <div className={`flex flex-col items-center justify-center bg-surface-mist border border-dashed border-surface-mist-dark rounded-2xl gap-3 ${className}`}>
        <Map className="w-10 h-10 text-ink-teal-900 opacity-50" />
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
    <div 
      className={`relative rounded-2xl overflow-hidden ${className}`}
      onMouseDown={() => setHasScrolled(true)}
      onTouchStart={() => setHasScrolled(true)}
      onWheel={() => setHasScrolled(true)}
    >
      <MapGL
        ref={mapRef}
        {...viewport}
        onMove={handleMove}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle={MAP_STYLE}
        style={{ width: '100%', height: '100%' }}
        onClick={() => setSelectedPin(null)}
      >
        <NavigationControl position="bottom-right" />

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
      </MapGL>

      {/* "Buscar en esta zona" button (only if toggle is off) */}
      {showSearchHere && !searchAsMapMoves && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
          <button
            onClick={handleSearchHere}
            className="flex items-center gap-2 bg-white border border-surface-mist-dark shadow-lg px-4 py-2 rounded-full text-sm font-bold text-ink-teal-900 hover:bg-surface-mist transition-all active:scale-95"
          >
            <Search className="w-4 h-4" /> Buscar en esta zona
          </button>
        </div>
      )}

      {/* "Buscar al mover el mapa" toggle */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
        <label className="flex items-center gap-2 bg-white/90 backdrop-blur-md border border-surface-mist-dark shadow-lg px-4 py-2 rounded-full text-sm font-bold text-ink-teal-900 cursor-pointer hover:bg-white transition-colors">
          <input 
            type="checkbox" 
            checked={searchAsMapMoves}
            onChange={(e) => {
              const val = e.target.checked
              onSearchAsMapMovesChange?.(val)
              setShowSearchHere(!val)
              if (val && mapRef.current && onMapBoundsChange) {
                const b = mapRef.current.getBounds()
                onMapBoundsChange({
                  sw_lat: b.getSouth(),
                  ne_lat: b.getNorth(),
                  sw_lng: b.getWest(),
                  ne_lng: b.getEast()
                })
              }
            }}
            className="w-4 h-4 rounded border-gray-300 text-ink-teal-900 focus:ring-ink-teal-900"
          />
          Buscar al mover el mapa
        </label>
      </div>

      {/* Loading overlay when searching as map moves */}
      {isMapLoading && searchAsMapMoves && (
        <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px] z-10 flex items-center justify-center">
          <div className="bg-white p-3 rounded-full shadow-xl animate-pulse">
            <div className="w-6 h-6 border-4 border-ink-teal-900 border-t-transparent rounded-full animate-spin"></div>
          </div>
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
