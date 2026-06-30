import { NextIntlClientProvider, useMessages } from 'next-intl'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

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
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}