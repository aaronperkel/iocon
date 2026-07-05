// ---------------------------------------------------------------------------
// Shared review data layer — same in-memory stub pattern as lib/orders.ts.
//
// TODO: Replace with real persistence alongside the orders DB swap.
// TODO: Reviews are meant for past customers only. There is no auth yet, so
//   nothing enforces that — when accounts/order lookup exist, verify the
//   reviewer against a completed order before accepting.
// ---------------------------------------------------------------------------

export interface Review {
  id: string
  name: string
  rating: number // 1–5 crowns
  text: string
  createdAt: string // ISO 8601
}

// In-memory store — state resets on server restart.
let reviews: Review[] = []

export function getReviews(): Review[] {
  return [...reviews]
}

export function addReview(data: Omit<Review, 'id' | 'createdAt'>): Review {
  const newReview: Review = {
    ...data,
    id: `review-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  }
  reviews = [...reviews, newReview]
  return newReview
}
