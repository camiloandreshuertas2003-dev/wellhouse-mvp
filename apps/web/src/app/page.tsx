import Link from 'next/link'
import { memo } from 'react'
import SupabaseTest from '@/components/SupabaseTest'

const HeroSection = memo(function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Viaja gratis alojándote en hogares reales
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
            Intercambia tu vivienda con personas verificadas de todo el mundo.
            La comunidad más confiable de intercambio de viviendas del mundo hispanohablante.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors inline-block text-center">
              Comenzar Gratis
            </Link>
            <Link href="/how-it-works" className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/10 transition-colors inline-block text-center">
              Cómo Funciona
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
})

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />

      {/* Supabase Integration Test */}
      <section className="py-12 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SupabaseTest />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              ¿Por qué Wellhouse?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Descubre las ventajas que nos hacen diferentes
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-8 rounded-xl">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Freemium + WellPoints</h3>
              <p className="text-gray-600">
                Sistema flexible de puntos que te permite intercambiar sin restricciones monetarias
              </p>
            </div>
            <div className="bg-gray-50 p-8 rounded-xl">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Verificación Robusta</h3>
              <p className="text-gray-600">
                3 niveles de verificación para garantizar la confianza y seguridad de la comunidad
              </p>
            </div>
            <div className="bg-gray-50 p-8 rounded-xl">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">100% en Español</h3>
              <p className="text-gray-600">
                Plataforma diseñada específicamente para la comunidad hispanohablante global
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              ¿Cómo funciona?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Intercambia tu vivienda en 4 simples pasos
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                1
              </div>
              <h3 className="text-lg font-semibold mb-2">Regístrate</h3>
              <p className="text-gray-600 text-sm">
                Crea tu perfil y verifica tu identidad
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                2
              </div>
              <h3 className="text-lg font-semibold mb-2">Publica</h3>
              <p className="text-gray-600 text-sm">
                Sube fotos de tu vivienda y calendario
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                3
              </div>
              <h3 className="text-lg font-semibold mb-2">Busca</h3>
              <p className="text-gray-600 text-sm">
                Encuentra el hogar perfecto para tu viaje
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                4
              </div>
              <h3 className="text-lg font-semibold mb-2">Intercambia</h3>
              <p className="text-gray-600 text-sm">
                Confirma y disfruta tu intercambio
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">
            ¿Listo para viajar gratis?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Únete a miles de viajeros que ya están intercambiando sus hogares
          </p>
          <Link href="/register" className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors inline-block">
            Crear Cuenta Gratis
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Wellhouse</h3>
              <p className="text-gray-400 text-sm">
                La plataforma de intercambio de viviendas más confiable del mundo hispanohablante.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Explorar</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>Buscar viviendas</li>
                <li>Cómo funciona</li>
                <li>Seguridad</li>
                <li>WellPoints</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Compañía</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>Sobre nosotros</li>
                <li>Blog</li>
                <li>Carreras</li>
                <li>Prensa</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Soporte</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>Centro de ayuda</li>
                <li>Contacto</li>
                <li>Términos</li>
                <li>Privacidad</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            © 2026 Wellhouse. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </main>
  )
}
