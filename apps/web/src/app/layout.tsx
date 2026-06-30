import { NextIntlClientProvider, useMessages } from 'next-intl'
import { Inter } from 'next/font/google'
import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

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

export default function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const messages = useMessages()

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Navbar />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}