'use client'

import React from 'react'
import { MapContainer, TileLayer, Circle } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

export default function LeafletMap({ lat, lng }: { lat: number; lng: number }) {
  // 1km radius = 1000 meters
  return (
    <MapContainer 
      center={[lat, lng]} 
      zoom={14} 
      scrollWheelZoom={false} 
      style={{ height: '100%', width: '100%', zIndex: 0 }}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      <Circle 
        center={[lat, lng]} 
        radius={1000} 
        pathOptions={{
          fillColor: '#F59346', 
          fillOpacity: 0.35,
          color: '#F59346',
          weight: 2
        }} 
      />
    </MapContainer>
  )
}
