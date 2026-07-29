import Link from 'next/link'
import CrownMark from '@/components/CrownMark'
import SubjectCard, { type ShopSubjectCard } from '@/components/SubjectCard'
import { type GallerySubject } from '@/lib/gallery'
import { getPublicGalleryImages } from '@/lib/gallery-store'

export const metadata = { title: 'Shop — Íocón Graphics' }

// The flip-tile carousels pull from the admin-managed gallery, so new uploads
// must show up immediately, not at next build.
export const dynamic = 'force-dynamic'

// ---------------------------------------------------------------------------
// Shop landing page.
//
// Ordering scheme (Riley):
//   - Solo Icon                → /shop/solo-icon (fork: new design vs. existing costume)
//   - Group Icons              → /shop/group-icons        (multi-dancer form)
//   - Through the Years        → /shop/through-the-years  (multi-age form)
//   - Bulk Drawings / Logo / Graphic → in-place contact modal (no order form —
//     starts with a conversation; the email is tagged with the inquiry name)
// Walking Duo was retired pre-launch (Riley, July 2026 — "I haven't developed
// the walking duo enough yet to offer it"); its route now redirects to /shop.
//
// Each subject is a flippable tile (components/SubjectCard.tsx): front shows
// the artwork + title, the back shows Riley's blurb and a carousel of gallery
// pieces tagged with the matching subject. Tile artwork lives in public/shop/
// — set `image` when Riley supplies a file; tiles without one show a line icon.
// ---------------------------------------------------------------------------

interface Subject extends ShopSubjectCard {
  gallerySubject: GallerySubject // feeds the back-of-tile example carousel
}

// Starting prices are Riley's launch pricing (July 2026) and show on the
// tile fronts; they must agree with lib/pricing.ts, which the order forms
// use to compute their live estimate.
const SUBJECTS: Subject[] = [
  {
    id: 'solo-icon',
    title: 'Solo Icon',
    href: '/shop/solo-icon',
    icon: 'dancer',
    gallerySubject: 'solo-icon',
    price: 'Starting from $25',
    blurb:
      'Where it all began! A single dancer with the original Íocón look. A detailed drawing of an existing costume or a new costume design.',
  },
  {
    id: 'group-icons',
    title: 'Group Icons',
    href: '/shop/group-icons',
    icon: 'dancers',
    gallerySubject: 'group-icons',
    price: 'Starting from $35',
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
    price: 'Starting from $35',
    blurb:
      'An excellent way to remember a dance career or dress design evolutions. Meant for one dancer to show their growth through the years. See “Group Icons” for a group drawing intended for friends, teammates, or siblings.',
  },
  {
    id: 'bulk-drawings',
    title: 'Bulk Drawings',
    icon: 'dancers',
    image: '/shop/bulk-drawings.jpeg',
    gallerySubject: 'bulk-drawings',
    price: 'Starting from $50',
    blurb:
      'Contact me to discuss drawings for a large group (more than 5 drawings). Intended for individual send-off gifts or posts for a group.',
    inquirySubject: 'Bulk Ordering Inquiry',
  },
  {
    id: 'logo',
    title: 'Logo',
    icon: 'logo',
    gallerySubject: 'logo',
    price: 'Starting from $20',
    blurb:
      'A custom logo, symbol, or graphic. Great for brands, merchandise, schools, organizations, or competitions.',
    inquirySubject: 'Logo Inquiry',
  },
  {
    id: 'custom-graphic',
    title: 'Graphic',
    icon: 'image',
    gallerySubject: 'custom-graphic',
    price: 'Starting from $20',
    blurb:
      'Custom graphics for social media posts, posters, statistics, good luck messages, mock-ups, and much more! Very customizable and flexible.',
    inquirySubject: 'Graphic Inquiry',
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
    text: 'Apply your design to a selection of product types: digital downloads, with prints and more to come.',
  },
]

// The gold crown from the logo with the step number seated in its body.
// Solid silhouette (no glint) so nothing competes with the number.
// The numeral is text-white to match the tile surface behind the crown
// (white in light mode, the dark card color in dark mode), so it reads
// as a cutout of the crown in both themes (Riley).
// top-[65%] centers the digit in the crown's solid band: the valleys between
// the peaks bottom out ~29% down the viewBox, so the band below them is
// centered at ~65% of the crown's height.
function CrownNumber({ number }: { number: number }) {
  return (
    <span className="relative inline-block w-16 text-gold mb-3">
      <CrownMark className="w-full" glint={false} />
      <span className="absolute inset-x-0 top-[65%] -translate-y-1/2 flex justify-center text-white text-sm font-bold leading-none">
        {number}
      </span>
    </span>
  )
}

export default async function ShopPage() {
  const galleryImages = await getPublicGalleryImages()
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-heading text-4xl font-bold text-olive-800 mb-8">Shop</h1>

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
      <h2 className="font-heading text-2xl font-bold text-olive-800 mb-6">
        Choose a subject to start
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {SUBJECTS.map(({ gallerySubject, ...subject }) => {
          const examples = galleryImages.filter((img) => img.subject === gallerySubject)
          return (
            <SubjectCard
              key={subject.id}
              subject={subject}
              examples={examples}
              // Riley's pick from the admin Gallery tab fronts the tile;
              // without one the tile falls back to subject.image / the icon.
              thumbnail={examples.find((img) => img.shopThumbnail && img.src)}
            />
          )
        })}
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
