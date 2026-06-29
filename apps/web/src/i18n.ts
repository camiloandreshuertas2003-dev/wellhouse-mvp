import { getRequestConfig } from 'next-intl/server';

const locales = ['es', 'en'] as const;
const defaultLocale = 'es';

type Locale = (typeof locales)[number];

function resolveLocale(locale: string | undefined): Locale {
  return locale && locales.includes(locale as Locale)
    ? (locale as Locale)
    : defaultLocale;
}

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;
  const resolvedLocale = resolveLocale(locale);

  return {
    locale: resolvedLocale,
    messages: (await import(`./messages/${resolvedLocale}.json`)).default,
  };
});
