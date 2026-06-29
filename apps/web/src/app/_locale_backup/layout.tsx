import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'Wellhouse - Intercambio de Viviendas',
  description: 'Plataforma de intercambio temporal de viviendas con sistema de puntos y comunidad verificada',
}

export default function RootLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  return (
    <html lang={locale}>
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  )
}
