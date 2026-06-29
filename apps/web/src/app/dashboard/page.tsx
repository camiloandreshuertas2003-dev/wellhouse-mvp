'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview')

  const tabs = [
    { id: 'overview', label: 'Resumen', icon: '📊' },
    { id: 'my-property', label: 'Mi Vivienda', icon: '🏠' },
    { id: 'exchanges', label: 'Intercambios', icon: '🔄' },
    { id: 'messages', label: 'Mensajes', icon: '💬' },
    { id: 'favorites', label: 'Favoritos', icon: '❤️' },
    { id: 'reviews', label: 'Reseñas', icon: '⭐' },
    { id: 'settings', label: 'Configuración', icon: '⚙️' },
  ]

  const user = {
    name: 'María García',
    email: 'maria@example.com',
    verified: true,
    wellPoints: 150,
    level: 'Nivel 1',
    memberSince: 'Enero 2026'
  }

  const myProperty = {
    id: '1',
    title: 'Apartamento acogedor en el centro de Madrid',
    status: 'published',
    views: 234,
    inquiries: 12,
    exchanges: 3
  }

  const recentExchanges = [
    { id: '1', property: 'Casa en Barcelona', date: '2026-06-15', status: 'completed' },
    { id: '2', property: 'Apartamento en Valencia', date: '2026-05-20', status: 'completed' },
    { id: '3', property: 'Loft en Málaga', date: '2026-07-01', status: 'upcoming' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Dashboard</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-blue-600">
                    {user.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h2 className="font-semibold">{user.name}</h2>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  {user.verified && (
                    <span className="text-xs text-green-600 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Verificado
                    </span>
                  )}
                </div>
              </div>
              
              <div className="space-y-3 pt-4 border-t">
                <div className="flex justify-between">
                  <span className="text-gray-600">WellPoints:</span>
                  <span className="font-bold text-blue-600">{user.wellPoints}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Nivel:</span>
                  <span className="font-semibold">{user.level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Miembro desde:</span>
                  <span className="text-gray-900">{user.memberSince}</span>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="bg-white rounded-xl shadow-sm p-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left mb-2 ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-600 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-xl">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'overview' && <OverviewTab user={user} myProperty={myProperty} recentExchanges={recentExchanges} />}
            {activeTab === 'my-property' && <MyPropertyTab property={myProperty} />}
            {activeTab === 'exchanges' && <ExchangesTab exchanges={recentExchanges} />}
            {activeTab === 'messages' && <MessagesTab />}
            {activeTab === 'favorites' && <FavoritesTab />}
            {activeTab === 'reviews' && <ReviewsTab />}
            {activeTab === 'settings' && <SettingsTab user={user} />}
          </div>
        </div>
      </div>
    </div>
  )
}

function OverviewTab({ user, myProperty, recentExchanges }: { user: any, myProperty: any, recentExchanges: any[] }) {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-600">WellPoints</span>
            <span className="text-2xl">💰</span>
          </div>
          <p className="text-3xl font-bold text-blue-600">{user.wellPoints}</p>
          <p className="text-sm text-gray-500 mt-1">Puntos disponibles</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-600">Vistas</span>
            <span className="text-2xl">👁️</span>
          </div>
          <p className="text-3xl font-bold">{myProperty.views}</p>
          <p className="text-sm text-gray-500 mt-1">Este mes</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-600">Intercambios</span>
            <span className="text-2xl">🔄</span>
          </div>
          <p className="text-3xl font-bold">{myProperty.exchanges}</p>
          <p className="text-sm text-gray-500 mt-1">Completados</p>
        </div>
      </div>

      {/* My Property Card */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Mi Vivienda</h2>
          <Link href={`/properties/${myProperty.id}/edit`} className="text-blue-600 hover:underline text-sm">
            Editar
          </Link>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h3 className="font-semibold mb-2">{myProperty.title}</h3>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Publicada
            </span>
            <span>•</span>
            <span>{myProperty.views} vistas</span>
            <span>•</span>
            <span>{myProperty.inquiries} consultas</span>
          </div>
        </div>

        <Link href="/properties/create" className="block text-center text-blue-600 hover:underline">
          ¿Quieres publicar otra vivienda?
        </Link>
      </div>

      {/* Recent Exchanges */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Intercambios Recientes</h2>
        <div className="space-y-4">
          {recentExchanges.map((exchange) => (
            <div key={exchange.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold">{exchange.property}</p>
                <p className="text-sm text-gray-600">{new Date(exchange.date).toLocaleDateString('es-ES')}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                exchange.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {exchange.status === 'completed' ? 'Completado' : 'Próximo'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function MyPropertyTab({ property }: { property: any }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Mi Vivienda</h2>
        <Link href={`/properties/${property.id}/edit`} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700">
          Editar
        </Link>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold mb-2">{property.title}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="text-center p-4 bg-white rounded-lg">
            <p className="text-2xl font-bold">{property.views}</p>
            <p className="text-sm text-gray-600">Vistas</p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg">
            <p className="text-2xl font-bold">{property.inquiries}</p>
            <p className="text-sm text-gray-600">Consultas</p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg">
            <p className="text-2xl font-bold">{property.exchanges}</p>
            <p className="text-sm text-gray-600">Intercambios</p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg">
            <p className="text-2xl font-bold">4.8</p>
            <p className="text-sm text-gray-600">Rating</p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          Recuerda que solo puedes tener una vivienda publicada a la vez. Si quieres cambiar tu vivienda, primero debes despublicar la actual.
        </p>
      </div>
    </div>
  )
}

function ExchangesTab({ exchanges }: { exchanges: any[] }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-6">Intercambios</h2>
      <div className="space-y-4">
        {exchanges.map((exchange) => (
          <Link key={exchange.id} href={`/exchanges/${exchange.id}`} className="block">
            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div>
                <p className="font-semibold">{exchange.property}</p>
                <p className="text-sm text-gray-600">{new Date(exchange.date).toLocaleDateString('es-ES')}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                exchange.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {exchange.status === 'completed' ? 'Completado' : 'Próximo'}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

function MessagesTab() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-6">Mensajes</h2>
      <div className="text-center py-12 text-gray-500">
        <p>No tienes mensajes nuevos</p>
      </div>
    </div>
  )
}

function FavoritesTab() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-6">Favoritos</h2>
      <div className="text-center py-12 text-gray-500">
        <p>No tienes viviendas guardadas como favoritas</p>
        <Link href="/search" className="text-blue-600 hover:underline mt-2 inline-block">
          Buscar viviendas
        </Link>
      </div>
    </div>
  )
}

function ReviewsTab() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-6">Reseñas</h2>
      <div className="text-center py-12 text-gray-500">
        <p>Aún no has recibido reseñas</p>
      </div>
    </div>
  )
}

function SettingsTab({ user }: { user: any }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-6">Configuración</h2>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
          <input
            type="text"
            defaultValue={user.name}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            defaultValue={user.email}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700">
          Guardar cambios
        </button>
      </div>
    </div>
  )
}
