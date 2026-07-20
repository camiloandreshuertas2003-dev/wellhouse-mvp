'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useChat } from '@ai-sdk/react'
import { usePathname, useSearchParams } from 'next/navigation'
import { X, Send, Bot, Sparkles } from 'lucide-react'

// Render markdown-lite: bold (**text**) and links
function renderBotText(text: string) {
  const lines = text.split('\n')
  return lines.map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/)
    const rendered = parts.map((part, j) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={j} className="font-semibold">{part.slice(2, -2)}</strong>
      }
      const linkMatch = part.match(/\[([^\]]+)\]\(([^)]+)\)/)
      if (linkMatch) {
        const [full, label, href] = linkMatch
        const before = part.slice(0, part.indexOf(full))
        const after = part.slice(part.indexOf(full) + full.length)
        return (
          <span key={j}>
            {before}
            <a href={href} className="text-[#f59e0b] underline underline-offset-2 hover:opacity-80" target={href.startsWith('http') ? '_blank' : undefined}>
              {label}
            </a>
            {after}
          </span>
        )
      }
      return <span key={j}>{part}</span>
    })
    return <span key={i}>{rendered}{i < lines.length - 1 && <br />}</span>
  })
}

const QUICK_PROMPTS = [
  'Fincas en el Eje Cafetero',
  'Casas en la Costa',
  'Apartamentos en Bogotá',
  '¿Cómo gano WellPoints?',
]

