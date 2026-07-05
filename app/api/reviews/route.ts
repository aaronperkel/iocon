import { NextRequest, NextResponse } from 'next/server'
import { addReview, getReviews } from '@/lib/reviews'

export async function GET() {
  return NextResponse.json(getReviews())
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, rating, text } = body as {
    name?: string
    rating?: number
    text?: string
  }

  if (!name?.trim() || !text?.trim() || typeof rating !== 'number') {
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

  const review = addReview({ name: name.trim(), rating, text: text.trim() })
  return NextResponse.json(review, { status: 201 })
}
