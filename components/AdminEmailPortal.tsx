'use client'

// Compose-and-send panel on the admin page: Riley picks customers (only those
// who chose email as their contact method), writes a subject + message, and
// POSTs to /api/admin/email. Each recipient gets an individual branded email
// opening "Hi <first name>," and signed "— Riley".

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Field } from '@/components/FormField'
import type { Order } from '@/lib/orders'

interface Recipient {
  key: string // lowercased email — identity for selection + the API
  email: string
  name: string
  orderCount: number
  hasOpen: boolean
}

const inputCls =
  'w-full rounded-lg border border-stone-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gold-400 transition'

export default function AdminEmailPortal({
  orders,
  initialSelected = [],
}: {
  orders: Order[] // newest-first, as held by the admin page
  initialSelected?: string[]
}) {
  const router = useRouter()

  // First sighting in a newest-first list wins the display name.
  const recipients = useMemo(() => {
    const map = new Map<string, Recipient>()
    for (const order of orders) {
      if (order.contactMethod !== 'email') continue
      const key = order.contactValue.trim().toLowerCase()
      const existing = map.get(key)
      if (existing) {
        existing.orderCount += 1
        existing.hasOpen = existing.hasOpen || order.status !== 'completed'
      } else {
        map.set(key, {
          key,
          email: order.contactValue.trim(),
          name: order.name,
          orderCount: 1,
          hasOpen: order.status !== 'completed',
        })
      }
    }
    return [...map.values()]
  }, [orders])

  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(initialSelected.map((e) => e.trim().toLowerCase()))
  )
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [sending, setSending] = useState(false)
  const [sentCount, setSentCount] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  function toggle(key: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
    setConfirming(false)
    setSentCount(null)
  }

  function selectWhere(predicate: (r: Recipient) => boolean) {
    setSelected(new Set(recipients.filter(predicate).map((r) => r.key)))
    setConfirming(false)
    setSentCount(null)
  }

  const ready = selected.size > 0 && subject.trim() !== '' && message.trim() !== ''

  async function sendEmails() {
    setSending(true)
    setError(null)
    setSentCount(null)
    try {
      const res = await fetch('/api/admin/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: [...selected],
          subject: subject.trim(),
          message,
        }),
      })
      if (res.status === 401) {
        router.replace('/admin/login')
        return
      }
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.error)
      const failed: { email: string; error: string }[] = data?.failed ?? []
      setSentCount(data?.sent ?? 0)
      if (failed.length > 0) {
        setError(`Failed to reach: ${failed.map((f) => f.email).join(', ')}`)
      }
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : 'Something went wrong — no emails may have been sent. Please try again.'
      )
    } finally {
      setSending(false)
      setConfirming(false)
    }
  }

  if (recipients.length === 0) {
    return (
      <p className="text-stone-400 italic text-sm">
        No customers to email yet — only customers who chose email as their
        contact method appear here.
      </p>
    )
  }

  return (
    <div className="space-y-6">
      {/* Recipients */}
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide flex-1">
            Recipients — {selected.size} selected
          </p>
          <QuickPick label="All" onClick={() => selectWhere(() => true)} />
          <QuickPick label="Open orders" onClick={() => selectWhere((r) => r.hasOpen)} />
          <QuickPick label="None" onClick={() => selectWhere(() => false)} />
        </div>
        <ul className="bg-white rounded-xl border border-stone-200 divide-y divide-stone-100 max-h-64 overflow-y-auto">
          {recipients.map((r) => (
            <li key={r.key}>
              <label className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-stone-50 transition-colors">
                <input
                  type="checkbox"
                  checked={selected.has(r.key)}
                  onChange={() => toggle(r.key)}
                  className="rounded accent-olive-800 shrink-0"
                />
                <span className="text-sm text-stone-800 font-medium truncate">{r.name}</span>
                <span className="text-xs text-stone-400 truncate flex-1">{r.email}</span>
                <span className="text-[10px] text-stone-400 shrink-0 hidden sm:block">
                  {r.orderCount} order{r.orderCount !== 1 ? 's' : ''}
                </span>
                {r.hasOpen && (
                  <span className="text-[10px] bg-gold-100 text-gold-800 px-2 py-0.5 rounded-full font-medium shrink-0">
                    open
                  </span>
                )}
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* Compose */}
      <Field label="Subject" required>
        <input
          type="text"
          value={subject}
          onChange={(e) => {
            setSubject(e.target.value)
            setConfirming(false)
            setSentCount(null)
          }}
          className={inputCls}
        />
      </Field>
      <Field label="Message" required>
        <textarea
          rows={7}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value)
            setConfirming(false)
            setSentCount(null)
          }}
          className={`${inputCls} resize-y`}
        />
      </Field>
      <p className="text-xs text-stone-400">
        Each customer gets their own email starting &ldquo;Hi &lt;first
        name&gt;,&rdquo; and ending &ldquo;— Riley&rdquo;, sent from
        orders@iocongraphics.com. Replies go to riley@iocongraphics.com.
      </p>

      {/* Send — two-step confirm instead of a browser dialog */}
      <div className="flex flex-wrap items-center gap-3">
        {confirming ? (
          <>
            <button
              type="button"
              disabled={sending}
              onClick={sendEmails}
              className="bg-gold hover:bg-gold-400 disabled:opacity-60 text-gold-950 font-medium text-sm px-8 py-2.5 rounded-lg transition-colors"
            >
              {sending
                ? 'Sending…'
                : `Yes, email ${selected.size} customer${selected.size !== 1 ? 's' : ''}`}
            </button>
            <button
              type="button"
              disabled={sending}
              onClick={() => setConfirming(false)}
              className="text-xs text-stone-500 hover:text-olive-800 underline underline-offset-2 transition-colors"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            type="button"
            disabled={!ready}
            onClick={() => setConfirming(true)}
            className="bg-gold hover:bg-gold-400 disabled:opacity-60 text-gold-950 font-medium text-sm px-8 py-2.5 rounded-lg transition-colors"
          >
            Send to {selected.size} customer{selected.size !== 1 ? 's' : ''}…
          </button>
        )}
        {sentCount !== null && (
          <p className="text-sm text-olive-800 font-medium">
            Sent to {sentCount} customer{sentCount !== 1 ? 's' : ''}.
          </p>
        )}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}

function QuickPick({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-3 py-1 rounded-full text-xs font-medium border bg-white text-stone-600 border-stone-300 hover:border-gold-400 transition"
    >
      {label}
    </button>
  )
}
