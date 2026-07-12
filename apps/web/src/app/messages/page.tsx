'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

function MessagesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeChatId = searchParams.get('chat')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [conversations, setConversations] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)

  // 1. Authenticate user & load conversations list
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setCurrentUser(user)

      try {
        const { data: convData } = await supabase
          .from('conversations')
          .select('*')
          .or(`user_one_id.eq.${user.id},user_two_id.eq.${user.id}`)
          .order('updated_at', { ascending: false })

        if (convData) {
          const mapped = convData.map((c) => {
            const isUserOne = c.user_one_id === user.id
            const otherUserId = isUserOne ? c.user_two_id : c.user_one_id
            return {
              ...c,
              otherUserId,
              displayName: `Usuario #${otherUserId.substring(0, 5)}`,
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

  // 2. Load and subscribe to messages of the active chat
  useEffect(() => {
    if (!activeChatId || !currentUser) return

    const loadMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', activeChatId)
        .order('created_at', { ascending: true })
      setMessages(data || [])
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    }

    loadMessages()

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

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeChatId || !currentUser || sending) return

    setSending(true)
    const content = newMessage.trim()
    setNewMessage('')

    const { error } = await supabase
      .from('messages')
      .insert({
        conversation_id: activeChatId,
        sender_id: currentUser.id,
        content: content
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-blue-600 font-bold text-xl">Wellhouse</Link>
          <span className="text-gray-300">|</span>
          <h1 className="text-lg font-semibold text-gray-800">Mensajes</h1>
        </div>
        <Link href="/dashboard" className="text-sm font-semibold text-blue-600 hover:underline">
          Ir a mi Dashboard
        </Link>
      </div>

      {/* Main Grid Layout */}
      <div className="flex-1 flex overflow-hidden">
        {conversations.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white m-4 rounded-xl shadow-sm">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
              <span className="text-3xl">💬</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No tienes conversaciones activas</h2>
            <p className="text-gray-500 mb-6 text-center max-w-sm">
              Contacta a otros anfitriones desde sus propiedades publicadas para iniciar un chat.
            </p>
            <Link href="/search" className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Explorar propiedades
            </Link>
          </div>
        ) : (
          <>
            {/* Sidebar */}
            <div className="w-80 bg-white border-r flex flex-col overflow-y-auto">
              <div className="p-4 border-b shrink-0">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tus Conversaciones</p>
              </div>
              <div className="flex-1 divide-y divide-gray-100">
                {conversations.map((c) => {
                  const isActive = c.id === activeChatId
                  return (
                    <button
                      key={c.id}
                      onClick={() => router.push(`/messages?chat=${c.id}`)}
                      className={`w-full text-left p-4 flex items-center gap-3 transition-colors ${isActive ? 'bg-blue-50/70 border-l-4 border-blue-600' : 'hover:bg-gray-50'}`}
                    >
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-blue-600">
                          {c.displayName.charAt(0)}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 truncate text-sm">{c.displayName}</p>
                        <p className="text-xs text-gray-400 truncate">Ver conversación</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Chat Room */}
            <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
              {activeChat ? (
                <>
                  <div className="bg-white border-b px-6 py-3 flex items-center gap-3 shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-600">{activeChat.displayName.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-800">{activeChat.displayName}</p>
                      <p className="text-xs text-green-600">Canal de chat directo</p>
                    </div>
                  </div>

                  <div className="flex-1 p-6 overflow-y-auto space-y-4">
                    {messages.map((m) => {
                      const isMe = m.sender_id === currentUser.id
                      return (
                        <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[70%] rounded-xl px-4 py-2 text-sm shadow-sm ${
                            isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
                          }`}>
                            <p className="break-words leading-relaxed">{m.content}</p>
                            <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                              {new Date(m.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  <form onSubmit={handleSend} className="p-4 bg-white border-t flex gap-3 shrink-0">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Escribe tu mensaje..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || sending}
                      className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                    >
                      {sending ? '...' : 'Enviar'}
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                  Selecciona una conversación para chatear.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <MessagesContent />
    </Suspense>
  )
}
