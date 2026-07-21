import { NextRequest, NextResponse } from 'next/server'
import { addReview, getPublicReviews, getReviews } from '@/lib/reviews'
import { rateLimit, SESSION_COOKIE, verifySessionToken } from '@/lib/auth'

// POST is deliberately public — the /review page (linked from the review-ask
// emails) submits here. Length caps match the DB columns (name VARCHAR(191),
// text TEXT) so bad input 400s instead of failing the INSERT.
// TODO: verify the reviewer actually made a purchase once order lookup exists.

const MAX_NAME = 191
const MAX_TEXT = 2000

// GET stays public in the middleware, but only admins (the Reviews tab needs
// the moderation queue) see unapproved reviews — everyone else gets the
// approved set, so pending/rejected reviews never leak.
export async function GET(req: NextRequest) {
  const email = await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value)
  return NextResponse.json(email ? await getReviews() : await getPublicReviews())
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (!rateLimit(`review:${ip}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json(
      { error: 'Too many reviews — please try again later.' },
      { status: 429 }
    )
  }

  const body = await req.json().catch(() => null)
  if (body === null || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }
  const { name, rating, text } = body as {
    name?: unknown
    rating?: unknown
    text?: unknown
  }

  if (
    typeof name !== 'string' ||
    typeof text !== 'string' ||
    !name.trim() ||
    !text.trim() ||
    typeof rating !== 'number'
  ) {
    return NextResponse.json(
      { error: 'name, rating, and text are required.' },
      { status: 400 }
    )
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: 'rating must be an integer from 1 to 5.' },
      { status: 400 }
    )
  }

  if (name.trim().length > MAX_NAME) {
    return NextResponse.json({ error: 'Name is too long.' }, { status: 400 })
  }
  if (text.trim().length > MAX_TEXT) {
    return NextResponse.json(
      { error: `Reviews are capped at ${MAX_TEXT} characters.` },
      { status: 400 }
    )
  }

  const review = await addReview({ name: name.trim(), rating, text: text.trim() })
  return NextResponse.json(review, { status: 201 })
}
