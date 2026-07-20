// ---------------------------------------------------------------------------
// Admin-managed gallery entries, backed by TiDB (see lib/db.ts) with the same
// in-memory fallback pattern as lib/orders.ts / lib/reviews.ts when
// DATABASE_URL is absent. Riley adds/tags/dates entries from the admin
// Gallery tab; image files live in Vercel Blob (or public/gallery/uploads/
// in local dev — see app/api/admin/gallery/route.ts).
//
// Types + labels are client-safe and live in lib/gallery.ts.
// ---------------------------------------------------------------------------

import 'server-only'
import type { RowDataPacket, ResultSetHeader } from 'mysql2/promise'
import { getPool, isDbConfigured } from './db'
import { GALLERY_IMAGES, type GalleryImage } from './gallery'

const memory = ((globalThis as unknown as { __ioconGallery?: { images: GalleryImage[] } })
  .__ioconGallery ??= { images: [] })

interface GalleryRow extends RowDataPacket {
  id: string
  caption: string
  product: GalleryImage['product']
  subject: GalleryImage['subject']
  src: string
  artwork_date: Date | null
  created_at: Date
}

function rowToImage(row: GalleryRow): GalleryImage {
  return {
    id: row.id,
    caption: row.caption,
    product: row.product,
    subject: row.subject,
    src: row.src,
    // DATE columns come back as midnight-UTC Dates (pool timezone is 'Z');
    // slice the ISO string rather than round-tripping through local time.
    date: row.artwork_date ? row.artwork_date.toISOString().slice(0, 10) : undefined,
  }
}

// Newest artwork first; undated entries sink to the bottom.
function byDateDesc(a: GalleryImage, b: GalleryImage): number {
  return (b.date ?? '') < (a.date ?? '') ? -1 : (b.date ?? '') > (a.date ?? '') ? 1 : 0
}

/** Real (admin-added) entries only — what the admin Gallery tab lists. */
export async function getGalleryImages(): Promise<GalleryImage[]> {
  if (!isDbConfigured()) return [...memory.images].sort(byDateDesc)
  const [rows] = await getPool().query<GalleryRow[]>(
    `SELECT id, caption, product, subject, src, artwork_date, created_at
     FROM gallery
     ORDER BY (artwork_date IS NULL), artwork_date DESC, created_at DESC`
  )
  return rows.map(rowToImage)
}

/** What visitors see: real entries, or the placeholder set while none exist. */
export async function getPublicGalleryImages(): Promise<GalleryImage[]> {
  const images = await getGalleryImages()
  return images.length > 0 ? images : GALLERY_IMAGES
}

export async function addGalleryImage(
  data: Omit<GalleryImage, 'id'> & { src: string }
): Promise<GalleryImage> {
  const newImage: GalleryImage & { src: string } = {
    ...data,
    id: `gallery-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  }
  if (!isDbConfigured()) {
    memory.images = [...memory.images, newImage]
    return newImage
  }
  await getPool().execute(
    `INSERT INTO gallery (id, caption, product, subject, src, artwork_date, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      newImage.id,
      newImage.caption,
      newImage.product,
      newImage.subject,
      newImage.src,
      newImage.date ?? null,
      new Date(),
    ]
  )
  return newImage
}

/** Returns the deleted entry (so the route can clean up its stored file). */
export async function deleteGalleryImage(id: string): Promise<GalleryImage | null> {
  if (!isDbConfigured()) {
    const image = memory.images.find((img) => img.id === id) ?? null
    if (image) memory.images = memory.images.filter((img) => img.id !== id)
    return image
  }
  const [rows] = await getPool().query<GalleryRow[]>(
    'SELECT id, caption, product, subject, src, artwork_date, created_at FROM gallery WHERE id = ?',
    [id]
  )
  if (rows.length === 0) return null
  await getPool().execute<ResultSetHeader>('DELETE FROM gallery WHERE id = ?', [id])
  return rowToImage(rows[0])
}
