import { promises as fs } from 'node:fs'
import path from 'node:path'
import { NextRequest, NextResponse } from 'next/server'
import { del } from '@vercel/blob'
import { deleteGalleryImage } from '@/lib/gallery-store'

// Admin-only (middleware.ts gates all of /api/admin): removes a gallery entry
// and best-effort cleans up its stored image (Vercel Blob, or the local-dev
// public/gallery/uploads/ fallback). A failed cleanup never fails the request
// — the entry is already gone, an orphaned file is just clutter.

async function deleteStoredImage(src: string) {
  try {
    if (src.startsWith('/gallery/uploads/')) {
      const uploadsDir = path.join(process.cwd(), 'public', 'gallery', 'uploads')
      const target = path.join(process.cwd(), 'public', src)
      if (target.startsWith(uploadsDir + path.sep)) await fs.unlink(target)
    } else if (src.includes('.blob.vercel-storage.com/') && process.env.BLOB_READ_WRITE_TOKEN) {
      await del(src)
    }
  } catch (error) {
    console.error('Failed to delete stored gallery image:', src, error)
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const deleted = await deleteGalleryImage(id)
  if (!deleted) {
    return NextResponse.json({ error: 'Gallery entry not found.' }, { status: 404 })
  }
  if (deleted.src) await deleteStoredImage(deleted.src)
  return NextResponse.json({ ok: true })
}
