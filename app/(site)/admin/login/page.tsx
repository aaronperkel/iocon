'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Field } from '@/components/FormField'

const inputCls =
  'w-full rounded-lg border border-stone-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gold-400 transition'

export default function AdminLoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  async function requestCode(e?: FormEvent) {
    e?.preventDefault()
    if (!email.trim()) {
      setError('Enter your email address.')
      return
    }
    setSubmitting(true)
    setError(null)
    setNotice(null)
    try {
      const res = await fetch('/api/auth/request-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.error)
      if (step === 'code') setNotice('A new code is on its way.')
      setStep('code')
      setCode('')
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : 'Something went wrong. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  async function verifyCode(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setNotice(null)
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.error)
      // Keep the button disabled while the redirect happens.
      router.replace('/admin')
      router.refresh()
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : 'Something went wrong. Please try again.'
      )
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-16">
      <h1 className="font-heading text-4xl font-bold text-olive-800 mb-2">Admin Sign In</h1>
      <p className="text-stone-500 text-sm mb-8">
        {step === 'email'
          ? 'Enter your email to receive a one-time sign-in code.'
          : `Enter the 6-digit code sent to ${email.trim()}. It expires in 10 minutes.`}
      </p>

      {step === 'email' ? (
        <form onSubmit={requestCode} className="space-y-5" noValidate>
          <Field label="Email" required>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
              autoComplete="email"
              autoFocus
            />
          </Field>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="bg-gold hover:bg-gold-400 disabled:opacity-60 text-gold-950 font-medium text-sm px-8 py-2.5 rounded-lg transition-colors"
          >
            {submitting ? 'Sending…' : 'Send Code'}
          </button>
        </form>
      ) : (
        <form onSubmit={verifyCode} className="space-y-5" noValidate>
          <Field label="6-Digit Code" required>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              className={`${inputCls} text-center text-lg tracking-[0.5em]`}
              autoComplete="one-time-code"
              autoFocus
            />
          </Field>
          {notice && <p className="text-xs text-olive-800">{notice}</p>}
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={submitting || code.length !== 6}
            className="bg-gold hover:bg-gold-400 disabled:opacity-60 text-gold-950 font-medium text-sm px-8 py-2.5 rounded-lg transition-colors"
          >
            {submitting ? 'Signing In…' : 'Sign In'}
          </button>
          <div className="flex gap-5 text-xs">
            <button
              type="button"
              disabled={submitting}
              onClick={() => requestCode()}
              className="text-stone-500 hover:text-olive-800 underline underline-offset-2 transition-colors"
            >
              Send a new code
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => {
                setStep('email')
                setCode('')
                setError(null)
                setNotice(null)
              }}
              className="text-stone-500 hover:text-olive-800 underline underline-offset-2 transition-colors"
            >
              Use a different email
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
