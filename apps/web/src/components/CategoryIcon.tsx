'use client'

import React from 'react'
import { Home, Building2, Mountain, Waves, Calendar, MessageCircle, Heart, Star, MapPin, User, Settings } from 'lucide-react'

// Custom coffee leaf icon for "Fincas y campo"
export function IconFincaCafetera({ className = 'w-6 h-6', strokeWidth = 2 }: { className?: string, strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M12 2c-2 3-2 5 0 7s2 4 0 7"/>
      <path d="M8 9c-1.5 1.5-1.5 3 0 4.5"/>
      <path d="M16 9c1.5 1.5 1.5 3 0 4.5"/>
      <circle cx="12" cy="19" r="2"/>
    </svg>
  )
}

// Custom diamond/star icon for "Exclusivo"
export function IconExclusivo({ className = 'w-6 h-6', strokeWidth = 2 }: { className?: string, strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M6 9l6-6 6 6-6 12z"/>
      <path d="M6 9h12"/>
      <path d="M10 9l2 12 2-12"/>
    </svg>
  )
}

// Custom Colombian flag icon (minimalist styled, 3 stripes)
export function IconColombia({ className = 'w-6 h-6', strokeWidth = 2 }: { className?: string, strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M4 3v18"/>
      <path d="M4 4h16v3.5H4z"/>
      <path d="M4 7.5h16v2H4z"/>
      <path d="M4 9.5h16v2H4z"/>
    </svg>
  )
}

interface CategoryIconProps {
  category?: string
  className?: string
  strokeWidth?: number
}

/**
 * CategoryIcon — Central component to render SVG line icons per Módulo E spec.
 * Resolves standard categories or falls back to Home.
 */
export default function CategoryIcon({ category = 'all', className = 'w-5 h-5', strokeWidth = 2 }: CategoryIconProps) {
  const norm = category.toLowerCase().trim()

  if (norm.includes('finca') || norm.includes('campo')) {
    return <IconFincaCafetera className={className} strokeWidth={strokeWidth} />
  }
  if (norm.includes('playa') || norm.includes('costa') || norm.includes('mar')) {
    return <Waves className={className} strokeWidth={strokeWidth} />
  }
  if (norm.includes('urbano') || norm.includes('ciudad') || norm.includes('loft') || norm.includes('apartamento')) {
    return <Building2 className={className} strokeWidth={strokeWidth} />
  }
  if (norm.includes('montaña') || norm.includes('montana')) {
    return <Mountain className={className} strokeWidth={strokeWidth} />
  }
  if (norm.includes('exclusivo') || norm.includes('lujo') || norm.includes('premium')) {
    return <IconExclusivo className={className} strokeWidth={strokeWidth} />
  }
  if (norm.includes('colombia') || norm.includes('festivo') || norm.includes('nacional')) {
    return <IconColombia className={className} strokeWidth={strokeWidth} />
  }
  if (norm === 'all' || norm === 'todo') {
    return <Home className={className} strokeWidth={strokeWidth} />
  }
  
  // Default fallback
  return <Home className={className} strokeWidth={strokeWidth} />
}
