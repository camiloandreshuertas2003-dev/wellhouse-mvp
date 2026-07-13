'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export default function WellbotAdminDashboard() {
  const [insights, setInsights] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadInsights() {
      const { data, error } = await supabase
        .from('assistant_insights')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (data) setInsights(data)
      setLoading(false)
    }
    loadInsights()
  }, [])

  if (loading) {
    return <div className="p-10 font-inter">Cargando Insights...</div>
  }

  const complaints = insights.filter(i => i.is_complaint)
  const features = insights.filter(i => i.is_feature_request)
  const unanswered = insights.filter(i => i.unanswered_question)

  return (
    <div className="min-h-screen bg-base-paper p-8 font-inter">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-fraunces font-bold text-ink-teal-900">WellBot - Inteligencia de Negocio</h1>
          <p className="text-text-muted-custom">Análisis de las interacciones de los usuarios con el asistente.</p>
        </header>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-surface-mist-dark">
            <h3 className="text-sm font-semibold text-text-muted-custom uppercase mb-2">Total Analizadas</h3>
            <p className="text-3xl font-bold text-ink-teal-900">{insights.length}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-surface-mist-dark">
            <h3 className="text-sm font-semibold text-text-muted-custom uppercase mb-2">Resolución</h3>
            <p className="text-3xl font-bold text-signal-green">
              {Math.round((insights.filter(i => i.resolved).length / Math.max(insights.length, 1)) * 100)}%
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-surface-mist-dark">
            <h3 className="text-sm font-semibold text-text-muted-custom uppercase mb-2">Quejas (Alta Prioridad)</h3>
            <p className="text-3xl font-bold text-red-600">{complaints.length}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-surface-mist-dark">
            <h3 className="text-sm font-semibold text-text-muted-custom uppercase mb-2">Dudas No Resueltas</h3>
            <p className="text-3xl font-bold text-wellpoint-gold">{unanswered.length}</p>
          </div>
        </div>

        {/* Content Grids */}
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Dudas No Resueltas (Para entrenar el Cerebro) */}
          <div className="bg-white rounded-2xl shadow-sm border border-surface-mist-dark overflow-hidden flex flex-col">
            <div className="p-6 border-b border-surface-mist-dark bg-surface-mist/30">
              <h2 className="text-lg font-bold text-ink-teal-900">Cola de Dudas No Resueltas</h2>
              <p className="text-xs text-text-muted-custom">Agrega estas respuestas al System Prompt (el Cerebro) para que WellBot aprenda.</p>
            </div>
            <div className="p-6 flex-1 overflow-y-auto max-h-[500px] space-y-4">
              {unanswered.length === 0 ? (
                <p className="text-sm text-text-muted-custom text-center py-8">No hay dudas pendientes. ¡WellBot sabe todo!</p>
              ) : (
                unanswered.map(u => (
                  <div key={u.id} className="p-4 border border-wellpoint-gold/30 bg-wellpoint-gold/5 rounded-xl">
                    <p className="font-semibold text-ink-teal-900 text-sm mb-2">"{u.unanswered_question}"</p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-[10px] text-text-muted-custom">Chat ID: {u.conversation_id}</span>
                      <button className="text-[10px] bg-white border border-surface-mist-dark px-2 py-1 rounded hover:bg-surface-mist transition-colors font-semibold">
                        Marcar como integrada
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sugerencias y Quejas */}
          <div className="bg-white rounded-2xl shadow-sm border border-surface-mist-dark overflow-hidden flex flex-col">
            <div className="p-6 border-b border-surface-mist-dark bg-surface-mist/30">
              <h2 className="text-lg font-bold text-ink-teal-900">Feedback de Producto</h2>
              <p className="text-xs text-text-muted-custom">Funcionalidades pedidas por usuarios y quejas extraídas.</p>
            </div>
            <div className="p-6 flex-1 overflow-y-auto max-h-[500px] space-y-6">
              
              <div>
                <h3 className="font-bold text-sm text-ink-teal-900 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent-mango block"></span> Feature Requests ({features.length})
                </h3>
                {features.map(f => (
                  <div key={f.id} className="text-sm text-text-muted-custom mb-2 border-b border-surface-mist-dark pb-2 last:border-0">
                    <p>En el chat {f.conversation_id.slice(0, 8)}...</p>
                  </div>
                ))}
              </div>

              <div>
                <h3 className="font-bold text-sm text-ink-teal-900 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-600 block"></span> Quejas ({complaints.length})
                </h3>
                {complaints.map(c => (
                  <div key={c.id} className="text-sm text-red-700/80 mb-2 border-b border-red-100 pb-2 last:border-0 bg-red-50 p-2 rounded">
                    <p>Revisar chat urgente: {c.conversation_id}</p>
                  </div>
                ))}
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
