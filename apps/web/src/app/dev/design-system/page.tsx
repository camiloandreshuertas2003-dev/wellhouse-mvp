'use client'

import React from 'react'

export default function DesignSystemPage() {
  const colors = [
    { name: 'ink-teal-900', hex: '#0F3D3E', class: 'bg-ink-teal-900 text-white', use: 'Texto principal, navegación, headers' },
    { name: 'ink-teal-700', hex: '#1C5253', class: 'bg-ink-teal-700 text-white', use: 'Texto secundario, íconos activos' },
    { name: 'ink-teal-500', hex: '#3A7274', class: 'bg-ink-teal-500 text-white', use: 'Links, estados hover' },
    { name: 'base-paper', hex: '#FBFAF7', class: 'bg-base-paper text-ink-teal-900 border border-gray-200', use: 'Fondo de la app (Blanco cálido)' },
    { name: 'surface-mist', hex: '#EFEFE9', class: 'bg-surface-mist text-ink-teal-900', use: 'Fondo de cards, skeletons, separadores' },
    { name: 'surface-mist-dark', hex: '#E2E1D9', class: 'bg-surface-mist-dark text-ink-teal-900', use: 'Bordes, divisores sutiles' },
    { name: 'accent-mango', hex: '#FF6A3D', class: 'bg-accent-mango text-white', use: 'CTAs primarios, botones de acción' },
    { name: 'accent-mango-hover', hex: '#E65A30', class: 'bg-accent-mango-hover text-white', use: 'Hover de accent-mango' },
    { name: 'accent-mango-light', hex: '#FFE4D9', class: 'bg-accent-mango-light text-accent-mango', use: 'Fondos suaves para resaltar' },
    { name: 'signal-green', hex: '#1FAE6E', class: 'bg-signal-green text-white', use: 'Éxito, verificado, confirmación' },
    { name: 'signal-red', hex: '#D64545', class: 'bg-signal-red text-white', use: 'Errores, penalizaciones' },
    { name: 'wellpoint-gold', hex: '#E3A93B', class: 'bg-wellpoint-gold text-white', use: 'Exclusivo para WellPoints (saldo, WellScore)' },
    { name: 'text-muted', hex: '#6B7370', class: 'bg-text-muted text-white', use: 'Texto secundario o terciario (ayuda)' },
  ]

  const fontScales = [
    { name: 'display-xl (Fraunces Semibold 40px)', class: 'font-fraunces font-semibold text-[40px] leading-[48px]', label: 'Hero de Home' },
    { name: 'display-lg (Fraunces Semibold 32px)', class: 'font-fraunces font-semibold text-[32px] leading-[40px]', label: 'Títulos de sección' },
    { name: 'display-md (Fraunces Regular 24px)', class: 'font-fraunces font-normal text-[24px] leading-[32px]', label: 'Título de vivienda en detalle' },
    { name: 'body-lg (Inter Regular 18px)', class: 'font-inter font-normal text-[18px] leading-[28px]', label: 'Descripciones largas' },
    { name: 'body-md (Inter Regular 16px)', class: 'font-inter font-normal text-[16px] leading-[24px]', label: 'Texto estándar de interfaz' },
    { name: 'body-sm (Inter Regular 14px)', class: 'font-inter font-normal text-[14px] leading-[20px]', label: 'Metadatos, ayuda' },
    { name: 'label (Inter Medium 14px)', class: 'font-inter font-medium text-[14px] leading-[20px]', label: 'Etiquetas de formulario, botones' },
    { name: 'data-md (IBM Plex Mono Medium 16px)', class: 'font-plex font-medium text-[16px] leading-[20px]', label: 'Puntos en cards' },
    { name: 'data-lg (IBM Plex Mono Medium 24px)', class: 'font-plex font-medium text-[24px] leading-[28px]', label: 'Saldo total en dashboard' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="border-b border-surface-mist-dark pb-6 mb-12">
        <h1 className="font-fraunces font-semibold text-4xl text-ink-teal-900">Wellhouse Design System</h1>
        <p className="font-inter text-text-muted-custom mt-2 text-lg">Guía de referencia y fuente de verdad visual para desarrolladores y diseñadores.</p>
      </div>

      {/* Colors Section */}
      <section className="mb-16">
        <h2 className="font-fraunces font-semibold text-2xl text-ink-teal-900 mb-6">1. Paleta de Colores</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {colors.map((color) => (
            <div key={color.name} className="border border-surface-mist-dark rounded-radius-md overflow-hidden bg-white shadow-shadow-sm hover:shadow-shadow-md transition-shadow">
              <div className={`h-24 ${color.class} flex items-end p-4 font-plex text-sm font-semibold`}>
                {color.hex}
              </div>
              <div className="p-4">
                <h3 className="font-inter font-semibold text-ink-teal-900">{color.name}</h3>
                <p className="font-inter text-xs text-text-muted-custom mt-1 leading-relaxed">{color.use}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Typography Section */}
      <section className="mb-16">
        <h2 className="font-fraunces font-semibold text-2xl text-ink-teal-900 mb-6">2. Escala Tipográfica</h2>
        <div className="space-y-6 bg-white p-8 border border-surface-mist-dark rounded-radius-md shadow-shadow-sm">
          {fontScales.map((font) => (
            <div key={font.name} className="border-b border-surface-mist pb-4 last:border-b-0 last:pb-0">
              <span className="font-plex text-xs text-text-muted-custom uppercase tracking-wider block mb-2">
                {font.name} — {font.label}
              </span>
              <p className={font.class}>El veloz murciélago hindú comía feliz cardillo y kiwi. 1234567890 WP</p>
            </div>
          ))}
        </div>
      </section>

      {/* Radius & Shadows Section */}
      <section className="mb-16 grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="font-fraunces font-semibold text-2xl text-ink-teal-900 mb-6">3. Bordes y Esquinas</h2>
          <div className="space-y-4 bg-white p-6 border border-surface-mist-dark rounded-radius-md shadow-shadow-sm font-inter">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-surface-mist border border-surface-mist-dark rounded-radius-sm flex items-center justify-center font-semibold text-xs text-ink-teal-900">sm (6px)</div>
              <div><code className="bg-surface-mist px-2 py-1 rounded text-sm text-ink-teal-700">rounded-radius-sm</code> (Inputs, botones pequeños)</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-surface-mist border border-surface-mist-dark rounded-radius-md flex items-center justify-center font-semibold text-xs text-ink-teal-900">md (12px)</div>
              <div><code className="bg-surface-mist px-2 py-1 rounded text-sm text-ink-teal-700">rounded-radius-md</code> (Cards de vivienda)</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-surface-mist border border-surface-mist-dark rounded-radius-lg flex items-center justify-center font-semibold text-xs text-ink-teal-900">lg (20px)</div>
              <div><code className="bg-surface-mist px-2 py-1 rounded text-sm text-ink-teal-700">rounded-radius-lg</code> (Modales, WellBot chat)</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-surface-mist border border-surface-mist-dark rounded-radius-full flex items-center justify-center font-semibold text-xs text-ink-teal-900">full</div>
              <div><code className="bg-surface-mist px-2 py-1 rounded text-sm text-ink-teal-700">rounded-radius-full</code> (Avatares, badges circulares)</div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="font-fraunces font-semibold text-2xl text-ink-teal-900 mb-6">4. Sombras</h2>
          <div className="grid grid-cols-1 gap-4 font-inter text-sm">
            <div className="bg-white border border-surface-mist-dark rounded-radius-md p-5 shadow-shadow-sm">
              <span className="font-semibold text-ink-teal-900 block mb-1">shadow-sm</span>
              <code className="bg-surface-mist px-2 py-0.5 rounded text-xs text-ink-teal-700">shadow-shadow-sm</code> (Cards en estado de reposo)
            </div>
            <div className="bg-white border border-surface-mist-dark rounded-radius-md p-5 shadow-shadow-md">
              <span className="font-semibold text-ink-teal-900 block mb-1">shadow-md</span>
              <code className="bg-surface-mist px-2 py-0.5 rounded text-xs text-ink-teal-700">shadow-shadow-md</code> (Hover sobre cards, dropdowns)
            </div>
            <div className="bg-white border border-surface-mist-dark rounded-radius-md p-5 shadow-shadow-lg">
              <span className="font-semibold text-ink-teal-900 block mb-1">shadow-lg</span>
              <code className="bg-surface-mist px-2 py-0.5 rounded text-xs text-ink-teal-700">shadow-shadow-lg</code> (Modales, WellBot burbuja)
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
