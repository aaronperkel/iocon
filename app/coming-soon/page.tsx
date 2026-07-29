import CrownMark from '@/components/CrownMark'
import LaunchCountdown from '@/components/LaunchCountdown'

// ---------------------------------------------------------------------------
// Pre-launch landing (Riley, July 2026): until midnight Aug 1 (Eastern),
// middleware rewrites every public page here. Deliberately plain — just the
// logo lockup, her copy, the ticking countdown, and the small early-visitor
// promo line at the bottom. It sits OUTSIDE the (site) route group on
// purpose: no nav, no footer, no links into the gated site.
// Middleware redirects this path to / once launched; deletable after Aug 1.
// ---------------------------------------------------------------------------

export const metadata = {
  title: 'Íocón Graphics — Launching August 1',
  // Four days of life — keep it out of the index entirely.
  robots: { index: false, follow: false },
}

export default function ComingSoonPage() {
  return (
    <>
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-16">
        {/* Gold crown + olive Uncial wordmark = Riley's stacked lockup */}
        <CrownMark className="w-16 text-gold" />
        {/* Literal string — no CSS transform on this element */}
        <p className="font-display text-5xl sm:text-6xl mt-5 tracking-wide text-olive-600">
          Íocón
        </p>
        <p className="text-olive-800 text-lg mt-8 max-w-sm leading-relaxed">
          Hey! You&apos;re early.... check back here on August 1st
        </p>
        <div className="mt-8">
          <LaunchCountdown />
        </div>
      </div>
      <p className="px-4 pb-6 text-center text-xs text-stone-400 leading-relaxed">
        Thanks for being an early visitor to the website : ) If you place an order on launch
        day, use promo code <span className="font-semibold text-stone-500">ICONIC</span> to
        receive 25% off
      </p>
    </>
  )
}
