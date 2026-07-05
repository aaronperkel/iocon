// ---------------------------------------------------------------------------
// Gallery — filterable by product type and subject.
//
// Image data lives in lib/gallery.ts; entries are placeholders until Riley's
// real artwork is added (drop files in public/gallery/ and set `src`).
// ---------------------------------------------------------------------------

import { Suspense } from 'react'
import GalleryGrid from '@/components/GalleryGrid'

export const metadata = { title: 'Gallery — Íocón' }

export default function GalleryPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <h1 className="font-serif text-4xl font-semibold text-gold-900 mb-3">Gallery</h1>
        <p className="text-stone-500 text-sm">
          Browse past work by product or subject using the filters below.
        </p>
      </div>

      {/* GalleryGrid reads its filters from the URL query string, so it needs a
          Suspense boundary for useSearchParams during static rendering. */}
      <Suspense fallback={null}>
        <GalleryGrid />
      </Suspense>
    </div>
  )
}
