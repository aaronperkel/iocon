import type { Metadata, Viewport } from 'next'
import { Inter, Uncial_Antiqua } from 'next/font/google'
import './globals.css'
import Nav from '@/components/Nav'
import { SITE_URL } from '@/lib/site'
import { Analytics } from "@vercel/analytics/next";

// Heading face (font-heading): Times New Roman, trial per Riley 2026-07. It is
// a system font, so the stack lives directly in tailwind.config.ts — no
// next/font import needed. (Replaced Alegreya Sans; to revert, restore the
// Alegreya_Sans import + --font-heading variable and point the Tailwind
// `heading` family back at it.)

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const uncialAntiqua = Uncial_Antiqua({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-uncial',
  display: 'swap',
})

// Title is set literally — no template suffix — so the accented Í is never
// run through a CSS text-transform that could mangle it at the layout level.
// Social preview images live at app/opengraph-image.png / app/twitter-image.png
// (Next.js file convention); the source design is design/og-image.html.
export const metadata: Metadata = {
  // Base for absolute social-image URLs; see lib/site.ts for why this must
  // be the public domain rather than VERCEL_URL.
  metadataBase: new URL(SITE_URL),
  title: 'Íocón',
  description:
    'Custom Irish dance costume drawings, digital logos, and costume designs by Íocón.',
  openGraph: {
    siteName: 'Íocón',
    type: 'website',
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
  },
}

// Matches the two body backgrounds in globals.css (--olive-25 light/dark).
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FCFCF4' },
    { media: '(prefers-color-scheme: dark)', color: '#16160C' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${uncialAntiqua.variable}`}>
      <body className="font-sans text-stone-900 min-h-screen flex flex-col">
        <Nav />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-stone-200 py-6 mt-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center text-stone-400 text-sm space-y-1">
            <p>&copy; {new Date().getFullYear()} Íocón &middot; All rights reserved</p>
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
        </footer>
        <Analytics />
      </body>
    </html>
  )
}
