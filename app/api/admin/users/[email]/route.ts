import { NextRequest, NextResponse } from 'next/server'
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth'
import { normalizeEmail, removeAdminUser } from '@/lib/admin-users'

// Admin-only (middleware.ts gates all of /api/admin): revoke an admin's
// access. Takes effect immediately — verifySessionToken re-checks the
// allowlist on every request, so their live session stops working too.
// Self-removal is blocked so the portal always keeps at least one admin.

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ email: string }> }
) {
  const you = await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value)
  let email: string
  try {
    email = normalizeEmail(decodeURIComponent((await params).email))
  } catch {
    return NextResponse.json({ error: 'Invalid email.' }, { status: 400 })
  }
  if (you && email === you) {
    return NextResponse.json(
      { error: 'You cannot remove your own access.' },
      { status: 400 }
    )
  }
  const removed = await removeAdminUser(email)
  if (!removed) {
    return NextResponse.json({ error: 'Admin not found.' }, { status: 404 })
  }
  return NextResponse.json({ ok: true })
}
