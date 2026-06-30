import Link from 'next/link'
import { useTranslations } from 'next-intl'

export default function HowItWorksPage() {
  const t = useTranslations('how_it_works_page')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Link href="/" className="text-blue-600 hover:underline mb-8 inline-block">
          {t('back_link')}
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">{t('title')}</h1>

        <div className="space-y-12">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h2 className="text-2xl font-semibold mb-2">{t('step1.title')}</h2>
                <p className="text-gray-600">{t('step1.description')}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h2 className="text-2xl font-semibold mb-2">{t('step2.title')}</h2>
                <p className="text-gray-600">{t('step2.description')}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h2 className="text-2xl font-semibold mb-2">{t('step3.title')}</h2>
                <p className="text-gray-600">{t('step3.description')}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                4
              </div>
              <div>
                <h2 className="text-2xl font-semibold mb-2">{t('step4.title')}</h2>
                <p className="text-gray-600">{t('step4.description')}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center bg-blue-600 text-white rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-4">{t('cta_title')}</h2>
          <Link
            href="/register"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-block"
          >
            {t('cta_button')}
          </Link>
        </div>
      </div>
    </div>
  )
}