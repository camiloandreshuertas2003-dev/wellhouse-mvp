'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Trophy, Shield, ArrowLeft, Repeat, Coins, Medal, User as UserIcon, Star } from 'lucide-react'

interface LeaderboardUser {
  user_id: string
  name: string
  avatar_url: string | null
  wellpoints: number
  historical_points: number
  rank_level: string
  exchanges_completed: number
}

const RANK_BADGES: Record<string, { label: string, color: string, bg: string }> = {
  'Leyenda':    { label: 'Leyenda Platino', color: '#8b5cf6', bg: '#eef2ff' },
  'Embajador': { label: 'Embajador Oro',   color: '#d97706', bg: '#fef3c7' },
  'Anfitrión':  { label: 'Anfitrión Plata', color: '#2563eb', bg: '#dbeafe' },
  'Explorador': { label: 'Explorador',      color: '#4b5563', bg: '#f3f4f6' },
}

export default function RankingsPage() {
  const [leaders, setLeaders] = useState<LeaderboardUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRanking = async () => {
      const { data, error } = await supabase
        .from('leaderboard_ranking')
        .select('*')
        .limit(20)
      
      if (!error && data) {
        setLeaders(data)
      } else {
        console.error('Error fetching rankings:', error)
      }
      setLoading(false)
    }
    fetchRanking()
  }, [])

  return (
    <div className="min-h-screen bg-surface-mist font-inter">
      {/* Header Bar */}
      <header className="border-b border-surface-mist-dark bg-white sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-text-muted-custom hover:text-ink-teal-900 transition-colors text-sm font-semibold">
            <ArrowLeft className="w-4 h-4" /> Volver al Panel
          </Link>
          <div className="flex items-center gap-1">
            <span className="font-fraunces font-semibold text-xl text-ink-teal-900">Well</span>
            <span className="font-fraunces font-semibold text-xl text-[#f0a500]">house</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Banner de Presentación */}
        <div className="rounded-3xl p-8 text-white mb-8 relative overflow-hidden bg-gradient-to-br from-ink-teal-900 to-[#2a2a2a]">
          <div className="absolute -top-32 -right-32 w-[350px] h-[350px] rounded-full bg-amber-400/20 blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-xl">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4">
              <Trophy className="w-6 h-6 text-amber-400" />
            </div>
            <h1 className="font-fraunces font-bold text-3xl md:text-4xl mb-3">Líderes de la Comunidad</h1>
            <p className="text-[#c4ddd4] text-sm leading-relaxed">
              Descubre a los anfitriones y viajeros más activos de Wellhouse. Gana retos, publica tu vivienda y realiza intercambios para subir en el ranking y desbloquear medallas exclusivas de confianza.
            </p>
          </div>
        </div>

        {/* Tabla de Rankings */}
        <div className="bg-white rounded-3xl border border-surface-mist-dark overflow-hidden shadow-sm">
          <div className="p-6 border-b border-surface-mist-dark">
            <h2 className="text-ink-teal-900 font-semibold text-base">Top 20 Miembros Destacados</h2>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="w-8 h-8 border-4 border-ink-teal-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-[#6b7280]">Cargando tabla de líderes...</p>
            </div>
          ) : leaders.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[#6b7280] text-sm">Aún no hay registros en la tabla de líderes. ¡Sé el primero!</p>
            </div>
          ) : (
            <div className="overflow-x-auto pb-4">
              <table className="w-full text-left border-collapse min-w-[500px] md:min-w-full">
                <thead>
                  <tr className="border-b border-surface-mist-dark bg-surface-mist/50">
                    <th className="py-3 px-2 md:px-4 w-12 md:w-16">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <Medal className="w-4 h-4 md:w-5 md:h-5 text-[#6b7280]" />
                        <span className="text-[9px] md:text-xs font-bold text-[#6b7280] uppercase tracking-wider">Posición</span>
                      </div>
                    </th>
                    <th className="py-3 px-2 md:px-4 text-left">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <UserIcon className="w-4 h-4 md:w-5 md:h-5 text-[#6b7280]" />
                        <span className="text-[9px] md:text-xs font-bold text-[#6b7280] uppercase tracking-wider">Usuario</span>
                      </div>
                    </th>
                    <th className="py-3 px-2 md:px-4 text-center">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <Shield className="w-4 h-4 md:w-5 md:h-5 text-[#6b7280]" />
                        <span className="text-[9px] md:text-xs font-bold text-[#6b7280] uppercase tracking-wider">Nivel</span>
                      </div>
                    </th>
                    <th className="py-3 px-2 md:px-4 text-center">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <Repeat className="w-4 h-4 md:w-5 md:h-5 text-[#6b7280]" />
                        <span className="text-[9px] md:text-xs font-bold text-[#6b7280] uppercase tracking-wider">Intercambios</span>
                      </div>
                    </th>
                    <th className="py-3 px-2 md:px-4 text-center">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <Coins className="w-4 h-4 md:w-5 md:h-5 text-[#6b7280]" />
                        <span className="text-[9px] md:text-xs font-bold text-[#6b7280] uppercase tracking-wider">Saldo WP</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0ede8]">
                  {leaders.map((user, idx) => {
                    const badge = RANK_BADGES[user.rank_level] || RANK_BADGES['Explorador']
                    const isFirst = idx === 0
                    const posColor = idx === 0 ? 'bg-amber-100 text-amber-800 border-amber-300' 
                                   : idx === 1 ? 'bg-slate-100 text-slate-800 border-slate-300'
                                   : idx === 2 ? 'bg-orange-100 text-orange-800 border-orange-300'
                                   : 'bg-gray-100 text-gray-700 border-gray-200'
                    
                    const rowBg = isFirst ? 'bg-amber-50/30' : 'hover:bg-surface-mist/30'

                    return (
                      <tr key={user.user_id} className={`transition-colors ${rowBg}`}>
                        <td className="py-4 px-2 md:px-4 text-center">
                          <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full border flex items-center justify-center font-bold text-xs md:text-sm mx-auto ${posColor}`}>
                            {idx + 1}
                          </div>
                        </td>
                        <td className="py-4 px-2 md:px-4">
                          <div className="flex items-center gap-2 md:gap-3">
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-cover bg-center shrink-0 flex items-center justify-center font-bold text-white text-xs md:text-sm"
                              style={user.avatar_url ? { backgroundImage: `url('${user.avatar_url}')` } : { backgroundColor: badge.color }}>
                              {!user.avatar_url && user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-xs md:text-sm text-ink-teal-900 leading-tight">
                                {user.name}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-2 md:px-4 text-center">
                          <span className="px-2 py-0.5 md:px-2.5 md:py-1 rounded-full text-[10px] md:text-xs font-bold inline-block whitespace-nowrap"
                            style={{ color: badge.color, backgroundColor: badge.bg, border: `1px solid ${badge.color}20` }}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-4 px-2 md:px-4 text-center font-medium text-xs md:text-sm text-ink-teal-900">
                          <div className="flex items-center justify-center gap-1">
                            <Repeat className="w-3 h-3 md:w-3.5 md:h-3.5 text-[#6b7280]" />
                            {user.exchanges_completed}
                          </div>
                        </td>
                        <td className="py-4 px-2 md:px-4 text-center font-bold text-xs md:text-sm text-amber-500">
                          <div className="flex items-center justify-center gap-1">
                            <Coins className="w-3 h-3 md:w-3.5 md:h-3.5" />
                            {user.wellpoints} <span className="text-[10px] md:text-xs">WP</span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {/* Info Box */}
              <div className="mx-4 mt-6 mb-2 p-4 rounded-xl bg-amber-50/50 border border-amber-100 flex items-start gap-3">
                <Star className="w-5 h-5 text-amber-500 shrink-0 mt-0.5 fill-transparent" strokeWidth={2} />
                <p className="text-sm text-amber-900/80 leading-relaxed">
                  Los puntos WellPoints (WP) se obtienen al realizar intercambios, recibir reseñas y completar retos en la comunidad.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
