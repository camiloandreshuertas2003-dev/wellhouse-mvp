'use client'

import React, { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'bot'
  text: string
}

const WELCOME = '¡Hola! Soy **WellBot**, tu asistente de Wellhouse 🏡\n\nPuedo ayudarte a:\n• Encontrar viviendas por ciudad o región\n• Entender cómo funcionan los WellPoints\n• Guiarte para publicar tu vivienda\n\n¿Qué buscas hoy?'

const QUICK_PROMPTS = [
  '🌾 Fincas en el Eje Cafetero',
  '🌊 Casas en la Costa',
  '🏙️ Apartamentos en Bogotá',
  '✨ ¿Cómo gano WellPoints?',
]

// Smart mock responses — will be replaced by real LLM endpoint in a future phase
function getBotResponse(userMsg: string): string {
  const msg = userMsg.toLowerCase()

  if (msg.includes('eje') || msg.includes('cafetero') || msg.includes('salento') || msg.includes('quindío') || msg.includes('finca')) {
    return '¡El Eje Cafetero es uno de los destinos más populares en Wellhouse! 🌾\n\nTenemos fincas cafeteras en **Salento**, **Montenegro** y **Filandia** con WellScores entre 80 y 200 WP/noche.\n\n[Ver fincas en el Eje →](/search?category=fincas&q=eje+cafetero)'
  }
  if (msg.includes('costa') || msg.includes('cartagena') || msg.includes('santa marta') || msg.includes('caribe') || msg.includes('playa')) {
    return 'La Costa Caribe tiene algunas de las mejores viviendas de Wellhouse 🌊\n\nEncontramos opciones en **Cartagena**, **Santa Marta** y **Barranquilla**, muchas con acceso a playa privada.\n\n[Explorar Playa y costa →](/search?category=playa)'
  }
  if (msg.includes('bogotá') || msg.includes('bogota') || msg.includes('ciudad') || msg.includes('urbano') || msg.includes('apartamento')) {
    return 'Bogotá tiene una gran oferta de apartamentos modernos y lofts en zonas como **Chapinero**, **Usaquén** y **La Candelaria** 🏙️\n\n[Ver viviendas urbanas →](/search?category=urbano&q=bogota)'
  }
  if (msg.includes('wellpoint') || msg.includes('punto') || msg.includes('wp') || msg.includes('ganar') || msg.includes('cómo funciona')) {
    return '¡Los **WellPoints** son la moneda de confianza de Wellhouse! 🌟\n\n**¿Cómo ganarlos?**\n• Publicar tu vivienda completa: +200 WP\n• Hospedar a alguien: WP calculados por tu WellScore™\n• Completar tu perfil y verificarte\n\n**¿Cómo usarlos?**\n• Para quedarte en cualquier vivienda de la plataforma\n\n[Ver WellPoints en tu dashboard →](/dashboard)'
  }
  if (msg.includes('publicar') || msg.includes('registrar') || msg.includes('mi vivienda') || msg.includes('subir')) {
    return 'Publicar tu vivienda en Wellhouse es muy fácil 🏡\n\n**Pasos:**\n1. Ve a tu **Dashboard**\n2. Clic en "Registrar vivienda"\n3. Completa el wizard de 6 pasos\n4. Sube tus fotos\n5. Espera la aprobación del equipo Wellhouse\n\nAl publicar ganas **+200 WP** automáticamente.\n\n[Ir a registrar vivienda →](/properties/create)'
  }
  if (msg.includes('hola') || msg.includes('buenas') || msg.includes('hey') || msg.includes('buenos')) {
    return '¡Hola! 👋 Estoy aquí para ayudarte a encontrar el alojamiento perfecto o resolver tus dudas sobre Wellhouse.\n\n¿Buscas vivienda en alguna región específica de Colombia?'
  }
  if (msg.includes('medellín') || msg.includes('medellin') || msg.includes('antioquia') || msg.includes('poblado')) {
    return 'Medellín tiene opciones increíbles en Wellhouse, especialmente en **El Poblado** y **Laureles** 🌸\n\nEncontramos lofts modernos y casas con jardín disponibles.\n\n[Buscar en Medellín →](/search?q=medellin)'
  }
  if (msg.includes('villav') || msg.includes('llano') || msg.includes('meta')) {
    return 'El Llano tiene fincas ganaderas espectaculares con horizontes infinitos 🐄🌅\n\nVillavicencio y sus alrededores son perfectos para desconectarse.\n\n[Ver fincas en el Llano →](/search?category=fincas&q=llano)'
  }
  if (msg.includes('precio') || msg.includes('cuánto') || msg.includes('costo') || msg.includes('vale')) {
    return 'En Wellhouse no pagas con dinero, sino con **WellPoints** 💛\n\nCada vivienda tiene un **WellScore™** que indica cuántos WP cuesta por noche. Cuanto más completa y mejor valorada sea, más WP pedirá — y más WP recibirás tú por hospedar.\n\nEl rango típico es de **30 a 300 WP por noche**.'
  }

  // Fallback
  return `Entendí "${userMsg}" 🤔\n\nPor ahora puedo ayudarte con:\n• Buscar viviendas por región colombiana\n• Información sobre WellPoints\n• Cómo publicar tu vivienda\n\n¿Quieres que busque viviendas en algún destino específico?`
}

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

  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: initialMessage || WELCOME }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialMessage && messages.length === 1 && messages[0].text !== initialMessage) {
      setMessages([{ role: 'bot', text: initialMessage }]);
    }
  }, [initialMessage]);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, messages]);

  const send = (text: string) => {
    if (!text.trim()) return
    setMessages((prev) => [...prev, { role: 'user', text: text.trim() }])
    setInput('')
    setTyping(true)
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: 'bot', text: getBotResponse(text) }])
      setTyping(false)
    }, 700 + Math.random() * 400)
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) }
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
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-radius-md font-inter text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-ink-teal-900 text-white rounded-br-sm'
                      : 'bg-white text-ink-teal-900 border border-surface-mist-dark rounded-bl-sm shadow-shadow-sm'
                  }`}
                >
                  {msg.role === 'bot' ? renderBotText(msg.text) : msg.text}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
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
                  onClick={() => send(prompt)}
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
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              className="flex-1 px-3 py-2.5 border border-surface-mist-dark rounded-radius-sm font-inter text-sm text-ink-teal-900 placeholder:text-text-muted-custom bg-base-paper focus:outline-none focus:ring-2 focus:ring-ink-teal-500 transition-all"
              aria-label="Mensaje para WellBot"
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || typing}
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
