import type { ProductFormat } from './products'

// ---------------------------------------------------------------------------
// Gallery data — each image is tagged with a product type and a subject so
// visitors can filter the gallery by either.
//
// TODO: These are placeholder entries. To add real pieces, drop the image in
//   public/gallery/ and add an entry with `src: '/gallery/<file>'` — tiles
//   without a src render as placeholder art blocks.
// ---------------------------------------------------------------------------

export type GallerySubject =
  | 'solo-icon'
  | 'group-icons'
  | 'through-the-years'
  | 'walking-duo'
  | 'logo'
  | 'custom-graphic'

export const GALLERY_SUBJECT_LABELS: Record<GallerySubject, string> = {
  'solo-icon': 'Solo Icon',
  'group-icons': 'Group Icons',
  'through-the-years': 'Through the Years',
  'walking-duo': 'Walking Duo',
  logo: 'Logo',
  'custom-graphic': 'Custom Graphic',
}

export interface GalleryImage {
  id: string
  caption: string
  product: ProductFormat
  subject: GallerySubject
  src?: string // path under /public; placeholder tile when absent
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
