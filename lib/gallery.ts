import type { ProductFormat } from './products'

// ---------------------------------------------------------------------------
// Gallery types + labels — each image is tagged with a product type and a
// subject so visitors can filter the gallery by either. This module stays
// client-safe (GalleryGrid value-imports it); the DB-backed store that Riley
// manages from the admin Gallery tab lives in lib/gallery-store.ts
// (server-only), following the orders.ts / order-types.ts split.
//
// GALLERY_IMAGES below are placeholder entries, shown only while the real
// (admin-managed) gallery is empty so the page never renders blank.
// ---------------------------------------------------------------------------

export type GallerySubject =
  | 'solo-icon'
  | 'group-icons'
  | 'through-the-years'
  | 'walking-duo'
  | 'bulk-drawings'
  | 'logo'
  | 'custom-graphic'

export const GALLERY_SUBJECT_LABELS: Record<GallerySubject, string> = {
  'solo-icon': 'Solo Icon',
  'group-icons': 'Group Icons',
  'through-the-years': 'Through the Years',
  'walking-duo': 'Walking Duo',
  'bulk-drawings': 'Bulk Drawings',
  logo: 'Logo',
  'custom-graphic': 'Custom Graphic',
}

export interface GalleryImage {
  id: string
  caption: string
  product: ProductFormat
  subject: GallerySubject
  src?: string // Blob URL or path under /public; placeholder tile when absent
  date?: string // YYYY-MM-DD — when the piece was made (Riley dates each entry)
}

// Shown as "Jul 2026" on tiles — month/year is the granularity that matters
// for artwork; the admin panel shows the full date.
export function formatGalleryDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  })
}

export const GALLERY_IMAGES: GalleryImage[] = [
  { id: 'g1', caption: 'Solo Feis Dress', product: 'digital-download', subject: 'solo-icon' },
  { id: 'g2', caption: 'School Crest Logo', product: 'digital-download', subject: 'logo' },
  { id: 'g3', caption: 'Championship Gown', product: 'digital-download', subject: 'solo-icon' },
  { id: 'g4', caption: 'Walking Duo Study', product: 'digital-download', subject: 'walking-duo' },
  {
    id: 'g5',
    caption: 'Through the Years — First Feis to Now',
    product: 'digital-download',
    subject: 'through-the-years',
  },
  { id: 'g6', caption: 'Custom Crest', product: 'digital-download', subject: 'custom-graphic' },
  { id: 'g7', caption: 'Céilí Team Group Icon', product: 'digital-download', subject: 'group-icons' },
]
