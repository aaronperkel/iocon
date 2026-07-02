import Link from 'next/link'
import { Icon, type IconName } from '@/components/icons'

export const metadata = { title: 'Order — Íocón' }

// ---------------------------------------------------------------------------
// Top-level product categories shown on /order.
// Each category links to its own sub-page where the specific options live.
// Add future categories (prints, merchandise, etc.) here — no other file needs
// to change.
// ---------------------------------------------------------------------------

interface Category {
  id: string
  title: string
  subtitle: string
  href: string
  icon: IconName
}

const CATEGORIES: Category[] = [
  {
    id: 'digital-image',
    title: 'Digital Image',
    subtitle:
      'A fully digital illustration delivered as a high-resolution file — costume drawings, logos, and more.',
    href: '/order/digital-image',
    icon: 'image',
  },
  // TODO: Add more categories here, e.g.:
  // { id: 'prints', title: 'Prints', subtitle: '…', href: '/order/prints', icon: 'image' },
]

export default function OrderPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-serif text-4xl font-semibold text-gold-900 mb-2">Place an Order</h1>
      <p className="text-stone-500 text-sm mb-12">Choose a product category below to get started.</p>

      <div className="grid sm:grid-cols-2 gap-5">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.id}
            href={cat.href}
            className="group flex flex-col gap-3 bg-white border border-stone-200 hover:border-gold-400 rounded-2xl p-7 shadow-sm hover:shadow-md transition-all"
          >
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-olive-50 text-olive-800 group-hover:bg-gold-50 group-hover:text-gold-700 transition-colors">
              <Icon name={cat.icon} className="w-6 h-6" />
            </span>
            <span className="font-serif text-2xl font-semibold text-gold-900 group-hover:text-gold-700 transition-colors leading-tight">
              {cat.title}
            </span>
            <span className="text-stone-500 text-sm leading-relaxed">{cat.subtitle}</span>
            <span className="mt-auto text-gold-600 text-xs font-medium group-hover:underline">
              Select →
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
