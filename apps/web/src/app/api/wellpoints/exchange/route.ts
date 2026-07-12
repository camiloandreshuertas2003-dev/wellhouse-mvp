import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    // Server-side client with service role to call SECURITY DEFINER functions
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    )
    const { action, exchange_id, cancelled_by, reason } = await req.json()

    // Verify user is authenticated via their JWT
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Verify user is a participant in this exchange
    const { data: exchange, error: fetchError } = await supabaseAdmin
      .from('exchanges')
      .select('host_id, guest_id, status')
      .eq('id', exchange_id)
      .single()

    if (fetchError || !exchange) {
      return NextResponse.json({ error: 'Exchange not found' }, { status: 404 })
    }

    const isParticipant = exchange.host_id === user.id || exchange.guest_id === user.id
    if (!isParticipant) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (action === 'finalize') {
      // Only host can finalize
      if (exchange.host_id !== user.id) {
        return NextResponse.json({ error: 'Only the host can finalize an exchange' }, { status: 403 })
      }

      const { data, error } = await supabaseAdmin.rpc('finalize_exchange_wellpoints', {
        p_exchange_id: exchange_id
      })

      if (error) throw error
      return NextResponse.json(data)
    }

    if (action === 'cancel') {
      const role = exchange.host_id === user.id ? 'host' : 'guest'

      const { data, error } = await supabaseAdmin.rpc('cancel_exchange_wellpoints', {
        p_exchange_id: exchange_id,
        p_cancelled_by: cancelled_by || role,
        p_reason: reason || null
      })

      if (error) throw error
      return NextResponse.json(data)
    }

    if (action === 'confirm') {
      // Only host can confirm a pending exchange
      if (exchange.host_id !== user.id) {
        return NextResponse.json({ error: 'Only the host can confirm an exchange' }, { status: 403 })
      }
      if (exchange.status !== 'pending') {
        return NextResponse.json({ error: 'Exchange is not pending' }, { status: 400 })
      }

      const { error } = await supabaseAdmin
        .from('exchanges')
        .update({ status: 'confirmed', confirmed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq('id', exchange_id)

      if (error) throw error
      return NextResponse.json({ ok: true, action: 'confirmed' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (err: any) {
    console.error('[WellPoints API]', err)
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}
