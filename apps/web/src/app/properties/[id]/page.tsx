'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function PropertyDetailPage({ params }: { params: { id: string } }) {
  const [selectedImage, setSelectedImage] = useState(0)

  const property = {
    id: params.id,
    title: 'Apartamento acogedor en el centro de Madrid',
    type: 'Apartamento',
    location: 'Madrid, España',
    rating: 4.8,
    reviews: 24,
    host: {
      name: 'María García',
      verified: true,
      responseRate: '95%',
      responseTime: '1 hora'
    },
    characteristics: {
      bedrooms: 2,
      bathrooms: 1,
      capacity: 4,
      beds: 2,
      size: 75,
      floors: 3
    },
    amenities: ['WiFi', 'Cocina equipada', 'Aire acondicionado', 'Lavadora', 'TV', 'Ascensor'],
    description: 'Hermoso apartamento recién renovado en el corazón de Madrid. A 5 minutos de la Puerta del Sol y a 10 minutos del Museo del Prado. Perfecto para familias o grupos de amigos que quieran explorar la ciudad.',
    rules: 'No fumar, no mascotas, check-in después de las 15:00, check-out antes de las 11:00',
    images: [
      '/images/property-1-1.jpg',
      '/images/property-1-2.jpg',
      '/images/property-1-3.jpg',
      '/images/property-1-4.jpg',
      '/images/property-1-5.jpg'
    ],
    availability: {
      from: '2026-07-01',
      to: '2026-12-31',
      minStay: 3,
      maxStay: 30
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/search" className="text-blue-600 hover:underline">
            ← Volver a la búsqueda
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="aspect-video bg-gray-200 relative">
                <img
                  src={property.images[selectedImage]}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="grid grid-cols-4 gap-2 p-4">
                {property.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-video rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-blue-500' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${property.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Property Info */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{property.title}</h1>
                  <p className="text-gray-600 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    {property.location}
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-blue-50 px-3 py-1 rounded-full">
                  <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="font-semibold">{property.rating}</span>
                  <span className="text-gray-600">({property.reviews} reseñas)</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{property.characteristics.bedrooms}</p>
                  <p className="text-sm text-gray-600">Habitaciones</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{property.characteristics.bathrooms}</p>
                  <p className="text-sm text-gray-600">Baños</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{property.characteristics.capacity}</p>
                  <p className="text-sm text-gray-600">Personas</p>
                </div>
              </div>

              <div className="border-t pt-6">
                <h2 className="text-xl font-semibold mb-4">Descripción</h2>
                <p className="text-gray-700 leading-relaxed">{property.description}</p>
              </div>

              <div className="border-t pt-6 mt-6">
                <h2 className="text-xl font-semibold mb-4">Lo que ofrece este lugar</h2>
                <div className="grid grid-cols-2 gap-4">
                  {property.amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-6 mt-6">
                <h2 className="text-xl font-semibold mb-4">Reglas de la casa</h2>
                <p className="text-gray-700">{property.rules}</p>
              </div>
            </div>

            {/* Availability */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Disponibilidad</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Disponible desde:</span>
                  <span className="font-semibold">{new Date(property.availability.from).toLocaleDateString('es-ES')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Disponible hasta:</span>
                  <span className="font-semibold">{new Date(property.availability.to).toLocaleDateString('es-ES')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estancia mínima:</span>
                  <span className="font-semibold">{property.availability.minStay} noches</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estancia máxima:</span>
                  <span className="font-semibold">{property.availability.maxStay} noches</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
              <div className="mb-4">
                <p className="text-2xl font-bold text-gray-900">Intercambio con WellPoints</p>
                <p className="text-sm text-gray-600">Sistema de puntos flexible</p>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-in
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-out
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de huéspedes
                  </label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    {[1, 2, 3, 4].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'huésped' : 'huéspedes'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Link href={`/exchanges/request/${params.id}`} className="block w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors mb-3 text-center">
                Solicitar intercambio
              </Link>

              <p className="text-center text-sm text-gray-600">
                No se realizará ningún cargo hasta que el intercambio sea confirmado
              </p>
            </div>

            {/* Host Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold mb-4">Tu anfitrión</h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-blue-600">
                    {property.host.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-semibold">{property.host.name}</p>
                  {property.host.verified && (
                    <span className="text-sm text-green-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Verificado
                    </span>
                  )}
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tasa de respuesta:</span>
                  <span className="font-semibold">{property.host.responseRate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tiempo de respuesta:</span>
                  <span className="font-semibold">{property.host.responseTime}</span>
                </div>
              </div>
              <button className="w-full mt-4 border border-gray-300 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                Contactar anfitrión
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
