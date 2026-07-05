import Link from 'next/link'
import Image from 'next/image'
import { Icon, type IconName } from '@/components/icons'

export const metadata = { title: 'Shop — Íocón' }

// ---------------------------------------------------------------------------
// Shop landing page.
//
// Ordering scheme (Riley):
//   - Solo Icon                → /shop/solo-icon (fork: new design vs. existing costume)
//   - Group Icons              → /shop/group-icons        (multi-dancer form)
//   - Through the Years        → /shop/through-the-years  (multi-age form)
//   - Walking Duo              → /shop/walking-duo        (two-dancer form)
//   - Logo / Custom Graphic    → /#contact (no order form — starts with a conversation)
//
// Each subject card has an image slot. When Riley uploads artwork, drop the
// file in public/shop/ (e.g. public/shop/solo-icon.png) and set `image` below —
// the placeholder icon disappears automatically.
// ---------------------------------------------------------------------------

interface Subject {
  id: string
  title: string
  subtitle: string
  href: string
  icon: IconName
  image?: string // path under /public, e.g. '/shop/solo-icon.png'
  contactNote?: boolean // true → card routes to the contact section, not a form
}

const SUBJECTS: Subject[] = [
  {
    id: 'solo-icon',
    title: 'Solo Icon',
    subtitle: 'One dancer in costume — the signature Íocón style.',
    href: '/shop/solo-icon',
    icon: 'dancer',
  },
  {
    id: 'group-icons',
    title: 'Group Icons',
    subtitle: 'Multiple dancers side by side, each in their own costume.',
    href: '/shop/group-icons',
    icon: 'dancers',
  },
  {
    id: 'through-the-years',
    title: 'Through the Years',
    subtitle: 'The same dancer across the ages, from first feis to now.',
    href: '/shop/through-the-years',
    icon: 'timeline',
  },
  {
    id: 'walking-duo',
    title: 'Walking Duo',
    subtitle: 'Two dancers walking side by side.',
    href: '/shop/walking-duo',
    icon: 'dancers',
  },
  {
    id: 'logo',
    title: 'Logo',
    subtitle: 'A custom logo for your school, academy, competition, or brand.',
    href: '/#contact',
    icon: 'logo',
    contactNote: true,
  },
  {
    id: 'custom-graphic',
    title: 'Custom Graphic',
    subtitle: 'Something one-of-a-kind — describe your idea and we will brainstorm together.',
    href: '/#contact',
    icon: 'image',
    contactNote: true,
  },
]

const STEPS = [
  {
    title: 'Pick a subject',
    text: 'Choose what you would like me to create from the options below.',
  },
  {
    title: 'Design your art',
    text: 'One short form captures every detail — costume, colors, and extras.',
  },
  {
    title: 'Choose a product',
    text: 'Digital download today — prints, stickers, and more coming soon.',
  },
]

export default function ShopPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-serif text-4xl font-semibold text-gold-900 mb-3">Shop</h1>
      <p className="text-stone-600 text-sm leading-relaxed mb-8 max-w-2xl">
        Every order starts with the art. Pick a subject, fill out one short form, and choose your
        product format at the end — your finished design can go on any product, so you never have
        to fill out the form twice.
      </p>

      {/* How it works */}
      <ol className="grid sm:grid-cols-3 gap-4 mb-12">
        {STEPS.map((step, i) => (
          <li
            key={step.title}
            className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-olive-100 text-olive-800 text-sm font-semibold mb-3">
              {i + 1}
            </span>
            <p className="font-medium text-sm text-stone-800">{step.title}</p>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">{step.text}</p>
          </li>
        ))}
      </ol>

      {/* Subject buttons */}
      <h2 className="font-serif text-2xl font-semibold text-gold-900 mb-2">
        What would you like me to create?
      </h2>
      <p className="text-stone-500 text-sm mb-6">Choose a subject to start your order.</p>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {SUBJECTS.map((s) => (
          <Link
            key={s.id}
            href={s.href}
            className="group flex flex-col bg-white border border-stone-200 hover:border-gold-400 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all"
          >
            {/* Image slot — placeholder until Riley's artwork is uploaded */}
            <div className="relative aspect-[4/3] bg-gradient-to-br from-olive-50 to-gold-50 border-b border-stone-100">
              {s.image ? (
                <Image src={s.image} alt={s.title} fill className="object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-olive-300 group-hover:text-gold-400 transition-colors">
                  <Icon name={s.icon} className="w-12 h-12" />
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1.5 p-4 sm:p-5 flex-1">
              <span className="font-serif text-lg sm:text-xl font-semibold text-gold-900 group-hover:text-gold-700 transition-colors leading-tight">
                {s.title}
              </span>
              <span className="text-stone-500 text-xs sm:text-sm leading-relaxed">
                {s.subtitle}
              </span>
              <span className="mt-auto pt-2 text-gold-600 text-xs font-medium group-hover:underline">
                {s.contactNote ? 'Contact me →' : 'Start an order →'}
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-10 space-y-2 text-sm text-stone-500">
        <p>
          Want to see finished pieces first?{' '}
          <Link
            href="/gallery"
            className="text-gold-700 font-medium underline underline-offset-2 hover:text-gold-600 transition-colors"
          >
            Browse the gallery
          </Link>
          .
        </p>
        <p>
          Ordering in bulk, or have something else in mind?{' '}
          <Link
            href="/#contact"
            className="text-gold-700 font-medium underline underline-offset-2 hover:text-gold-600 transition-colors"
          >
            Contact me
          </Link>{' '}
          and we will figure it out together.
        </p>
      </div>
    </div>
  )
}
