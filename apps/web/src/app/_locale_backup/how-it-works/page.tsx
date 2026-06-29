import Link from 'next/link'

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Link href="/" className="text-blue-600 hover:underline mb-8 inline-block">
          ← Volver al inicio
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          ¿Cómo funciona Wellhouse?
        </h1>

        <div className="space-y-12">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h2 className="text-2xl font-semibold mb-2">Regístrate</h2>
                <p className="text-gray-600">
                  Crea tu perfil gratuito y verifica tu identidad. Solo tomamos unos minutos
                  y garantizamos la seguridad de toda la comunidad.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h2 className="text-2xl font-semibold mb-2">Publica tu vivienda</h2>
                <p className="text-gray-600">
                  Sube fotos de tu hogar, describe las características y establece tu calendario
                  de disponibilidad. Cuantos más detalles, más oportunidades de intercambio.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h2 className="text-2xl font-semibold mb-2">Busca y conecta</h2>
                <p className="text-gray-600">
                  Explora viviendas en destinos que te interesen. Contacta con otros usuarios
                  y acuerda los detalles de tu intercambio.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                4
              </div>
              <div>
                <h2 className="text-2xl font-semibold mb-2">Intercambia y viaja</h2>
                <p className="text-gray-600">
                  Confirma el intercambio, recibe las instrucciones de acceso y disfruta de tu
                  estancia. Al regresar, deja una reseña para ayudar a la comunidad.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center bg-blue-600 text-white rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-4">
            ¿Listo para comenzar tu primera experiencia?
          </h2>
          <Link
            href="/register"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-block"
          >
            Crear Cuenta Gratis
          </Link>
        </div>
      </div>
    </div>
  )
}
