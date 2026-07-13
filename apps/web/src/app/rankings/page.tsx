'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Trophy, Shield, ArrowLeft, Star, Repeat, Coins } from 'lucide-react'

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
    <div className="min-h-screen bg-[#f8f7f4] font-inter">
      {/* Header Bar */}
      <header className="border-b border-[#e8e4dc] bg-white sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-[#4a6b5e] hover:text-[#1a3c34] transition-colors text-sm font-semibold">
            <ArrowLeft className="w-4 h-4" /> Volver al Panel
          </Link>
          <div className="flex items-center gap-1">
            <span className="font-fraunces font-semibold text-xl text-[#1a3c34]">Well</span>
            <span className="font-fraunces font-semibold text-xl text-[#f0a500]">house</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Banner de Presentación */}
        <div className="rounded-3xl p-8 text-white mb-8 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a3c34 0%, #2d6a4f 100%)' }}>
          <div className="absolute -top-32 -right-32 w-[350px] h-[350px] rounded-full bg-amber-400/20 blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-xl">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl mb-4">🏆</div>
            <h1 className="font-fraunces font-bold text-3xl md:text-4xl mb-3">Líderes de la Comunidad</h1>
            <p className="text-[#c4ddd4] text-sm leading-relaxed">
              Descubre a los anfitriones y viajeros más activos de Wellhouse. Gana retos, publica tu vivienda y realiza intercambios para subir en el ranking y desbloquear medallas exclusivas de confianza.
            </p>
          </div>
        </div>

        {/* Tabla de Rankings */}
        <div className="bg-white rounded-3xl border border-[#e8e4dc] overflow-hidden shadow-sm">
          <div className="p-6 border-b border-[#e8e4dc]">
            <h2 className="text-[#1a3c34] font-semibold text-base">Top 20 Miembros Destacados</h2>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="w-8 h-8 border-4 border-[#1a3c34] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-[#6b7280]">Cargando tabla de líderes...</p>
            </div>
          ) : leaders.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[#6b7280] text-sm">Aún no hay registros en la tabla de líderes. ¡Sé el primero!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#e8e4dc] bg-[#f8f7f4]/50">
                    <th className="py-4 px-6 text-xs font-bold text-[#6b7280] uppercase tracking-wider w-16">Posición</th>
                    <th className="py-4 px-6 text-xs font-bold text-[#6b7280] uppercase tracking-wider">Usuario</th>
                    <th className="py-4 px-6 text-xs font-bold text-[#6b7280] uppercase tracking-wider text-center">Nivel</th>
                    <th className="py-4 px-6 text-xs font-bold text-[#6b7280] uppercase tracking-wider text-center">Intercambios</th>
                    <th className="py-4 px-6 text-xs font-bold text-[#6b7280] uppercase tracking-wider text-right">Saldo WP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0ede8]">
                  {leaders.map((user, idx) => {
                    const badge = RANK_BADGES[user.rank_level] || RANK_BADGES['Explorador']
                    const posColor = idx === 0 ? 'bg-amber-100 text-amber-800 border-amber-300' 
                                   : idx === 1 ? 'bg-slate-100 text-slate-800 border-slate-300'
                                   : idx === 2 ? 'bg-orange-100 text-orange-800 border-orange-300'
                                   : 'bg-gray-100 text-gray-700 border-gray-200'

                    return (
                      <tr key={user.user_id} className="hover:bg-[#f8f7f4]/30 transition-colors">
                        <td className="py-4 px-6">
                          <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-sm ${posColor}`}>
                            {idx + 1}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-cover bg-center shrink-0 flex items-center justify-center font-bold text-white text-sm"
                              style={user.avatar_url ? { backgroundImage: `url('${user.avatar_url}')` } : { backgroundColor: badge.color }}>
                              {!user.avatar_url && user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-[#1a3c34] flex items-center gap-1.5">
                                {user.name}
                                {user.wellpoints > 500 && (
                                  <Shield className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                )}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold inline-block"
                            style={{ color: badge.color, backgroundColor: badge.bg, border: `1px solid ${badge.color}20` }}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center font-medium text-sm text-[#1a3c34]">
                          <div className="flex items-center justify-center gap-1">
                            <Repeat className="w-3.5 h-3.5 text-[#6b7280]" />
                            {user.exchanges_completed}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right font-bold text-sm text-amber-500">
                          <div className="flex items-center justify-end gap-1">
                            <Coins className="w-3.5 h-3.5" />
                            {user.wellpoints} WP
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
