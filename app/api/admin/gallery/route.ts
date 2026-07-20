import { promises as fs } from 'node:fs'
import path from 'node:path'
import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { GALLERY_SUBJECT_LABELS, type GalleryImage } from '@/lib/gallery'
import { addGalleryImage, getGalleryImages } from '@/lib/gallery-store'
import { PRODUCT_FORMAT_LABELS } from '@/lib/products'

// Admin-only (middleware.ts gates all of /api/admin): Riley's gallery
// management. GET lists the real (admin-added) entries; POST uploads an image
// and creates a tagged, dated entry.
//
// Image files go to Vercel Blob (BLOB_READ_WRITE_TOKEN in .env.local — mirror
// into Vercel). Without the token, local dev falls back to writing under
// public/gallery/uploads/ (gitignored) so uploads work on a fresh clone; on
// Vercel the filesystem is read-only, so missing token → 503.

// Vercel serverless bodies cap at ~4.5 MB; AdminGalleryPanel shrinks larger
// images client-side before uploading.
const MAX_UPLOAD_BYTES = 4.5 * 1024 * 1024

const IMAGE_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

export async function GET() {
  return NextResponse.json(await getGalleryImages())
}

export async function POST(req: NextRequest) {
  const form = await req.formData()

  const image = form.get('image')
  if (!(image instanceof File) || image.size === 0) {
    return NextResponse.json({ error: 'Please choose an image to upload.' }, { status: 400 })
  }
  const ext = IMAGE_EXTENSIONS[image.type]
  if (!ext) {
    return NextResponse.json(
      { error: 'Unsupported image type — please upload a JPEG, PNG, WebP, or GIF.' },
      { status: 400 }
    )
  }
  if (image.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: 'Image is too large — please upload a file under 4.5 MB.' },
      { status: 413 }
    )
  }

  const caption = String(form.get('caption') ?? '').trim()
  if (!caption || caption.length > 191) {
    return NextResponse.json({ error: 'Please add a caption (up to 191 characters).' }, { status: 400 })
  }
  const subject = String(form.get('subject') ?? '')
  if (!(subject in GALLERY_SUBJECT_LABELS)) {
    return NextResponse.json({ error: 'Please pick a valid subject.' }, { status: 400 })
  }
  const product = String(form.get('product') ?? '')
  if (!(product in PRODUCT_FORMAT_LABELS)) {
    return NextResponse.json({ error: 'Please pick a valid product type.' }, { status: 400 })
  }
  const date = String(form.get('date') ?? '')
  if (date && (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date)))) {
    return NextResponse.json({ error: 'Please pick a valid date.' }, { status: 400 })
  }

  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`
  let src: string
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`gallery/${filename}`, image, {
      access: 'public',
      contentType: image.type,
    })
    src = blob.url
  } else if (!process.env.VERCEL) {
    const dir = path.join(process.cwd(), 'public', 'gallery', 'uploads')
    await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(path.join(dir, filename), Buffer.from(await image.arrayBuffer()))
    src = `/gallery/uploads/${filename}`
  } else {
    return NextResponse.json(
      { error: 'Image storage is not configured — add BLOB_READ_WRITE_TOKEN in Vercel.' },
      { status: 503 }
    )
  }

  const entry = await addGalleryImage({
    caption,
    product: product as GalleryImage['product'],
    subject: subject as GalleryImage['subject'],
    src,
    date: date || undefined,
  })
  return NextResponse.json(entry, { status: 201 })
}
