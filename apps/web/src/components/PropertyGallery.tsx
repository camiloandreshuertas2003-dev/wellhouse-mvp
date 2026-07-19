'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface PropertyGalleryProps {
  images: string[]
  title: string
  /** If viewer is the owner, show "Add more photos" prompt when < 5 photos */
  isOwner?: boolean
}

/**
 * PropertyGallery — "Mosaico WellHouse"
 * Desktop: Large photo (60%) + vertical column of 3 thumbnails.
 * Last thumbnail shows overlay with remaining photo count.
 * Mobile: Full-bleed swipe carousel with dot indicators.
 * Click any photo → full-screen modal with keyboard/swipe navigation.
 */
export default function PropertyGallery({ images, title, isOwner = false }: PropertyGalleryProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [modalIndex, setModalIndex] = useState(0)
  const [mobileIndex, setMobileIndex] = useState(0)

  const safeImages = images.length > 0 ? images : ['/images/property-1.jpg']
  const hasEnoughForMosaic = safeImages.length >= 4

  const openModal = (idx: number) => {
    setModalIndex(idx)
    setModalOpen(true)
  }

  const prev = useCallback(() => {
    setModalIndex(i => (i - 1 + safeImages.length) % safeImages.length)
  }, [safeImages.length])

  const next = useCallback(() => {
    setModalIndex(i => (i + 1) % safeImages.length)
  }, [safeImages.length])

  // Keyboard navigation in modal
  useEffect(() => {
    if (!modalOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'Escape') setModalOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [modalOpen, prev, next])

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = modalOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [modalOpen])

  const remainingCount = safeImages.length - 4

  return (
    <>
      {/* ── Mobile: Rounded card carousel ──────────────────────────────── */}
      <div className="md:hidden relative">
        <div className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-surface-mist shadow-sm">
          <img
            src={safeImages[mobileIndex]}
            alt={`${title} — foto ${mobileIndex + 1}`}
            className="w-full h-full object-cover"
            loading={mobileIndex === 0 ? 'eager' : 'lazy'}
            onClick={() => openModal(mobileIndex)}
          />
          {/* Photo counter overlay */}
          <div className="absolute top-3 right-3 bg-black/75 text-white text-[11px] font-semibold font-inter px-2.5 py-1 rounded-full">
            {mobileIndex + 1} / {safeImages.length}
          </div>
        </div>

        {/* Thumbnail Row on Mobile */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-none">
          {safeImages.slice(0, 5).map((img, idx) => (
            <button
              key={idx}
              onClick={() => setMobileIndex(idx)}
              className={`w-16 h-12 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                idx === mobileIndex ? 'border-[#0f766e] scale-95 shadow-sm' : 'border-transparent opacity-70'
              }`}
            >
              <img src={img} className="w-full h-full object-cover" alt={`Thumb ${idx + 1}`} />
            </button>
          ))}
        </div>

        {/* "Ver las X fotos" Button */}
        <button
          onClick={() => openModal(0)}
          className="mt-3 flex items-center gap-1.5 px-4 py-2 border border-neutral-200 bg-white rounded-xl font-inter font-medium text-xs text-ink-teal-900 hover:bg-surface-mist transition-colors shadow-sm"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" className="text-[#6b7280]">
            <rect x="3" y="3" width="18" height="18" rx="3"/>
            <path d="M3 9h18M9 21V9"/>
          </svg>
          Ver las {safeImages.length} fotos
        </button>
      </div>

      {/* ── Desktop: Mosaico WellHouse ───────────────────────────────── */}
      <div className="hidden md:block">
        {safeImages.length >= 5 ? (
          <div className="grid grid-cols-4 grid-rows-2 gap-2 rounded-[16px] overflow-hidden h-[420px] lg:h-[480px]">
            {/* Main photo */}
            <div
              className="relative cursor-pointer overflow-hidden col-span-2 row-span-2"
              onClick={() => openModal(0)}
            >
              <img
                src={safeImages[0]}
                alt={`${title} — foto principal`}
                className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-300"
                loading="eager"
              />
            </div>

            {/* 4 Thumbnails */}
            {[1, 2, 3, 4].map((imgIdx) => (
              <div
                key={imgIdx}
                className="relative cursor-pointer overflow-hidden"
                onClick={() => openModal(imgIdx < safeImages.length ? imgIdx : 0)}
              >
                <img
                  src={safeImages[imgIdx]}
                  alt={`${title} — foto ${imgIdx + 1}`}
                  className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-300"
                  loading="lazy"
                />
                {/* Last thumbnail: remaining count overlay */}
                {imgIdx === 4 && safeImages.length > 5 && (
                  <div
                    className="absolute inset-0 bg-ink-teal-900/70 flex flex-col items-center justify-center text-white cursor-pointer"
                    onClick={() => openModal(4)}
                  >
                    <span className="font-fraunces font-semibold text-2xl">+{safeImages.length - 5}</span>
                    <span className="font-inter text-xs mt-0.5 text-white/80">fotos</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* Single large photo when < 4 photos */
          <div
            className="relative h-[420px] lg:h-[480px] rounded-[16px] overflow-hidden cursor-pointer"
            onClick={() => openModal(0)}
          >
            <img
              src={safeImages[0]}
              alt={`${title} — foto principal`}
              className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-300"
              loading="eager"
            />
            {isOwner && (
              <div className="absolute bottom-4 left-4 bg-wellpoint-gold/90 backdrop-blur-sm text-white text-xs font-inter font-semibold px-3 py-1.5 rounded-full">
                + Añade más fotos para mejorar tu WellRank™
              </div>
            )}
          </div>
        )}

        {/* "Ver todas las fotos" button */}
        {safeImages.length > 1 && (
          <button
            onClick={() => openModal(0)}
            className="mt-3 flex items-center gap-1.5 px-4 py-2 border border-neutral-300 rounded-radius-sm font-inter font-medium text-sm text-ink-teal-900 hover:bg-surface-mist transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="3"/>
              <path d="M3 9h18M9 21V9"/>
            </svg>
            Ver las {safeImages.length} fotos
          </button>
        )}
      </div>

      {/* ── Full-screen modal gallery ──────────────────────────────────── */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center"
          onClick={() => setModalOpen(false)}
        >
          <button
            className="absolute top-4 left-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
            onClick={() => setModalOpen(false)}
            aria-label="Cerrar galería"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <span className="absolute top-4 left-1/2 -translate-x-1/2 font-inter text-white/70 text-sm">
            {modalIndex + 1} / {safeImages.length}
          </span>

          {safeImages.length > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                onClick={(e) => { e.stopPropagation(); prev() }}
                aria-label="Foto anterior"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                onClick={(e) => { e.stopPropagation(); next() }}
                aria-label="Siguiente foto"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </>
          )}

          <div
            className="relative max-w-5xl max-h-[85vh] w-full mx-4"
            onClick={e => e.stopPropagation()}
          >
            <img
              src={safeImages[modalIndex]}
              alt={`${title} — foto ${modalIndex + 1}`}
              className="w-full h-full object-contain max-h-[85vh]"
            />
          </div>

          {/* Thumbnails strip */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto px-4">
            {safeImages.map((img, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setModalIndex(i) }}
                className={`w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${i === modalIndex ? 'border-accent-mango opacity-100' : 'border-transparent opacity-50 hover:opacity-75'}`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
