// Client-side image shrinking, shared by the admin gallery upload and the
// order-form uploads. Vercel serverless bodies cap at ~4.5 MB and phone
// photos / iPad art exports routinely blow past that, so oversized images are
// shrunk in the browser (canvas) before uploading. Browser-only — call it
// from 'use client' code.

const SHRINK_THRESHOLD_BYTES = 3.5 * 1024 * 1024
const MAX_EDGE_PX = 2400

function canvasToBlob(canvas: HTMLCanvasElement, type: string): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, 0.85))
}

export async function shrinkImage(file: File): Promise<Blob> {
  // GIFs would lose animation in a canvas round-trip; send as-is and let the
  // server's size check speak if it's too big.
  if (file.size <= SHRINK_THRESHOLD_BYTES || file.type === 'image/gif') return file
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, MAX_EDGE_PX / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(bitmap.width * scale))
    canvas.height = Math.max(1, Math.round(bitmap.height * scale))
    const ctx = canvas.getContext('2d')
    if (!ctx) return file
    const targetType = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
    if (targetType === 'image/jpeg') {
      // JPEG has no alpha — flatten onto white instead of black.
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()
    let blob = await canvasToBlob(canvas, targetType)
    if (blob && targetType === 'image/png' && blob.size > SHRINK_THRESHOLD_BYTES) {
      ctx.globalCompositeOperation = 'destination-over'
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      blob = await canvasToBlob(canvas, 'image/jpeg')
    }
    return blob && blob.size < file.size ? blob : file
  } catch {
    return file
  }
}
