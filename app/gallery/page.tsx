// ---------------------------------------------------------------------------
// Gallery — STUB ONLY
//
// This page will become an Instagram-style image feed.
// TODO: Replace ImageGrid sample data with real images.
//   Options: pull from Instagram Basic Display API, a CMS (Contentful,
//   Sanity, etc.), or a static imports list in components/ImageGrid.tsx.
// ---------------------------------------------------------------------------

import ImageGrid from '@/components/ImageGrid'

export const metadata = { title: 'Gallery — Íocón' }

export default function GalleryPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <h1 className="font-serif text-4xl font-semibold text-emerald-900 mb-3">Gallery</h1>
        <p className="text-stone-500 italic text-sm">
          {/* Placeholder note — this section is intentionally left as a scaffold */}
          Coming soon: an Instagram-style feed of custom designs, logos, and costume drawings.
          Each tile will show a full image with a short description on hover.
        </p>
      </div>

      <ImageGrid />
    </div>
  )
}
