import { Inter, Fraunces, IBM_Plex_Mono } from 'next/font/google'
import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import WellBot from '@/components/WellBot'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const fraunces = Fraunces({ 
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
})

const ibmPlexMono = IBM_Plex_Mono({ 
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-plex',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Wellhouse — Explora viviendas para intercambiar',
  description: 'Hospeda hoy, gana WellPoints y viaja gratis. Explora cientos de viviendas verificadas en Colombia y el mundo hispanohablante.',
  keywords: ['intercambio de viviendas', 'wellpoints', 'vacaciones Colombia', 'viajes gratis', 'comunidad verificada'],
  openGraph: {
    title: 'Wellhouse — Explora viviendas para intercambiar',
    description: 'Hospeda hoy, gana WellPoints y viaja gratis. Colombia y el mundo hispanohablante.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${inter.variable} ${fraunces.variable} ${ibmPlexMono.variable}`}>
      <body className="font-inter bg-base-paper text-ink-teal-900 min-h-screen antialiased">
        <Navbar />
        {children}
        <WellBot />
      </body>
    </html>
  )
}