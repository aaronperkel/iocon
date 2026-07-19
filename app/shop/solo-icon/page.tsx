import Link from 'next/link'

export const metadata = { title: 'Solo Icon — Íocón Graphics' }

// Solo Icon is a fork: draw an existing costume (Flow B) or design a
// brand-new one (Flow A). Existing costume is listed first (Riley, 2026-07);
// both blurbs are her copy.
const OPTIONS = [
  {
    id: 'existing-costume',
    label: 'Draw My Existing Costume',
    description: 'An icon created from images of a costume you already own.',
    href: '/shop/solo-icon/existing-costume',
  },
  {
    id: 'new-costume',
    label: 'Design a New Costume from Scratch',
    description:
      'An original costume concept that we work together to create. Can be used to support the design process with dressmakers.',
    href: '/shop/solo-icon/new-costume',
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

      <h1 className="font-heading text-4xl font-bold text-olive-800 mb-8 mt-4">Solo Icon</h1>

      <div className="grid sm:grid-cols-2 gap-5">
        {OPTIONS.map((opt) => (
          <Link
            key={opt.id}
            href={opt.href}
            className="group flex flex-col gap-3 bg-white border border-stone-200 hover:border-gold-400 rounded-2xl p-7 shadow-sm hover:shadow-md transition-all"
          >
            <span className="font-heading text-xl font-bold text-olive-800 group-hover:text-gold-700 transition-colors leading-tight">
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
