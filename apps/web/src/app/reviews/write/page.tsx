'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function WriteReviewPage() {
  const params = useParams()
  const exchangeId = params.id as string

  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [review, setReview] = useState({
    cleanliness: 0,
    communication: 0,
    location: 0,
    checkIn: 0,
    accuracy: 0,
    value: 0,
    comment: ''
  })

  const categories = [
    { id: 'cleanliness', label: 'Limpieza', icon: '🧹' },
    { id: 'communication', label: 'Comunicación', icon: '💬' },
    { id: 'location', label: 'Ubicación', icon: '📍' },
    { id: 'checkIn', label: 'Check-in', icon: '🔑' },
    { id: 'accuracy', label: 'Precisión', icon: '✅' },
    { id: 'value', label: 'Relación calidad-precio', icon: '💰' },
  ]

  const exchange = {
    id: exchangeId,
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
    }
  }

  const calculateOverallRating = () => {
    const ratings = Object.values(review).filter(v => typeof v === 'number') as number[]
    if (ratings.length === 0) return 0
    const sum = ratings.reduce((a, b) => a + b, 0)
    return (sum / ratings.length).toFixed(1)
  }

  const handleRatingChange = (category: string, value: number) => {
    setReview({ ...review, [category]: value })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href={`/exchanges/${exchangeId}`} className="text-blue-600 hover:underline">
            ← Volver al intercambio
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-2xl font-bold mb-2">Escribir una reseña</h1>
          <p className="text-gray-600 mb-8">
            Comparte tu experiencia para ayudar a otros usuarios a tomar decisiones informadas.
          </p>

          {/* Exchange Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-8 flex items-center gap-4">
            <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
              <img src={exchange.property.image} alt={exchange.property.title} className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="font-semibold">{exchange.property.title}</h3>
              <p className="text-gray-600 text-sm">{exchange.property.location}</p>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(exchange.dates.checkIn).toLocaleDateString('es-ES')} - {new Date(exchange.dates.checkOut).toLocaleDateString('es-ES')}
              </p>
            </div>
          </div>

          {/* Overall Rating */}
          <div className="text-center mb-8">
            <h2 className="text-lg font-semibold mb-4">Calificación general</h2>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="text-4xl transition-colors"
                >
                  <span className={star <= (hoverRating || rating) ? 'text-yellow-400' : 'text-gray-300'}>
                    ★
                  </span>
                </button>
              ))}
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">{rating > 0 ? rating : '-'}</p>
          </div>

          {/* Category Ratings */}
          <div className="space-y-6 mb-8">
            {categories.map((category) => (
              <div key={category.id}>
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <span className="text-xl">{category.icon}</span>
                    {category.label}
                  </label>
                  <span className="text-sm font-semibold text-gray-900">
                    {Number(review[category.id as keyof typeof review]) > 0 ? review[category.id as keyof typeof review] : '-'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRatingChange(category.id, star)}
                      className="text-2xl transition-colors"
                    >
                      <span className={star <= Number(review[category.id as keyof typeof review]) ? 'text-yellow-400' : 'text-gray-300'}>
                        ★
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Comment */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comentario adicional
            </label>
            <textarea
              value={review.comment}
              onChange={(e) => setReview({ ...review, comment: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={6}
              placeholder="Cuéntanos más sobre tu experiencia. ¿Qué te gustó? ¿Qué se podría mejorar?"
            />
          </div>

          {/* Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-blue-900">Calificación promedio:</span>
              <span className="text-2xl font-bold text-blue-600">{calculateOverallRating()}</span>
            </div>
          </div>

          {/* Submit */}
          <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors mb-4">
            Publicar reseña
          </button>

          <p className="text-center text-sm text-gray-600">
            Tu reseña será visible públicamente y ayudará a otros usuarios.
          </p>
        </div>
      </div>
    </div>
  )
}
