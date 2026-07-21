'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Icon, type IconName } from '@/components/icons'
import InquiryModal from '@/components/InquiryModal'
import type { GalleryImage } from '@/lib/gallery'

// ---------------------------------------------------------------------------
// SubjectCard — one shop subject as a flippable tile (Riley, July 2026).
//
// Front: image (or placeholder icon) + title, linking straight to the order
// form, with a slim "Learn more" bar that flips the card.
// Back: example carousel pulled from the gallery (entries tagged with this
// subject), the starting price, Riley's blurb, and the same CTA.
//
// Subjects without an order form (Bulk Drawings / Logo / Graphic) set
// `inquirySubject` instead of `href`: both CTAs open the InquiryModal — a
// contact form tagged with that subject — rather than navigating away.
//
// Both faces stay mounted so the 3D flip can animate; the hidden face is
// `inert` so it never traps keyboard focus. The faces are stacked in the same
// grid cell, so the card is as tall as its taller face — no clipped blurbs.
// ---------------------------------------------------------------------------

export interface ShopSubjectCard {
  id: string
  title: string
  href?: string // order-form route; omitted when inquirySubject is set
  icon: IconName
  image?: string // path under /public — front-of-tile artwork
  imageFit?: 'cover' | 'contain' // contain (on white) for drawings that must not crop; default cover
  price?: string // e.g. 'Starting from $–' (TODO: real prices from Riley)
  blurb: string
  inquirySubject?: string // e.g. 'Bulk Ordering Inquiry' → CTA opens the contact modal
}

const TILE_SIZES = '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'

export default function SubjectCard({
  subject,
  examples,
}: {
  subject: ShopSubjectCard
  examples: GalleryImage[]
}) {
  const [flipped, setFlipped] = useState(false)
  const [exampleIndex, setExampleIndex] = useState(0)
  const [inquiryOpen, setInquiryOpen] = useState(false)

  // Flipping makes the focused control inert (browsers then drop focus to
  // <body>), so hand focus to the revealed face's control instead.
  const learnMoreRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const hasFlipped = useRef(false)
  useEffect(() => {
    if (!hasFlipped.current) {
      hasFlipped.current = flipped
      return
    }
    ;(flipped ? closeRef : learnMoreRef).current?.focus()
  }, [flipped])

  const cta = subject.inquirySubject ? 'Contact me' : 'Start an order'
  const example = examples[exampleIndex]

  const frontFace = (
    <>
      <div
        className={`relative flex-1 min-h-40 border-b border-stone-100 ${
          subject.imageFit === 'contain'
            ? 'bg-[#fff]' // literal white mat: must match the artwork's own white ground even in dark mode
            : 'bg-gradient-to-br from-olive-50 to-gold-50'
        }`}
      >
        {subject.image ? (
          <Image
            src={subject.image}
            alt={subject.title}
            fill
            sizes={TILE_SIZES}
            className={subject.imageFit === 'contain' ? 'object-contain p-2' : 'object-cover'}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-olive-300 group-hover:text-gold-400 transition-colors">
            <Icon name={subject.icon} className="w-12 h-12" />
          </div>
        )}
      </div>
      <span className="block p-4 text-center font-heading text-lg sm:text-xl font-bold text-olive-800 group-hover:text-gold-700 transition-colors leading-tight">
        {subject.title}
      </span>
    </>
  )

  return (
    <div className="h-full [perspective:1200px]">
      <div
        className={`grid h-full transition-transform duration-500 [transform-style:preserve-3d] motion-reduce:transition-none ${
          flipped ? '[transform:rotateY(180deg)]' : ''
        }`}
      >
        {/* Front — image + title only */}
        <div
          inert={flipped}
          className="[grid-area:1/1] [backface-visibility:hidden] flex flex-col bg-white border border-stone-200 hover:border-gold-400 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all"
        >
          {subject.inquirySubject ? (
            <button
              type="button"
              onClick={() => setInquiryOpen(true)}
              className="group flex flex-col flex-1 text-left"
            >
              {frontFace}
            </button>
          ) : (
            <Link href={subject.href ?? '/shop'} className="group flex flex-col flex-1">
              {frontFace}
            </Link>
          )}
          <button
            ref={learnMoreRef}
            type="button"
            onClick={() => setFlipped(true)}
            aria-expanded={flipped}
            className="border-t border-stone-100 py-2.5 text-xs font-medium text-gold-700 hover:text-gold-800 hover:bg-gold-50 transition-colors"
          >
            Learn more
          </button>
        </div>

        {/* Back — example carousel + price + blurb */}
        <div
          inert={!flipped}
          className="[grid-area:1/1] [transform:rotateY(180deg)] [backface-visibility:hidden] flex flex-col bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm"
        >
          <div className="relative aspect-[4/3] bg-gradient-to-br from-olive-50 to-gold-50 border-b border-stone-100">
            {example ? (
              example.src ? (
                <Image
                  src={example.src}
                  alt={example.caption}
                  fill
                  sizes={TILE_SIZES}
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
                  <Icon name="image" className="w-8 h-8 text-stone-300" />
                  <p className="text-stone-400 text-xs text-center leading-tight">
                    {example.caption}
                  </p>
                </div>
              )
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
                <Icon name={subject.icon} className="w-8 h-8 text-stone-300" />
                <p className="text-stone-400 text-xs text-center leading-tight">
                  Examples coming soon
                </p>
              </div>
            )}
            {examples.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setExampleIndex((exampleIndex - 1 + examples.length) % examples.length)
                  }
                  aria-label="Previous example"
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-white/90 hover:bg-white text-stone-600 shadow-sm flex items-center justify-center text-sm leading-none"
                >
                  &lsaquo;
                </button>
                <button
                  type="button"
                  onClick={() => setExampleIndex((exampleIndex + 1) % examples.length)}
                  aria-label="Next example"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-white/90 hover:bg-white text-stone-600 shadow-sm flex items-center justify-center text-sm leading-none"
                >
                  &rsaquo;
                </button>
                <span className="absolute bottom-2 right-2 bg-white/90 text-stone-600 text-[10px] font-medium px-2 py-0.5 rounded-full">
                  {exampleIndex + 1} / {examples.length}
                </span>
              </>
            )}
          </div>
          <div className="flex flex-col flex-1 gap-1.5 p-4 text-left">
            {subject.price && (
              <p className="text-[11px] font-semibold uppercase tracking-wide text-olive-800">
                {subject.price}
              </p>
            )}
            <p className="text-stone-600 text-xs leading-relaxed">{subject.blurb}</p>
            <div className="mt-auto pt-2 flex items-center justify-between gap-2">
              {subject.inquirySubject ? (
                <button
                  type="button"
                  onClick={() => setInquiryOpen(true)}
                  className="text-gold-700 text-xs font-medium hover:underline"
                >
                  {cta} &rarr;
                </button>
              ) : (
                <Link
                  href={subject.href ?? '/shop'}
                  className="text-gold-700 text-xs font-medium hover:underline"
                >
                  {cta} &rarr;
                </Link>
              )}
              <button
                ref={closeRef}
                type="button"
                onClick={() => setFlipped(false)}
                className="text-stone-500 hover:text-stone-700 text-xs font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {subject.inquirySubject && (
        <InquiryModal
          title={subject.inquirySubject}
          open={inquiryOpen}
          onClose={() => setInquiryOpen(false)}
        />
      )}
    </div>
  )
}
