'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ExchangesPage() {
  const [activeTab, setActiveTab] = useState('sent')

  const sentRequests = [
    {
      id: '1',
      property: {
        title: 'Casa con jardín en Barcelona',
        location: 'Barcelona, España',
        image: '/images/property-2.jpg'
      },
      host: {
        name: 'Juan Rodríguez',
        avatar: 'J'
      },
      dates: {
        checkIn: '2026-07-15',
        checkOut: '2026-07-22'
      },
      status: 'pending',
      createdAt: '2026-06-20',
      wellPoints: 350
    },
    {
      id: '2',
      property: {
        title: 'Apartamento en Valencia',
        location: 'Valencia, España',
        image: '/images/property-3.jpg'
      },
      host: {
        name: 'Ana Martínez',
        avatar: 'A'
      },
      dates: {
        checkIn: '2026-08-01',
        checkOut: '2026-08-07'
      },
      status: 'accepted',
      createdAt: '2026-06-15',
      wellPoints: 280
    }
  ]

  const receivedRequests = [
    {
      id: '3',
      property: {
        title: 'Mi apartamento en Madrid',
        location: 'Madrid, España',
        image: '/images/property-1.jpg'
      },
      requester: {
        name: 'Carlos López',
        avatar: 'C'
      },
      dates: {
        checkIn: '2026-09-01',
        checkOut: '2026-09-08'
      },
      status: 'pending',
      createdAt: '2026-06-18',
      wellPoints: 420
    },
    {
      id: '4',
      property: {
        title: 'Mi apartamento en Madrid',
        location: 'Madrid, España',
        image: '/images/property-1.jpg'
      },
      requester: {
        name: 'Laura Sánchez',
        avatar: 'L'
      },
      dates: {
        checkIn: '2026-08-15',
        checkOut: '2026-08-22'
      },
      status: 'rejected',
      createdAt: '2026-06-10',
      wellPoints: 350
    }
  ]

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendiente' },
      accepted: { bg: 'bg-green-100', text: 'text-green-800', label: 'Aceptado' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rechazado' },
      cancelled: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Cancelado' },
      completed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Completado' }
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Mis solicitudes de intercambio</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="border-b">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('sent')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'sent'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Enviadas ({sentRequests.length})
              </button>
              <button
                onClick={() => setActiveTab('received')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'received'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Recibidas ({receivedRequests.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'sent' ? (
          <div className="space-y-4">
            {sentRequests.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <p className="text-gray-600">No has enviado solicitudes de intercambio</p>
                <Link href="/search" className="text-blue-600 hover:underline mt-2 inline-block">
                  Buscar viviendas
                </Link>
              </div>
            ) : (
              sentRequests.map((request) => (
                <Link key={request.id} href={`/exchanges/${request.id}`} className="block">
                  <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                    <div className="flex gap-6">
                      <div className="w-32 h-32 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={request.property.image} alt={request.property.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">{request.property.title}</h3>
                            <p className="text-gray-600 text-sm">{request.property.location}</p>
                          </div>
                          {getStatusBadge(request.status)}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                            {new Date(request.dates.checkIn).toLocaleDateString('es-ES')} - {new Date(request.dates.checkOut).toLocaleDateString('es-ES')}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                            </svg>
                            {request.host.name}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-500">
                            Enviada el {new Date(request.createdAt).toLocaleDateString('es-ES')}
                          </p>
                          <p className="text-sm font-semibold text-blue-600">
                            {request.wellPoints} WellPoints
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {receivedRequests.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-gray-600">No has recibido solicitudes de intercambio</p>
              </div>
            ) : (
              receivedRequests.map((request) => (
                <Link key={request.id} href={`/exchanges/${request.id}`} className="block">
                  <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                    <div className="flex gap-6">
                      <div className="w-32 h-32 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={request.property.image} alt={request.property.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">{request.property.title}</h3>
                            <p className="text-gray-600 text-sm">{request.property.location}</p>
                          </div>
                          {getStatusBadge(request.status)}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                            {new Date(request.dates.checkIn).toLocaleDateString('es-ES')} - {new Date(request.dates.checkOut).toLocaleDateString('es-ES')}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                            </svg>
                            {request.requester.name}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-500">
                            Recibida el {new Date(request.createdAt).toLocaleDateString('es-ES')}
                          </p>
                          <p className="text-sm font-semibold text-blue-600">
                            {request.wellPoints} WellPoints
                          </p>
                        </div>

                        {request.status === 'pending' && (
                          <div className="flex gap-2 mt-4">
                            <button className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700">
                              Aceptar
                            </button>
                            <button className="flex-1 border border-gray-300 py-2 rounded-lg font-semibold hover:bg-gray-50">
                              Rechazar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
