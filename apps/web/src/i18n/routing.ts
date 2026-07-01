import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  // All supported locales
  locales: ['es', 'en'],

  // Default locale — no prefix (e.g. / instead of /es/)
  defaultLocale: 'es'
});
