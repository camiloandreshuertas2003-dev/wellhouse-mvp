'use client'

import React from 'react'
import Link from 'next/link'

interface RowEndCardProps {
  count: number
  categorySlug: string
}

/**
 * RowEndCard — brand-colored card at the end of property rows per Módulo A.3 spec.
 * Uses ink-teal-900 background and wellpoint-gold coin icon.
 */
export default function RowEndCard({ count, categorySlug }: RowEndCardProps) {
  const href = categorySlug === 'all' ? '/search' : `/search?category=${categorySlug}`
  
  return (
    <Link
      href={href}
      className="group flex flex-col justify-between p-6 bg-ink-teal-900 rounded-radius-md shadow-shadow-sm hover:shadow-shadow-md hover:-translate-y-0.5 transition-all duration-200 aspect-[4/3] w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-mango"
    >
      {/* Icon (WellPoints Coin) */}
      <div className="w-10 h-10 rounded-radius-full bg-wellpoint-gold/20 flex items-center justify-center text-wellpoint-gold group-hover:scale-110 transition-transform">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="8"/>
          <path d="M12 8v8"/>
          <path d="M9 12h6"/>
        </svg>
      </div>

      {/* Brand Text & CTA */}
      <div className="space-y-1.5">
        <div className="font-fraunces font-semibold text-xl text-base-paper leading-tight">
          +{count} viviendas
        </div>
        <div className="font-inter font-medium text-sm text-accent-mango group-hover:text-accent-mango-hover transition-colors flex items-center gap-1">
          Ver todas
          <span className="group-hover:translate-x-1 transition-transform" aria-hidden="true">→</span>
        </div>
      </div>
    </Link>
  )
}
