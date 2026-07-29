'use client'

import { useEffect, useState } from 'react'
import { LAUNCH_AT_MS } from '@/lib/launch'

// Ticking countdown to the Aug 1 launch instant, for /coming-soon only.
// Riley is fine with the seconds ticking here (unlike the waitlist season
// countdowns — keep those days-only). Renders em dashes until mounted to
// avoid a hydration mismatch, and reloads at zero — the middleware gate has
// expired by then, so the reload lands on the real home page.

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

export default function LaunchCountdown() {
  const [ms, setMs] = useState<number | null>(null)

  useEffect(() => {
    const tick = () => {
      const remaining = LAUNCH_AT_MS - Date.now()
      if (remaining <= 0) {
        window.location.reload()
        return
      }
      setMs(remaining)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  // One DD:HH:MM:SS clock (Aaron's call — not "N days" + a separate clock).
  const clock =
    ms !== null
      ? `${pad(Math.floor(ms / 86_400_000))}:${pad(
          Math.floor((ms % 86_400_000) / 3_600_000)
        )}:${pad(Math.floor((ms % 3_600_000) / 60_000))}:${pad(
          Math.floor((ms % 60_000) / 1000)
        )}`
      : null

  return (
    <p className="tabular-nums text-olive-800">
      <span className="font-heading text-4xl font-bold">{clock ?? '—:—:—:—'}</span>
    </p>
  )
}
