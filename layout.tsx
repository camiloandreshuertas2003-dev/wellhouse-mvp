import { NextIntlClientProvider } from 'next-intl';
import { getMessages, unstable_setRequestLocale } from 'next-intl/server';
import { Inter } from 'next/font/google';
import { ReactNode } from 'react';

// Asumiendo que tus estilos globales están en `apps/web/src/app/globals.css`
import '../globals.css';

const inter = Inter({ subsets: ['latin'] });

type Props = {
  children: ReactNode;
  params: { locale: string };
};

// Esto le dice a Next.js qué idiomas construir estáticamente.
export function generateStaticParams() {
  return [{ locale: 'es' }];
}

export const metadata = {
  title: 'Wellhouse - Intercambio de Viviendas',
  description: 'Viaja gratis alojándote en hogares reales, intercambiando tu vivienda con personas verificadas de todo el mundo.',
};

export default async function LocaleLayout({
  children,
  params: { locale },
}: Props) {
  // Habilita el renderizado estático para este 'locale'.
  unstable_setRequestLocale(locale);
  
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}