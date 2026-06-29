'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function EditPropertyPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState('basic')

  const tabs = [
    { id: 'basic', label: 'Información Básica' },
    { id: 'location', label: 'Ubicación' },
    { id: 'characteristics', label: 'Características' },
    { id: 'amenities', label: 'Amenities' },
    { id: 'photos', label: 'Fotos' },
    { id: 'availability', label: 'Disponibilidad' },
  ]

  const property = {
    id: params.id,
    title: 'Apartamento acogedor en el centro de Madrid',
    type: 'apartment',
    description: 'Hermoso apartamento recién renovado en el corazón de Madrid.',
    location: {
      address: 'Calle Mayor 123',
      city: 'Madrid',
      country: 'España',
      postalCode: '28013'
    },
    characteristics: {
      bedrooms: 2,
      bathrooms: 1,
      capacity: 4,
      beds: 2,
      size: 75,
      floors: 3
    },
    amenities: ['wifi', 'kitchen', 'ac', 'washer', 'tv', 'elevator'],
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
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href={`/properties/${params.id}`} className="text-blue-600 hover:underline">
              ← Volver a la vivienda
            </Link>
            <h1 className="text-2xl font-bold">Editar vivienda</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="border-b">
            <nav className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'basic' && <BasicInfoTab property={property} />}
            {activeTab === 'location' && <LocationTab property={property} />}
            {activeTab === 'characteristics' && <CharacteristicsTab property={property} />}
            {activeTab === 'amenities' && <AmenitiesTab property={property} />}
            {activeTab === 'photos' && <PhotosTab property={property} />}
            {activeTab === 'availability' && <AvailabilityTab property={property} />}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between">
          <button className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50">
            Cancelar
          </button>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700">
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  )
}

function BasicInfoTab({ property }: { property: any }) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Título de tu vivienda
        </label>
        <input
          type="text"
          defaultValue={property.title}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tipo de vivienda
        </label>
        <select
          defaultValue={property.type}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="apartment">Apartamento</option>
          <option value="house">Casa</option>
          <option value="studio">Estudio</option>
          <option value="loft">Loft</option>
          <option value="villa">Villa</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descripción
        </label>
        <textarea
          defaultValue={property.description}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={6}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Reglas de la casa
        </label>
        <textarea
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={4}
          placeholder="Ej: No fumar, no mascotas, check-in después de las 15:00..."
        />
      </div>
    </div>
  )
}

function LocationTab({ property }: { property: any }) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Dirección
        </label>
        <input
          type="text"
          defaultValue={property.location.address}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ciudad
        </label>
        <input
          type="text"
          defaultValue={property.location.city}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          País
        </label>
        <input
          type="text"
          defaultValue={property.location.country}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Código Postal
        </label>
        <input
          type="text"
          defaultValue={property.location.postalCode}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  )
}

function CharacteristicsTab({ property }: { property: any }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Habitaciones
          </label>
          <input
            type="number"
            min="1"
            defaultValue={property.characteristics.bedrooms}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Baños
          </label>
          <input
            type="number"
            min="1"
            defaultValue={property.characteristics.bathrooms}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Capacidad máxima
          </label>
          <input
            type="number"
            min="1"
            defaultValue={property.characteristics.capacity}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Camas
          </label>
          <input
            type="number"
            min="1"
            defaultValue={property.characteristics.beds}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Metros cuadrados
          </label>
          <input
            type="number"
            min="1"
            defaultValue={property.characteristics.size}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pisos
          </label>
          <input
            type="number"
            min="1"
            defaultValue={property.characteristics.floors}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  )
}

function AmenitiesTab({ property }: { property: any }) {
  const amenities = [
    { id: 'wifi', name: 'WiFi', icon: '📶' },
    { id: 'kitchen', name: 'Cocina equipada', icon: '🍳' },
    { id: 'parking', name: 'Estacionamiento', icon: '🚗' },
    { id: 'ac', name: 'Aire acondicionado', icon: '❄️' },
    { id: 'heating', name: 'Calefacción', icon: '🔥' },
    { id: 'washer', name: 'Lavadora', icon: '🧺' },
    { id: 'tv', name: 'TV', icon: '📺' },
    { id: 'pool', name: 'Piscina', icon: '🏊' },
    { id: 'gym', name: 'Gimnasio', icon: '💪' },
    { id: 'garden', name: 'Jardín', icon: '🌳' },
    { id: 'balcony', name: 'Balcón', icon: '🌅' },
    { id: 'elevator', name: 'Ascensor', icon: '🛗' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {amenities.map((amenity) => (
          <label key={amenity.id} className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
            <input
              type="checkbox"
              defaultChecked={property.amenities.includes(amenity.id)}
              className="mr-3 rounded"
            />
            <span className="text-2xl mr-2">{amenity.icon}</span>
            <span className="text-sm">{amenity.name}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

function PhotosTab({ property }: { property: any }) {
  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <p className="text-gray-600 mb-2">Arrastra fotos aquí o haz clic para seleccionar</p>
        <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700">
          Seleccionar fotos
        </button>
      </div>

      <div>
        <h3 className="font-semibold mb-4">Fotos actuales (5)</h3>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5].map((num) => (
            <div key={num} className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden group">
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button className="text-white p-2 hover:bg-white/20 rounded-full">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function AvailabilityTab({ property }: { property: any }) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Fecha de disponibilidad desde
        </label>
        <input
          type="date"
          defaultValue={property.availability.from}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Fecha de disponibilidad hasta
        </label>
        <input
          type="date"
          defaultValue={property.availability.to}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Estancia mínima (noches)
        </label>
        <input
          type="number"
          min="1"
          defaultValue={property.availability.minStay}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Estancia máxima (noches)
        </label>
        <input
          type="number"
          min="1"
          defaultValue={property.availability.maxStay}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  )
}
