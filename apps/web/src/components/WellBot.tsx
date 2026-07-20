'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'

const WELCOME = '¡Hola! Soy **WellBot**, tu asistente de Wellhouse 🏡\n\nPuedo ayudarte a:\n• Encontrar viviendas por ciudad o región\n• Entender cómo funcionan los WellPoints\n• Guiarte para publicar tu vivienda\n\n¿Qué buscas hoy?'

const QUICK_PROMPTS = [
  '🌾 Fincas en el Eje Cafetero',
  '🌊 Casas en la Costa',
  '🏙️ Apartamentos en Bogotá',
  '✨ ¿Cómo gano WellPoints?',
]

// Real LLM endpoint logic is now handled via useChat hooks from ai/react

// Render markdown-lite: bold (**text**) and links ([text](url))
function renderBotText(text: string) {
  const lines = text.split('\n')
  return lines.map((line, i) => {
    // Replace **bold**
    const parts = line.split(/(\*\*[^*]+\*\*)/)
    const rendered = parts.map((part, j) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={j} className="font-semibold">{part.slice(2, -2)}</strong>
      }
      // Replace [text](url)
      const linkMatch = part.match(/\[([^\]]+)\]\(([^)]+)\)/)
      if (linkMatch) {
        const [full, label, href] = linkMatch
        const before = part.slice(0, part.indexOf(full))
        const after = part.slice(part.indexOf(full) + full.length)
        return (
          <span key={j}>
            {before}
            <a href={href} className="text-accent-mango underline underline-offset-2 hover:text-accent-mango-hover" target={href.startsWith('http') ? '_blank' : undefined}>
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

interface WellBotProps {
  isOpen?: boolean;
  onClose?: () => void;
  initialMessage?: string;
}

export default function WellBot({ isOpen: externalIsOpen, onClose, initialMessage }: WellBotProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = externalIsOpen !== undefined ? externalIsOpen : internalOpen;
  
  const handleSetOpen = (newState: boolean) => {
    if (externalIsOpen === undefined) {
      setInternalOpen(newState);
    } else if (!newState && onClose) {
      onClose();
    }
  };

  const [input, setInput] = useState('');
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value);
  const { messages, setMessages, append, isLoading } = useChat({
    api: '/api/chat',
    initialMessages: [
      { id: 'welcome', role: 'assistant', content: initialMessage || WELCOME }
    ]
  });

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialMessage && messages.length === 1 && messages[0].content !== initialMessage) {
      setMessages([{ id: 'welcome', role: 'assistant', content: initialMessage }]);
    }
  }, [initialMessage]);

  useEffect(() => {
    const handleOpenWellBot = (e: Event) => {
      const customEvent = e as CustomEvent;
      const context = customEvent.detail?.context;
      if (context) {
        setMessages([{ id: 'welcome', role: 'assistant', content: `¡Hola! Vi que estabas en la página de "Cómo Funciona". ¿En qué te puedo ayudar con el tema: "${context}"?` }]);
      }
      handleSetOpen(true);
    };

    window.addEventListener('open-wellbot', handleOpenWellBot);
    return () => window.removeEventListener('open-wellbot', handleOpenWellBot);
  }, []);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, messages]);

  const sendPrompt = (text: string) => {
    if (!text.trim()) return
    append({ role: 'user', content: text })
  }

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { 
      e.preventDefault(); 
      if (input.trim() && !isLoading) {
        // useChat's handleSubmit usually takes a form event, but we can synthesize one or just use append
        append({ role: 'user', content: input });
        setInput('');
      }
    }
  }

  return (
    <>
      {/* ── Floating bubble ─────────────────────────────────── */}
      <button
        id="wellbot-toggle"
        onClick={() => handleSetOpen(!open)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-radius-full shadow-shadow-lg flex items-center justify-center transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-mango ${
          open ? 'bg-ink-teal-900 rotate-90' : 'bg-accent-mango hover:bg-accent-mango-hover hover:scale-110'
        } md:bottom-8 md:right-8`}
        aria-label={open ? 'Cerrar WellBot' : 'Abrir WellBot asistente'}
        aria-expanded={open}
        style={{ bottom: 'calc(56px + env(safe-area-inset-bottom, 0px) + 1rem)' }}
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M17 5L5 17M5 5l12 12"/>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            <circle cx="9" cy="10" r="1" fill="white"/>
            <circle cx="12" cy="10" r="1" fill="white"/>
            <circle cx="15" cy="10" r="1" fill="white"/>
          </svg>
        )}
      </button>

      {/* ── Chat panel ──────────────────────────────────────── */}
      <div
        className={`fixed z-50 transition-all duration-300 ease-out ${
          open
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none'
        }
        /* Mobile: full screen. Desktop: floating panel */
        inset-0 md:inset-auto md:bottom-32 md:right-8 md:w-[380px] md:h-[520px]
        `}
        role="dialog"
        aria-label="WellBot asistente"
        aria-modal="true"
      >
        <div className="flex flex-col h-full bg-white md:rounded-radius-lg shadow-shadow-lg overflow-hidden border border-surface-mist-dark">

          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-ink-teal-900">
            <div className="w-9 h-9 rounded-radius-full bg-accent-mango flex items-center justify-center flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M15.75 11.25a1.5 1.5 0 01-1.5 1.5H4.5l-3 3V3.75A1.5 1.5 0 013 2.25h11.25a1.5 1.5 0 011.5 1.5v7.5z"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-fraunces font-semibold text-white">WellBot 🏡</h3>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-signal-green rounded-full" aria-hidden="true"/>
            </div>
            <button
              onClick={() => handleSetOpen(false)}
              className="text-white/80 hover:text-white transition-colors p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-mango rounded-radius-sm"
              aria-label="Cerrar WellBot"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                <path d="M14 4L4 14M4 4l10 10"/>
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-base-paper">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-radius-md font-inter text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-ink-teal-900 text-white rounded-br-sm'
                      : 'bg-white text-ink-teal-900 border border-surface-mist-dark rounded-bl-sm shadow-shadow-sm'
                  }`}
                >
                  {msg.role === 'assistant' ? renderBotText(msg.content) : msg.content}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-surface-mist-dark rounded-radius-md rounded-bl-sm px-4 py-3 shadow-shadow-sm flex gap-1 items-center">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-2 h-2 bg-text-muted-custom rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }}
                      aria-hidden="true"
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick prompts */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-none">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendPrompt(prompt)}
                  className="flex-shrink-0 bg-white border border-surface-mist-dark text-ink-teal-700 font-inter text-xs px-3 py-2 rounded-radius-sm hover:border-ink-teal-500 hover:text-ink-teal-900 transition-all whitespace-nowrap"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-4 py-3 border-t border-surface-mist-dark bg-white flex gap-2 items-center">
            <input
              ref={inputRef}
              type="text"
              placeholder="Escribe tu pregunta…"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKey}
              className="flex-1 px-3 py-2.5 border border-surface-mist-dark rounded-radius-sm font-inter text-sm text-ink-teal-900 placeholder:text-text-muted-custom bg-base-paper focus:outline-none focus:ring-2 focus:ring-ink-teal-500 transition-all"
              aria-label="Mensaje para WellBot"
            />
            <button
              onClick={() => {
                if (input.trim() && !isLoading) {
                  append({ role: 'user', content: input });
                  setInput('');
                }
              }}
              disabled={!input.trim() || isLoading}
              className="w-10 h-10 bg-accent-mango rounded-radius-sm flex items-center justify-center text-white hover:bg-accent-mango-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
              aria-label="Enviar mensaje"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M14.5 1.5L1.5 7l5 1.5 1.5 6 6.5-13z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
