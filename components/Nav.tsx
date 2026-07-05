'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import CrownMark from '@/components/CrownMark'

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Shop', href: '/shop' },
  { label: 'Waitlist', href: '/waitlist' },
]

export default function Nav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-stone-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Brand — title cased exactly; no text-transform so Í stays intact */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group"
            onClick={() => setOpen(false)}
          >
            <CrownMark className="w-7 text-gold flex-shrink-0" />
            {/* Do NOT add uppercase/capitalize here — preserves Í */}
            <span className="font-display text-xl text-olive-600 group-hover:text-gold-600 transition-colors">
              Íocón
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden sm:flex items-center gap-8">
            {NAV_LINKS.map(({ label, href }) => {
              const active = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className={`text-sm font-medium transition-colors ${
                    active
                      ? 'text-gold-700 border-b-2 border-gold-600 pb-0.5'
                      : 'text-stone-600 hover:text-gold-700'
                  }`}
                >
                  {label}
                </Link>
              )
            })}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(!open)}
            aria-label="Toggle navigation menu"
            aria-expanded={open}
            className="sm:hidden p-2 rounded-md text-stone-600 hover:text-gold-700 hover:bg-stone-50 transition-colors"
          >
            {open ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile dropdown */}
        {open && (
          <div className="sm:hidden border-t border-stone-100 py-2 flex flex-col">
            {NAV_LINKS.map(({ label, href }) => {
              const active = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={`px-2 py-2.5 text-sm font-medium rounded-md transition-colors ${
                    active
                      ? 'text-gold-700 bg-gold-50'
                      : 'text-stone-600 hover:text-gold-700 hover:bg-stone-50'
                  }`}
                >
                  {label}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </nav>
  )
}
