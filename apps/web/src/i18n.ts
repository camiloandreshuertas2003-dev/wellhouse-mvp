import { getRequestConfig } from 'next-intl/server';
import { routing } from './i18n/routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // Await the locale (next-intl v4 API)
  let locale = await requestLocale;

  // Fallback to default locale if undefined or unsupported
  if (!locale || !routing.locales.includes(locale as 'es' | 'en')) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});