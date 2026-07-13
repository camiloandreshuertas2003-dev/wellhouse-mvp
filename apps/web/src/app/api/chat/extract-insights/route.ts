import { google } from '@ai-sdk/google'
import { generateObject } from 'ai'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const maxDuration = 60; // Hasta 60s porque lee de la DB y llama al modelo

const insightSchema = z.object({
  category: z.enum(['WellPoints', 'registro', 'confianza_seguridad', 'precio', 'disponibilidad', 'queja', 'otro']).describe('Categoría principal de la conversación'),
  resolved: z.boolean().describe('¿Se resolvió la duda del usuario?'),
  sentiment: z.enum(['positivo', 'neutro', 'negativo']).describe('Sentimiento general del usuario al final'),
  is_complaint: z.boolean().describe('¿Hubo alguna queja explícita?'),
  is_feature_request: z.boolean().describe('¿El usuario pidió una función que no existe?'),
  unanswered_question: z.string().nullable().describe('Si WellBot no supo responder algo, pon la pregunta exacta aquí. Si respondió todo, null.')
})

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // 1. Obtener conversaciones cerradas sin insights
    // Para simplificar, asumiremos que recibimos un conversation_id o procesamos las últimas 5 sin insight
    const { conversation_id } = await req.json().catch(() => ({ conversation_id: null }))

    let query = supabase
      .from('assistant_conversations')
      .select('id, page_origin, assistant_messages(role, content)')

    if (conversation_id) {
      query = query.eq('id', conversation_id)
    } else {
      // Simulación: coger las recientes que no tengan insight.
      // query = query.order('ended_at', { ascending: false }).limit(5)
      return NextResponse.json({ message: 'Must provide conversation_id for this demo' })
    }

    const { data: convData, error } = await query.single()
    if (error || !convData) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // 2. Preparar el texto de la conversación
    const chatText = convData.assistant_messages
      ?.map((m: any) => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n\n')

    if (!chatText) return NextResponse.json({ message: 'No messages to analyze' })

    // 3. Extraer insights usando AI SDK
    const { object } = await generateObject({
      model: google('gemini-2.5-flash') as any,
      schema: insightSchema,
      prompt: `Analiza esta transcripción de chat entre un usuario y WellBot y extrae los insights según el esquema requerido:\n\n${chatText}`,
    })

    // 4. Guardar en DB
    await supabase.from('assistant_insights').upsert({
      conversation_id: convData.id,
      category: object.category,
      resolved: object.resolved,
      sentiment: object.sentiment,
      is_complaint: object.is_complaint,
      is_feature_request: object.is_feature_request,
      unanswered_question: object.unanswered_question,
      reviewed_by_team: false
    })

    return NextResponse.json({ success: true, insights: object })
  } catch (error) {
    console.error('Insights extraction error:', error)
    return NextResponse.json({ error: 'Failed to extract insights' }, { status: 500 })
  }
}
