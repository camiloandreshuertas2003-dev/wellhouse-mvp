import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    )

    const { userId } = await req.json()
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    // Check if onboarding bonus already exists
    const { data: existing } = await supabaseAdmin
      .from('wellpoint_transactions')
      .select('id')
      .eq('user_id', userId)
      .eq('transaction_type', 'onboarding_bonus')
      .single()

    if (existing) {
      return NextResponse.json({ ok: true, message: "Onboarding bonus already granted." })
    }

    // Grant 100 wellpoints
    const { error: insertErr } = await supabaseAdmin
      .from('wellpoint_transactions')
      .insert({
        user_id: userId,
        amount: 100,
        transaction_type: 'onboarding_bonus',
        description: 'Bono de bienvenida por registrar tu primera vivienda',
        status: 'completed'
      })

    if (insertErr) {
      throw insertErr
    }

    // Also update users table wellpoints_balance
    // Using RPC or raw query if RPC exists, but since we don't know, we let triggers handle it if they exist
    // Or we update it directly:
    const { data: userRecord } = await supabaseAdmin
      .from('users')
      .select('wellpoints_balance')
      .eq('id', userId)
      .single()

    if (userRecord) {
      await supabaseAdmin
        .from('users')
        .update({ wellpoints_balance: (userRecord.wellpoints_balance || 0) + 100 })
        .eq('id', userId)
    }

    return NextResponse.json({ ok: true, message: "Onboarding wellpoints granted." })

  } catch (err: any) {
    console.error('[WellPoints Onboarding API]', err)
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}
