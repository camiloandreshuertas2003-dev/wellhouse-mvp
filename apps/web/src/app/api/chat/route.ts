import { google } from '@ai-sdk/google'
import { streamText, convertToCoreMessages } from 'ai'
import { getWellBotTools } from '@/lib/wellbot-tools'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const SYSTEM_PROMPT = `
Eres WellBot, el asistente inteligente de Wellhouse. Tu tono es cercano, claro y colombiano (sin ser exageradamente informal).
Eres un experto en el ecosistema Wellhouse, que se basa en intercambios de viviendas utilizando WellPoints (WP).

REGLAS DE NEGOCIO ESTÁTICAS (El "Cerebro"):
- Los WellPoints (WP) son la moneda de la plataforma. Se usan para pedir intercambios en lugar de pagar con dinero.
- WellScore™ es el sistema de puntuación. Determina cuántos WP por noche vale una vivienda (de 30 a 300 WP). Se basa en la capacidad, habitaciones, baños, calidad de las fotos y verificaciones.
- Los huéspedes envían mensajes a los anfitriones. El primer mensaje que acompaña una solicitud de intercambio es gratuito. Para seguir charlando libremente, se requiere el plan "Priority" (membresía mensual de $4 USD). Los anfitriones NUNCA pagan por responder mensajes.
- WellBot NUNCA ejecuta transacciones monetarias ni debita WP directamente. Solo puede leer e informar, indicando a los usuarios que usen la interfaz para finalizar acciones.
- Nunca inventes información de disponibilidad ni saldos; si no lo sabes o falla la herramienta, indícalo honestamente.

LÍMITES IMPORTANTES:
No puedes modificar el saldo de un usuario, no puedes aprobar solicitudes de intercambio.

El contexto actual de la página en la que está el usuario te llegará en el mensaje. Úsalo a tu favor.
`

export async function POST(req: Request) {
  try {
    const { messages, page_context } = await req.json()
    
    // In a real app we'd get the JWT from headers/cookies and authenticate
    // Here we'll create an anon supabase client just for demonstration of tools
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // TODO: Extract user ID from auth cookie if present
    const userId = undefined // placeholder for real implementation

    const tools = getWellBotTools(supabase, userId)

    const result = await streamText({
      model: google('models/gemini-2.5-flash'),
      system: SYSTEM_PROMPT + `\n\nCONTEXTO DE PÁGINA ACTUAL: ${JSON.stringify(page_context || {})}`,
      messages: convertToCoreMessages(messages),
      tools: tools,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error('Chat API Error:', error)
    return NextResponse.json({ error: 'Failed to process chat' }, { status: 500 })
  }
}
