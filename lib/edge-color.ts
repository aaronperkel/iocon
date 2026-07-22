// ---------------------------------------------------------------------------
// Client-only canvas helper for components/MattedImage.tsx: reads a rendered
// image's border pixels and returns their average color, so letterbox bars
// around an object-contain image can match the artwork's own background.
//
// Works on any same-origin <img> — and every image we render goes through
// next/image's same-origin /_next/image optimizer (or lives under /public),
// so the canvas is never tainted. If it ever is (or decoding fails), we
// return null and the caller keeps its default white mat.
// ---------------------------------------------------------------------------

const SAMPLE_SIZE = 24 // image scaled down to this square before reading edges

export function sampleEdgeColor(img: HTMLImageElement): string | null {
  try {
    const canvas = document.createElement('canvas')
    canvas.width = SAMPLE_SIZE
    canvas.height = SAMPLE_SIZE
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return null
    ctx.drawImage(img, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE)
    const { data } = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE)

    let r = 0
    let g = 0
    let b = 0
    let count = 0
    for (let y = 0; y < SAMPLE_SIZE; y++) {
      for (let x = 0; x < SAMPLE_SIZE; x++) {
        // Border ring only — the interior is the artwork, not its ground.
        if (x !== 0 && x !== SAMPLE_SIZE - 1 && y !== 0 && y !== SAMPLE_SIZE - 1) continue
        const i = (y * SAMPLE_SIZE + x) * 4
        const alpha = data[i + 3] / 255
        // Composite transparent edges over white, the card surface behind them.
        r += data[i] * alpha + 255 * (1 - alpha)
        g += data[i + 1] * alpha + 255 * (1 - alpha)
        b += data[i + 2] * alpha + 255 * (1 - alpha)
        count++
      }
    }
    if (count === 0) return null
    return `rgb(${Math.round(r / count)}, ${Math.round(g / count)}, ${Math.round(b / count)})`
  } catch {
    return null
  }
}
