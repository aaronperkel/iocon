import Link from 'next/link'

// ---------------------------------------------------------------------------
// Privacy Policy — a plain-English account of what the site actually
// collects and where it goes, in the same voice as /terms. Every claim here
// maps to a real data flow (order forms → TiDB, uploads → Vercel Blob,
// Vercel Analytics, iCloud SMTP, the admin session cookie) — update this
// page whenever one of those flows changes or a new one is added.
// Linked from the footer (components/Footer.tsx).
// ---------------------------------------------------------------------------

export const metadata = {
  title: 'Privacy Policy — Íocón Graphics',
  description:
    'How Íocón Graphics handles your information: what the order and contact forms collect, what appears publicly, where data is stored, and how to ask for changes or deletion.',
  openGraph: { url: '/privacy' },
}

const SECTION_H2_CLS =
  'font-heading text-2xl font-bold text-olive-800 border-b border-gold-200 pb-2 mb-4'

const INLINE_LINK_CLS =
  'text-gold-700 font-medium underline underline-offset-2 hover:text-gold-600 transition-colors'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className={SECTION_H2_CLS}>{title}</h2>
      <div className="text-stone-600 text-sm leading-relaxed space-y-3">{children}</div>
    </section>
  )
}

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <h1 className="font-heading text-4xl font-bold text-olive-800 mb-3">Privacy Policy</h1>
        <p className="text-stone-500 text-sm">Last updated: July 22, 2026</p>
        <p className="text-stone-600 text-sm leading-relaxed mt-4 max-w-2xl">
          Íocón Graphics is a small, one-artist business, and this policy is written the same
          way as the{' '}
          <Link href="/terms" className={INLINE_LINK_CLS}>
            commission terms
          </Link>{' '}
          — in plain English. The short version: this site collects only what&rsquo;s needed to
          create your commission and stay in touch about it, shows very little of it publicly,
          and never sells it to anyone.
        </p>
      </div>

      <Section title="What this site collects">
        <p>There are only three ways this site collects information, and all of them are forms you fill out yourself:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <span className="font-medium text-stone-700">Order forms:</span> your name, how
            you&rsquo;d like to be reached (an email address, a phone number for text or
            WhatsApp, or an Instagram handle — whichever you choose), and the details of your
            commission: dancer first names or ages, costume and shoe choices, dance school and
            costume designer if you share them, your comments, and any reference photos you
            upload.
          </li>
          <li>
            <span className="font-medium text-stone-700">Contact form:</span> your name, email
            address, and message.
          </li>
          <li>
            <span className="font-medium text-stone-700">Review form:</span> your name, a crown
            rating, and your review.
          </li>
        </ul>
        <p>
          There are no visitor accounts or logins, no newsletter sign-ups, and no data brokers
          — nothing is collected behind the scenes beyond the basic technical logs any website
          host keeps.
        </p>
      </Section>

      <Section title="How it&rsquo;s used">
        <p>
          Your information is used to draw your commission, to contact you about your order
          (your place in the queue and progress updates), to answer your messages, and to
          publish reviews you&rsquo;ve chosen to leave. That&rsquo;s the whole list — it is
          never sold, rented, or shared for advertising or marketing.
        </p>
      </Section>

      <Section title="What appears publicly">
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <span className="font-medium text-stone-700">The waitlist</span> shows only your
            initials, the type of order, and its status — never your full name or contact
            details.
          </li>
          <li>
            <span className="font-medium text-stone-700">Reviews</span> appear on the home page
            with the name you gave, but only after they&rsquo;re approved. If you&rsquo;d like a
            review edited or taken down, just ask.
          </li>
          <li>
            <span className="font-medium text-stone-700">Finished artwork</span> may appear in
            the gallery and on social media, as described in the commission terms — and if
            you&rsquo;d rather your piece stay private, that&rsquo;s always respected. The
            reference photos you upload are never published.
          </li>
        </ul>
      </Section>

      <Section title="Where your information lives">
        <p>
          The site runs on a small set of trusted services, each of which handles your data
          only to provide its service:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <span className="font-medium text-stone-700">Vercel</span> hosts the site and
            stores uploaded images.
          </li>
          <li>
            <span className="font-medium text-stone-700">TiDB Cloud</span> stores order,
            review, and gallery records in a database.
          </li>
          <li>
            <span className="font-medium text-stone-700">Apple iCloud Mail</span> delivers
            order updates and contact-form messages.
          </li>
          <li>
            <span className="font-medium text-stone-700">Stripe</span> handles payment when you
            pay online — your card details go directly to Stripe and never pass through this
            site.
          </li>
        </ul>
      </Section>

      <Section title="Cookies &amp; analytics">
        <p>
          There are no advertising or tracking cookies. Browsing, ordering, and leaving a
          review set no cookies at all — the only cookie this site uses is a sign-in cookie
          for the site&rsquo;s own admin area, which only affects the artist.
        </p>
        <p>
          The site uses Vercel Analytics for anonymous, aggregated page-view counts (how many
          people visited the shop this week, for example). It sets no cookies and does not
          track you across other sites.
        </p>
      </Section>

      <Section title="Email">
        <p>
          If you choose email as your contact method, you&rsquo;ll receive automated updates
          about your order — when it&rsquo;s placed, when it moves up the queue, when
          it&rsquo;s being drawn, and when it&rsquo;s finished — and occasionally a personal
          note from me about it. There is no marketing list: every email you get from Íocón
          Graphics is about your own order.
        </p>
      </Section>

      <Section title="Young dancers">
        <p>
          Much of this work celebrates young dancers, so orders should be placed by a parent,
          guardian, or another adult. Photos of dancers are used only as reference for drawing
          the artwork, are never published, and can be deleted on request once your commission
          is delivered.
        </p>
      </Section>

      <Section title="A note on AI">
        <p>
          As promised in the commission terms: the photos you upload and the artwork you
          receive are never used to train AI systems.
        </p>
      </Section>

      <Section title="How long things are kept &amp; your choices">
        <p>
          Order records are kept as the business record of your commission; completed orders
          drop off the public waitlist about two weeks after they&rsquo;re finished. You can
          ask at any time to see the information held about you, to correct it, or to have it
          deleted — it will be, apart from anything that has to stay for legal or accounting
          reasons (like payment records).
        </p>
      </Section>

      <Section title="Changes to this policy">
        <p>
          If how the site handles information changes, this page will be updated and the date
          at the top revised.
        </p>
      </Section>

      <Section title="Questions?">
        <p>
          If anything here is unclear, use the{' '}
          <Link href="/#contact" className={INLINE_LINK_CLS}>
            contact form
          </Link>{' '}
          — happy to talk it through.
        </p>
      </Section>
    </div>
  )
}