function WellBotBubbleContent() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Draggable state for mobile
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null)
  const isDragging = useRef(false)
  const dragStart = useRef({ x: 0, y: 0, btnX: 0, btnY: 0 })

  const initPosition = () => {
    if (typeof window === 'undefined') return
    setPosition({ x: window.innerWidth - 72, y: window.innerHeight - 160 })
  }

  useEffect(() => {
    if (typeof window !== 'undefined') initPosition()
    const onResize = () => initPosition()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const onTouchStart = (e: React.TouchEvent) => {
    if (isOpen) return
    const touch = e.touches[0]
    isDragging.current = false
    dragStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      btnX: position?.x ?? 0,
      btnY: position?.y ?? 0
    }
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (isOpen) return
    const touch = e.touches[0]
    const dx = touch.clientX - dragStart.current.x
    const dy = touch.clientY - dragStart.current.y
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      isDragging.current = true
      e.preventDefault()
      const newX = Math.max(8, Math.min(window.innerWidth - 64, dragStart.current.btnX + dx))
      const newY = Math.max(80, Math.min(window.innerHeight - 100, dragStart.current.btnY + dy))
      setPosition({ x: newX, y: newY })
    }
  }

  const onTouchEnd = () => {
    if (!isDragging.current) {
      setIsOpen(o => !o)
    }
    isDragging.current = false
  }

  // Page context for smarter AI responses
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
    if (path.startsWith('/exchanges')) return { page: 'exchanges' }
    return { page: 'other', path }
  }

  const [input, setInput] = useState('')
  const { messages, append, isLoading } = useChat({
    api: '/api/chat',
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: '¡Hola! Soy **WellBot**, tu asistente de Wellhouse.\n\nPuedo ayudarte a:\n• Encontrar viviendas por ciudad o región\n• Entender cómo funcionan los WellPoints\n• Guiarte para publicar tu vivienda\n\n¿Qué buscas hoy?'
      }
    ],
    body: { page_context: getPageContext() }
  })

  // Auto-scroll al fondo cuando hay nuevos mensajes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // Don't render until position is computed client-side
  if (!position) return null

  // On property detail page the bar is at bottom-[72px], so offset above it on mobile
  const isPropertyPage = (pathname || '').startsWith('/properties/')

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          ref={buttonRef}
          onClick={() => { if (!isDragging.current) setIsOpen(true) }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          className="fixed z-[70] w-14 h-14 bg-[#0f766e] text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-[#0f766e]/30 cursor-grab active:cursor-grabbing select-none touch-none"
          style={{ left: `${position.x}px`, top: `${position.y}px` }}
          aria-label="Abrir WellBot asistente"
        >
          <Bot className="w-6 h-6" />
          {/* Ping indicator */}
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-[#f59e0b] rounded-full border-2 border-white" />
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div
          className="fixed z-[70] inset-0 md:inset-auto md:bottom-6 md:right-6 font-inter"
          role="dialog"
          aria-label="WellBot asistente"
          aria-modal="true"
        >
          {/* Mobile backdrop */}
          <div
            className="md:hidden absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          <div
            className={`relative md:static flex flex-col bg-white overflow-hidden shadow-2xl
              /* Mobile: sheet from bottom */
              absolute bottom-0 left-0 right-0 rounded-t-[24px] max-h-[90vh]
              md:rounded-[20px] md:w-[380px] md:h-[540px] md:max-h-none md:bottom-auto md:left-auto
              ${isPropertyPage ? 'pb-[env(safe-area-inset-bottom,0px)]' : ''}
            `}
          >
            {/* Header */}
            <div className="bg-[#0f766e] text-white px-4 py-3.5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-fraunces font-bold text-base leading-tight">WellBot</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                    <p className="text-[11px] text-white/80">Asistente Inteligente</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white p-1.5 focus:outline-none transition-colors rounded-full hover:bg-white/10"
                aria-label="Cerrar WellBot"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f8fafb]">
              {messages.map(m => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-full bg-[#0f766e]/10 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5 text-[#0f766e]" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-[#0f766e] text-white rounded-br-sm'
                        : 'bg-white text-[#1a2e2e] border border-gray-100 rounded-bl-sm shadow-sm'
                    }`}
                  >
                    {m.role === 'assistant' ? renderBotText(m.content) : m.content}
                    {m.toolInvocations?.map((tool: any) => (
                      <div key={tool.toolCallId} className="mt-2 text-[10px] bg-gray-50 p-1.5 rounded text-gray-500 font-mono border border-gray-200">
                        {'result' in tool ? `Consultó: ${tool.toolName}` : `Consultando: ${tool.toolName}...`}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#0f766e]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-[#0f766e]" />
                  </div>
                  <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm shadow-sm px-4 py-3 flex gap-1 items-center">
                    {[0, 1, 2].map(i => (
                      <span
                        key={i}
                        className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 150}ms` }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick prompts - show when only welcome message */}
            {messages.length <= 1 && (
              <div className="px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-none shrink-0 bg-[#f8fafb]">
                {QUICK_PROMPTS.map(prompt => (
                  <button
                    key={prompt}
                    onClick={() => {
                      append({ role: 'user', content: prompt })
                    }}
                    className="flex-shrink-0 bg-white border border-gray-200 text-[#0f766e] font-inter text-xs px-3 py-2 rounded-full hover:border-[#0f766e] hover:bg-[#f0fdfa] transition-all whitespace-nowrap shadow-sm"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-4 py-3 bg-white border-t border-gray-100 shrink-0">
              <form onSubmit={(e) => {
                e.preventDefault();
                if (input.trim() && !isLoading) {
                  append({ role: 'user', content: input });
                  setInput('');
                }
              }} className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Escribe tu pregunta..."
                  className="flex-1 bg-[#f8fafb] border border-gray-200 rounded-full py-2.5 px-4 text-sm text-[#1a2e2e] focus:ring-2 focus:ring-[#0f766e]/30 focus:border-[#0f766e] outline-none transition-all placeholder:text-gray-400"
                  disabled={isLoading}
                  style={{ fontSize: '16px' }} /* prevent iOS zoom */
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-[#0f766e] text-white rounded-full hover:bg-[#0d635c] disabled:opacity-40 disabled:bg-gray-300 transition-colors focus:outline-none"
                  aria-label="Enviar mensaje"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <p className="text-[10px] text-center text-gray-400 mt-2">
                WellBot puede cometer errores. Verifica la información importante.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default function WellBotBubble() {
  return (
    <React.Suspense fallback={null}>
      <WellBotBubbleContent />
    </React.Suspense>
  )
}
