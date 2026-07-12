'use client'

import React from 'react'

interface BreakdownFactor {
  label: string
  value: number  // 0-100
  maxPoints: number
  earned: number
}

interface WellRankBreakdownProps {
  total: number   // 0-300 WP
  bedrooms?: number
  bathrooms?: number
  capacity?: number
  hasPhotos?: boolean
  isVerified?: boolean
  hasCalendar?: boolean
  reviewCount?: number
}

/**
 * WellRankBreakdown — Shows the WellRank™ ring (large) + horizontal bar breakdown.
 * Transparent and educational: lets guests and hosts understand the score.
 */
export default function WellRankBreakdown({
  total,
  bedrooms = 1,
  bathrooms = 1,
  capacity = 2,
  hasPhotos = false,
  isVerified = false,
  hasCalendar = false,
  reviewCount = 0,
}: WellRankBreakdownProps) {
  const max = 300

  const factors: BreakdownFactor[] = [
    {
      label: 'Capacidad y espacio',
      value: Math.round(((capacity * 15 + bedrooms * 20 + bathrooms * 10) / 130) * 100),
      maxPoints: 130,
      earned: capacity * 15 + bedrooms * 20 + bathrooms * 10,
    },
    {
      label: 'Fotos de calidad',
      value: hasPhotos ? 100 : 20,
      maxPoints: 60,
      earned: hasPhotos ? 60 : 12,
    },
    {
      label: 'Perfil verificado',
      value: isVerified ? 100 : 0,
      maxPoints: 50,
      earned: isVerified ? 50 : 0,
    },
    {
      label: 'Calendario actualizado',
      value: hasCalendar ? 100 : 0,
      maxPoints: 30,
      earned: hasCalendar ? 30 : 0,
    },
    {
      label: 'Reseñas de huéspedes',
      value: Math.min(reviewCount * 20, 100),
      maxPoints: 30,
      earned: Math.min(reviewCount * 6, 30),
    },
  ]

  // SVG ring calculation
  const size = 100
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (total / max) * circumference

  const ringColor = total >= 200
    ? '#1FAE6E' // signal-green (excellent)
    : total >= 120
    ? '#F2A425' // wellpoint-gold (good)
    : '#E38B2C' // accent-mango (growing)

  return (
    <div className="bg-white rounded-[16px] border border-surface-mist p-6 md:p-8">
      <h2 className="font-fraunces font-semibold text-2xl text-ink-teal-900 mb-6">
        WellRank™ de esta vivienda
      </h2>

      <div className="flex flex-col sm:flex-row gap-8 items-start">

        {/* Large Ring */}
        <div className="flex-shrink-0 flex flex-col items-center gap-2">
          <div className="relative" style={{ width: 120, height: 120 }}>
            <svg width={120} height={120} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
              {/* Background track */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="#EEF0F2"
                strokeWidth={strokeWidth}
              />
              {/* Progress arc */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={ringColor}
                strokeWidth={strokeWidth}
                strokeDasharray={`${progress} ${circumference}`}
                strokeLinecap="round"
                className="transition-all duration-700"
              />
            </svg>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-plex font-bold text-xl text-ink-teal-900" style={{ color: ringColor }}>
                {total}
              </span>
              <span className="font-inter text-[9px] font-medium text-text-muted-custom uppercase tracking-wider leading-none">
                WP/noche
              </span>
            </div>
          </div>
          <p className="font-inter text-xs text-text-muted-custom text-center max-w-[100px]">
            {total >= 200 ? '★ Vivienda destacada' : total >= 120 ? 'Buena puntuación' : 'En crecimiento'}
          </p>
        </div>

        {/* Bar breakdown */}
        <div className="flex-1 space-y-3 w-full">
          {factors.map((f) => (
            <div key={f.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-inter text-sm font-medium text-ink-teal-900">{f.label}</span>
                <span className="font-plex text-xs font-medium text-text-muted-custom">
                  {f.earned} / {f.maxPoints} WP
                </span>
              </div>
              <div className="h-1.5 bg-surface-mist rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(f.value, 100)}%`,
                    backgroundColor: f.value >= 80 ? '#1FAE6E' : f.value >= 40 ? '#F2A425' : '#E38B2C',
                  }}
                />
              </div>
            </div>
          ))}

          {/* Total */}
          <div className="pt-3 border-t border-surface-mist flex items-center justify-between">
            <span className="font-inter text-sm font-semibold text-ink-teal-900">WellRank™ total</span>
            <span className="font-plex font-bold text-ink-teal-900">{total} WP/noche</span>
          </div>
        </div>
      </div>

      <p className="mt-5 font-inter text-xs text-text-muted-custom leading-relaxed border-t border-surface-mist pt-4">
        El WellRank™ determina cuántos WellPoints cuesta quedarse en esta vivienda por noche. 
        Cuanto mayor es el puntaje, más atractiva es la vivienda para el intercambio — y más WP gana el anfitrión al hospedar.
      </p>
    </div>
  )
}
