'use client'

import React, { useEffect, useRef } from 'react'

interface WellRankRingProps {
  value: number   // 0-300 WP range
  wp: number      // WP per night price
  size?: number   // diameter in px
}

/**
 * WellRankRing — SVG animated ring showing WellRank™ value.
 * Uses wellpoint-gold exclusively per design system rules.
 * Respects `prefers-reduced-motion` from user OS settings.
 */
export default function WellRankRing({ value, wp, size = 72 }: WellRankRingProps) {
  const circleRef = useRef<SVGCircleElement>(null)
  const strokeWidth = 5
  const radius = (size - strokeWidth * 2) / 2
  const circumference = 2 * Math.PI * radius
  const progress = Math.min(value / 300, 1) // normalize to 0-1
  const offset = circumference - progress * circumference

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!circleRef.current || prefersReducedMotion) return

    // Animate from 0 to target
    circleRef.current.style.strokeDashoffset = String(circumference)
    circleRef.current.style.transition = 'none'
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (circleRef.current) {
          circleRef.current.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)'
          circleRef.current.style.strokeDashoffset = String(offset)
        }
      })
    })
  }, [value, offset, circumference])

  return (
    <div
      className="relative flex-shrink-0 flex items-center justify-center"
      style={{ width: size, height: size }}
      aria-label={`WellRank ${value} WP, ${wp} WP por noche`}
    >
      <svg
        width={size}
        height={size}
        className="rotate-[-90deg]"
        aria-hidden="true"
      >
        {/* Track ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--surface-mist-dark)"
          strokeWidth={strokeWidth}
        />
        {/* Progress ring */}
        <circle
          ref={circleRef}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--wellpoint-gold)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-plex font-medium text-wellpoint-gold leading-none" style={{ fontSize: size < 60 ? '10px' : '12px' }}>
          {wp}
        </span>
        <span className="font-plex text-text-muted-custom leading-none" style={{ fontSize: size < 60 ? '7px' : '8px' }}>
          WP
        </span>
      </div>
    </div>
  )
}
