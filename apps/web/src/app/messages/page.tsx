'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [messages, setMessages] = useState([
    { id: '1', sender: 'other', text: 'Hola, me interesa tu vivienda para el mes de julio. ¿Está disponible?', time: '10:30 AM' },
    { id: '2', sender: 'me', text: '¡Hola! Sí, está disponible desde el 15 de julio hasta el 31 de julio.', time: '10:35 AM' },
    { id: '3', sender: 'other', text: 'Perfecto. ¿Cuántos WellPoints serían para 7 noches?', time: '10:40 AM' },
    { id: '4', sender: 'me', text: 'Serían 350 WellPoints. ¿Te gustaría proceder con la solicitud?', time: '10:45 AM' },
    { id: '5', sender: 'other', text: 'Sí, me gustaría. ¿Cómo puedo hacer la solicitud?', time: '10:50 AM' },
  ])

  const conversations = [
    {
      id: '1',
      user: {
        name: 'Juan Rodríguez',
        avatar: 'J',
        verified: true
      },
      property: {
        id: '2',
        title: 'Casa con jardín en Barcelona',
        image: '/images/property-2.jpg'
      },
      lastMessage: 'Hola, me interesa tu vivienda para el mes de julio. ¿Está disponible?',
      time: '10:30 AM',
      unread: 2
    },
    {
      id: '2',
      user: {
        name: 'Ana Martínez',
        avatar: 'A',
        verified: true
      },
      property: {
        id: '3',
        title: 'Apartamento en Valencia',
        image: '/images/property-3.jpg'
      },
      lastMessage: 'Gracias por la información. Me pondré en contacto pronto.',
      time: 'Ayer',
      unread: 0
    },
    {
      id: '3',
      user: {
        name: 'Carlos López',
        avatar: 'C',
        verified: false
      },
      property: {
        id: '4',
        title: 'Loft en Málaga',
        image: '/images/property-4.jpg'
      },
      lastMessage: '¿Podrías enviarme más fotos de la cocina?',
      time: '2 días',
      unread: 0
    }
  ]

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversation) return

    const messageText = newMessage
    setNewMessage('') // Limpiar el input inmediatamente

    try {
      // Add message to local state
      const messageObj = {
        id: String(messages.length + 1),
        sender: 'me' as const,
        text: messageText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages([...messages, messageObj])

      // Save to Supabase (if you have the messages table set up)
      // Uncomment when you have the proper database structure
      /*
      const { error } = await supabase.from('messages').insert({
        conversation_id: selectedConversation,
        sender_id: 'current-user-id',
        text: messageText,
      })
      if (error) throw error
      */
    } catch (error) {
      console.error('Error sending message:', error)
      setNewMessage(messageText) // Restaurar el texto si hay error
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Mensajes</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="grid lg:grid-cols-3 h-[calc(100vh-200px)]">
            {/* Conversations List */}
            <div className="border-r">
              <div className="p-4 border-b">
                <input
                  type="text"
                  placeholder="Buscar conversaciones..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="overflow-y-auto h-[calc(100%-73px)]">
                {conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation.id)}
                    className={`w-full p-4 border-b hover:bg-gray-50 text-left ${
                      selectedConversation === conversation.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xl font-bold text-blue-600">{conversation.user.avatar}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold truncate">{conversation.user.name}</h3>
                          <span className="text-xs text-gray-500">{conversation.time}</span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                        {conversation.unread > 0 && (
                          <span className="inline-block mt-1 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                            {conversation.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            {selectedConversation ? (
              <div className="lg:col-span-2 flex flex-col">
                {/* Chat Header */}
                <div className="p-4 border-b flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold text-blue-600">
                        {conversations.find(c => c.id === selectedConversation)?.user.avatar}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        {conversations.find(c => c.id === selectedConversation)?.user.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {conversations.find(c => c.id === selectedConversation)?.property.title}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/properties/${conversations.find(c => c.id === selectedConversation)?.property.id}`}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Ver vivienda
                  </Link>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.sender === 'me'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                        <p className={`text-xs mt-1 ${message.sender === 'me' ? 'text-blue-100' : 'text-gray-500'}`}>
                          {message.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t">
                  <form onSubmit={handleSendMessage} className="flex gap-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Escribe un mensaje..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button 
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      Enviar
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="lg:col-span-2 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p>Selecciona una conversación para comenzar</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
