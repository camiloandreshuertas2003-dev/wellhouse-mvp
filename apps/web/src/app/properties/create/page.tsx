'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function CreatePropertyPage() {
  const [step, setStep] = useState(1)
  const totalSteps = 6

  const steps = [
    { number: 1, title: 'Información Básica' },
    { number: 2, title: 'Ubicación' },
    { number: 3, title: 'Características' },
    { number: 4, title: 'Amenities' },
    { number: 5, title: 'Fotos' },
    { number: 6, title: 'Disponibilidad' },
  ]

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            ← Cancelar
          </Link>
          <h1 className="text-2xl font-bold">Publicar tu vivienda</h1>
          <div className="w-20"></div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((s) => (
              <div key={s.number} className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step === s.number
                      ? 'bg-blue-600 text-white'
                      : step > s.number
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step > s.number ? '✓' : s.number}
                </div>
                <span className="text-xs mt-2 text-center hidden sm:block">{s.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          {step === 1 && <BasicInfoStep />}
          {step === 2 && <LocationStep />}
          {step === 3 && <CharacteristicsStep />}
          {step === 4 && <AmenitiesStep />}
          {step === 5 && <PhotosStep />}
          {step === 6 && <AvailabilityStep />}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={prevStep}
            disabled={step === 1}
            className={`px-6 py-3 rounded-lg font-semibold ${
              step === 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Anterior
          </button>
          <button
            onClick={nextStep}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            {step === totalSteps ? 'Publicar' : 'Siguiente'}
          </button>
        </div>
      </div>
    </div>
  )
}

function BasicInfoStep() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Información Básica</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Título de tu vivienda
        </label>
        <input
          type="text"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Ej: Apartamento acogedor en el centro de Madrid"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tipo de vivienda
        </label>
        <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          <option value="">Selecciona el tipo</option>
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
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={6}
          placeholder="Describe tu vivienda, el barrio, y lo que hace especial tu hogar..."
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

function LocationStep() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Ubicación</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Dirección
        </label>
        <input
          type="text"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Calle, número, ciudad, país"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ciudad
        </label>
        <input
          type="text"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Ej: Madrid"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          País
        </label>
        <input
          type="text"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Ej: España"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Código Postal
        </label>
        <input
          type="text"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Ej: 28001"
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          La dirección exacta solo se mostrará a usuarios con intercambios confirmados por seguridad.
        </p>
      </div>
    </div>
  )
}

function CharacteristicsStep() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Características</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Habitaciones
          </label>
          <input
            type="number"
            min="1"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Baños
          </label>
          <input
            type="number"
            min="1"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Capacidad máxima
          </label>
          <input
            type="number"
            min="1"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Camas
          </label>
          <input
            type="number"
            min="1"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Metros cuadrados
          </label>
          <input
            type="number"
            min="1"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pisos
          </label>
          <input
            type="number"
            min="1"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="1"
          />
        </div>
      </div>
    </div>
  )
}

function AmenitiesStep() {
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
      <h2 className="text-xl font-semibold mb-4">Amenities</h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {amenities.map((amenity) => (
          <label key={amenity.id} className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
            <input type="checkbox" className="mr-3 rounded" />
            <span className="text-2xl mr-2">{amenity.icon}</span>
            <span className="text-sm">{amenity.name}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

function PhotosStep() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Fotos</h2>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <p className="text-gray-600 mb-2">Arrastra fotos aquí o haz clic para seleccionar</p>
        <p className="text-sm text-gray-500">Mínimo 5 fotos, máximo 20</p>
        <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700">
          Seleccionar fotos
        </button>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-900 mb-2">Consejos para fotos</h3>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• Usa fotos de alta resolución</li>
          <li>• Muestra todas las habitaciones principales</li>
          <li>• Incluye fotos del baño y cocina</li>
          <li>• Fotos con luz natural funcionan mejor</li>
        </ul>
      </div>
    </div>
  )
}

function AvailabilityStep() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Disponibilidad</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Fecha de disponibilidad desde
        </label>
        <input
          type="date"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Fecha de disponibilidad hasta
        </label>
        <input
          type="date"
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
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="1"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Estancia máxima (noches)
        </label>
        <input
          type="number"
          min="1"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="30"
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          Podrás actualizar tu calendario de disponibilidad en cualquier momento desde tu dashboard.
        </p>
      </div>
    </div>
  )
}
