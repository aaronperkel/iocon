'use client'

import { useState } from 'react'

interface Fields {
  name: string
  email: string
  subject: string
  message: string
}

const EMPTY: Fields = { name: '', email: '', subject: '', message: '' }

function validate(f: Fields): Partial<Record<keyof Fields, string>> {
  const e: Partial<Record<keyof Fields, string>> = {}
  if (!f.name.trim()) e.name = 'Name is required.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = 'Enter a valid email address.'
  if (!f.subject.trim()) e.subject = 'Subject is required.'
  if (f.message.trim().length < 10) e.message = 'Message must be at least 10 characters.'
  return e
}

export default function ContactForm() {
  const [form, setForm] = useState<Fields>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({})
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  function set(key: keyof Fields) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }))
      if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
    }
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
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
      setForm(EMPTY)
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-8 text-center">
        <p className="font-serif text-2xl text-emerald-800 mb-2">Message sent!</p>
        <p className="text-emerald-700 text-sm">Thanks for reaching out — I will be in touch soon.</p>
        <button
          onClick={() => setStatus('idle')}
          className="mt-5 text-sm text-emerald-700 underline underline-offset-2"
        >
          Send another message
        </button>
      </div>
    )
  }

  const inputCls = (key: keyof Fields) =>
    `w-full rounded-lg border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 transition ${
      errors[key] ? 'border-red-400' : 'border-stone-300'
    }`

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Name" required error={errors.name}>
          <input
            type="text"
            value={form.name}
            onChange={set('name')}
            className={inputCls('name')}
            placeholder="Your name"
            autoComplete="name"
          />
        </Field>
        <Field label="Email" required error={errors.email}>
          <input
            type="email"
            value={form.email}
            onChange={set('email')}
            className={inputCls('email')}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </Field>
      </div>

      <Field label="Subject" required error={errors.subject}>
        <input
          type="text"
          value={form.subject}
          onChange={set('subject')}
          className={inputCls('subject')}
          placeholder="What is this about?"
        />
      </Field>

      <Field label="Message" required error={errors.message}>
        <textarea
          value={form.message}
          onChange={set('message')}
          rows={5}
          className={`${inputCls('message')} resize-y`}
          placeholder="Tell me about your project..."
        />
      </Field>

      {status === 'error' && (
        <p className="text-sm text-red-600">Something went wrong — please try again.</p>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="bg-amber-700 hover:bg-amber-800 disabled:opacity-60 text-white font-medium text-sm px-8 py-2.5 rounded-lg transition-colors"
      >
        {status === 'loading' ? 'Sending…' : 'Send Message'}
      </button>
    </form>
  )
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-stone-700 mb-1">
        {label}
        {required && <span className="text-amber-600 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
