'use client'

import Link from 'next/link'
import { UserPlus, Home, Search, Repeat, ArrowUpCircle, ArrowDownCircle, CheckCircle } from 'lucide-react'

const STEPS = [
  {
    n: '01',
    Icon: UserPlus,
    title: 'Regístrate gratis',
    desc: 'Crea tu perfil en minutos con tu correo o cuenta de Google. Verifica tu identidad con cédula de ciudadanía para ganar acceso completo a la comunidad.',
    detail: 'La verificación con cédula es el primer paso hacia la confianza mutua. Solo los miembros verificados pueden solicitar intercambios.',
  },
  {
    n: '02',
    Icon: Home,
    title: 'Publica tu vivienda',
    desc: 'Sube fotos, describe tu hogar y define tu calendario de disponibilidad. Cuantos más detalles, más oportunidades de intercambio y más WellPoints ganarás.',
    detail: 'Al publicar tu vivienda completa y verificada recibes +200 WellPoints automáticamente. El equipo Wellhouse revisa cada publicación antes de activarla.',
  },
  {
    n: '03',
    Icon: Search,
    title: 'Explora y conecta',
    desc: 'Busca viviendas en cualquier región de Colombia y el mundo hispanohablante. Filtra por categoría, fechas de festivos o número de habitaciones.',
    detail: 'Cada vivienda muestra su WellScore™ — una puntuación que refleja capacidad, amenities y reseñas reales de la comunidad.',
  },
  {
    n: '04',
    Icon: Repeat,
    title: 'Intercambia y viaja',
    desc: 'Acuerda los detalles con el otro miembro, confirma el intercambio y disfruta tu estadía. Al finalizar, ambas partes dejan una reseña pública.',
    detail: 'El intercambio no tiene que ser simultáneo. Puedes hospedar primero, acumular WellPoints y viajar cuando tú decidas.',
  },
]

