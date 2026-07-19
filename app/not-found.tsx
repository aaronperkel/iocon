import Link from 'next/link'
import CrownMark from '@/components/CrownMark'

export const metadata = { title: 'Page Not Found — Íocón Graphics' }

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-24 text-center">
      <CrownMark className="w-14 mx-auto text-gold" />
      <p className="font-heading text-7xl font-bold text-olive-800 mt-6">404</p>
      <h1 className="font-heading text-3xl font-bold text-olive-800 mt-2">
        This page has danced away
      </h1>
      <p className="text-stone-500 mt-4 leading-relaxed">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
        <Link
          href="/"
          className="inline-block bg-gold hover:bg-gold-400 text-gold-950 font-medium text-sm px-8 py-3 rounded-full transition-colors"
        >
          Back to Home
        </Link>
        <Link
          href="/gallery"
          className="inline-block border border-stone-300 hover:border-gold-400 text-stone-700 font-medium text-sm px-8 py-3 rounded-full transition-colors"
        >
          Browse the Gallery
        </Link>
      </div>
    </div>
  )
}
