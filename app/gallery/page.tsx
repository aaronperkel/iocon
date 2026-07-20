// ---------------------------------------------------------------------------
// Gallery — filterable by product type and subject.
//
// Entries come from the DB-backed store Riley manages in the admin Gallery
// tab (lib/gallery-store.ts); the placeholder set from lib/gallery.ts shows
// only while she hasn't added anything yet.
// ---------------------------------------------------------------------------

import { Suspense } from 'react'
import GalleryGrid from '@/components/GalleryGrid'
import { getPublicGalleryImages } from '@/lib/gallery-store'

export const metadata = { title: 'Gallery — Íocón Graphics' }

// Riley's admin uploads must show up immediately, not at next build.
export const dynamic = 'force-dynamic'

export default async function GalleryPage() {
  const images = await getPublicGalleryImages()
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <h1 className="font-heading text-4xl font-bold text-olive-800 mb-3">Gallery</h1>
        <p className="text-stone-500 text-sm">
          Browse past work by product or subject using the filters below.
        </p>
      </div>

      {/* GalleryGrid reads its filters from the URL query string, so it needs a
          Suspense boundary for useSearchParams during static rendering. */}
      <Suspense fallback={null}>
        <GalleryGrid images={images} />
      </Suspense>
    </div>
  )
}
