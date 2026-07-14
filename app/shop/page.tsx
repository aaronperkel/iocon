import Link from 'next/link'
import CrownMark from '@/components/CrownMark'
import SubjectCard, { type ShopSubjectCard } from '@/components/SubjectCard'
import { GALLERY_IMAGES, type GallerySubject } from '@/lib/gallery'

export const metadata = { title: 'Shop — Íocón' }

// ---------------------------------------------------------------------------
// Shop landing page.
//
// Ordering scheme (Riley):
//   - Solo Icon                → /shop/solo-icon (fork: new design vs. existing costume)
//   - Group Icons              → /shop/group-icons        (multi-dancer form)
//   - Through the Years        → /shop/through-the-years  (multi-age form)
//   - Walking Duo              → /shop/walking-duo        (two-dancer form)
//   - Bulk Drawings / Logo / Graphic → /#contact (no order form — starts with a conversation)
//
// Each subject is a flippable tile (components/SubjectCard.tsx): front shows
// the artwork + title, the back shows Riley's blurb and a carousel of gallery
// pieces tagged with the matching subject. Tile artwork lives in public/shop/
// — set `image` when Riley supplies a file; tiles without one show a line icon.
// ---------------------------------------------------------------------------

interface Subject extends ShopSubjectCard {
  gallerySubject: GallerySubject // feeds the back-of-tile example carousel
}

// TODO: replace the '$–' placeholders when Riley settles real starting prices.
const PRICE_TBD = 'Starting from $–'

const SUBJECTS: Subject[] = [
  {
    id: 'solo-icon',
    title: 'Solo Icon',
    href: '/shop/solo-icon',
    icon: 'dancer',
    gallerySubject: 'solo-icon',
    price: PRICE_TBD,
    blurb:
      'Where it all began! A single dancer with the original Íocón look. A detailed drawing of an existing costume or a new costume design.',
  },
  {
    id: 'group-icons',
    title: 'Group Icons',
    href: '/shop/group-icons',
    icon: 'dancers',
    gallerySubject: 'group-icons',
    price: PRICE_TBD,
    blurb:
      'Multiple dancers together in one drawing. Great for siblings, teams, and friends. See the “Through the Years” option for one dancer (young to old).',
  },
  {
    id: 'through-the-years',
    title: 'Through the Years',
    href: '/shop/through-the-years',
    icon: 'timeline',
    image: '/shop/through-the-years.png',
    imageFit: 'contain', // the age progression must show all dancers — never crop
    gallerySubject: 'through-the-years',
    price: PRICE_TBD,
    blurb:
      'An excellent way to remember a dance career or dress design evolutions. Meant for one dancer to show their growth through the years. See “Group Icons” for a group drawing intended for friends, teammates, or siblings.',
  },
  {
    id: 'walking-duo',
    title: 'Walking Duo',
    href: '/shop/walking-duo',
    icon: 'dancers',
    gallerySubject: 'walking-duo',
    price: PRICE_TBD,
    blurb:
      'A new, more organic template for two dancers. The drawing depicts dancers holding hands, walking away from the viewer, with the back of the costume drawn in detail. Ideal for dance besties, siblings, or teammates. Male dancers can also be used in the template by request.',
  },
  {
    id: 'bulk-drawings',
    title: 'Bulk Drawings',
    href: '/#contact',
    icon: 'dancers',
    image: '/shop/bulk-drawings.jpeg',
    gallerySubject: 'bulk-drawings',
    blurb:
      'Contact me to discuss drawings for a large group (more than 5 drawings). Intended for individual send-off gifts or posts for a group.',
    contactNote: true,
  },
  {
    id: 'logo',
    title: 'Logo',
    href: '/#contact',
    icon: 'logo',
    gallerySubject: 'logo',
    blurb:
      'A custom logo, symbol, or graphic. Great for brands, merchandise, schools, organizations, or competitions.',
    contactNote: true,
  },
  {
    id: 'custom-graphic',
    title: 'Graphic',
    href: '/#contact',
    icon: 'image',
    gallerySubject: 'custom-graphic',
    blurb:
      'Custom graphics for social media posts, posters, statistics, good luck messages, mock-ups, and much more! Very customizable and flexible.',
    contactNote: true,
  },
]

const STEPS = [
  {
    title: 'Pick a subject',
    text: 'Choose what you would like me to create from the options below.',
  },
  {
    title: 'Complete the Order Form',
    text: 'Upload images, select extras, and leave comments.',
  },
  {
    title: 'Choose a product',
    text: 'Apply your design to a selection of product types: digital downloads and prints (with more to come).',
  },
]

// The gold crown from the logo with the step number seated in its base.
function CrownNumber({ number }: { number: number }) {
  return (
    <span className="relative inline-block w-16 text-gold mb-3">
      <CrownMark className="w-full" />
      {/* Seated low in the crown's solid band, clear of the diagonal glint cut-out */}
      <span className="absolute inset-x-0 bottom-[6%] flex justify-center text-gold-950 text-xs font-bold leading-none">
        {number}
      </span>
    </span>
  )
}

export default function ShopPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-heading text-4xl font-bold text-gold-900 mb-3">Shop</h1>
      <p className="text-stone-600 text-sm leading-relaxed mb-8 max-w-2xl">
        Every order starts with the art. Pick a subject, fill out one short form to share the
        details, and choose your product format at the end.
      </p>

      {/* How it works */}
      <ol className="grid sm:grid-cols-3 gap-4 mb-12">
        {STEPS.map((step, i) => (
          <li
            key={step.title}
            className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm"
          >
            <CrownNumber number={i + 1} />
            <p className="font-medium text-sm text-stone-800">{step.title}</p>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">{step.text}</p>
          </li>
        ))}
      </ol>

      {/* Subject buttons */}
      <h2 className="font-heading text-2xl font-bold text-gold-900 mb-6">
        Choose a subject to start
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {SUBJECTS.map(({ gallerySubject, ...subject }) => (
          <SubjectCard
            key={subject.id}
            subject={subject}
            examples={GALLERY_IMAGES.filter((img) => img.subject === gallerySubject)}
          />
        ))}
      </div>

      <p className="mt-10 text-sm text-stone-500">
        Want to see finished pieces first?{' '}
        <Link
          href="/gallery"
          className="text-gold-700 font-medium underline underline-offset-2 hover:text-gold-600 transition-colors"
        >
          Browse the gallery
        </Link>
        .
      </p>
    </div>
  )
}
