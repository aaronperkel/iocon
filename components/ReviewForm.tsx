'use client'

import { useState } from 'react'
import CrownMark from '@/components/CrownMark'
import { Field } from '@/components/FormField'

interface Fields {
  name: string
  rating: number // 0 = not yet chosen
  text: string
}

const EMPTY: Fields = { name: '', rating: 0, text: '' }

function validate(f: Fields): Partial<Record<keyof Fields, string>> {
  const e: Partial<Record<keyof Fields, string>> = {}
  if (!f.name.trim()) e.name = 'Name is required.'
  if (f.rating === 0) e.rating = 'Please choose a crown rating.'
  if (f.text.trim().length < 10) e.text = 'Review must be at least 10 characters.'
  return e
}

export default function ReviewForm() {
  const [form, setForm] = useState<Fields>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({})
  const [hovered, setHovered] = useState(0)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  function setRating(rating: number) {
    setForm((prev) => ({ ...prev, rating }))
    if (errors.rating) setErrors((prev) => ({ ...prev, rating: undefined }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }
    setStatus('loading')
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          rating: form.rating,
          text: form.text.trim(),
        }),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="bg-olive-50 border border-olive-200 rounded-xl p-8 text-center">
        <div className="flex justify-center gap-1.5 mb-3" aria-hidden="true">
          {Array.from({ length: form.rating }, (_, i) => (
            <CrownMark key={i} className="w-7 text-gold" />
          ))}
        </div>
        <p className="font-serif text-2xl text-olive-800 mb-2">Thank you for your review!</p>
        <p className="text-olive-700 text-sm">
          Your feedback means a lot — thank you for supporting Íocón.
        </p>
      </div>
    )
  }

  // Crowns show gold up to the hovered value while hovering, otherwise up to
  // the chosen rating.
  const shown = hovered || form.rating

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div>
        <p className="block text-sm font-medium text-stone-700 mb-1">
          Your rating <span className="text-gold-600">*</span>
        </p>
        <div
          className="flex items-center gap-1.5"
          role="radiogroup"
          aria-label="Rating out of 5 crowns"
          onMouseLeave={() => setHovered(0)}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={form.rating === n}
              aria-label={`${n} of 5 crowns`}
              onClick={() => setRating(n)}
              onMouseEnter={() => setHovered(n)}
              onFocus={() => setHovered(n)}
              onBlur={() => setHovered(0)}
              className="p-0.5 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
            >
              <CrownMark
                className={`w-9 transition-colors ${
                  n <= shown ? 'text-gold' : 'text-stone-300'
                }`}
              />
            </button>
          ))}
          {form.rating > 0 && (
            <span className="ml-2 text-sm text-stone-500">{form.rating} of 5</span>
          )}
        </div>
        {errors.rating && <p className="mt-1 text-xs text-red-600">{errors.rating}</p>}
      </div>

      <Field label="Name" required error={errors.name}>
        <input
          type="text"
          value={form.name}
          onChange={(e) => {
            setForm((prev) => ({ ...prev, name: e.target.value }))
            if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }))
          }}
          className={`w-full rounded-lg border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gold-400 transition ${
            errors.name ? 'border-red-400' : 'border-stone-300'
          }`}
          placeholder="Your name"
          autoComplete="name"
        />
      </Field>

      <Field label="Your review" required error={errors.text}>
        <textarea
          value={form.text}
          onChange={(e) => {
            setForm((prev) => ({ ...prev, text: e.target.value }))
            if (errors.text) setErrors((prev) => ({ ...prev, text: undefined }))
          }}
          rows={4}
          className={`w-full rounded-lg border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gold-400 transition resize-y ${
            errors.text ? 'border-red-400' : 'border-stone-300'
          }`}
          placeholder="How was your experience? What did you order?"
        />
      </Field>

      {status === 'error' && (
        <p className="text-sm text-red-600">Something went wrong — please try again.</p>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="bg-gold hover:bg-gold-400 disabled:opacity-60 text-gold-950 font-medium text-sm px-8 py-2.5 rounded-lg transition-colors"
      >
        {status === 'loading' ? 'Submitting…' : 'Submit Review'}
      </button>
    </form>
  )
}
