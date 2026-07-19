import { NextRequest, NextResponse } from 'next/server'
import {
  CHALLENGE_COOKIE,
  SESSION_COOKIE,
  SESSION_TTL_MS,
  createSessionToken,
  normalizeEmail,
  rateLimit,
  verifyChallengeToken,
} from '@/lib/auth'

export async function POST(request: NextRequest) {
  let body: { email?: string; code?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const email = normalizeEmail(String(body.email ?? ''))
  const code = String(body.code ?? '').trim()
  if (!email || !/^\d{6}$/.test(code)) {
    return NextResponse.json(
      { error: 'Enter the 6-digit code from your email.' },
      { status: 400 }
    )
  }

  if (!rateLimit(`verify:${email}`, 10, 15 * 60_000)) {
    return NextResponse.json(
      { error: 'Too many attempts — request a new code.' },
      { status: 429 }
    )
  }

  const challenge = request.cookies.get(CHALLENGE_COOKIE)?.value
  const valid = challenge ? await verifyChallengeToken(challenge, email, code) : false
  if (!valid) {
    return NextResponse.json(
      { error: 'That code is incorrect or has expired.' },
      { status: 401 }
    )
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set(SESSION_COOKIE, await createSessionToken(email), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  })
  res.cookies.set(CHALLENGE_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  })
  return res
}
