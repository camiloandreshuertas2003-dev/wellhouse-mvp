import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { streamText } from 'ai'
import { getWellBotTools } from '@/lib/wellbot-tools'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
})

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

    // Map messages manually to ensure compatibility with CoreMessage
    const coreMessages = (messages || []).map((m: any) => ({
      role: m.role,
      content: m.content,
      // If there are tool invocations/results in the future, we pass them along
      ...(m.toolInvocations ? { toolInvocations: m.toolInvocations } : {})
    }))

    // 1. Check cache for exact match
    const lastMessage = messages?.[messages.length - 1];
    const userQuestion = lastMessage?.role === 'user' ? lastMessage.content.trim() : '';
    const normalizedQuestion = userQuestion.toLowerCase().replace(/\s+/g, ' ');

    // Use service role for database writes if available
    const serviceSupabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseKey)

    if (normalizedQuestion) {
      const { data: cached } = await serviceSupabase
        .from('wellbot_qa')
        .select('answer, usage_count')
        .eq('question', normalizedQuestion)
        .maybeSingle();

      if (cached) {
        // Increment usage count in background (fire and forget)
        serviceSupabase.from('wellbot_qa')
          .update({ usage_count: (cached.usage_count || 0) + 1 })
          .eq('question', normalizedQuestion)
          .then();

        // Return cached answer using Vercel AI SDK Data Stream protocol format
        return new Response('0:' + JSON.stringify(cached.answer) + '\n', { 
          status: 200, 
          headers: { 'Content-Type': 'text/plain; charset=utf-8' } 
        });
      }
    }

    // 2. Generate response with Gemini
    const result = await streamText({
      model: google('gemini-1.5-flash'),
      system: SYSTEM_PROMPT + `\n\nCONTEXTO DE PÁGINA ACTUAL: ${JSON.stringify(page_context || {})}`,
      messages: coreMessages,
      tools: tools,
      onFinish: async ({ text, toolCalls }) => {
        // Only cache if no tools were used (to avoid caching dynamic info like property search)
        if (text && (!toolCalls || toolCalls.length === 0) && normalizedQuestion) {
          await serviceSupabase.from('wellbot_qa').insert({
            question: normalizedQuestion,
            answer: text,
            usage_count: 1
          }).select() // ignore error if unique constraint fails
        }
      }
    })

    const anyResult = result as any
    if (anyResult.toDataStreamResponse) {
      return anyResult.toDataStreamResponse()
    } else if (anyResult.toAIStreamResponse) {
      return anyResult.toAIStreamResponse()
    } else {
      return anyResult.toTextStreamResponse()
    }
  } catch (error) {
    console.error('Chat API Error:', error)
    return NextResponse.json({ error: 'Failed to process chat' }, { status: 500 })
  }
}
