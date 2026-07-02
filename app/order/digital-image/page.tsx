import Link from 'next/link'
import { Icon, type IconName } from '@/components/icons'

export const metadata = { title: 'Digital Image — Íocón' }

// Options in Riley's preferred order: Costume, Logo, Other
const OPTIONS: { id: string; label: string; description: string; href: string; icon: IconName }[] = [
  {
    id: 'costume',
    label: 'Costume',
    description:
      'A detailed illustration of an existing costume, or a brand-new design created from scratch.',
    href: '/order/costume',
    icon: 'costume',
  },
  {
    id: 'logo',
    label: 'Logo',
    description: 'A custom digital logo for your school, academy, competition, or brand.',
    href: '/order/logo',
    icon: 'logo',
  },
  {
    id: 'other',
    label: 'Other',
    description: "Not sure what you need? Send me a message and we'll figure it out together.",
    href: '/#contact',
    icon: 'chat',
  },
]

export default function DigitalImagePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <Breadcrumb />

      <h1 className="font-serif text-4xl font-semibold text-gold-900 mb-2 mt-4">Digital Image</h1>
      <p className="text-stone-500 text-sm mb-10">
        A fully digital illustration delivered as a high-resolution file. What type of image would
        you like?
      </p>

      <div className="grid sm:grid-cols-3 gap-4">
        {OPTIONS.map((opt) => (
          <Link
            key={opt.id}
            href={opt.href}
            className="group flex flex-col gap-3 bg-white border border-stone-200 hover:border-gold-400 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all"
          >
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-olive-50 text-olive-800 group-hover:bg-gold-50 group-hover:text-gold-700 transition-colors">
              <Icon name={opt.icon} className="w-6 h-6" />
            </span>
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
      <span className="text-stone-600">Digital Image</span>
    </nav>
  )
}
