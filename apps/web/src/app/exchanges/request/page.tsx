'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function ExchangeRequestPage() {
  const params = useParams()
  const propertyId = params.id as string

  const [formData, setFormData] = useState({
    checkIn: '',
    checkOut: '',
    guests: '2',
    message: ''
  })

  const property = {
    id: propertyId,
    title: 'Casa con jardín en Barcelona',
    location: 'Barcelona, España',
    host: {
      name: 'Juan Rodríguez',
      verified: true,
      responseRate: '95%',
      responseTime: '1 hora'
    },
    characteristics: {
      bedrooms: 3,
      bathrooms: 2,
      capacity: 6
    },
    wellPointsPerNight: 75
  }

  const calculateDuration = () => {
    if (!formData.checkIn || !formData.checkOut) return 0
    const checkIn = new Date(formData.checkIn)
    const checkOut = new Date(formData.checkOut)
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const calculateTotalPoints = () => {
    const duration = calculateDuration()
    return duration * property.wellPointsPerNight
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href={`/properties/${propertyId}`} className="text-blue-600 hover:underline">
            ← Volver a la vivienda
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h1 className="text-2xl font-bold mb-2">Solicitar intercambio</h1>
              <p className="text-gray-600 mb-6">
                Envía una solicitud de intercambio al anfitrión. Ellos revisarán tu solicitud y te responderán.
              </p>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold mb-2">{property.title}</h3>
                <p className="text-gray-600 text-sm">{property.location}</p>
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                  <span>{property.characteristics.bedrooms} hab</span>
                  <span>•</span>
                  <span>{property.characteristics.bathrooms} baños</span>
                  <span>•</span>
                  <span>{property.characteristics.capacity} pers</span>
                </div>
              </div>

              <form className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Check-in
                    </label>
                    <input
                      type="date"
                      value={formData.checkIn}
                      onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Check-out
                    </label>
                    <input
                      type="date"
                      value={formData.checkOut}
                      onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de huéspedes
                  </label>
                  <select
                    value={formData.guests}
                    onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'huésped' : 'huéspedes'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mensaje al anfitrión
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={6}
                    placeholder="Preséntate brevemente y explica por qué te interesa esta vivienda. Cuanta más información proporciones, más probable será que el anfitrión acepte tu solicitud."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Enviar solicitud de intercambio
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Summary Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
              <h3 className="font-semibold mb-4">Resumen de la solicitud</h3>
              
              {formData.checkIn && formData.checkOut ? (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-in:</span>
                    <span className="font-semibold">{new Date(formData.checkIn).toLocaleDateString('es-ES')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-out:</span>
                    <span className="font-semibold">{new Date(formData.checkOut).toLocaleDateString('es-ES')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duración:</span>
                    <span className="font-semibold">{calculateDuration()} noches</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Huéspedes:</span>
                    <span className="font-semibold">{formData.guests}</span>
                  </div>
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">WellPoints/noche:</span>
                      <span className="font-semibold">{property.wellPointsPerNight}</span>
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-gray-600">Total:</span>
                      <span className="text-xl font-bold text-blue-600">{calculateTotalPoints()}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  Selecciona las fechas para ver el resumen de tu solicitud
                </p>
              )}
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
            </div>

            {/* Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Consejos para tu solicitud</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Sé específico sobre tus fechas y planes</li>
                <li>• Menciona por qué te interesa esta vivienda</li>
                <li>• Preséntate brevemente</li>
                <li>• Sé cortés y respetuoso</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
