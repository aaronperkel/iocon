import Link from 'next/link'

export const metadata = { title: 'Solo Icon — Íocón' }

// Solo Icon is a fork: design a brand-new costume (Flow A) or draw an
// existing one (Flow B).
const OPTIONS = [
  {
    id: 'new-costume',
    label: 'Design a New Costume from Scratch',
    description:
      'A completely original costume concept tailored to your vision — silhouette, embroidery, colors, and all.',
    href: '/shop/solo-icon/new-costume',
  },
  {
    id: 'existing-costume',
    label: 'Draw My Existing Costume',
    description:
      'A solo icon of a costume you already own, drawn from your photos down to the last detail.',
    href: '/shop/solo-icon/existing-costume',
  },
]

export default function SoloIconPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <nav className="flex items-center gap-1.5 text-xs text-stone-400" aria-label="Breadcrumb">
        <Link href="/shop" className="hover:text-gold-600 transition-colors">
          Shop
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-stone-600">Solo Icon</span>
      </nav>

      <h1 className="font-heading text-4xl font-bold text-gold-900 mb-2 mt-4">Solo Icon</h1>
      <p className="text-stone-500 text-sm mb-10">
        Would you like a brand-new costume design, or an icon of a costume you already own?
      </p>

      <div className="grid sm:grid-cols-2 gap-5">
        {OPTIONS.map((opt) => (
          <Link
            key={opt.id}
            href={opt.href}
            className="group flex flex-col gap-3 bg-white border border-stone-200 hover:border-gold-400 rounded-2xl p-7 shadow-sm hover:shadow-md transition-all"
          >
            <span className="font-heading text-xl font-bold text-gold-900 group-hover:text-gold-700 transition-colors leading-tight">
              {opt.label}
            </span>
            <span className="text-stone-500 text-sm leading-relaxed">{opt.description}</span>
            <span className="mt-auto text-gold-600 text-xs font-medium group-hover:underline">
              Select →
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
