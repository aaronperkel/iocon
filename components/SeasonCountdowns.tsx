'use client'

import { useEffect, useState } from 'react'

// ---------------------------------------------------------------------------
// Season countdowns on /waitlist (Aaron, July 2026): a compact "Countdown to"
// strip at the very top of the page — above the Waitlist heading, so the
// queue content flows uninterrupted — showing whole days to the next
// Oireachtas / Nationals / Worlds season date, soonest first. Days only —
// the ticking hh:mm:ss clock was cut (Riley absolutely hates it); don't
// bring it back. Still client-side so "midnight" is the viewer's own;
// renders an em dash until mounted, since any server-rendered time could
// mismatch on hydration. A slow interval keeps long-open tabs honest when
// the count rolls over.
// ---------------------------------------------------------------------------

const SEASONS = [
  { label: 'Oireachtas', month: 11, day: 26 },
  { label: 'Nationals', month: 7, day: 4 },
  { label: 'Worlds', month: 5, day: 1 },
]

function nextOccurrence(month: number, day: number, from: Date): Date {
  const target = new Date(from.getFullYear(), month - 1, day)
  if (target.getTime() <= from.getTime()) target.setFullYear(target.getFullYear() + 1)
  return target
}

export default function SeasonCountdowns() {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  const items = SEASONS.map(({ label, month, day }) => {
    const target = now ? nextOccurrence(month, day, now) : null
    return {
      label,
      dateLabel: new Date(2000, month - 1, day).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      ms: target && now ? target.getTime() - now.getTime() : null,
    }
  }).sort((a, b) => (a.ms ?? 0) - (b.ms ?? 0))

  return (
    <section aria-label="Season countdowns">
      <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">
        Countdown to
      </p>
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm grid grid-cols-3 divide-x divide-stone-100">
        {items.map(({ label, dateLabel, ms }) => {
          const days = ms !== null ? Math.ceil(ms / 86_400_000) : null
          return (
            <div key={label} className="px-3 py-2.5 sm:px-4">
              <p className="font-heading text-sm font-bold text-olive-800 leading-tight">
                {label}
              </p>
              <p className="tabular-nums">
                <span className="font-heading text-xl font-bold text-olive-800">
                  {days ?? '—'}
                </span>
                <span className="text-xs text-stone-500"> days</span>
              </p>
              <p className="text-[11px] text-stone-400">{dateLabel}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
