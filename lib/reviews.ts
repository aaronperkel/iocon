// ---------------------------------------------------------------------------
// Shared review data layer, backed by TiDB (see lib/db.ts) with the same
// in-memory fallback pattern as lib/orders.ts when DATABASE_URL is absent.
//
// TODO: Reviews are meant for past customers only. There is no auth yet, so
//   nothing enforces that — when accounts/order lookup exist, verify the
//   reviewer against a completed order before accepting.
// ---------------------------------------------------------------------------

import type { RowDataPacket, ResultSetHeader } from 'mysql2/promise'
import { getPool, isDbConfigured } from './db'

export interface Review {
  id: string
  name: string
  rating: number // 1–5 crowns
  text: string
  createdAt: string // ISO 8601
}

const memory = ((globalThis as unknown as { __ioconReviews?: { reviews: Review[] } })
  .__ioconReviews ??= { reviews: [] })

interface ReviewRow extends RowDataPacket {
  id: string
  name: string
  rating: number
  text: string
  created_at: Date
}

function rowToReview(row: ReviewRow): Review {
  return {
    id: row.id,
    name: row.name,
    rating: row.rating,
    text: row.text,
    createdAt: row.created_at.toISOString(),
  }
}

export async function getReviews(): Promise<Review[]> {
  if (!isDbConfigured()) return [...memory.reviews]
  const [rows] = await getPool().query<ReviewRow[]>(
    'SELECT id, name, rating, `text`, created_at FROM reviews ORDER BY created_at ASC, id ASC'
  )
  return rows.map(rowToReview)
}

export async function addReview(
  data: Omit<Review, 'id' | 'createdAt'>
): Promise<Review> {
  const newReview: Review = {
    ...data,
    id: `review-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  }
  if (!isDbConfigured()) {
    memory.reviews = [...memory.reviews, newReview]
    return newReview
  }
  await getPool().execute(
    'INSERT INTO reviews (id, name, rating, `text`, created_at) VALUES (?, ?, ?, ?, ?)',
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
