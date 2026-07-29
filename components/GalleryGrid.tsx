'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  formatGalleryDate,
  GALLERY_SUBJECT_LABELS,
  PUBLIC_GALLERY_SUBJECTS,
  type GalleryImage,
  type GallerySubject,
} from '@/lib/gallery'
import { AVAILABLE_PRODUCTS, PRODUCT_FORMAT_LABELS, type ProductFormat } from '@/lib/products'

// Filterable gallery grid. Entries come from the server page (the DB-backed
// gallery Riley manages from the admin Gallery tab). The active filters live
// in the URL query string (?product=…&subject=…) so views are shareable and
// deep-linkable. Filter chips offer only what's currently for sale
// (AVAILABLE_PRODUCTS / PUBLIC_GALLERY_SUBJECTS) — the product row hides
// itself entirely while only one format exists. Clicking a tile opens the
// piece full-size in a lightbox (tiles crop to squares; the dialog doesn't).

const PRODUCTS = AVAILABLE_PRODUCTS
const SUBJECTS = PUBLIC_GALLERY_SUBJECTS

export default function GalleryGrid({ images }: { images: GalleryImage[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [lightbox, setLightbox] = useState<GalleryImage | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (lightbox && !dialog.open) dialog.showModal()
    else if (!lightbox && dialog.open) dialog.close()
  }, [lightbox])

  const productParam = searchParams.get('product')
  const subjectParam = searchParams.get('subject')
  const product = PRODUCTS.includes(productParam as ProductFormat)
    ? (productParam as ProductFormat)
    : null
  const subject = SUBJECTS.includes(subjectParam as GallerySubject)
    ? (subjectParam as GallerySubject)
    : null

  function setFilter(key: 'product' | 'subject', value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  const filtered = images.filter(
    (img) => (!product || img.product === product) && (!subject || img.subject === subject)
  )

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="space-y-4">
        {PRODUCTS.length > 1 && (
          <FilterRow
            label="Product"
            options={PRODUCTS.map((p) => ({ value: p, label: PRODUCT_FORMAT_LABELS[p] }))}
            active={product}
            onSelect={(v) => setFilter('product', v)}
          />
        )}
        <FilterRow
          label="Subject"
          options={SUBJECTS.map((s) => ({ value: s, label: GALLERY_SUBJECT_LABELS[s] }))}
          active={subject}
          onSelect={(v) => setFilter('subject', v)}
        />
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="text-stone-400 italic text-sm py-8 text-center">
          Nothing here yet — new pieces are always in the works, so check back soon!
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {filtered.map((img) =>
            img.src ? (
              <button
                key={img.id}
                type="button"
                onClick={() => setLightbox(img)}
                aria-label={`View “${img.caption}” full size`}
                className="group relative rounded-xl overflow-hidden aspect-square bg-gradient-to-br from-olive-50 to-gold-50 border border-stone-200 cursor-zoom-in text-left"
              >
                <Image src={img.src} alt={img.caption} fill className="object-cover" />
                <TileBadges img={img} />
                <div className="absolute inset-0 bg-gold-950/0 group-hover:bg-gold-950/10 transition-colors" />
              </button>
            ) : (
              <div
                key={img.id}
                className="group relative rounded-xl overflow-hidden aspect-square bg-gradient-to-br from-olive-50 to-gold-50 border border-stone-200"
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4">
                  <ImagePlaceholderIcon />
                  <p className="text-stone-400 text-xs text-center leading-tight">
                    {img.caption}
                  </p>
                </div>
                <TileBadges img={img} />
              </div>
            )
          )}
        </div>
      )}

      {/* Lightbox — the tiles crop to squares; this shows the whole piece. */}
      <dialog
        ref={dialogRef}
        onClose={() => setLightbox(null)}
        onClick={(e) => {
          // The dialog element itself is only the click target on the backdrop.
          if (e.target === dialogRef.current) dialogRef.current?.close()
        }}
        aria-label={lightbox ? `${lightbox.caption}, full size` : undefined}
        className="rounded-2xl border border-stone-200 bg-white p-0 shadow-xl backdrop:bg-[rgb(28_25_23/0.7)]"
      >
        {lightbox?.src && (
          <div className="p-3 sm:p-4">
            <div className="relative w-[min(90vw,52rem)] h-[min(72vh,44rem)]">
              <Image
                src={lightbox.src}
                alt={lightbox.caption}
                fill
                sizes="90vw"
                className="object-contain"
              />
            </div>
            <div className="mt-3 flex items-center justify-between gap-4">
              <p className="text-sm text-stone-600">
                <span className="font-medium text-stone-700">{lightbox.caption}</span>
                <span className="text-stone-400">
                  {' '}
                  — {GALLERY_SUBJECT_LABELS[lightbox.subject]}
                  {lightbox.date ? `, ${formatGalleryDate(lightbox.date)}` : ''}
                </span>
              </p>
              <button
                type="button"
                onClick={() => dialogRef.current?.close()}
                className="shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium text-stone-500 hover:text-stone-700 hover:bg-stone-100 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </dialog>
    </div>
  )
}

function TileBadges({ img }: { img: GalleryImage }) {
  return (
    <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1">
      <span className="bg-white/90 text-stone-600 text-[10px] font-medium px-2 py-0.5 rounded-full">
        {GALLERY_SUBJECT_LABELS[img.subject]}
      </span>
      {img.date && (
        <span className="bg-white/90 text-stone-600 text-[10px] font-medium px-2 py-0.5 rounded-full">
          {formatGalleryDate(img.date)}
        </span>
      )}
    </div>
  )
}

function FilterRow({
  label,
  options,
  active,
  onSelect,
}: {
  label: string
  options: { value: string; label: string }[]
  active: string | null
  onSelect: (value: string | null) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide w-16 shrink-0">
        {label}
      </span>
      <Chip label="All" selected={active === null} onClick={() => onSelect(null)} />
      {options.map((opt) => (
        <Chip
          key={opt.value}
          label={opt.label}
          selected={active === opt.value}
          onClick={() => onSelect(opt.value)}
        />
      ))}
    </div>
  )
}

function Chip({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
        selected
          ? 'bg-olive-800 text-white border-olive-800'
          : 'bg-white text-stone-600 border-stone-300 hover:border-gold-400'
      }`}
    >
      {label}
    </button>
  )
}

function ImagePlaceholderIcon() {
  return (
    <svg
      className="w-10 h-10 text-stone-300"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  )
}
