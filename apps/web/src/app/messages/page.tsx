'use client'

import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Send, Search, ShieldCheck, Sparkles, User as UserIcon, Calendar as CalIcon } from 'lucide-react'
import ProposalCard from '@/components/messaging/ProposalCard'
import ProposalComposer from '@/components/messaging/ProposalComposer'

export default function MessagesPage() {
  const [user, setUser] = useState<any>(null)
  const [conversations, setConversations] = useState<any[]>([])
  const [activeConv, setActiveConv] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [proposals, setProposals] = useState<any[]>([])
  const [input, setInput] = useState("")
  const [composingProposal, setComposingProposal] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user)
        fetchConversations(data.user.id)
      }
    })
  }, [])

  const fetchConversations = async (userId: string) => {
    const { data } = await supabase
      .from("conversations")
      .select("*, participant_a(id, name, avatar_url, trust_index), participant_b(id, name, avatar_url, trust_index), properties(id, title, city, wp_price)")
      .or(`participant_a.eq.${userId},participant_b.eq.${userId}`)
      .order("created_at", { ascending: false })
    if (data) setConversations(data)
  }

  const loadConversation = async (conv: any) => {
    setActiveConv(conv)
    setComposingProposal(false)
    const { data: msgs } = await supabase.from("messages").select("*").eq("conversation_id", conv.id).order("created_at", { ascending: true })
    if (msgs) setMessages(msgs)
    
    const { data: props } = await supabase.from("proposals").select("*").eq("conversation_id", conv.id).order("created_at", { ascending: true })
    if (props) setProposals(props)

    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !activeConv || !user) return
    const txt = input.trim()
    setInput("")
    
    const { data: newMsg } = await supabase.from("messages").insert({
      conversation_id: activeConv.id,
      sender_id: user.id,
      content: txt,
      message_type: "text"
    }).select().single()

    if (newMsg) {
      setMessages([...messages, newMsg])
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100)
    }
  }

  const handleSendProposal = async (proposalData: any) => {
    setComposingProposal(false)
    const { data: newProp } = await supabase.from("proposals").insert({
      ...proposalData,
      conversation_id: activeConv.id,
      created_by: user.id
    }).select().single()

    if (newProp) {
      setProposals([...proposals, newProp])
      await supabase.from("conversations").update({ status: "proposal_sent" }).eq("id", activeConv.id)
      setActiveConv({ ...activeConv, status: "proposal_sent" })
      
      const { data: newMsg } = await supabase.from("messages").insert({
        conversation_id: activeConv.id,
        sender_id: user.id,
        content: newProp.id,
        message_type: "proposal"
      }).select().single()
      if (newMsg) {
        setMessages([...messages, newMsg])
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100)
      }
    }
  }

  const handleAcceptProposal = async (prop: any) => {
    const { error } = await supabase.rpc("accept_proposal", { p_proposal_id: prop.id })
    if (!error) {
      setProposals(proposals.map(p => p.id === prop.id ? { ...p, status: "accepted" } : p))
      setActiveConv({ ...activeConv, status: "confirmed" })
      alert("¡Intercambio confirmado! Las fechas han sido bloqueadas y el acuerdo registrado.")
    } else {
      alert("Error al aceptar la propuesta: " + error.message)
    }
  }

  const handleRejectProposal = async (prop: any) => {
    const { error } = await supabase.from("proposals").update({ status: "rejected" }).eq("id", prop.id)
    if (!error) {
      setProposals(proposals.map(p => p.id === prop.id ? { ...p, status: "rejected" } : p))
      await supabase.from("conversations").update({ status: "chatting" }).eq("id", activeConv.id)
      setActiveConv({ ...activeConv, status: "chatting" })
    }
  }

  const getOtherParticipant = (conv: any) => {
    if (!user) return null
    return conv.participant_a.id === user.id ? conv.participant_b : conv.participant_a
  }

  const renderStatus = () => {
    if (!activeConv) return null
    switch(activeConv.status) {
      case "proposal_sent": return <div className="text-xs font-bold text-accent-cobalt bg-accent-cobalt/10 px-3 py-1 rounded-full">Propuesta enviada · esperando respuesta</div>
      case "confirmed": return <div className="text-xs font-bold text-[#10b981] bg-[#10b981]/10 px-3 py-1 rounded-full flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> Intercambio confirmado</div>
      case "countered": return <div className="text-xs font-bold text-wellpoint-gold bg-wellpoint-gold/10 px-3 py-1 rounded-full">Contrapropuesta recibida</div>
      default: return <div className="text-xs font-medium text-[#6b7280]">Conversando</div>
    }
  }

  return (
    <div className="flex h-[calc(100vh-72px)] bg-surface-mist pt-[72px]">
      <div className="w-full md:w-80 bg-white border-r border-surface-mist-dark flex flex-col hidden md:flex">
        <div className="p-4 border-b border-surface-mist-dark">
          <h1 className="text-xl font-fraunces font-bold text-ink-teal-900">Mensajes</h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-sm text-[#6b7280]">No tienes conversaciones aún.</div>
          ) : (
            conversations.map(c => {
              const other = getOtherParticipant(c)
              return (
                <button
                  key={c.id}
                  onClick={() => loadConversation(c)}
                  className={`w-full p-4 flex items-start gap-3 border-b border-surface-mist hover:bg-surface-mist transition text-left ${activeConv?.id === c.id ? "bg-surface-mist-dark" : ""}`}
                >
                  <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {other?.avatar_url ? <img src={other.avatar_url} alt="" className="w-full h-full object-cover" /> : <UserIcon className="w-5 h-5 text-gray-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-ink-teal-900 truncate">{other?.name || "Usuario"}</h4>
                    <p className="text-xs text-[#6b7280] truncate">{c.properties?.title || "Sin propiedad"}</p>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-surface-mist">
        {activeConv ? (
          <>
            <div className="bg-white px-6 py-4 border-b border-surface-mist-dark flex items-center justify-between shadow-sm z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                  {getOtherParticipant(activeConv)?.avatar_url ? (
                    <img src={getOtherParticipant(activeConv).avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div>
                  <h2 className="font-fraunces font-bold text-lg text-ink-teal-900">
                    {getOtherParticipant(activeConv)?.name || "Usuario"}
                  </h2>
                  <div className="text-xs text-[#6b7280] flex items-center gap-2">
                    <span>Índice: {getOtherParticipant(activeConv)?.trust_index || 0}●</span>
                    <span>·</span>
                    <span className="truncate max-w-[200px]">{activeConv.properties?.title}</span>
                  </div>
                </div>
              </div>
              <div>{renderStatus()}</div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
              <div className="text-center text-xs text-[#6b7280] mb-4">
                🔒 Toda esta conversación está protegida por la Garantía Wellhouse
              </div>
              
              {messages.map((m) => {
                const isMe = m.sender_id === user?.id
                if (m.message_type === "proposal") {
                  const prop = proposals.find(p => p.id === m.content)
                  if (!prop) return null
                  return (
                    <div key={m.id} className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}>
                      <ProposalCard
                        proposal={prop}
                        isMyProposal={isMe}
                        onAccept={() => handleAcceptProposal(prop)}
                        onReject={() => handleRejectProposal(prop)}
                        onCounter={() => {
                          setComposingProposal(true)
                        }}
                      />
                    </div>
                  )
                }

                return (
                  <div key={m.id} className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${isMe ? "bg-ink-teal-900 text-white rounded-br-none" : "bg-white border border-surface-mist-dark text-ink-teal-900 rounded-bl-none"}`}>
                      {m.content}
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="flex flex-col">
              {composingProposal && (
                <ProposalComposer
                  property={activeConv.properties}
                  onCancel={() => setComposingProposal(false)}
                  onSubmit={handleSendProposal}
                />
              )}
              <div className="bg-white p-4 border-t border-surface-mist-dark">
                <form onSubmit={handleSend} className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setComposingProposal(true)}
                    className="p-3 text-text-muted-custom hover:bg-surface-mist rounded-xl transition"
                    title="Armar propuesta"
                  >
                    <CalIcon className="w-5 h-5" />
                  </button>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 px-4 py-3 bg-surface-mist border border-surface-mist-dark rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ink-teal-900/20 focus:border-ink-teal-900"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="p-3 bg-accent-cobalt text-white rounded-xl hover:bg-opacity-90 transition disabled:opacity-50"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[#6b7280]">
            <Sparkles className="w-12 h-12 mb-4 text-surface-mist-dark" />
            <p className="text-sm">Selecciona una conversación para empezar a hablar.</p>
          </div>
        )}
      </div>
    </div>
  )
}
