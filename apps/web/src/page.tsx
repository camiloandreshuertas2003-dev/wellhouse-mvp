import Link from 'next/link';
import {useTranslations} from 'next-intl';

export default function Home() {
  const t = useTranslations('home');
  const tFooter = useTranslations('footer');

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              {t('hero.title')}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors inline-block text-center">
                {t('hero.cta_primary')}
              </Link>
              <Link href="/how-it-works" className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/10 transition-colors inline-block text-center">
                {t('hero.cta_secondary')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t('features.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('features.subtitle')}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-8 rounded-xl">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('features.freemium.title')}</h3>
              <p className="text-gray-600">
                {t('features.freemium.description')}
              </p>
            </div>
            <div className="bg-gray-50 p-8 rounded-xl">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('features.verification.title')}</h3>
              <p className="text-gray-600">
                {t('features.verification.description')}
              </p>
            </div>
            <div className="bg-gray-50 p-8 rounded-xl">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('features.spanish.title')}</h3>
              <p className="text-gray-600">
                {t('features.spanish.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t('how_it_works.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('how_it_works.subtitle')}
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">1</div>
              <h3 className="text-lg font-semibold mb-2">{t('how_it_works.step1.title')}</h3>
              <p className="text-gray-600 text-sm">{t('how_it_works.step1.description')}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">2</div>
              <h3 className="text-lg font-semibold mb-2">{t('how_it_works.step2.title')}</h3>
              <p className="text-gray-600 text-sm">{t('how_it_works.step2.description')}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">3</div>
              <h3 className="text-lg font-semibold mb-2">{t('how_it_works.step3.title')}</h3>
              <p className="text-gray-600 text-sm">{t('how_it_works.step3.description')}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">4</div>
              <h3 className="text-lg font-semibold mb-2">{t('how_it_works.step4.title')}</h3>
              <p className="text-gray-600 text-sm">{t('how_it_works.step4.description')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">{t('cta.title')}</h2>
          <p className="text-xl mb-8 text-blue-100">{t('cta.subtitle')}</p>
          <Link href="/register" className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors inline-block">
            {t('cta.button')}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">{tFooter('wellhouse')}</h3>
              <p className="text-gray-400 text-sm">{tFooter('description')}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{tFooter('explore.title')}</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/search" className="hover:text-white">{tFooter('explore.search')}</Link></li>
                <li><Link href="/how-it-works" className="hover:text-white">{tFooter('explore.how_it_works')}</Link></li>
                <li><Link href="/security" className="hover:text-white">{tFooter('explore.security')}</Link></li>
                <li><Link href="/wellpoints" className="hover:text-white">{tFooter('explore.wellpoints')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{tFooter('company.title')}</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/about" className="hover:text-white">{tFooter('company.about_us')}</Link></li>
                <li><Link href="/blog" className="hover:text-white">{tFooter('company.blog')}</Link></li>
                <li><Link href="/careers" className="hover:text-white">{tFooter('company.careers')}</Link></li>
                <li><Link href="/press" className="hover:text-white">{tFooter('company.press')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{tFooter('support.title')}</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/help" className="hover:text-white">{tFooter('support.help_center')}</Link></li>
                <li><Link href="/contact" className="hover:text-white">{tFooter('support.contact')}</Link></li>
                <li><Link href="/terms" className="hover:text-white">{tFooter('support.terms')}</Link></li>
                <li><Link href="/privacy" className="hover:text-white">{tFooter('support.privacy')}</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            {tFooter('copyright')}
          </div>
        </div>
      </footer>
    </main>
  )
}