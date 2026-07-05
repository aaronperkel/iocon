'use client'

import Image from 'next/image'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  GALLERY_IMAGES,
  GALLERY_SUBJECT_LABELS,
  type GallerySubject,
} from '@/lib/gallery'
import { PRODUCT_FORMAT_LABELS, type ProductFormat } from '@/lib/products'

// Filterable gallery grid. The active filters live in the URL query string
// (?product=…&subject=…) so views are shareable and the shop's
// "Digital Download" button can deep-link straight to a filtered gallery.

const PRODUCTS = Object.keys(PRODUCT_FORMAT_LABELS) as ProductFormat[]
const SUBJECTS = Object.keys(GALLERY_SUBJECT_LABELS) as GallerySubject[]

export default function GalleryGrid() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

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

  const filtered = GALLERY_IMAGES.filter(
    (img) => (!product || img.product === product) && (!subject || img.subject === subject)
  )

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="space-y-4">
        <FilterRow
          label="Product"
          options={PRODUCTS.map((p) => ({ value: p, label: PRODUCT_FORMAT_LABELS[p] }))}
          active={product}
          onSelect={(v) => setFilter('product', v)}
        />
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
          {filtered.map((img) => (
            <div
              key={img.id}
              className="group relative rounded-xl overflow-hidden aspect-square bg-gradient-to-br from-olive-50 to-gold-50 border border-stone-200"
            >
              {img.src ? (
                <Image src={img.src} alt={img.caption} fill className="object-cover" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4">
                  <ImagePlaceholderIcon />
                  <p className="text-stone-400 text-xs text-center leading-tight">
                    {img.caption}
                  </p>
                </div>
              )}
              {/* Tag badges */}
              <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1">
                <span className="bg-white/90 text-stone-600 text-[10px] font-medium px-2 py-0.5 rounded-full">
                  {GALLERY_SUBJECT_LABELS[img.subject]}
                </span>
                <span className="bg-white/90 text-stone-600 text-[10px] font-medium px-2 py-0.5 rounded-full">
                  {PRODUCT_FORMAT_LABELS[img.product]}
                </span>
              </div>
              <div className="absolute inset-0 bg-gold-950/0 group-hover:bg-gold-950/10 transition-colors" />
            </div>
          ))}
        </div>
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
          ? 'bg-gold-900 text-white border-gold-900'
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
