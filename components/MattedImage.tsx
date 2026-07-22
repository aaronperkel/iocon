'use client'

import { useState } from 'react'
import Image from 'next/image'
import { sampleEdgeColor } from '@/lib/edge-color'

// ---------------------------------------------------------------------------
// Artwork that must never crop: object-contain at any container shape, with
// the letterbox bars painted in the image's own background color (sampled
// from its edge pixels on load — most pieces sit on a solid ground, so the
// bars disappear into the artwork). Until sampling succeeds the mat is
// literal white — not a theme variable, because it stands in for the
// drawing's paper ground even in dark mode.
//
// Fills its nearest positioned ancestor (like next/image `fill`). When
// cycling one slot through multiple sources (a carousel), render with
// key={src} so the mat state resets per image.
// ---------------------------------------------------------------------------

// src → sampled color, so a carousel revisiting an image doesn't flash white.
const matCache = new Map<string, string>()

export default function MattedImage({
  src,
  alt,
  sizes,
}: {
  src: string
  alt: string
  sizes?: string
}) {
  const [mat, setMat] = useState<string | null>(() => matCache.get(src) ?? null)
  return (
    <div
      className="absolute inset-0 transition-colors duration-300"
      style={{ backgroundColor: mat ?? '#fff' }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        className="object-contain"
        onLoad={(e) => {
          const color = sampleEdgeColor(e.currentTarget)
          if (color) {
            matCache.set(src, color)
            setMat(color)
          }
        }}
      />
    </div>
  )
}
