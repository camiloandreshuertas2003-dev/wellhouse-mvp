import { getRequestConfig } from 'next-intl/server';

const locales = ['es', 'en'] as const;
const defaultLocale = 'es';

type Locale = (typeof locales)[number];

function resolveLocale(locale: string | undefined): Locale {
  if (locale && locales.includes(locale as Locale)) {
    return locale as Locale;
  }
  // `locale` is `undefined` in the normal case today (no `[locale]` route or
  // middleware is wired up). A non-empty but invalid value, however, signals a
  // locale routing/middleware misconfiguration, so surface it instead of
  // silently serving the default locale.
  if (locale) {
    console.warn(
      `[i18n] Unsupported locale "${locale}", falling back to "${defaultLocale}".`,
    );
  }
  return defaultLocale;
}

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;
  const resolvedLocale = resolveLocale(locale);

  return {
    locale: resolvedLocale,
    messages: (await import(`./messages/${resolvedLocale}.json`)).default,
  };
});
