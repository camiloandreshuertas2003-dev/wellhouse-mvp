import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { to, subject, html } = await request.json()

    console.log(`[EMAIL SENDING] To: ${to} | Subject: ${subject}`)

    // If Resend API Key is available in the environment variables, we use it
    const apiKey = process.env.RESEND_API_KEY
    if (apiKey) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          from: 'Wellhouse <onboarding@resend.dev>',
          to,
          subject,
          html
        })
      })

      if (res.ok) {
        return NextResponse.json({ success: true, message: 'Email sent successfully via Resend' })
      } else {
        const errText = await res.text()
        console.error('Resend API error:', errText)
      }
    }

    // Fallback/Mock behavior in dev or if no key is configured
    return NextResponse.json({ 
      success: true, 
      simulated: true, 
      message: `Email simulated successfully to ${to}. Subject: "${subject}"` 
    })
  } catch (error: any) {
    console.error('Error in send-email API:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
