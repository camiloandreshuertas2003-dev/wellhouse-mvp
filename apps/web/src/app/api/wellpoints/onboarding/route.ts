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
      .eq('type', 'WELCOME_BONUS')
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ ok: true, message: "Onboarding bonus already granted." })
    }

    // Get current balance first (single declaration of balRecord)
    const { data: balRecord } = await supabaseAdmin
      .from('wellpoint_balances')
      .select('current_balance, total_earned_lifetime')
      .eq('user_id', userId)
      .maybeSingle()

    const currentBalance = balRecord?.current_balance || 0
    const newBalance = currentBalance + 100

    // Log the transaction with correct balance_after
    const { error: insertErr } = await supabaseAdmin
      .from('wellpoint_transactions')
      .insert({
        user_id: userId,
        amount: 100,
        balance_after: newBalance,
        type: 'WELCOME_BONUS',
        description: 'Bono de bienvenida por registrar tu primera vivienda'
      })

    if (insertErr) {
      throw insertErr
    }

    // Update or create the balance record
    if (balRecord) {
      await supabaseAdmin
        .from('wellpoint_balances')
        .update({
          current_balance: newBalance,
          total_earned_lifetime: (balRecord.total_earned_lifetime || 0) + 100,
          last_activity_at: new Date().toISOString()
        })
        .eq('user_id', userId)
    } else {
      await supabaseAdmin
        .from('wellpoint_balances')
        .insert({
          user_id: userId,
          current_balance: 100,
          total_earned_lifetime: 100,
          last_activity_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        })
    }

    return NextResponse.json({ ok: true, message: "Onboarding wellpoints granted." })

  } catch (err: any) {
    console.error('[WellPoints Onboarding API]', err)
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}
