import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'Wellhouse - Intercambio de Viviendas',
  description: 'Plataforma de intercambio temporal de viviendas con sistema de puntos y comunidad verificada',
  keywords: ['intercambio de viviendas', 'vacaciones', 'viajes', 'puntos', 'comunidad'],
  openGraph: {
    title: 'Wellhouse - Intercambio de Viviendas',
    description: 'Plataforma de intercambio temporal de viviendas con sistema de puntos y comunidad verificada',
    type: 'website',
  },
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  )
}
