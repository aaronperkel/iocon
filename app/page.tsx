import Link from 'next/link'
import ContactForm from '@/components/ContactForm'
import CrownMark from '@/components/CrownMark'
import { getPublicReviews } from '@/lib/reviews'
import { SITE_URL } from '@/lib/site'

// Force dynamic so newly approved reviews show immediately (same immediacy
// pattern as /shop and /gallery).
export const dynamic = 'force-dynamic'

// Cap the home-page strip; the point is social proof, not an archive.
const MAX_HOME_REVIEWS = 6

// Google's site-name feature reads WebSite structured data from the home page
// only; alternateName lists the unaccented spellings people actually type.
const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      name: 'Íocón Graphics',
      alternateName: ['Íocón', 'Iocon Graphics', 'Iocon'],
      url: SITE_URL,
    },
    {
      '@type': 'Organization',
      name: 'Íocón Graphics',
      alternateName: ['Íocón', 'Iocon Graphics', 'Iocon'],
      url: SITE_URL,
      logo: `${SITE_URL}/icon.png`,
      sameAs: ['https://www.instagram.com/iocongraphics/'],
    },
  ],
}

export default async function HomePage() {
  const reviews = (await getPublicReviews()).slice(0, MAX_HOME_REVIEWS)
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
      />
      {/* Hero — light olive banner; the rest of the page sits on olive-25 (body) */}
      <section className="bg-olive-100 border-b border-olive-200 py-20 px-4 text-center">
        <CrownMark className="w-16 mx-auto text-gold" />
        {/* Literal string — no CSS transform on this element */}
        {/* Gold crown + olive wordmark = Riley's stacked lockup, in live text */}
        <h1 className="font-display text-5xl sm:text-6xl mt-5 mb-3 tracking-wide text-olive-600">
          Íocón
        </h1>
        <p className="text-olive-800 text-lg max-w-sm mx-auto leading-relaxed">
          Hand made graphics for the Irish Dance world
        </p>
        <a
          href="/shop"
          className="inline-block mt-8 bg-gold hover:bg-gold-400 text-gold-950 font-medium text-sm px-8 py-3 rounded-full transition-colors"
        >
          Start Your Order
        </a>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 space-y-20">

        {/* About Me */}
        <section>
          <h2 className="font-heading text-4xl font-bold text-olive-800 mb-6">
            About Me
          </h2>
          <div className="space-y-4 text-stone-600 leading-relaxed">
            <p>
              I&apos;m Riley and I&apos;ve been an Irish dancer in the Mid-Atlantic region for 10
              years. During the pandemic, I started creating free drawings for dancers using only
              my iPhone and pointer finger under my previous Instagram name, @irish.dance.costumes.
              The years of support since then, and the growth of generative AI, have motivated me
              to increase my efforts and presence in the Irish dance community.
            </p>
            <p>
              Íocón was developed to be a multi-purpose small business for Irish dance art,
              graphics, design, and gifts. The name comes from the Irish word for Icon, inspired by
              the strong, basic, and upright form that my original dancer drawings take. The
              graphics that I offer are highly customizable and I always welcome collaboration
              until the design is just right. You can follow along on Instagram at{' '}
              <a
                href="https://www.instagram.com/iocongraphics/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-olive-800 underline underline-offset-2 hover:text-gold-700 transition-colors"
              >
                @iocongraphics
              </a>
              .
            </p>
          </div>
        </section>

        {/* Reviews — approved ones only (Riley moderates in the admin Reviews
            tab); the section disappears entirely while there are none. */}
        {reviews.length > 0 && (
          <section>
            <h2 className="font-heading text-4xl font-bold text-olive-800 mb-6">Reviews</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {reviews.map((review) => (
                <figure
                  key={review.id}
                  className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 flex flex-col gap-2.5"
                >
                  <div className="flex gap-1" aria-label={`${review.rating} of 5 crowns`}>
                    {Array.from({ length: review.rating }, (_, i) => (
                      <CrownMark key={i} className="w-4 text-gold" />
                    ))}
                  </div>
                  <blockquote className="text-sm text-stone-600 leading-relaxed flex-1 whitespace-pre-wrap">
                    {review.text}
                  </blockquote>
                  <figcaption className="text-sm font-medium text-olive-800">
                    — {review.name}
                  </figcaption>
                </figure>
              ))}
            </div>
            <p className="mt-5 text-sm text-stone-500">
              Ordered from Íocón before?{' '}
              <Link
                href="/review"
                className="text-gold-700 font-medium underline underline-offset-2 hover:text-gold-600 transition-colors"
              >
                Leave a review
              </Link>
              .
            </p>
          </section>
        )}

        {/* Contact Me — id="contact" lets /#contact anchor scrolling work */}
        <section id="contact" className="scroll-mt-20">
          <h2 className="font-heading text-4xl font-bold text-olive-800 mb-2">
            Contact Me
          </h2>
          <p className="text-stone-500 text-sm mb-8">
            Have a question or are looking to order bulk or custom? I welcome your input! Please
            describe in detail what you are looking to achieve and I will get back to you with my
            ideas and recommendations.
          </p>
          <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm">
            <ContactForm />
          </div>
        </section>

      </div>
    </>
  )
}
