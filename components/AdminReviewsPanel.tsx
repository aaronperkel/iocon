'use client'

// Review moderation panel on the admin page — currently the only place
// submitted reviews are visible at all (the home page has just the form).
// Anyone can POST /api/reviews, so Riley needs a way to see and remove spam.

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import CrownMark from '@/components/CrownMark'
import type { Review } from '@/lib/reviews'

export default function AdminReviewsPanel() {
  const router = useRouter()
  const [reviews, setReviews] = useState<Review[] | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/reviews')
      .then((r) => r.json())
      .then((data: Review[]) => setReviews(data.slice().reverse())) // newest first
      .catch(() => setReviews([]))
  }, [])

  async function remove(id: string) {
    setDeletingId(id)
    setError(null)
    try {
      const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE' })
      if (res.status === 401) {
        router.replace('/admin/login')
        return
      }
      if (!res.ok) throw new Error()
      setReviews((prev) => (prev ? prev.filter((r) => r.id !== id) : prev))
    } catch {
      setError('Failed to delete the review. Please try again.')
    } finally {
      setDeletingId(null)
      setConfirmId(null)
    }
  }

  if (reviews === null) {
    return <p className="text-stone-400 text-sm">Loading reviews…</p>
  }

  if (reviews.length === 0) {
    return <p className="text-stone-400 italic text-sm">No reviews yet.</p>
  }

  return (
    <div className="space-y-3">
      {error && <p className="text-xs text-red-600">{error}</p>}
      {reviews.map((review) => (
        <div
          key={review.id}
          className="bg-white rounded-2xl border border-stone-200 shadow-sm px-5 py-4"
        >
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <div className="flex gap-1" aria-label={`${review.rating} of 5 crowns`}>
              {Array.from({ length: review.rating }, (_, i) => (
                <CrownMark key={i} className="w-4 text-gold" />
              ))}
            </div>
            <span className="text-sm font-medium text-stone-800">{review.name}</span>
            <span className="text-xs text-stone-400 flex-1">
              {new Date(review.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            {confirmId === review.id ? (
              <span className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={deletingId === review.id}
                  onClick={() => remove(review.id)}
                  className="text-xs text-red-600 font-medium underline underline-offset-2 disabled:opacity-50"
                >
                  {deletingId === review.id ? 'Deleting…' : 'Confirm delete'}
                </button>
                <button
                  type="button"
                  disabled={deletingId === review.id}
                  onClick={() => setConfirmId(null)}
                  className="text-xs text-stone-500 hover:text-olive-800 underline underline-offset-2 transition-colors"
                >
                  Cancel
                </button>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmId(review.id)}
                className="text-xs text-stone-500 hover:text-red-600 underline underline-offset-2 transition-colors"
              >
                Delete
              </button>
            )}
          </div>
          <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-wrap">
            {review.text}
          </p>
        </div>
      ))}
    </div>
  )
}
