'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function ReportPage() {
  const params = useParams()
  const reportType = params.type as string
  const reportId = params.id as string

  const [formData, setFormData] = useState({
    reason: '',
    description: '',
    category: ''
  })

  const categories = [
    { id: 'safety', label: 'Problema de seguridad', description: 'Comportamiento amenazante o peligroso' },
    { id: 'fraud', label: 'Posible fraude', description: 'Información falsa o engañosa' },
    { id: 'cleanliness', label: 'Problemas de limpieza', description: 'La vivienda no cumple con los estándares de limpieza' },
    { id: 'rules', label: 'Incumplimiento de reglas', description: 'No se respetaron las reglas del intercambio' },
    { id: 'cancellation', label: 'Cancelación problemática', description: 'Cancelación tardía o sin justificación' },
    { id: 'other', label: 'Otro', description: 'Otro tipo de problema' }
  ]

  const target = {
    type: reportType === 'property' ? 'Vivienda' : 'Usuario',
    name: reportType === 'property' ? 'Casa con jardín en Barcelona' : 'Juan Rodríguez',
    id: reportId
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href={reportType === 'property' ? `/properties/${reportId}` : '/search'} className="text-blue-600 hover:underline">
            ← Volver
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-2xl font-bold mb-2">Reportar {target.type}</h1>
          <p className="text-gray-600 mb-8">
            Ayúdanos a mantener la comunidad segura informando sobre problemas.
          </p>

          {/* Target Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-blue-600">
                  {target.name.charAt(0)}
                </span>
              </div>
              <div>
                <p className="font-semibold">{target.name}</p>
                <p className="text-sm text-gray-600">{target.type} • ID: {target.id}</p>
              </div>
            </div>
          </div>

          <form className="space-y-6">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría del reporte
              </label>
              <div className="space-y-3">
                {categories.map((category) => (
                  <label key={category.id} className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                    <input
                      type="radio"
                      name="category"
                      value={category.id}
                      checked={formData.category === category.id}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium">{category.label}</p>
                      <p className="text-sm text-gray-600">{category.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Motivo del reporte
              </label>
              <input
                type="text"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe brevemente el motivo del reporte"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción detallada
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={6}
                placeholder="Proporciona detalles específicos sobre el incidente. Cuanta más información proporciones, mejor podremos investigar el caso."
              />
            </div>

            {/* Warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <h4 className="font-semibold text-yellow-900 mb-1">Importante</h4>
                  <p className="text-sm text-yellow-800">
                    Los reportes falsos o malintencionados pueden resultar en la suspensión de tu cuenta. Por favor, utiliza esta función solo para reportar problemas reales.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Enviar reporte
            </button>

            <p className="text-center text-sm text-gray-600">
              Tu reporte será revisado por nuestro equipo de seguridad. Te notificaremos sobre el resultado de la investigación.
            </p>
          </form>
        </div>

        {/* Additional Help */}
        <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
          <h3 className="font-semibold mb-4">¿Necesitas ayuda adicional?</h3>
          <div className="space-y-3">
            <Link href="/support" className="block text-blue-600 hover:underline">
              Contactar soporte
            </Link>
            <Link href="/faq" className="block text-blue-600 hover:underline">
              Ver preguntas frecuentes
            </Link>
            <Link href="/safety" className="block text-blue-600 hover:underline">
              Guía de seguridad
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
