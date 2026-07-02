import Link from 'next/link'

export const metadata = { title: 'Costume Order — Íocón' }

const OPTIONS = [
  {
    id: 'drawing',
    label: 'Existing Costume Drawing',
    description:
      'A detailed illustration of a costume you already own. Great for memories, gifts, or social media.',
    href: '/order/drawing',
  },
  {
    id: 'design',
    label: 'New Costume Design',
    description:
      'A completely original costume concept designed from scratch, tailored to your vision.',
    href: '/order/design',
  },
]

export default function CostumePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <Breadcrumb />

      <h1 className="font-serif text-4xl font-semibold text-gold-900 mb-2 mt-4">Costume</h1>
      <p className="text-stone-500 text-sm mb-10">What type of costume project are you looking for?</p>

      <div className="grid sm:grid-cols-2 gap-5">
        {OPTIONS.map((opt) => (
          <Link
            key={opt.id}
            href={opt.href}
            className="group flex flex-col gap-3 bg-white border border-stone-200 hover:border-gold-400 rounded-2xl p-7 shadow-sm hover:shadow-md transition-all"
          >
            <span className="font-serif text-xl font-semibold text-gold-900 group-hover:text-gold-700 transition-colors leading-tight">
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

function Breadcrumb() {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-stone-400" aria-label="Breadcrumb">
      <Link href="/order" className="hover:text-gold-600 transition-colors">
        Order
      </Link>
      <span aria-hidden="true">/</span>
      <Link href="/order/digital-image" className="hover:text-gold-600 transition-colors">
        Digital Image
      </Link>
      <span aria-hidden="true">/</span>
      <span className="text-stone-600">Costume</span>
    </nav>
  )
}
