// Uploads order-form images to POST /api/uploads at submit time (shrinking
// oversized ones in the browser first) and returns the stored URLs, in the
// same order as the input. Browser-only — call it from 'use client' code.

import type { UploadedFile } from '@/components/ImageUpload'
import { shrinkImage } from './shrink-image'

export async function uploadOrderImages(files: UploadedFile[]): Promise<string[]> {
  return Promise.all(
    files.map(async (f) => {
      const blob = await shrinkImage(f.file)
      const form = new FormData()
      if (blob === f.file) form.append('image', f.file)
      else form.append('image', blob, f.name)
      const res = await fetch('/api/uploads', { method: 'POST', body: form })
      const data = await res.json().catch(() => null)
      if (!res.ok || typeof data?.url !== 'string') {
        throw new Error(data?.error || 'Image upload failed')
      }
      return data.url as string
    })
  )
}
