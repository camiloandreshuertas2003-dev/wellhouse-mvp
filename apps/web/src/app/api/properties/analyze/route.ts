import { NextResponse } from 'next/server'
import { google } from '@ai-sdk/google'
import { generateObject } from 'ai'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'

export const maxDuration = 30; // Max execution time for API route

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(req: Request) {
  try {
    const { propertyId, city, country } = await req.json()

    if (!propertyId || !city || !country) {
      return NextResponse.json({ error: 'Faltan parámetros requeridos (propertyId, city, country)' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // 1. Usar Vercel AI SDK para llamar a Gemini 1.5 Flash y estructurar la salida
    const { object } = await generateObject({
      model: google('models/gemini-1.5-flash-latest'),
      schema: z.object({
        spots: z.array(z.object({
          name: z.string().describe('Nombre del lugar turístico o actividad'),
          description: z.string().describe('Breve descripción atractiva del por qué visitarlo (max 150 caracteres)'),
          distance: z.string().describe('Tiempo estimado desde el centro o distancia aproximada (ej: "A 15 minutos en carro")')
        })).max(3).describe('Lista de exactamente 3 lugares turísticos populares o joyas ocultas de la zona'),
        tips: z.array(z.object({
          title: z.string().describe('Título del consejo (ej: "Mejor forma de moverse", "Plato típico imperdible")'),
          content: z.string().describe('Contenido del consejo de viaje (max 150 caracteres)')
        })).max(2).describe('Exactamente 2 consejos útiles locales de viaje para el huésped')
      }),
      prompt: `Actúa como un guía local experto para la plataforma de intercambio de casas Wellhouse. 
El usuario acaba de listar una casa en: ${city}, ${country}.
Genera una guía de viaje altamente atractiva, auténtica y útil para los futuros huéspedes que se queden en esta zona. 
Concéntrate en la autenticidad local. Devuelve 3 lugares turísticos y 2 tips de viaje.`,
    });

    // 2. Guardar el resultado en la base de datos
    const { error: updateError } = await supabase
      .from('properties')
      .update({ local_guide: object })
      .eq('id', propertyId)

    if (updateError) {
      console.error('Error actualizando la propiedad en Supabase:', updateError)
      return NextResponse.json({ error: 'Error guardando la guía en la base de datos' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: object })

  } catch (error: any) {
    console.error('Error en analyze route:', error)
    return NextResponse.json({ error: error.message || 'Error procesando la solicitud' }, { status: 500 })
  }
}
