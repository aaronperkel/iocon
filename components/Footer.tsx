import Link from 'next/link'
import CrownMark from '@/components/CrownMark'

// ---------------------------------------------------------------------------
// Site-map footer (Aaron, July 2026 — replaced the single-line footer, which
// had grown too crowded): brand + tagline on the left, Explore / Support link
// columns, and a © bar underneath. The Instagram link is deliberately plain
// text rather than the icon. The brand line uses font-heading — Uncial
// (font-display) stays reserved for the nav and hero wordmarks — and says
// "Íocón Graphics" like the © line, not the bare wordmark.
// ---------------------------------------------------------------------------

const EXPLORE_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Shop', href: '/shop' },
  { label: 'Waitlist', href: '/waitlist' },
]

const SUPPORT_LINKS = [
  { label: 'Contact', href: '/#contact' },
  { label: 'Leave a Review', href: '/review' },
  { label: 'Commission Terms', href: '/terms' },
  { label: 'Privacy Policy', href: '/privacy' },
]

const LINK_CLS = 'text-sm text-stone-500 hover:text-gold-700 transition-colors'
const HEADING_CLS = 'font-heading text-base font-bold text-olive-800 mb-3'

function LinkColumn({ title, links }: { title: string; links: typeof EXPLORE_LINKS }) {
  return (
    <nav aria-label={title}>
      <h3 className={HEADING_CLS}>{title}</h3>
      <ul className="space-y-2">
        {links.map(({ label, href }) => (
          <li key={href}>
            <Link href={href} className={LINK_CLS}>
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default function Footer() {
  return (
    <footer className="border-t border-stone-200 mt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid gap-10 sm:grid-cols-[1.5fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5">
              <CrownMark className="w-6 text-gold flex-shrink-0" />
              {/* Do NOT add uppercase/capitalize here — preserves Í */}
              <span className="font-heading text-lg font-bold text-olive-800">
                Íocón Graphics
              </span>
            </div>
            <p className="mt-3 text-sm text-stone-500 leading-relaxed max-w-xs">
              Hand made graphics for the Irish Dance world.
            </p>
            <a
              href="https://www.instagram.com/iocongraphics/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Íocón Graphics on Instagram (@iocongraphics)"
              className={`mt-3 inline-block ${LINK_CLS}`}
            >
              Instagram — @iocongraphics
            </a>
          </div>

          <LinkColumn title="Explore" links={EXPLORE_LINKS} />
          <LinkColumn title="Support" links={SUPPORT_LINKS} />
        </div>

        {/* © bar */}
        <div className="mt-10 pt-6 border-t border-stone-200 flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between text-sm text-stone-400">
          <p>&copy; {new Date().getFullYear()} Íocón Graphics &middot; All rights reserved</p>
          <p>
            Built by{' '}
            <a
              href="https://aaronperkel.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-stone-500 hover:text-gold-700 underline underline-offset-2 transition-colors"
            >
              Aaron Perkel
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
