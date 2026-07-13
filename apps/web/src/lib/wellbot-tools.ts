import { tool } from 'ai'
import { z } from 'zod'
import { SupabaseClient } from '@supabase/supabase-js'

// Helper para crear los tools con contexto (supabase + userId)
export const getWellBotTools = (supabase: SupabaseClient, userId?: string) => {
  return {
    get_property_detail: tool({
      description: 'Obtiene los datos reales de una vivienda específica: amenidades, WellScore, disponibilidad, etc. Úsala siempre que el usuario pregunte algo específico de una vivienda que se está viendo o mencionando.',
      parameters: z.object({
        property_id: z.string().describe('El ID de la vivienda'),
      }),
      execute: async ({ property_id }) => {
        const { data, error } = await supabase
          .from('properties')
          .select('id, title, city, country, type, bedrooms, bathrooms, capacity, amenities, available_from, available_to, description')
          .eq('id', property_id)
          .single()

        if (error || !data) return { error: 'Vivienda no encontrada' }
        return { property: data }
      },
    }),

    search_properties: tool({
      description: 'Busca viviendas por categoría o tipo. Úsala si el usuario pide recomendaciones de casas o fincas.',
      parameters: z.object({
        category: z.enum(['playa', 'finca', 'montana', 'exclusivo', 'urbano', 'all']).describe('Categoría de búsqueda'),
      }),
      execute: async ({ category }) => {
        let q = supabase.from('properties').select('id, title, city, type, capacity').eq('status', 'published').limit(5)
        
        if (category === 'playa') q = q.or('type.ilike.%playa%,title.ilike.%mar%')
        else if (category === 'finca') q = q.or('type.ilike.%finca%,title.ilike.%campo%')
        
        const { data } = await q
        return { results: data || [] }
      },
    }),

    get_wellpoints_balance: tool({
      description: 'Consulta el saldo actual de WellPoints del usuario. Solo funciona si el usuario está autenticado.',
      parameters: z.object({}),
      execute: async () => {
        if (!userId) return { error: 'El usuario no está autenticado. Invítalo a iniciar sesión.' }
        const { data } = await supabase
          .from('wellpoint_balances')
          .select('current_balance')
          .eq('user_id', userId)
          .single()
        
        return { balance: data?.current_balance || 0 }
      },
    }),

    get_wellpoints_packages: tool({
      description: 'Devuelve la lista de paquetes de WellPoints disponibles para comprar y sus precios.',
      parameters: z.object({}),
      execute: async () => {
        return {
          packages: [
            { id: 1, name: 'Básico', points: 100, price_usd: 10 },
            { id: 2, name: 'Popular', points: 500, price_usd: 45 },
            { id: 3, name: 'Premium', points: 1000, price_usd: 80 }
          ]
        }
      }
    }),
    
    get_membership_status: tool({
      description: 'Verifica si el usuario tiene una membresía (Priority) activa.',
      parameters: z.object({}),
      execute: async () => {
        if (!userId) return { error: 'El usuario no está autenticado.' }
        const { data } = await supabase.from('users').select('has_priority_plan').eq('id', userId).single()
        return { hasPriorityPlan: data?.has_priority_plan || false }
      }
    }),
  }
}
