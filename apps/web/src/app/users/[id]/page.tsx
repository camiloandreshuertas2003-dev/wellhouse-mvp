'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function UserProfilePage({ params }: { params: { id: string } }) {
  const user = {
    id: params.id,
    name: 'Juan Rodríguez',
    avatar: 'J',
    verified: true,
    memberSince: 'Enero 2026',
    responseRate: '95%',
    responseTime: '1 hora',
    level: 'Nivel 2',
    reviews: {
      total: 24,
      overall: 4.8,
      cleanliness: 4.9,
      communication: 4.7,
      location: 4.8,
      checkIn: 4.9,
      accuracy: 4.8
    },
    bio: 'Viajero apasionado que ama compartir mi hogar con personas de todo el mundo. Me encanta conocer nuevas culturas y hacer que mis huéspedes se sientan como en casa.',
    languages: ['Español', 'Inglés', 'Francés'],
    interests: ['Viajes', 'Fotografía', 'Gastronomía', 'Naturaleza'],
    property: {
      id: '2',
      title: 'Casa con jardín en Barcelona',
      location: 'Barcelona, España',
      image: '/images/property-2.jpg',
      rating: 4.9,
      reviews: 31
    }
  }

  const recentReviews = [
    {
      id: '1',
      author: 'María García',
      avatar: 'M',
      date: 'Junio 2026',
      rating: 5,
      text: 'Juan fue un anfitrión excepcional. Su casa es hermosa y él nos hizo sentir muy bienvenidos. ¡Definitivamente volveremos!'
    },
    {
      id: '2',
      author: 'Carlos López',
      avatar: 'C',
      date: 'Mayo 2026',
      rating: 5,
      text: 'Excelente experiencia. La casa estaba impecable y Juan fue muy atento a todas nuestras necesidades.'
    },
    {
      id: '3',
      author: 'Ana Martínez',
      avatar: 'A',
      date: 'Abril 2026',
      rating: 4,
      text: 'Muy buena experiencia en general. La casa es preciosa y la ubicación perfecta.'
    }
  ]

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
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl font-bold text-blue-600">{user.avatar}</span>
                </div>
                <h1 className="text-2xl font-bold mb-2">{user.name}</h1>
                {user.verified && (
                  <span className="inline-flex items-center gap-1 text-sm text-green-600">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Verificado
                  </span>
                )}
                <p className="text-sm text-gray-600 mt-1">Miembro desde {user.memberSince}</p>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="flex justify-between">
                  <span className="text-gray-600">Nivel:</span>
                  <span className="font-semibold">{user.level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tasa de respuesta:</span>
                  <span className="font-semibold">{user.responseRate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tiempo de respuesta:</span>
                  <span className="font-semibold">{user.responseTime}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t">
                <h3 className="font-semibold mb-2">Idiomas</h3>
                <div className="flex flex-wrap gap-2">
                  {user.languages.map((lang) => (
                    <span key={lang} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t">
                <h3 className="font-semibold mb-2">Intereses</h3>
                <div className="flex flex-wrap gap-2">
                  {user.interests.map((interest) => (
                    <span key={interest} className="bg-blue-50 px-3 py-1 rounded-full text-sm text-blue-800">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              <button className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700">
                Contactar
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Sobre mí</h2>
              <p className="text-gray-700 leading-relaxed">{user.bio}</p>
            </div>

            {/* Property */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Mi vivienda</h2>
              <Link href={`/properties/${user.property.id}`} className="block">
                <div className="flex gap-4">
                  <div className="w-32 h-32 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={user.property.image} alt={user.property.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{user.property.title}</h3>
                    <p className="text-gray-600 text-sm">{user.property.location}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="font-semibold">{user.property.rating}</span>
                      <span className="text-gray-600">({user.property.reviews} reseñas)</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            {/* Reviews Summary */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Reseñas ({user.reviews.total})</h2>
                <div className="flex items-center gap-2">
                  <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-2xl font-bold">{user.reviews.overall}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 w-24">Limpieza</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${user.reviews.cleanliness * 20}%` }} />
                  </div>
                  <span className="text-sm font-semibold w-8">{user.reviews.cleanliness}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 w-24">Comunicación</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${user.reviews.communication * 20}%` }} />
                  </div>
                  <span className="text-sm font-semibold w-8">{user.reviews.communication}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 w-24">Ubicación</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${user.reviews.location * 20}%` }} />
                  </div>
                  <span className="text-sm font-semibold w-8">{user.reviews.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 w-24">Check-in</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${user.reviews.checkIn * 20}%` }} />
                  </div>
                  <span className="text-sm font-semibold w-8">{user.reviews.checkIn}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 w-24">Precisión</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${user.reviews.accuracy * 20}%` }} />
                  </div>
                  <span className="text-sm font-semibold w-8">{user.reviews.accuracy}</span>
                </div>
              </div>

              {/* Recent Reviews */}
              <div className="space-y-4">
                {recentReviews.map((review) => (
                  <div key={review.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-bold text-blue-600">{review.avatar}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-semibold">{review.author}</p>
                            <p className="text-sm text-gray-600">{review.date}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-4 h-4 ${i < review.rating ? 'text-yellow-500' : 'text-gray-300'}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-700">{review.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
