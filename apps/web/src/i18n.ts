import { getRequestConfig } from 'next-intl/server'

export default getRequestConfig(async ({ locale }) => {
  const activeLocale = locale || 'es'
  return {
    locale: activeLocale,
    // eslint-disable-next-line
    messages: (await import(`./messages/${activeLocale}.json`)).default,
  }
})