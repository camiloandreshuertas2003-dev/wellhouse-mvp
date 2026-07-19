'use client'

import React, { useState, useEffect, useRef, Suspense, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import {
  ArrowLeft, Send, ShieldCheck, Sparkles, User as UserIcon,
  Calendar as CalIcon, X, MessageCircle, Check, CheckCheck, Pin
} from 'lucide-react'
import ProposalCard from '@/components/messaging/ProposalCard'
import ProposalComposer from '@/components/messaging/ProposalComposer'
import { useSearchParams, useRouter } from 'next/navigation'

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface-mist flex items-center justify-center text-sm font-semibold text-ink-teal-900">Cargando mensajes...</div>}>
      <MessagesContent />
    </Suspense>
  )
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function formatTime(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

function formatDateLabel(dateStr: string) {
  const d = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)

  if (d.toDateString() === today.toDateString()) return 'Hoy'
  if (d.toDateString() === yesterday.toDateString()) return 'Ayer'
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatConvTime(dateStr?: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const today = new Date()
  if (d.toDateString() === today.toDateString()) {
    return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

// ─── main content ─────────────────────────────────────────────────────────────

function MessagesContent() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [conversations, setConversations] = useState<any[]>([])
  const [activeConv, setActiveConv] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [proposals, setProposals] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [composingProposal, setComposingProposal] = useState(false)
  const [activeExchange, setActiveExchange] = useState<any>(null)
  // Track unread counts per conversation (local state)
  const [unreadMap, setUnreadMap] = useState<Record<string, number>>({})
  // Track last message preview per conversation
  const [lastMsgMap, setLastMsgMap] = useState<Record<string, { content: string; created_at: string }>>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const searchParams = useSearchParams()
  const conversationIdParam = searchParams.get('conversation_id')

  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paying, setPaying] = useState(false)
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')

  // ── load user + conversations ────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        const { data: profile } = await supabase.from('users').select('*').eq('id', data.user.id).maybeSingle()
        const u = profile || data.user
        setUser(u)
        fetchConversations(data.user.id)
      }
    })
  }, [conversationIdParam])

  const fetchConversations = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('conversations')
      .select('*, participant_a(id, name, avatar_url, trust_index, plan), participant_b(id, name, avatar_url, trust_index, plan), properties(id, title, city, wellrank, user_id)')
      .or(`participant_a.eq.${userId},participant_b.eq.${userId}`)
      .order('created_at', { ascending: false })

    if (data) {
      // fetch last message + unread count for each conversation
      const convIds = data.map(c => c.id)

      // Get last messages for all convs
      const { data: lastMsgs } = await supabase
        .from('messages')
        .select('conversation_id, content, created_at, sender_id, message_type, read_at')
        .in('conversation_id', convIds)
        .order('created_at', { ascending: false })

      const lMap: Record<string, { content: string; created_at: string }> = {}
      const uMap: Record<string, number> = {}

      lastMsgs?.forEach(m => {
        if (!lMap[m.conversation_id]) {
          lMap[m.conversation_id] = {
            content: m.message_type === 'proposal' ? '📋 Propuesta enviada' : m.content,
            created_at: m.created_at,
          }
        }
        // count unread (messages not from me, without read_at)
        if (m.sender_id !== userId && !m.read_at) {
          uMap[m.conversation_id] = (uMap[m.conversation_id] || 0) + 1
        }
      })

      setLastMsgMap(lMap)
      setUnreadMap(uMap)

      // Sort: paid users first (pinned), then by most recent updated_at
      const sorted = [...data].sort((a, b) => {
        const otherA = a.participant_a.id === userId ? a.participant_b : a.participant_a
        const otherB = b.participant_a.id === userId ? b.participant_b : b.participant_a
        const aPaid = otherA?.plan === 'monthly_pass' ? 1 : 0
        const bPaid = otherB?.plan === 'monthly_pass' ? 1 : 0
        if (bPaid !== aPaid) return bPaid - aPaid
        // Then by last message time
        const aTime = lMap[a.id]?.created_at || a.created_at
        const bTime = lMap[b.id]?.created_at || b.created_at
        return new Date(bTime).getTime() - new Date(aTime).getTime()
      })

      setConversations(sorted)

      if (conversationIdParam) {
        const found = data.find(c => c.id === conversationIdParam)
        if (found) loadConversation(found, userId)
      }
    }
  }, [conversationIdParam])

  // ── realtime: new messages ─────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return
    const channel = supabase
      .channel('realtime_messages_page')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, async (payload) => {
        const msg = payload.new as any
        // Update last message map
        setLastMsgMap(prev => ({
          ...prev,
          [msg.conversation_id]: {
            content: msg.message_type === 'proposal' ? '📋 Propuesta enviada' : msg.content,
            created_at: msg.created_at,
          }
        }))
        // If message is in active conversation, add it to messages
        if (activeConv && msg.conversation_id === activeConv.id && msg.sender_id !== user.id) {
          setMessages(prev => [...prev, msg])
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
          // mark as read immediately since we're viewing it
          supabase.from('messages').update({ read_at: new Date().toISOString() }).eq('id', msg.id).then(() => {})
        } else if (msg.sender_id !== user.id) {
          // increment unread
          setUnreadMap(prev => ({ ...prev, [msg.conversation_id]: (prev[msg.conversation_id] || 0) + 1 }))
        }
        // re-sort conversations
        setConversations(prev => {
          const idx = prev.findIndex(c => c.id === msg.conversation_id)
          if (idx === -1) return prev
          const updated = [...prev]
          const [conv] = updated.splice(idx, 1)
          // Pinned (paid) always stay at top, then new message conv comes next
          const pinnedEnd = updated.findIndex(c => {
            const other = c.participant_a.id === user.id ? c.participant_b : c.participant_a
            return other?.plan !== 'monthly_pass'
          })
          const otherParticipant = conv.participant_a.id === user.id ? conv.participant_b : conv.participant_a
          if (otherParticipant?.plan === 'monthly_pass') {
            updated.unshift(conv)
          } else {
            const insertAt = pinnedEnd === -1 ? 0 : pinnedEnd
            updated.splice(insertAt, 0, conv)
          }
          return updated
        })
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [user?.id, activeConv?.id])

  const loadConversation = async (conv: any, userId?: string) => {
    const uid = userId || user?.id
    router.push(`/messages?conversation_id=${conv.id}`)
    setActiveConv(conv)
    setComposingProposal(false)

    const { data: msgs } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conv.id)
      .order('created_at', { ascending: true })
    if (msgs) setMessages(msgs)

    const { data: props } = await supabase
      .from('proposals')
      .select('*')
      .eq('conversation_id', conv.id)
      .order('created_at', { ascending: true })
    if (props) setProposals(props)

    // Mark all unread messages as read
    if (uid) {
      supabase.from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', conv.id)
        .neq('sender_id', uid)
        .is('read_at', null)
        .then(() => {
          setUnreadMap(prev => ({ ...prev, [conv.id]: 0 }))
        })
    }

    // Load exchange details
    const other = conv.participant_a.id === uid ? conv.participant_b : conv.participant_a
    if (conv.property_id && other) {
      const { data: exData } = await supabase
        .from('exchanges')
        .select('*')
        .eq('host_property_id', conv.property_id)
        .or(`guest_id.eq.${uid},guest_id.eq.${other.id}`)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      setActiveExchange(exData || null)
    } else {
      setActiveExchange(null)
    }

    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      inputRef.current?.focus()
    }, 150)
  }

  // ── send message ─────────────────────────────────────────────────────────────
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !activeConv || !user) return
    const txt = input.trim()
    setInput('')

    const { data: newMsg } = await supabase.from('messages').insert({
      conversation_id: activeConv.id,
      sender_id: user.id,
      content: txt,
      message_type: 'text'
    }).select().single()

    if (newMsg) {
      setMessages(prev => [...prev, newMsg])
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
      // Update last msg map
      setLastMsgMap(prev => ({ ...prev, [activeConv.id]: { content: txt, created_at: newMsg.created_at } }))

      const other = getOtherParticipant(activeConv)
      if (other?.id) {
        supabase.from('notifications').insert({
          user_id: other.id,
          actor_id: user.id,
          type: 'message',
          title: `Nuevo mensaje de ${user.name || 'Huésped'}`,
          content: txt.length > 50 ? txt.slice(0, 47) + '...' : txt,
          link: '/messages'
        }).then(() => {})
      }
    }
  }

  // ── send proposal ─────────────────────────────────────────────────────────────
  const handleSendProposal = async (proposalData: any) => {
    setComposingProposal(false)
    const { data: newProp } = await supabase.from('proposals').insert({
      ...proposalData,
      conversation_id: activeConv.id,
      created_by: user.id
    }).select().single()

    if (newProp) {
      setProposals(prev => [...prev, newProp])
      await supabase.from('conversations').update({ status: 'proposal_sent' }).eq('id', activeConv.id)
      setActiveConv({ ...activeConv, status: 'proposal_sent' })

      const { data: newMsg } = await supabase.from('messages').insert({
        conversation_id: activeConv.id,
        sender_id: user.id,
        content: newProp.id,
        message_type: 'proposal'
      }).select().single()

      if (newMsg) {
        setMessages(prev => [...prev, newMsg])
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)

        const other = getOtherParticipant(activeConv)
        if (other?.id) {
          supabase.from('notifications').insert({
            user_id: other.id,
            actor_id: user.id,
            type: 'proposal',
            title: `Nueva propuesta de intercambio de ${user.name || 'Usuario'}`,
            content: 'Tienes una propuesta de intercambio para revisar.',
            link: '/messages'
          }).then(() => {})
        }
      }
    }
  }

  // ── accept / reject proposal ──────────────────────────────────────────────────
  const handleAcceptProposal = async (prop: any) => {
    const { error } = await supabase.rpc('accept_proposal', { p_proposal_id: prop.id })
    if (!error) {
      setProposals(proposals.map(p => p.id === prop.id ? { ...p, status: 'accepted' } : p))
      setActiveConv({ ...activeConv, status: 'confirmed' })
      alert('¡Intercambio confirmado! Las fechas han sido bloqueadas y el acuerdo registrado.')

      const other = getOtherParticipant(activeConv)
      if (other?.id) {
        supabase.from('users').select('email, name').eq('id', other.id).maybeSingle()
          .then(({ data: userData }) => {
            if (userData?.email) {
              fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  to: userData.email,
                  subject: '¡Tu viaje fue aprobado!',
                  html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #f0ede8;border-radius:16px;background:white"><h2 style="color:#0f766e">¡Felicidades, ${userData.name || 'Huésped'}!</h2><p>Tu solicitud para <strong>${activeConv.properties?.title || 'la vivienda'}</strong> fue aprobada.</p><div style="margin-top:30px;text-align:center"><a href="https://wellhouse-mvp.vercel.app/dashboard?tab=exchanges" style="background:#0f766e;color:white;padding:12px 24px;text-decoration:none;border-radius:12px;font-weight:bold;display:inline-block">Ver en mi panel</a></div></div>`
                })
              }).catch(() => {})
            }

            supabase.from('notifications').insert({
              user_id: other.id,
              actor_id: user.id,
              type: 'proposal_accepted',
              title: '¡Tu viaje ha sido aprobado!',
              content: `El anfitrión aceptó tu propuesta para ${activeConv.properties?.title || 'la vivienda'}.`,
              link: '/dashboard?tab=exchanges'
            }).then(() => {})
          })
      }
    } else {
      alert('Error al aceptar la propuesta: ' + error.message)
    }
  }

  const handleRejectProposal = async (prop: any) => {
    const { error } = await supabase.from('proposals').update({ status: 'rejected' }).eq('id', prop.id)
    if (!error) {
      setProposals(proposals.map(p => p.id === prop.id ? { ...p, status: 'rejected' } : p))
      await supabase.from('conversations').update({ status: 'chatting' }).eq('id', activeConv.id)
      setActiveConv({ ...activeConv, status: 'chatting' })
    }
  }

  const handlePurchasePass = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cardNumber || !cardExpiry || !cardCvv || !user) return
    setPaying(true)
    await new Promise(r => setTimeout(r, 1500))
    const { error } = await supabase.from('users').update({ plan: 'monthly_pass' }).eq('id', user.id)
    setPaying(false)
    if (!error) {
      setUser({ ...user, plan: 'monthly_pass' })
      setShowPaymentModal(false)
      alert('¡Pase de Mensajería comprado! Ahora tienes acceso ilimitado durante un mes.')
    } else {
      alert('Error procesando pago: ' + error.message)
    }
  }

  const getOtherParticipant = (conv: any) => {
    if (!user) return null
    return conv.participant_a.id === user.id ? conv.participant_b : conv.participant_a
  }

  const renderStatus = () => {
    if (!activeConv) return null
    switch (activeConv.status) {
      case 'proposal_sent': return <div className="text-xs font-bold text-accent-cobalt bg-accent-cobalt/10 px-3 py-1 rounded-full">Propuesta enviada · esperando respuesta</div>
      case 'confirmed': return <div className="text-xs font-bold text-[#10b981] bg-[#10b981]/10 px-3 py-1 rounded-full flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Confirmado</div>
      case 'countered': return <div className="text-xs font-bold text-wellpoint-gold bg-wellpoint-gold/10 px-3 py-1 rounded-full">Contrapropuesta</div>
      default: return null
    }
  }

  // ── date separators for messages ──────────────────────────────────────────────
  const renderMessages = () => {
    let lastDate = ''
    return messages.map((m, idx) => {
      const isMe = m.sender_id === user?.id
      const msgDate = new Date(m.created_at).toDateString()
      const showDateSep = msgDate !== lastDate
      if (showDateSep) lastDate = msgDate

      const isLastFromMe = isMe && (idx === messages.length - 1 || messages[idx + 1]?.sender_id !== user?.id)

      if (m.message_type === 'proposal') {
        const prop = proposals.find(p => p.id === m.content)
        if (!prop) return null
        return (
          <div key={m.id}>
            {showDateSep && <DateSeparator label={formatDateLabel(m.created_at)} />}
            <div className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
              <ProposalCard
                proposal={prop}
                isMyProposal={isMe}
                onAccept={() => handleAcceptProposal(prop)}
                onReject={() => handleRejectProposal(prop)}
                onCounter={() => setComposingProposal(true)}
              />
            </div>
          </div>
        )
      }

      return (
        <div key={m.id}>
          {showDateSep && <DateSeparator label={formatDateLabel(m.created_at)} />}
          <div className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
            <div className="flex flex-col gap-0.5 max-w-[72%]">
              <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isMe ? 'bg-ink-teal-900 text-white rounded-br-sm' : 'bg-white border border-surface-mist-dark text-ink-teal-900 rounded-bl-sm shadow-sm'}`}>
                {m.content}
              </div>
              <div className={`flex items-center gap-1 text-[10px] text-gray-400 ${isMe ? 'justify-end pr-1' : 'pl-1'}`}>
                <span>{formatTime(m.created_at)}</span>
                {isMe && isLastFromMe && (
                  m.read_at
                    ? <CheckCheck className="w-3 h-3 text-[#0f766e]" />
                    : <Check className="w-3 h-3 text-gray-400" />
                )}
              </div>
            </div>
          </div>
        </div>
      )
    })
  }

  // ─── render ───────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-[calc(100vh-64px)] bg-surface-mist">

      {/* ── Conversation list ── */}
      <div className={`w-full md:w-80 lg:w-96 bg-white border-r border-surface-mist-dark flex flex-col flex-shrink-0 ${activeConv ? 'hidden md:flex' : 'flex'}`}>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-sm text-[#6b7280]">
              <MessageCircle className="w-10 h-10 mx-auto mb-3 text-gray-200" />
              <p>No tienes conversaciones aún.</p>
            </div>
          ) : (
            conversations.map(c => {
              const other = getOtherParticipant(c)
              const isPaid = other?.plan === 'monthly_pass'
              const unread = unreadMap[c.id] || 0
              const lastMsg = lastMsgMap[c.id]
              const isActive = activeConv?.id === c.id

              return (
                <button
                  key={c.id}
                  onClick={() => loadConversation(c)}
                  className={`w-full px-4 py-3.5 flex items-center gap-3 border-b border-surface-mist hover:bg-gray-50 transition text-left relative ${isActive ? 'bg-[#0f766e]/5 border-l-2 border-l-[#0f766e]' : ''}`}
                >
                  {/* Pin indicator for paid */}
                  {isPaid && (
                    <div className="absolute top-2 right-3 flex items-center gap-1 text-[9px] font-bold text-[#0f766e]">
                      <Pin className="w-2.5 h-2.5" /> PRIORITARIO
                    </div>
                  )}

                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                      {other?.avatar_url
                        ? <img src={other.avatar_url} alt="" className="w-full h-full object-cover" />
                        : <UserIcon className="w-6 h-6 text-gray-400" />}
                    </div>
                    {isPaid && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#0f766e] rounded-full flex items-center justify-center">
                        <span className="text-white text-[7px] font-bold">★</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 mt-3">
                    <div className="flex items-baseline justify-between">
                      <h4 className={`text-sm truncate ${unread > 0 ? 'font-bold text-ink-teal-900' : 'font-semibold text-ink-teal-900'}`}>
                        {other?.name || 'Usuario'}
                      </h4>
                      {lastMsg && (
                        <span className="text-[10px] text-gray-400 flex-shrink-0 ml-2">
                          {formatConvTime(lastMsg.created_at)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className={`text-xs truncate max-w-[180px] ${unread > 0 ? 'font-semibold text-ink-teal-900' : 'text-[#6b7280]'}`}>
                        {lastMsg?.content || c.properties?.title || 'Nueva conversación'}
                      </p>
                      {unread > 0 && (
                        <span className="flex-shrink-0 ml-2 min-w-[20px] h-5 bg-[#0f766e] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1.5">
                          {unread > 9 ? '9+' : unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* ── Chat area ── */}
      <div className={`flex-1 flex flex-col bg-surface-mist min-w-0 ${activeConv ? 'flex' : 'hidden md:flex'}`}>
        {activeConv ? (
          <>
            {/* Chat header */}
            <div className="bg-white px-4 py-3 border-b border-surface-mist-dark flex items-center justify-between shadow-sm z-10 flex-shrink-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setActiveConv(null); router.push('/messages') }}
                  className="md:hidden p-2 text-ink-teal-900 hover:bg-surface-mist rounded-full transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                  {getOtherParticipant(activeConv)?.avatar_url
                    ? <img src={getOtherParticipant(activeConv).avatar_url} alt="" className="w-full h-full object-cover" />
                    : <UserIcon className="w-5 h-5 text-gray-400" />}
                </div>
                <div>
                  <h2 className="font-semibold text-sm text-ink-teal-900 leading-tight">
                    {getOtherParticipant(activeConv)?.name || 'Usuario'}
                  </h2>
                  <p className="text-[11px] text-[#6b7280] truncate max-w-[180px] md:max-w-none">
                    {activeConv.properties?.title || 'Sin propiedad'}
                  </p>
                </div>
              </div>
              <div>{renderStatus()}</div>
            </div>

            {/* Exchange dates banner */}
            {activeExchange && (
              <div className="bg-[#f0fdf9] border-b border-[#0f766e]/15 px-4 py-2 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2">
                  <CalIcon className="w-3.5 h-3.5 text-[#0f766e] flex-shrink-0" />
                  <p className="text-[11px] text-ink-teal-900">
                    <span className="font-semibold">Intercambio:</span>{' '}
                    {new Date(activeExchange.checkin_date).toLocaleDateString('es-ES')} → {new Date(activeExchange.checkout_date).toLocaleDateString('es-ES')} · {activeExchange.nights} noches
                  </p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${activeExchange.status === 'confirmed' ? 'bg-[#10b981]/10 text-[#10b981]' : 'bg-surface-mist text-[#0f766e]'}`}>
                  {activeExchange.status === 'pending' ? 'Pendiente' : activeExchange.status === 'confirmed' ? 'Confirmado' : activeExchange.status}
                </span>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-1">
              <div className="flex items-center justify-center gap-1.5 text-center text-[10px] text-[#9ca3af] mb-3">
                <ShieldCheck className="w-3 h-3 text-[#0f766e]" />
                <span>Conversación protegida por la Garantía Wellhouse</span>
              </div>

              {renderMessages()}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="flex-shrink-0 bg-white border-t border-surface-mist-dark">
              {composingProposal && (
                <ProposalComposer
                  property={activeConv.properties}
                  isHost={activeConv.properties?.user_id === user?.id}
                  onCancel={() => setComposingProposal(false)}
                  onSubmit={handleSendProposal}
                />
              )}

              {!(activeConv?.properties?.user_id === user?.id) &&
               messages.filter(m => m.sender_id === user?.id).length >= 1 &&
               user?.plan !== 'monthly_pass' ? (
                <div className="p-4 bg-surface-mist border-t border-[#0f766e]/20">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink-teal-900 text-sm flex items-center gap-1.5">
                        <MessageCircle className="w-4 h-4 text-[#0f766e]" /> Pase de Mensajería Requerido
                      </p>
                      <p className="text-xs text-text-muted-custom mt-0.5 leading-normal">
                        Tu primer mensaje fue gratis. Adquiere el Pase Mensual por <strong>$4 USD</strong> para continuar.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowPaymentModal(true)}
                      className="w-full sm:w-auto flex-shrink-0 bg-[#0f766e] text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-sm hover:bg-[#0d635c] transition-all"
                    >
                      Comprar Pase ($4 USD)
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSend} className="p-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setComposingProposal(true)}
                    className="flex-shrink-0 w-10 h-10 flex items-center justify-center text-[#6b7280] hover:bg-surface-mist rounded-full transition"
                    title="Armar propuesta de intercambio"
                  >
                    <CalIcon className="w-5 h-5" />
                  </button>
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-[#0f766e]/30 focus:border-[#0f766e]"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-[#0f766e] text-white rounded-full hover:bg-[#0d635c] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[#6b7280] gap-3">
            <div className="w-16 h-16 rounded-2xl bg-surface-mist-dark flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-[#0f766e]/30" />
            </div>
            <p className="text-sm font-medium">Selecciona una conversación</p>
          </div>
        )}
      </div>

      {/* ── Payment Modal ── */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-surface-mist-dark">
            <button onClick={() => setShowPaymentModal(false)} className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5 text-gray-400" />
            </button>
            <div className="text-center mb-6">
              <div className="w-14 h-14 mx-auto bg-[#0f766e]/10 rounded-2xl flex items-center justify-center mb-3">
                <MessageCircle className="w-7 h-7 text-[#0f766e]" />
              </div>
              <h3 className="font-fraunces font-bold text-xl text-ink-teal-900">Pasarela de Pago de Prueba</h3>
              <p className="text-xs text-text-muted-custom mt-1">Pase Mensual de Chat · <strong>$4.00 USD</strong></p>
            </div>
            <form onSubmit={handlePurchasePass} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink-teal-900 mb-1">Nombre en la tarjeta</label>
                <input type="text" required placeholder="Ej: Camilo Gómez" className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-base md:text-sm focus:outline-none focus:border-[#0f766e] focus:ring-1 focus:ring-[#0f766e] bg-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink-teal-900 mb-1">Número de tarjeta</label>
                <input type="text" required maxLength={19} placeholder="4000 1234 5678 9010" value={cardNumber} onChange={e => setCardNumber(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim())} className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-base md:text-sm focus:outline-none focus:border-[#0f766e] focus:ring-1 focus:ring-[#0f766e] bg-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink-teal-900 mb-1">Expiración</label>
                  <input type="text" required maxLength={5} placeholder="MM/AA" value={cardExpiry} onChange={e => setCardExpiry(e.target.value)} className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-base md:text-sm focus:outline-none focus:border-[#0f766e] focus:ring-1 focus:ring-[#0f766e] bg-white text-center" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink-teal-900 mb-1">CVV</label>
                  <input type="password" required maxLength={4} placeholder="123" value={cardCvv} onChange={e => setCardCvv(e.target.value)} className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-base md:text-sm focus:outline-none focus:border-[#0f766e] focus:ring-1 focus:ring-[#0f766e] bg-white text-center" />
                </div>
              </div>
              <div className="pt-2">
                <button type="submit" disabled={paying} className="w-full py-3 bg-[#0f766e] hover:bg-[#0d635c] text-white font-bold text-sm rounded-2xl transition-colors shadow-sm disabled:opacity-50">
                  {paying ? 'Procesando...' : 'Pagar $4.00 USD'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── small components ────────────────────────────────────────────────────────

function DateSeparator({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-3">
      <div className="flex-1 h-px bg-gray-200" />
      <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap bg-surface-mist px-2">{label}</span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  )
}
