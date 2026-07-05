'use client'

import {
  AVAILABLE_PRODUCTS,
  PRODUCT_DESCRIPTIONS,
  PRODUCT_FORMAT_LABELS,
  type ProductFormat,
} from '@/lib/products'

interface Props {
  value: ProductFormat | null
  onChange: (value: ProductFormat) => void
  error?: string
}

// Once-per-order product format step. Only Digital Download exists today —
// when Riley adds prints/stickers to AVAILABLE_PRODUCTS they show up here
// automatically.
export function ProductSelectionBlock({ value, onChange, error }: Props) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-stone-500">
        Your finished design can be added to any product format, so you only fill out the form
        once — more formats are coming soon.
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        {AVAILABLE_PRODUCTS.map((product) => {
          const selected = value === product
          return (
            <button
              key={product}
              type="button"
              onClick={() => onChange(product)}
              className={`relative rounded-xl border-2 p-4 text-left transition ${
                selected
                  ? 'border-gold-600 ring-2 ring-gold-600/30 bg-gold-50'
                  : 'border-stone-200 hover:border-gold-400 bg-white'
              }`}
            >
              <p className="font-medium text-sm text-stone-800">
                {PRODUCT_FORMAT_LABELS[product]}
              </p>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                {PRODUCT_DESCRIPTIONS[product]}
              </p>
              {selected && (
                <span className="absolute top-3 right-3 w-5 h-5 bg-gold-600 rounded-full flex items-center justify-center">
                  <svg
                    viewBox="0 0 12 10"
                    fill="none"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-3 h-3"
                    aria-hidden="true"
                  >
                    <polyline points="1,5 4,8 11,1" />
                  </svg>
                </span>
              )}
            </button>
          )
        })}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
