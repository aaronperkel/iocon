import type { Metadata } from 'next'
import { Cormorant_Garamond, Inter, Uncial_Antiqua } from 'next/font/google'
import './globals.css'
import Nav from '@/components/Nav'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
})

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
export const metadata: Metadata = {
  title: 'Íocón',
  description:
    'Custom Irish dance costume drawings, digital logos, and costume designs by Íocón.',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable} ${uncialAntiqua.variable}`}>
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
                className="text-stone-500 hover:text-amber-700 underline underline-offset-2 transition-colors"
              >
                Aaron Perkel
              </a>
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}
