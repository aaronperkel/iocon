import { NextRequest, NextResponse } from 'next/server'
import { deleteReview } from '@/lib/reviews'

// Admin-only (middleware.ts lets GET/POST through on /api/reviews but gates
// every other method): moderation for the public review form.

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
