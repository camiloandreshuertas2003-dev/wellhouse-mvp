'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function SearchPage() {
  const [filters, setFilters] = useState({
    location: '',
    checkIn: '',
    checkOut: '',
    guests: '2',
    propertyType: '',
    bedrooms: '',
    priceRange: '',
    amenities: [] as string[]
  })

  const [showFilters, setShowFilters] = useState(false)

  const mockProperties = [
    {
      id: '1',
      title: 'Apartamento acogedor en el centro de Madrid',
      location: 'Madrid, España',
      type: 'Apartamento',
      bedrooms: 2,
      bathrooms: 1,
      capacity: 4,
      rating: 4.8,
      reviews: 24,
      price: 50,
      image: '/images/property-1.jpg',
      verified: true
    },
    {
      id: '2',
      title: 'Casa con jardín en Barcelona',
      location: 'Barcelona, España',
      type: 'Casa',
      bedrooms: 3,
      bathrooms: 2,
      capacity: 6,
      rating: 4.9,
      reviews: 31,
      price: 75,
      image: '/images/property-2.jpg',
      verified: true
    },
    {
      id: '3',
      title: 'Estudio moderno en Valencia',
      location: 'Valencia, España',
      type: 'Estudio',
      bedrooms: 1,
      bathrooms: 1,
      capacity: 2,
      rating: 4.7,
      reviews: 18,
      price: 35,
      image: '/images/property-3.jpg',
      verified: false
    },
    {
      id: '4',
      title: 'Loft con vistas al mar en Málaga',
      location: 'Málaga, España',
      type: 'Loft',
      bedrooms: 1,
      bathrooms: 1,
      capacity: 2,
      rating: 4.6,
      reviews: 12,
      price: 45,
      image: '/images/property-4.jpg',
      verified: true
    },
    {
      id: '5',
      title: 'Villa con piscina en Sevilla',
      location: 'Sevilla, España',
      type: 'Villa',
      bedrooms: 4,
      bathrooms: 3,
      capacity: 8,
      rating: 5.0,
      reviews: 45,
      price: 100,
      image: '/images/property-5.jpg',
      verified: true
    },
    {
      id: '6',
      title: 'Apartamento histórico en Granada',
      location: 'Granada, España',
      type: 'Apartamento',
      bedrooms: 2,
      bathrooms: 1,
      capacity: 4,
      rating: 4.5,
      reviews: 9,
      price: 40,
      image: '/images/property-6.jpg',
      verified: false
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="¿A dónde quieres ir?"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filtros
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Check-in</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filters.checkIn}
                  onChange={(e) => setFilters({ ...filters, checkIn: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Check-out</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filters.checkOut}
                  onChange={(e) => setFilters({ ...filters, checkOut: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Huéspedes</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filters.guests}
                  onChange={(e) => setFilters({ ...filters, guests: e.target.value })}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'huésped' : 'huéspedes'}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de vivienda</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filters.propertyType}
                  onChange={(e) => setFilters({ ...filters, propertyType: e.target.value })}
                >
                  <option value="">Todos</option>
                  <option value="apartment">Apartamento</option>
                  <option value="house">Casa</option>
                  <option value="studio">Estudio</option>
                  <option value="loft">Loft</option>
                  <option value="villa">Villa</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">
            {mockProperties.length} viviendas encontradas
          </h1>
          <select className="px-4 py-2 border border-gray-300 rounded-lg">
            <option>Relevancia</option>
            <option>Precio: menor a mayor</option>
            <option>Precio: mayor a menor</option>
            <option>Mejor valoradas</option>
          </select>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockProperties.map((property) => (
            <Link key={property.id} href={`/properties/${property.id}`} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-video bg-gray-200 relative">
                <img
                  src={property.image}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
                {property.verified && (
                  <div className="absolute top-3 left-3 bg-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Verificado
                  </div>
                )}
                <button className="absolute top-3 right-3 p-2 bg-white rounded-full hover:bg-gray-100">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>
              
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 line-clamp-1">{property.title}</h3>
                  <div className="flex items-center gap-1 text-sm">
                    <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span>{property.rating}</span>
                    <span className="text-gray-600">({property.reviews})</span>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-3 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {property.location}
                </p>
                
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <span>{property.bedrooms} hab</span>
                  <span>•</span>
                  <span>{property.bathrooms} baños</span>
                  <span>•</span>
                  <span>{property.capacity} pers</span>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t">
                  <div>
                    <p className="text-sm text-gray-600">WellPoints</p>
                    <p className="text-xl font-bold text-blue-600">{property.price}/noche</p>
                  </div>
                  <span className="text-xs text-gray-500">{property.type}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-8">
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>
              Anterior
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">1</button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">2</button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">3</button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
