'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ShieldCheck, Lock, Star } from 'lucide-react'

function MessagesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeChatId = searchParams.get('chat')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [conversations, setConversations] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  
  // Upsell Modal State
  const [showPaywall, setShowPaywall] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setCurrentUser(user)

      // Get user profile for priority plan status
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
      
      setUserProfile(profile)

      try {
        const { data: convData } = await supabase
          .from('conversations')
          .select('*')
          .or(`user_one_id.eq.${user.id},user_two_id.eq.${user.id}`)
          .order('updated_at', { ascending: false })

        if (convData) {
          const otherUserIds = [...new Set(convData.map(c => c.user_one_id === user.id ? c.user_two_id : c.user_one_id))]
          const { data: usersData } = await supabase.from('users').select('id, full_name, email').in('id', otherUserIds)
          const userMap = new Map((usersData || []).map(u => [u.id, u.full_name || u.email || 'Anfitrión']))

          const mapped = convData.map((c) => {
            const isUserOne = c.user_one_id === user.id
            const otherUserId = isUserOne ? c.user_two_id : c.user_one_id
            return {
              ...c,
              otherUserId,
              displayName: userMap.get(otherUserId) || `Usuario #${otherUserId.substring(0, 5)}`,
            }
          })
          setConversations(mapped)

          if (mapped.length > 0 && !activeChatId) {
            router.replace(`/messages?chat=${mapped[0].id}`)
          }
        }
      } catch (err) {
        console.error('Failed to load conversations:', err)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [router, activeChatId])

  const [isHostInExchange, setIsHostInExchange] = useState(false)

  useEffect(() => {
    if (!activeChatId || !currentUser) return

    const loadMessagesAndHostStatus = async () => {
      // Load messages
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', activeChatId)
        .order('created_at', { ascending: true })
      setMessages(data || [])
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)

      // Find the other user in this conversation
      const { data: convData } = await supabase
        .from('conversations')
        .select('user_one_id, user_two_id')
        .eq('id', activeChatId)
        .single()
      
      if (convData) {
        const otherUserId = convData.user_one_id === currentUser.id ? convData.user_two_id : convData.user_one_id
        // Check if the current user is the host for this other user in any exchange
        const { data: hostExchanges } = await supabase
          .from('exchanges')
          .select('id')
          .eq('host_id', currentUser.id)
          .eq('guest_id', otherUserId)
          .limit(1)
        
        setIsHostInExchange((hostExchanges && hostExchanges.length > 0) || false)
      }
    }

    loadMessagesAndHostStatus()

    const channel = supabase
      .channel(`chat:${activeChatId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${activeChatId}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new])
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [activeChatId, currentUser])

  // Count my messages in active chat
  const myMessagesCount = messages.filter(m => m.sender_id === currentUser?.id).length
  // For Fase 2, users without priority plan can only send 1 message per conversation, unless they are the host replying
  const hasPriorityPlan = userProfile?.has_priority_plan || false
  const canSendMessage = hasPriorityPlan || isHostInExchange || myMessagesCount < 1

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeChatId || !currentUser || sending) return

    if (!canSendMessage) {
      setShowPaywall(true)
      return
    }

    setSending(true)
    const content = newMessage.trim()
    setNewMessage('')

    const { error } = await supabase
      .from('messages')
      .insert({
        conversation_id: activeChatId,
        sender_id: currentUser.id,
        content: content,
        is_priority: hasPriorityPlan
      })

    if (error) {
      alert('Error al enviar el mensaje: ' + error.message)
    } else {
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', activeChatId)
    }
    setSending(false)
  }

  const activeChat = conversations.find(c => c.id === activeChatId)

  if (loading) {
    return (
      <div className="min-h-screen bg-base-paper flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary-cobalt border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-64px)] bg-base-paper flex flex-col overflow-hidden font-inter text-ink-teal-900">
      {/* Messages Toolbar */}
      <div className="bg-white border-b border-surface-mist-dark px-6 py-3 flex justify-between items-center shrink-0 shadow-sm z-10">
        <h1 className="text-xl font-bold font-fraunces text-ink-teal-900">Mensajes</h1>
        <div className="flex items-center gap-4">
          {!hasPriorityPlan && (
            <button 
              onClick={() => setShowPaywall(true)}
              className="text-xs font-bold text-wellpoint-gold bg-wellpoint-gold/10 px-3 py-1.5 rounded-full hover:bg-wellpoint-gold/20 transition-colors flex items-center gap-1"
            >
              <Star className="w-3 h-3" />
              Hazte Priority
            </button>
          )}
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="flex-1 flex overflow-hidden max-w-7xl mx-auto w-full">
        {conversations.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 m-4 lg:my-8 bg-white rounded-[16px] shadow-sm border border-surface-mist-dark text-center">
            <div className="w-20 h-20 bg-surface-mist rounded-full flex items-center justify-center mb-6">
              <span className="text-3xl">💬</span>
            </div>
            <h2 className="text-2xl font-fraunces font-bold mb-3">No tienes conversaciones activas</h2>
            <p className="text-text-muted-custom mb-8 max-w-md text-sm leading-relaxed">
              Contacta a otros anfitriones desde sus propiedades publicadas para iniciar un chat e intercambiar noches.
            </p>
            <Link href="/search" className="btn-primary px-8">
              Explorar propiedades
            </Link>
          </div>
        ) : (
          <div className="flex flex-1 m-4 lg:my-8 bg-white rounded-[16px] shadow-sm border border-surface-mist-dark overflow-hidden">
            {/* Sidebar */}
            <div className="w-full md:w-80 bg-base-paper border-r border-surface-mist-dark flex flex-col overflow-y-auto shrink-0">
              <div className="p-4 border-b border-surface-mist-dark shrink-0 bg-white">
                <p className="text-xs font-bold text-ink-teal-500 uppercase tracking-wider">Tus Conversaciones</p>
              </div>
              <div className="flex-1 divide-y divide-surface-mist-dark bg-white">
                {conversations.map((c) => {
                  const isActive = c.id === activeChatId
                  return (
                    <button
                      key={c.id}
                      onClick={() => router.push(`/messages?chat=${c.id}`)}
                      className={`w-full text-left p-4 flex items-center gap-3 transition-colors ${isActive ? 'bg-primary-cobalt/5 border-l-4 border-primary-cobalt' : 'hover:bg-surface-mist'}`}
                    >
                      <div className="w-12 h-12 bg-primary-cobalt/10 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-lg font-bold text-primary-cobalt">
                          {c.displayName.charAt(0)}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-ink-teal-900 truncate">{c.displayName}</p>
                        <p className="text-xs text-text-muted-custom truncate mt-0.5">Ver conversación</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Chat Room */}
            <div className="hidden md:flex flex-1 flex-col bg-white overflow-hidden relative">
              {activeChat ? (
                <>
                  <div className="bg-white border-b border-surface-mist-dark px-6 py-4 flex justify-between items-center shrink-0 shadow-sm z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary-cobalt/10 rounded-full flex items-center justify-center">
                        <span className="font-bold text-primary-cobalt">{activeChat.displayName.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-ink-teal-900">{activeChat.displayName}</p>
                        <p className="text-xs text-signal-green flex items-center gap-1 font-medium mt-0.5">
                          <ShieldCheck className="w-3 h-3" />
                          Chat Seguro
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#fcfcfc]">
                    {messages.map((m) => {
                      const isMe = m.sender_id === currentUser.id
                      const isPriority = m.is_priority
                      return (
                        <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[75%] rounded-[16px] px-5 py-3 text-sm shadow-sm relative ${
                            isMe ? 'bg-primary-cobalt text-white rounded-br-sm' : 'bg-white text-ink-teal-900 rounded-bl-sm border border-surface-mist-dark'
                          } ${isPriority ? 'ring-2 ring-wellpoint-gold/50' : ''}`}>
                            {/* Priority Badge Indicator */}
                            {isPriority && !isMe && (
                              <div className="absolute -top-2.5 -left-2 bg-wellpoint-gold text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm">
                                Prioridad
                              </div>
                            )}
                            
                            <p className="break-words leading-relaxed">{m.content}</p>
                            <p className={`text-[10px] mt-2 text-right ${isMe ? 'text-white/70' : 'text-text-muted-custom'}`}>
                              {new Date(m.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Area */}
                  <div className="p-4 bg-white border-t border-surface-mist-dark shrink-0 relative">
                    {!canSendMessage && (
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
                        <button 
                          onClick={() => setShowPaywall(true)}
                          className="bg-wellpoint-gold text-white px-5 py-2 rounded-full font-bold text-sm flex items-center gap-2 shadow-lg hover:bg-wellpoint-gold/90 transition-transform hover:scale-105"
                        >
                          <Lock className="w-4 h-4" />
                          Desbloquear chat
                        </button>
                      </div>
                    )}
                    
                    <form onSubmit={handleSend} className="flex gap-3">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={canSendMessage ? "Escribe tu mensaje..." : "Mensaje bloqueado..."}
                        disabled={!canSendMessage}
                        className="flex-1 input-field"
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim() || sending || !canSendMessage}
                        className="btn-primary shrink-0 px-8"
                      >
                        {sending ? 'Enviando...' : 'Enviar'}
                      </button>
                    </form>
                    
                    {hasPriorityPlan && (
                      <p className="text-[10px] text-wellpoint-gold font-medium mt-2 flex items-center gap-1">
                        <Star className="w-3 h-3" /> Enviando como mensaje prioritario
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-text-muted-custom p-8 bg-[#fcfcfc]">
                  <div className="w-16 h-16 bg-surface-mist rounded-full flex items-center justify-center mb-4">
                    <ShieldCheck className="w-8 h-8 text-ink-teal-300" />
                  </div>
                  <p className="font-semibold text-ink-teal-900 mb-1">Selecciona una conversación</p>
                  <p className="text-sm text-center max-w-sm">Tus mensajes están protegidos por Wellhouse. Recuerda nunca hacer transferencias por fuera de la plataforma.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Paywall Modal */}
      {showPaywall && (
        <div className="fixed inset-0 z-[200] bg-ink-teal-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] shadow-2xl max-w-md w-full overflow-hidden relative animate-in fade-in zoom-in duration-300">
            <button 
              onClick={() => setShowPaywall(false)}
              className="absolute top-4 right-4 text-ink-teal-500 hover:text-ink-teal-900 transition-colors bg-surface-mist p-2 rounded-full"
            >
              ✕
            </button>
            
            <div className="bg-gradient-to-br from-ink-teal-900 to-primary-cobalt p-8 text-center text-white">
              <div className="w-16 h-16 bg-wellpoint-gold rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-fraunces font-bold mb-2">Wellhouse Priority</h2>
              <p className="text-white/80 text-sm">Destaca entre los demás y cierra intercambios más rápido.</p>
            </div>
            
            <div className="p-8">
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3 text-sm text-ink-teal-900">
                  <div className="bg-signal-green/20 text-signal-green p-1 rounded-full shrink-0">✓</div>
                  <p><strong>Mensajes ilimitados</strong> para planear todos los detalles de tu estancia.</p>
                </li>
                <li className="flex items-start gap-3 text-sm text-ink-teal-900">
                  <div className="bg-signal-green/20 text-signal-green p-1 rounded-full shrink-0">✓</div>
                  <p><strong>Insignia de Prioridad</strong>. Tus mensajes aparecerán destacados y el anfitrión será penalizado en su WellRank si no te responde.</p>
                </li>
                <li className="flex items-start gap-3 text-sm text-ink-teal-900">
                  <div className="bg-signal-green/20 text-signal-green p-1 rounded-full shrink-0">✓</div>
                  <p><strong>Soporte 24/7 preferencial</strong> en caso de disputas.</p>
                </li>
              </ul>
              
              <button 
                onClick={async () => {
                  alert("Simulación: Has pagado $4 USD/mes con éxito. ¡Ahora eres Priority!")
                  
                  if (currentUser) {
                    await supabase.from('users').update({ has_priority_plan: true }).eq('id', currentUser.id)
                    setUserProfile({ ...userProfile, has_priority_plan: true })
                  }
                  
                  setShowPaywall(false)
                }}
                className="w-full bg-wellpoint-gold text-white font-bold py-3.5 rounded-radius-sm shadow-md hover:bg-[#d49911] transition-colors"
              >
                Suscribirse por $4 USD / mes
              </button>
              <p className="text-center text-xs text-text-muted-custom mt-4">
                Cancela en cualquier momento.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-base-paper flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary-cobalt border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <MessagesContent />
    </Suspense>
  )
}
