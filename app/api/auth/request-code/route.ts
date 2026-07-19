import { NextRequest, NextResponse } from 'next/server'
import {
  CHALLENGE_COOKIE,
  CODE_TTL_MS,
  createChallengeToken,
  generateCode,
  isAdminEmail,
  normalizeEmail,
  rateLimit,
} from '@/lib/auth'
import { sendLoginCodeEmail } from '@/lib/auth-email'

export async function POST(request: NextRequest) {
  let body: { email?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const email = normalizeEmail(String(body.email ?? ''))
  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  // Unknown emails get the same success response as allowed ones, so the
  // form can't be used to discover which addresses have admin access.
  if (!isAdminEmail(email) || !rateLimit(`send:${email}`, 5, CODE_TTL_MS)) {
    return NextResponse.json({ ok: true })
  }

  const code = generateCode()
  try {
    await sendLoginCodeEmail(email, code)
  } catch (err) {
    console.error('Failed to send sign-in code email:', err)
    return NextResponse.json(
      { error: 'Could not send the code. Please try again.' },
      { status: 502 }
    )
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set(CHALLENGE_COOKIE, await createChallengeToken(email, code), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: Math.floor(CODE_TTL_MS / 1000),
  })
  return res
}
