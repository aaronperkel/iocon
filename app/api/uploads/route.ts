import { promises as fs } from 'node:fs'
import path from 'node:path'
import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { rateLimit } from '@/lib/auth'

// Deliberately public (like POST /api/orders): the order forms upload dancer,
// layout, and inspiration images here at submit time and put the returned
// URLs in the order details. Storage mirrors the admin gallery route: Vercel
// Blob when BLOB_READ_WRITE_TOKEN is set, public/order-uploads/ (gitignored)
// in local dev, 503 on Vercel without the token.
//
// Guardrails for a public endpoint: image content types only, the ~4.5 MB
// Vercel body cap, and a best-effort per-IP rate limit (in-memory, so
// per-lambda in prod — the size cap is the real bound on abuse).

const MAX_UPLOAD_BYTES = 4.5 * 1024 * 1024

// Generous enough for the biggest legit order (many dancers × several photos
// each, submitted in one Promise.all burst) while capping drive-by abuse.
const RATE_LIMIT_MAX = 60
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000

const IMAGE_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (!rateLimit(`upload:${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS)) {
    return NextResponse.json(
      { error: 'Too many uploads — please try again later.' },
      { status: 429 }
    )
  }

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

  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`
  let url: string
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`orders/${filename}`, image, {
      access: 'public',
      contentType: image.type,
    })
    url = blob.url
  } else if (!process.env.VERCEL) {
    const dir = path.join(process.cwd(), 'public', 'order-uploads')
    await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(path.join(dir, filename), Buffer.from(await image.arrayBuffer()))
    url = `/order-uploads/${filename}`
  } else {
    return NextResponse.json(
      { error: 'Image storage is not configured — add BLOB_READ_WRITE_TOKEN in Vercel.' },
      { status: 503 }
    )
  }

  return NextResponse.json({ url }, { status: 201 })
}
