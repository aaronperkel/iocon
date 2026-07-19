import { NextRequest, NextResponse } from 'next/server'
import { isEmailConfigured, sendContactEmail } from '@/lib/email'

// Submissions are emailed to Riley via lib/email.ts (iCloud SMTP).
// Without SMTP env vars the submission is only logged — fine for dev.

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, email, subject, message } = body

  if (!name || !email || !subject || !message) {
    return NextResponse.json(
      { error: 'All fields are required.' },
      { status: 400 }
    )
  }

  if (!isEmailConfigured()) {
    console.log('[Contact Form — SMTP not configured]', { name, email, subject, message })
    return NextResponse.json({ success: true })
  }

  try {
    await sendContactEmail({ name, email, subject, message })
  } catch (err) {
    console.error('[Contact Form] send failed:', err)
    return NextResponse.json(
      { error: 'Your message could not be sent. Please try again in a moment.' },
      { status: 502 }
    )
  }

  return NextResponse.json({ success: true })
}
