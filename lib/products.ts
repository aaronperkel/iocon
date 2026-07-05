// ---------------------------------------------------------------------------
// Product formats — the physical/digital format the finished art ships in.
// Shared by the order forms (product selection step) and the gallery filters.
//
// Riley currently offers Digital Download only. When prints/stickers launch,
// add them to AVAILABLE_PRODUCTS — the product selection step and gallery
// filters pick them up automatically.
// ---------------------------------------------------------------------------

export type ProductFormat = 'digital-download' | 'print' | 'sticker'

export const PRODUCT_FORMAT_LABELS: Record<ProductFormat, string> = {
  'digital-download': 'Digital Download',
  print: 'Print',
  sticker: 'Sticker',
}

export const PRODUCT_DESCRIPTIONS: Record<ProductFormat, string> = {
  'digital-download':
    'A high-resolution digital file of your finished art, delivered directly to you.',
  print: 'Your art printed and shipped to you.',
  sticker: 'Your art as a die-cut sticker.',
}

// Formats currently for sale.
export const AVAILABLE_PRODUCTS: ProductFormat[] = ['digital-download']
