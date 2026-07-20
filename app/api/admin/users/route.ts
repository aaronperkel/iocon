import { NextRequest, NextResponse } from 'next/server'
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth'
import { addAdminUser, getAdminUsers, normalizeEmail } from '@/lib/admin-users'

// Admin-only (middleware.ts gates all of /api/admin): manage who can sign in
// to the portal. GET also returns the caller's email so the panel can mark
// "(you)" and block self-removal client-side (the DELETE route enforces it).

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function GET(req: NextRequest) {
  const you = await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value)
  return NextResponse.json({ users: await getAdminUsers(), you })
}

export async function POST(req: NextRequest) {
  const you = await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value)
  let body: { email?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
  const email = normalizeEmail(String(body.email ?? ''))
  if (!EMAIL_RE.test(email) || email.length > 191) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  }
  const user = await addAdminUser(email, you)
  if (!user) {
    return NextResponse.json({ error: 'That email is already an admin.' }, { status: 409 })
  }
  return NextResponse.json(user, { status: 201 })
}
