'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useChat } from '@ai-sdk/react'
import { usePathname, useSearchParams } from 'next/navigation'

export default function WellBotBubble() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Determinar el contexto de la página
  const getPageContext = () => {
    const path = pathname || ''
    if (path === '/') return { page: 'home', details: 'Buscando inspiración' }
    if (path.startsWith('/search')) return { page: 'search', filters: searchParams?.toString() }
    if (path.startsWith('/properties/')) {
      const id = path.split('/')[2]
      return { page: 'property_detail', property_id: id }
    }
    if (path.startsWith('/messages')) return { page: 'messages_center' }
    if (path.startsWith('/dashboard')) return { page: 'dashboard' }
    return { page: 'unknown', path }
  }

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    body: {
      page_context: getPageContext()
    }
  })

  // Auto-scroll al fondo cuando hay nuevos mensajes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  return (
    <div className="fixed bottom-6 right-6 z-50 font-inter">
      {/* Botón flotante */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-primary-cobalt text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-primary-cobalt/30"
          aria-label="Abrir WellBot"
        >
          <span className="text-2xl">🤖</span>
        </button>
      )}

      {/* Panel del Chat */}
      {isOpen && (
        <div className="w-96 max-w-[calc(100vw-2rem)] h-[500px] max-h-[calc(100vh-4rem)] bg-white rounded-[24px] shadow-2xl border border-surface-mist-dark flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          
          {/* Header */}
          <div className="bg-primary-cobalt text-white p-4 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">
                🤖
              </div>
              <div>
                <h3 className="font-fraunces font-bold text-lg leading-tight">WellBot</h3>
                <p className="text-xs text-white/80 font-medium">Asistente Inteligente</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-2 focus:outline-none transition-colors"
              aria-label="Cerrar chat"
            >
              ✕
            </button>
          </div>

          {/* Área de mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface-mist/30">
            {messages.length === 0 ? (
              <div className="text-center mt-10">
                <span className="text-4xl mb-3 block">👋</span>
                <p className="text-sm text-ink-teal-700">¡Hola! Soy WellBot.</p>
                <p className="text-xs text-text-muted-custom mt-2 px-6">
                  Puedo ayudarte a buscar casas, entender tus WellPoints, o explicarte cómo funciona la plataforma.
                </p>
              </div>
            ) : (
              messages.map(m => (
                <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                  {m.role === 'assistant' && (
                    <span className="text-[10px] text-text-muted-custom ml-1 mb-1 font-bold">WellBot</span>
                  )}
                  <div
                    className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm ${
                      m.role === 'user'
                        ? 'bg-primary-cobalt text-white rounded-br-none'
                        : 'bg-white text-ink-teal-900 border border-surface-mist-dark rounded-tl-none shadow-sm'
                    }`}
                  >
                    {m.content}
                    
                    {/* Render tool invocations si es necesario (el AI SDK ya maneja el texto final, esto es opcional) */}
                    {m.toolInvocations?.map(tool => (
                      <div key={tool.toolCallId} className="mt-2 text-[10px] bg-surface-mist p-2 rounded-lg text-text-muted-custom font-mono">
                        {tool.state === 'result' ? `✓ Consultó: ${tool.toolName}` : `⏳ Consultando: ${tool.toolName}...`}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
            
            {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
              <div className="flex items-start">
                <div className="bg-white text-ink-teal-900 border border-surface-mist-dark rounded-2xl rounded-tl-none shadow-sm px-4 py-3 flex gap-1">
                  <div className="w-2 h-2 bg-text-muted-custom/50 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-text-muted-custom/50 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-text-muted-custom/50 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-surface-mist-dark shrink-0">
            <form onSubmit={handleSubmit} className="relative flex items-center">
              <input
                value={input}
                onChange={handleInputChange}
                placeholder="Escribe tu pregunta..."
                className="w-full bg-surface-mist border-none rounded-full py-3 pl-4 pr-12 text-sm text-ink-teal-900 focus:ring-2 focus:ring-primary-cobalt/50 outline-none transition-all placeholder:text-text-muted-custom"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="absolute right-2 w-8 h-8 flex items-center justify-center bg-primary-cobalt text-white rounded-full hover:bg-primary-cobalt/90 disabled:opacity-50 disabled:bg-text-muted-custom transition-colors focus:outline-none"
              >
                ↑
              </button>
            </form>
            <p className="text-[9px] text-center text-text-muted-custom mt-2">
              WellBot puede cometer errores. Verifica información importante.
            </p>
          </div>

        </div>
      )}
    </div>
  )
}
