import { NextRequest, NextResponse } from 'next/server'
import { getOrders } from '@/lib/orders'
import { isEmailConfigured, sendCustomEmail } from '@/lib/email'

// Admin-only (gated by middleware.ts): sends a message Riley composed in the
// admin portal to selected customers. Recipients must match the contact email
// of an existing order — this endpoint can't be used to mail arbitrary
// addresses — and each customer gets an individual email (no shared To/CC).

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { recipients, subject, message } = body as {
    recipients?: string[]
    subject?: string
    message?: string
  }

  if (
    !Array.isArray(recipients) ||
    recipients.length === 0 ||
    !subject?.trim() ||
    !message?.trim()
  ) {
    return NextResponse.json(
      { error: 'recipients, subject, and message are required.' },
      { status: 400 }
    )
  }

  if (!isEmailConfigured()) {
    return NextResponse.json(
      { error: 'Email is not configured on this server (SMTP env vars missing).' },
      { status: 503 }
    )
  }

  // Resolve recipients against email-contact customers. getOrders() is
  // oldest-first, so the newest order wins the greeting name.
  const orders = await getOrders()
  const known = new Map<string, { email: string; firstName: string }>()
  for (const order of orders) {
    if (order.contactMethod !== 'email') continue
    const email = order.contactValue.trim()
    known.set(email.toLowerCase(), {
      email,
      firstName: order.name.trim().split(/\s+/)[0],
    })
  }

  const unknown = recipients.filter((r) => !known.has(r.trim().toLowerCase()))
  if (unknown.length > 0) {
    return NextResponse.json(
      { error: `Not email customers: ${unknown.join(', ')}` },
      { status: 400 }
    )
  }

  // Sequential sends keep iCloud SMTP happy; volumes here are small.
  const targets = [...new Set(recipients.map((r) => r.trim().toLowerCase()))]
  let sent = 0
  const failed: { email: string; error: string }[] = []
  for (const key of targets) {
    const recipient = known.get(key)!
    try {
      await sendCustomEmail(recipient, subject.trim(), message)
      sent += 1
    } catch (err) {
      console.error('[Admin email] send failed:', recipient.email, err)
      failed.push({
        email: recipient.email,
        error: err instanceof Error ? err.message : 'send failed',
      })
    }
  }

  return NextResponse.json({ sent, failed })
}