const WELLPOINTS_FAQ = [
  { q: '¿Son WellPoints dinero real?', a: 'No. Los WellPoints son una medida de hospitalidad y reciprocidad dentro de la plataforma. No tienen valor monetario fuera de Wellhouse y no se pueden vender.' },
  { q: '¿Cuántos WP cuesta quedarme en una vivienda?', a: 'Cada vivienda tiene un WellScore™ que determina su tarifa en WP por noche. El rango va de 30 WP (estudios pequeños) a 300 WP (villas exclusivas).' },
  { q: '¿Qué pasa si no tengo suficientes WP?', a: 'Puedes hospedar primero para acumular WP, o comprar un paquete de WP adicionales desde tu dashboard (WellPoints Phase 2, próximamente).' },
  { q: '¿Caducan los WellPoints?', a: 'No. Los WP no tienen fecha de vencimiento mientras tu cuenta esté activa y en buen estado dentro de la comunidad.' },
]

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-base-paper">

      {/* Hero */}
      <section className="bg-ink-teal-900 text-white py-20 relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-accent-mango/15 blur-3xl pointer-events-none" aria-hidden="true"/>
        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
          <Link href="/search" className="inline-flex items-center gap-1 font-inter text-white/50 text-sm hover:text-white transition-colors mb-8">
            ← Volver al explorador
          </Link>
          <h1 className="font-fraunces font-semibold text-4xl md:text-5xl text-white mb-4 leading-tight">
            ¿Cómo funciona<br/><span className="text-accent-mango">Wellhouse</span>?
          </h1>
          <p className="font-inter text-white/60 text-lg max-w-2xl mx-auto">
            Un sistema sencillo basado en hospitalidad, reciprocidad y confianza.
            Hospeda, acumula WellPoints y viaja gratis.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20" aria-labelledby="steps-heading">
        <div className="max-w-4xl mx-auto px-4">
          <h2 id="steps-heading" className="font-fraunces font-semibold text-3xl text-ink-teal-900 text-center mb-14">
            En 4 pasos simples
          </h2>
          <div className="space-y-6">
            {STEPS.map((step) => (
              <div key={step.n} className="bg-white rounded-radius-md shadow-shadow-sm p-6 md:p-8 flex gap-6 items-start hover:shadow-shadow-md transition-shadow">
                <div className="flex-shrink-0 w-14 h-14 rounded-radius-full bg-accent-mango-light border-2 border-accent-mango/30 flex items-center justify-center">
                  <step.Icon className="w-6 h-6 text-accent-mango" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-plex font-medium text-accent-mango text-sm mb-1">{step.n}</div>
                  <h3 className="font-inter font-semibold text-ink-teal-900 text-xl mb-2">{step.title}</h3>
                  <p className="font-inter text-text-muted-custom text-base leading-relaxed mb-3">{step.desc}</p>
                  <div className="flex items-start gap-2 bg-surface-mist rounded-radius-sm px-3 py-2.5">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="mt-0.5 flex-shrink-0 text-ink-teal-500" aria-hidden="true">
                      <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2"/>
                      <path d="M7 5v3M7 9.5v.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                    <p className="font-inter text-ink-teal-700 text-sm leading-relaxed">{step.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WellPoints section */}
      <section className="py-20 bg-ink-teal-900" aria-labelledby="wp-heading">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-wellpoint-gold/20 border border-wellpoint-gold/30 rounded-radius-full px-4 py-1.5 mb-4">
              <span className="font-plex font-medium text-wellpoint-gold text-xs">WELLPOINTS™</span>
            </div>
            <h2 id="wp-heading" className="font-fraunces font-semibold text-3xl text-white mb-3">
              La moneda de confianza
            </h2>
            <p className="font-inter text-white/60 text-base max-w-2xl mx-auto">
              Los WellPoints no son dinero. Son una medida de tu hospitalidad y reciprocidad dentro de la comunidad Wellhouse.
            </p>
          </div>

          {/* Earn / Spend */}
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            <div className="bg-white/10 border border-white/20 rounded-radius-md p-6">
              <h3 className="font-inter font-semibold text-signal-green text-base mb-4 flex items-center gap-2">
                <ArrowUpCircle className="w-5 h-5" aria-hidden="true" /> Cómo ganar WellPoints
              </h3>
              <ul className="space-y-3">
                {[
                  { action: 'Publicar tu vivienda completa', wp: '+200 WP' },
                  { action: 'Hospedar a alguien (por noche)', wp: '+WellScore™ WP' },
                  { action: 'Verificar tu identidad con cédula', wp: '+50 WP' },
                  { action: 'Completar tu perfil al 100%', wp: '+30 WP' },
                  { action: 'Recibir reseñas de 5 estrellas', wp: '+20 WP c/u' },
                ].map((item) => (
                  <li key={item.action} className="flex items-center justify-between py-2 border-b border-white/10 last:border-0">
                    <span className="font-inter text-white/70 text-sm">{item.action}</span>
                    <span className="font-plex font-medium text-signal-green text-sm">{item.wp}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white/10 border border-white/20 rounded-radius-md p-6">
              <h3 className="font-inter font-semibold text-accent-mango text-base mb-4 flex items-center gap-2">
                <ArrowDownCircle className="w-5 h-5" aria-hidden="true" /> Cómo usar WellPoints
              </h3>
              <ul className="space-y-3">
                {[
                  { action: 'Noche en finca cafetera (30–80 WP)', wp: '–WP/noche' },
                  { action: 'Noche en casa de playa (60–150 WP)', wp: '–WP/noche' },
                  { action: 'Noche en villa exclusiva (150–300 WP)', wp: '–WP/noche' },
                  { action: 'Solicitar intercambio directamente', wp: 'Gratis' },
                ].map((item) => (
                  <li key={item.action} className="flex items-center justify-between py-2 border-b border-white/10 last:border-0">
                    <span className="font-inter text-white/70 text-sm">{item.action}</span>
                    <span className="font-plex font-medium text-accent-mango text-sm">{item.wp}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 p-3 bg-wellpoint-gold/10 border border-wellpoint-gold/20 rounded-radius-sm">
                <p className="font-inter text-wellpoint-gold text-xs leading-relaxed">
                  💡 Cada vivienda tiene un <strong>WellScore™</strong> único que determina cuántos WP cuesta por noche. Cuanto mejor valorada, más WP necesitas — y más WP recibirás al hospedar.
                </p>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="space-y-4">
            <h3 className="font-fraunces font-semibold text-white text-xl mb-4 text-center">Preguntas frecuentes</h3>
            {WELLPOINTS_FAQ.map((item) => (
              <details key={item.q} className="bg-white/10 border border-white/20 rounded-radius-md group">
                <summary className="px-5 py-4 font-inter font-medium text-white text-sm cursor-pointer flex items-center justify-between list-none">
                  {item.q}
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0 text-white/40 group-open:rotate-180 transition-transform" aria-hidden="true">
                    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </summary>
                <div className="px-5 pb-4 font-inter text-white/60 text-sm leading-relaxed border-t border-white/10 pt-3">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-accent-mango text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="font-fraunces font-semibold text-3xl mb-4">¿Listo para tu primer intercambio?</h2>
          <p className="font-inter text-white/80 text-lg mb-8">
            Regístrate gratis, publica tu vivienda y recibe <span className="font-semibold">+200 WellPoints</span> para comenzar.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register" className="bg-white text-accent-mango px-8 py-4 rounded-radius-sm font-inter font-semibold text-base hover:bg-accent-mango-light transition-colors">
              Crear cuenta gratis →
            </Link>
            <Link href="/search" className="border border-white/40 text-white px-8 py-4 rounded-radius-sm font-inter font-semibold text-base hover:bg-white/10 transition-colors">
              Explorar viviendas
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
