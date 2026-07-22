import type { Metadata, Viewport } from 'next'
import { Inter, Uncial_Antiqua } from 'next/font/google'
import './globals.css'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
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

// Titles and description lead with "Íocón Graphics" — the searchable business
// name, matching the domain. Without the word "Graphics" anywhere in on-page
// text, Google only matched the site for "iocon", never "iocon graphics"; the
// visible brand wordmark stays plain "Íocón". Title is set literally — no
// template suffix — so the accented Í is never run through a CSS
// text-transform that could mangle it at the layout level.
// Social preview images live at app/opengraph-image.png / app/twitter-image.png
// (Next.js file convention); the source design is design/og-image.html.
export const metadata: Metadata = {
  // Base for absolute social-image URLs; see lib/site.ts for why this must
  // be the public domain rather than VERCEL_URL.
  metadataBase: new URL(SITE_URL),
  applicationName: 'Íocón Graphics',
  title: 'Íocón Graphics — Hand made graphics for the Irish Dance world',
  description:
    'Íocón Graphics creates custom Irish dance costume drawings, digital icons, logos, and graphics — hand made for the Irish Dance world.',
  openGraph: {
    siteName: 'Íocón Graphics',
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
        <Footer />
        <Analytics />
      </body>
    </html>
  )
}
