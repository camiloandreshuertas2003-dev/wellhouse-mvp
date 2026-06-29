'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function NotificationSettingsPage() {
  const [preferences, setPreferences] = useState({
    email: {
      newExchangeRequest: true,
      exchangeAccepted: true,
      exchangeRejected: true,
      exchangeCompleted: true,
      newMessage: true,
      reviewReceived: true,
      promotional: false
    },
    push: {
      newExchangeRequest: true,
      exchangeAccepted: true,
      exchangeRejected: true,
      exchangeCompleted: true,
      newMessage: true,
      reviewReceived: true,
      promotional: false
    },
    inApp: {
      newExchangeRequest: true,
      exchangeAccepted: true,
      exchangeRejected: true,
      exchangeCompleted: true,
      newMessage: true,
      reviewReceived: true,
      promotional: false
    }
  })

  const handleToggle = (category: string, setting: string) => {
    setPreferences({
      ...preferences,
      [category]: {
        ...preferences[category as keyof typeof preferences],
        [setting]: !(preferences[category as keyof typeof preferences] as any)[setting]
      }
    })
  }

  const categories = [
    { id: 'email', label: 'Email', icon: '📧' },
    { id: 'push', label: 'Notificaciones push', icon: '🔔' },
    { id: 'inApp', label: 'Notificaciones en la app', icon: '💬' }
  ]

  const settings = [
    { id: 'newExchangeRequest', label: 'Nuevas solicitudes de intercambio', description: 'Cuando alguien solicita intercambiar contigo' },
    { id: 'exchangeAccepted', label: 'Intercambios aceptados', description: 'Cuando tu solicitud es aceptada' },
    { id: 'exchangeRejected', label: 'Intercambios rechazados', description: 'Cuando tu solicitud es rechazada' },
    { id: 'exchangeCompleted', label: 'Intercambios completados', description: 'Cuando un intercambio se completa' },
    { id: 'newMessage', label: 'Nuevos mensajes', description: 'Cuando recibes un mensaje nuevo' },
    { id: 'reviewReceived', label: 'Nuevas reseñas', description: 'Cuando recibes una reseña' },
    { id: 'promotional', label: 'Promociones y ofertas', description: 'Ofertas especiales y novedades de Wellhouse' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            ← Volver al dashboard
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-2xl font-bold mb-2">Preferencias de notificación</h1>
          <p className="text-gray-600 mb-8">
            Elige cómo y cuándo quieres recibir notificaciones de Wellhouse.
          </p>

          {/* Notification Categories */}
          <div className="space-y-8">
            {categories.map((category) => (
              <div key={category.id} className="border-b pb-8 last:border-b-0 last:pb-0">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-2xl">{category.icon}</span>
                  <h2 className="text-xl font-semibold">{category.label}</h2>
                </div>

                <div className="space-y-4">
                  {settings.map((setting) => (
                    <div key={setting.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{setting.label}</p>
                        <p className="text-sm text-gray-600">{setting.description}</p>
                      </div>
                      <button
                        onClick={() => handleToggle(category.id, setting.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          (preferences[category.id as keyof typeof preferences] as any)[setting.id]
                            ? 'bg-blue-600'
                            : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            (preferences[category.id as keyof typeof preferences] as any)[setting.id]
                              ? 'translate-x-6'
                              : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Save Button */}
          <div className="mt-8 pt-6 border-t">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700">
              Guardar cambios
            </button>
          </div>
        </div>

        {/* Additional Settings */}
        <div className="bg-white rounded-xl shadow-sm p-8 mt-6">
          <h2 className="text-xl font-semibold mb-4">Configuración adicional</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frecuencia de resumen de actividad
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="never">Nunca</option>
                <option value="daily">Diario</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensual</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Idioma de las notificaciones
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="es">Español</option>
                <option value="en">English</option>
                <option value="pt">Português</option>
                <option value="fr">Français</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Modo silencioso</p>
                <p className="text-sm text-gray-600">Desactivar todas las notificaciones temporalmente</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
              </button>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700">
              Guardar cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
