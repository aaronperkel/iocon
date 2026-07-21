import { NextRequest, NextResponse } from 'next/server'
import { deleteReview, setReviewApproved } from '@/lib/reviews'

// Admin-only (middleware.ts lets GET/POST through on /api/reviews but gates
// every other method): moderation for the public review form. PATCH toggles
// the approved flag — only approved reviews render on the public site.

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json().catch(() => null)
  const { approved } = (body ?? {}) as { approved?: unknown }
  if (typeof approved !== 'boolean') {
    return NextResponse.json({ error: 'approved must be a boolean.' }, { status: 400 })
  }
  const updated = await setReviewApproved(id, approved)
  if (!updated) {
    return NextResponse.json({ error: 'Review not found.' }, { status: 404 })
  }
  return NextResponse.json(updated)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const deleted = await deleteReview(id)
  if (!deleted) {
    return NextResponse.json({ error: 'Review not found.' }, { status: 404 })
  }
  return NextResponse.json({ ok: true })
}
