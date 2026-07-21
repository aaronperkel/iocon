import { NextRequest, NextResponse } from 'next/server'
import { isEmailConfigured, sendContactEmail } from '@/lib/email'
import { rateLimit } from '@/lib/auth'

// Submissions are emailed to Riley via lib/email.ts (iCloud SMTP).
// Without SMTP env vars the submission is only logged — fine for dev.

const MAX_NAME = 191
const MAX_EMAIL = 191
const MAX_SUBJECT = 191
const MAX_MESSAGE = 5000

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (!rateLimit(`contact:${ip}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json(
      { error: 'Too many messages — please try again in a few minutes.' },
      { status: 429 }
    )
  }

  const body = await req.json().catch(() => null)
  if (body === null || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }
  const { name, email, subject, message } = body as {
    name?: unknown
    email?: unknown
    subject?: unknown
    message?: unknown
  }

  if (
    typeof name !== 'string' ||
    typeof email !== 'string' ||
    typeof subject !== 'string' ||
    typeof message !== 'string' ||
    !name.trim() ||
    !email.trim() ||
    !subject.trim() ||
    !message.trim()
  ) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
  }

  if (email.length > MAX_EMAIL || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  }
  if (name.length > MAX_NAME || subject.length > MAX_SUBJECT || message.length > MAX_MESSAGE) {
    return NextResponse.json({ error: 'Message is too long.' }, { status: 400 })
  }

  // Name and subject end up in email headers — never let them smuggle CRLFs.
  const submission = {
    name: name.trim().replace(/[\r\n]+/g, ' '),
    email: email.trim(),
    subject: subject.trim().replace(/[\r\n]+/g, ' '),
    message: message.trim(),
  }

  if (!isEmailConfigured()) {
    console.log('[Contact Form — SMTP not configured]', submission)
    return NextResponse.json({ success: true })
  }

  try {
    await sendContactEmail(submission)
  } catch (err) {
    console.error('[Contact Form] send failed:', err)
    return NextResponse.json(
      { error: 'Your message could not be sent. Please try again in a moment.' },
      { status: 502 }
    )
  }

  return NextResponse.json({ success: true })
}
