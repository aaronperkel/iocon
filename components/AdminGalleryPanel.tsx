'use client'

// Gallery management panel on the admin page — Riley uploads a piece, tags it
// with a subject + product, and dates it (her July 2026 ask: "add gallery
// images and tag them and date them"). Entries go live on /gallery and the
// shop flip-tile carousels immediately. Files are stored via
// POST /api/admin/gallery (Vercel Blob, or public/gallery/uploads/ in dev).

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Field } from '@/components/FormField'
import {
  GALLERY_SUBJECT_LABELS,
  type GalleryImage,
  type GallerySubject,
} from '@/lib/gallery'
import { PRODUCT_FORMAT_LABELS, type ProductFormat } from '@/lib/products'
import { shrinkImage } from '@/lib/shrink-image'

const inputCls =
  'w-full rounded-lg border border-stone-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gold-400 transition'

function todayLocalISO(): string {
  const now = new Date()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${mm}-${dd}`
}

export default function AdminGalleryPanel() {
  const router = useRouter()
  const [images, setImages] = useState<GalleryImage[] | null>(null)

  // Add form
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [caption, setCaption] = useState('')
  const [subject, setSubject] = useState<GallerySubject | ''>('')
  const [product, setProduct] = useState<ProductFormat>('digital-download')
  const [date, setDate] = useState(todayLocalISO())
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [added, setAdded] = useState<string | null>(null)

  // List
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [listError, setListError] = useState<string | null>(null)

  async function refresh(): Promise<GalleryImage[] | null> {
    const res = await fetch('/api/admin/gallery')
    if (res.status === 401) {
      router.replace('/admin/login')
      return null
    }
    return res.json()
  }

  useEffect(() => {
    refresh()
      .then((data) => data && setImages(data))
      .catch(() => setImages([]))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Object-URL preview for the chosen file; revoke the old one on change.
  useEffect(() => {
    if (!file) {
      setPreview(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const ready = file !== null && caption.trim() !== '' && subject !== ''

  async function submit() {
    if (!ready || !file) return
    setSubmitting(true)
    setFormError(null)
    setAdded(null)
    try {
      const blob = await shrinkImage(file)
      const form = new FormData()
      if (blob === file) form.append('image', file)
      else form.append('image', blob, 'artwork')
      form.append('caption', caption.trim())
      form.append('subject', subject)
      form.append('product', product)
      form.append('date', date)
      const res = await fetch('/api/admin/gallery', { method: 'POST', body: form })
      if (res.status === 401) {
        router.replace('/admin/login')
        return
      }
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.error)
      setAdded(data?.caption ?? caption.trim())
      setFile(null)
      setCaption('')
      if (fileInputRef.current) fileInputRef.current.value = ''
      const list = await refresh()
      if (list) setImages(list)
    } catch (err) {
      setFormError(
        err instanceof Error && err.message
          ? err.message
          : 'Something went wrong — the image was not added. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  async function remove(id: string) {
    setDeletingId(id)
    setListError(null)
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, { method: 'DELETE' })
      if (res.status === 401) {
        router.replace('/admin/login')
        return
      }
      if (!res.ok) throw new Error()
      setImages((prev) => (prev ? prev.filter((img) => img.id !== id) : prev))
    } catch {
      setListError('Failed to delete the image. Please try again.')
    } finally {
      setDeletingId(null)
      setConfirmId(null)
    }
  }

  return (
    <div className="space-y-10">
      {/* Add form */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 space-y-4">
        <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide">
          Add a gallery image
        </p>
        <Field label="Image" required>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null)
              setAdded(null)
            }}
            className="block w-full text-sm text-stone-600 cursor-pointer file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-olive-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-olive-800 hover:file:bg-olive-50 transition"
          />
        </Field>
        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Preview of the chosen image"
            className="h-40 rounded-lg border border-stone-200 bg-white object-contain"
          />
        )}
        <Field label="Caption" required>
          <input
            type="text"
            value={caption}
            maxLength={191}
            onChange={(e) => {
              setCaption(e.target.value)
              setAdded(null)
            }}
            className={inputCls}
          />
        </Field>
        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="Subject" required>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value as GallerySubject | '')}
              className={inputCls}
            >
              <option value="" disabled>
                Choose…
              </option>
              {Object.entries(GALLERY_SUBJECT_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Product" required>
            <select
              value={product}
              onChange={(e) => setProduct(e.target.value as ProductFormat)}
              className={inputCls}
            >
              {Object.entries(PRODUCT_FORMAT_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Date">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            disabled={!ready || submitting}
            onClick={submit}
            className="bg-gold hover:bg-gold-400 disabled:opacity-60 text-gold-950 font-medium text-sm px-8 py-2.5 rounded-lg transition-colors"
          >
            {submitting ? 'Uploading…' : 'Add to gallery'}
          </button>
          {added && (
            <p className="text-sm text-olive-800 font-medium">
              Added &ldquo;{added}&rdquo; — it&rsquo;s live on the gallery now.
            </p>
          )}
        </div>
        {formError && <p className="text-xs text-red-600">{formError}</p>}
      </div>

      {/* Existing entries */}
      <div>
        <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-3">
          Gallery images
        </p>
        {listError && <p className="text-xs text-red-600 mb-3">{listError}</p>}
        {images === null ? (
          <p className="text-stone-400 text-sm">Loading gallery…</p>
        ) : images.length === 0 ? (
          <p className="text-stone-400 italic text-sm">
            No gallery images yet — visitors see placeholder tiles until you add
            the first one.
          </p>
        ) : (
          <div className="space-y-3">
            {images.map((img) => (
              <div
                key={img.id}
                className="bg-white rounded-2xl border border-stone-200 shadow-sm px-5 py-4 flex items-center gap-4"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.src}
                  alt={img.caption}
                  className="h-16 w-16 rounded-lg border border-stone-100 object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-800 truncate">{img.caption}</p>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    <span className="bg-olive-50 text-olive-800 text-[10px] font-medium px-2 py-0.5 rounded-full">
                      {GALLERY_SUBJECT_LABELS[img.subject]}
                    </span>
                    <span className="bg-olive-50 text-olive-800 text-[10px] font-medium px-2 py-0.5 rounded-full">
                      {PRODUCT_FORMAT_LABELS[img.product]}
                    </span>
                    {img.date && (
                      <span className="bg-stone-100 text-stone-600 text-[10px] font-medium px-2 py-0.5 rounded-full">
                        {new Date(`${img.date}T00:00:00`).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    )}
                  </div>
                </div>
                {confirmId === img.id ? (
                  <span className="flex items-center gap-3 shrink-0">
                    <button
                      type="button"
                      disabled={deletingId === img.id}
                      onClick={() => remove(img.id)}
                      className="text-xs text-red-600 font-medium underline underline-offset-2 disabled:opacity-50"
                    >
                      {deletingId === img.id ? 'Deleting…' : 'Confirm delete'}
                    </button>
                    <button
                      type="button"
                      disabled={deletingId === img.id}
                      onClick={() => setConfirmId(null)}
                      className="text-xs text-stone-500 hover:text-olive-800 underline underline-offset-2 transition-colors"
                    >
                      Cancel
                    </button>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmId(img.id)}
                    className="text-xs text-stone-500 hover:text-red-600 underline underline-offset-2 transition-colors shrink-0"
                  >
                    Delete
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
