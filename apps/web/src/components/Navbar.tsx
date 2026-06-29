'use client'

import Link from 'next/link'
import { useState, memo } from 'react'

const Navbar = memo(function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-blue-600">Wellhouse</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8" role="navigation" aria-label="Menú principal">
            <Link href="/search" className="text-gray-700 hover:text-blue-600 transition-colors">
              Buscar viviendas
            </Link>
            <Link href="/how-it-works" className="text-gray-700 hover:text-blue-600 transition-colors">
              Cómo funciona
            </Link>
            <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 transition-colors">
              Dashboard
            </Link>
            <Link href="/messages" className="text-gray-700 hover:text-blue-600 transition-colors relative">
              Mensajes
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center" aria-label="2 mensajes no leídos">
                2
              </span>
            </Link>
            <Link href="/login" className="text-gray-700 hover:text-blue-600 transition-colors">
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Registrarse
            </Link>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={isOpen}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden py-4 space-y-4" role="navigation" aria-label="Menú móvil">
            <Link href="/search" className="block text-gray-700 hover:text-blue-600 transition-colors">
              Buscar viviendas
            </Link>
            <Link href="/how-it-works" className="block text-gray-700 hover:text-blue-600 transition-colors">
              Cómo funciona
            </Link>
            <Link href="/dashboard" className="block text-gray-700 hover:text-blue-600 transition-colors">
              Dashboard
            </Link>
            <Link href="/login" className="block text-gray-700 hover:text-blue-600 transition-colors">
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              className="block bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center"
            >
              Registrarse
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
})

export default Navbar
