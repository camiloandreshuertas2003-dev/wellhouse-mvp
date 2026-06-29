'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ExchangeDetailPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState('details')

  const exchange = {
    id: params.id,
    status: 'pending',
    requesterProperty: {
      id: '1',
      title: 'Apartamento acogedor en el centro de Madrid',
      location: 'Madrid, España',
      image: '/images/property-1.jpg'
    },
    hostProperty: {
      id: '2',
      title: 'Casa con jardín en Barcelona',
      location: 'Barcelona, España',
      image: '/images/property-2.jpg'
    },
    requester: {
      name: 'María García',
      verified: true,
      avatar: 'M'
    },
    host: {
      name: 'Juan Rodríguez',
      verified: true,
      avatar: 'J'
    },
    dates: {
      checkIn: '2026-07-15',
      checkOut: '2026-07-22',
      duration: 7
    },
    wellPoints: 350,
    createdAt: '2026-06-20'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            ← Volver al dashboard
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Status Banner */}
        <div className={`rounded-xl p-6 mb-8 ${
          exchange.status === 'pending' ? 'bg-yellow-50 border border-yellow-200' :
          exchange.status === 'confirmed' ? 'bg-green-50 border border-green-200' :
          exchange.status === 'completed' ? 'bg-blue-50 border border-blue-200' :
          'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">
                {exchange.status === 'pending' ? 'Intercambio pendiente de confirmación' :
                 exchange.status === 'confirmed' ? 'Intercambio confirmado' :
                 exchange.status === 'completed' ? 'Intercambio completado' :
                 'Intercambio cancelado'}
              </h2>
              <p className="text-gray-600">
                Creado el {new Date(exchange.createdAt).toLocaleDateString('es-ES')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">WellPoints</p>
              <p className="text-2xl font-bold text-blue-600">{exchange.wellPoints}</p>
            </div>
          </div>
        </div>

        {/* Exchange Details */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Properties */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold mb-4">Tu vivienda</h3>
              <div className="flex gap-4">
                <div className="w-32 h-32 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={exchange.requesterProperty.image} alt={exchange.requesterProperty.title} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-semibold">{exchange.requesterProperty.title}</h4>
                  <p className="text-gray-600 text-sm">{exchange.requesterProperty.location}</p>
                  <Link href={`/properties/${exchange.requesterProperty.id}`} className="text-blue-600 hover:underline text-sm mt-2 inline-block">
                    Ver detalles
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold mb-4">Vivienda del anfitrión</h3>
              <div className="flex gap-4">
                <div className="w-32 h-32 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={exchange.hostProperty.image} alt={exchange.hostProperty.title} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-semibold">{exchange.hostProperty.title}</h4>
                  <p className="text-gray-600 text-sm">{exchange.hostProperty.location}</p>
                  <Link href={`/properties/${exchange.hostProperty.id}`} className="text-blue-600 hover:underline text-sm mt-2 inline-block">
                    Ver detalles
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Details & Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold mb-4">Fechas del intercambio</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-in:</span>
                  <span className="font-semibold">{new Date(exchange.dates.checkIn).toLocaleDateString('es-ES')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-out:</span>
                  <span className="font-semibold">{new Date(exchange.dates.checkOut).toLocaleDateString('es-ES')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duración:</span>
                  <span className="font-semibold">{exchange.dates.duration} noches</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold mb-4">Participantes</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold text-blue-600">{exchange.requester.avatar}</span>
                  </div>
                  <div>
                    <p className="font-semibold">{exchange.requester.name}</p>
                    {exchange.requester.verified && (
                      <span className="text-xs text-green-600 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Verificado
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold text-green-600">{exchange.host.avatar}</span>
                  </div>
                  <div>
                    <p className="font-semibold">{exchange.host.name}</p>
                    {exchange.host.verified && (
                      <span className="text-xs text-green-600 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Verificado
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions based on status */}
            {exchange.status === 'pending' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold mb-4">Acciones</h3>
                <div className="space-y-3">
                  <button className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700">
                    Aceptar intercambio
                  </button>
                  <button className="w-full border border-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-50">
                    Rechazar intercambio
                  </button>
                  <Link href={`/messages/${exchange.host.name}`} className="block text-center text-blue-600 hover:underline">
                    Contactar anfitrión
                  </Link>
                </div>
              </div>
            )}

            {exchange.status === 'confirmed' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold mb-4">Información de contacto</h3>
                <div className="space-y-3">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800 mb-2">Instrucciones de check-in:</p>
                    <p className="text-sm text-gray-700">
                      Las instrucciones detalladas de acceso se compartirán 48 horas antes del check-in.
                    </p>
                  </div>
                  <Link href={`/messages/${exchange.host.name}`} className="block text-center text-blue-600 hover:underline">
                    Contactar anfitrión
                  </Link>
                </div>
              </div>
            )}

            {exchange.status === 'completed' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold mb-4">Reseñas</h3>
                <div className="space-y-3">
                  <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700">
                    Escribir reseña del anfitrión
                  </button>
                  <p className="text-center text-sm text-gray-600">
                    Tu reseña ayudará a otros usuarios a tomar decisiones informadas
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
