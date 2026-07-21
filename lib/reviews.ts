// ---------------------------------------------------------------------------
// Shared review data layer, backed by TiDB (see lib/db.ts) with the same
// in-memory fallback pattern as lib/orders.ts when DATABASE_URL is absent.
//
// Reviews submit unapproved; Riley flips `approved` from the admin Reviews
// tab and only approved ones render publicly (home-page section).
//
// TODO: Reviews are meant for past customers only. There is no auth yet, so
//   nothing enforces that — when accounts/order lookup exist, verify the
//   reviewer against a completed order before accepting.
// ---------------------------------------------------------------------------

import 'server-only'
import type { RowDataPacket, ResultSetHeader } from 'mysql2/promise'
import { getPool, isDbConfigured } from './db'

export interface Review {
  id: string
  name: string
  rating: number // 1–5 crowns
  text: string
  approved: boolean // Riley's moderation flag — only approved reviews show publicly
  createdAt: string // ISO 8601
}

const memory = ((globalThis as unknown as { __ioconReviews?: { reviews: Review[] } })
  .__ioconReviews ??= { reviews: [] })

interface ReviewRow extends RowDataPacket {
  id: string
  name: string
  rating: number
  text: string
  approved: number
  created_at: Date
}

function rowToReview(row: ReviewRow): Review {
  return {
    id: row.id,
    name: row.name,
    rating: row.rating,
    text: row.text,
    approved: Boolean(row.approved),
    createdAt: row.created_at.toISOString(),
  }
}

const SELECT_REVIEWS =
  'SELECT id, name, rating, `text`, approved, created_at FROM reviews'

export async function getReviews(): Promise<Review[]> {
  if (!isDbConfigured()) return [...memory.reviews]
  const [rows] = await getPool().query<ReviewRow[]>(
    `${SELECT_REVIEWS} ORDER BY created_at ASC, id ASC`
  )
  return rows.map(rowToReview)
}

// Approved reviews only, newest first — what public pages render.
export async function getPublicReviews(): Promise<Review[]> {
  if (!isDbConfigured()) {
    return memory.reviews
      .filter((r) => r.approved)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }
  const [rows] = await getPool().query<ReviewRow[]>(
    `${SELECT_REVIEWS} WHERE approved = 1 ORDER BY created_at DESC, id DESC`
  )
  return rows.map(rowToReview)
}

export async function addReview(
  data: Omit<Review, 'id' | 'approved' | 'createdAt'>
): Promise<Review> {
  const newReview: Review = {
    ...data,
    id: `review-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    approved: false,
    createdAt: new Date().toISOString(),
  }
  if (!isDbConfigured()) {
    memory.reviews = [...memory.reviews, newReview]
    return newReview
  }
  await getPool().execute(
    'INSERT INTO reviews (id, name, rating, `text`, approved, created_at) VALUES (?, ?, ?, ?, 0, ?)',
    [
      newReview.id,
      newReview.name,
      newReview.rating,
      newReview.text,
      new Date(newReview.createdAt),
    ]
  )
  return newReview
}

export async function setReviewApproved(
  id: string,
  approved: boolean
): Promise<Review | null> {
  if (!isDbConfigured()) {
    let updated: Review | null = null
    memory.reviews = memory.reviews.map((r) => {
      if (r.id === id) {
        updated = { ...r, approved }
        return updated
      }
      return r
    })
    return updated
  }
  const [result] = await getPool().execute<ResultSetHeader>(
    'UPDATE reviews SET approved = ? WHERE id = ?',
    [approved ? 1 : 0, id]
  )
  if (result.affectedRows === 0) return null
  const [rows] = await getPool().query<ReviewRow[]>(`${SELECT_REVIEWS} WHERE id = ?`, [id])
  return rows.length ? rowToReview(rows[0]) : null
}

export async function deleteReview(id: string): Promise<boolean> {
  if (!isDbConfigured()) {
    const before = memory.reviews.length
    memory.reviews = memory.reviews.filter((r) => r.id !== id)
    return memory.reviews.length < before
  }
  const [result] = await getPool().execute<ResultSetHeader>(
    'DELETE FROM reviews WHERE id = ?',
    [id]
  )
  return result.affectedRows > 0
}
