import { NextRequest, NextResponse } from 'next/server'

// ---------------------------------------------------------------------------
// TODO: Wire up a real email provider here.
//
//   Options:
//     • Resend     — RESEND_API_KEY
//     • SendGrid   — SENDGRID_API_KEY
//     • Nodemailer — SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS
//
//   Also set:
//     CONTACT_EMAIL_TO — the inbox that receives submissions
//
//   Replace the console.log below with your provider's send call.
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, email, subject, message } = body

  if (!name || !email || !subject || !message) {
    return NextResponse.json(
      { error: 'All fields are required.' },
      { status: 400 }
    )
  }

  // TODO: send email via provider (see env var stubs above)
  console.log('[Contact Form]', { name, email, subject, message })

  return NextResponse.json({ success: true })
}
