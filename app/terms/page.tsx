import Link from 'next/link'

// ---------------------------------------------------------------------------
// Commission Terms — plain-English terms for custom commissions.
//
// Placeholders to fill in before launch: [LAST_UPDATED], [DELIVERY_TIMEFRAME].
// Linked from the footer (components/Footer.tsx) and from the agreement line
// above the submit button on both order forms.
// ---------------------------------------------------------------------------

export const metadata = {
  title: 'Commission Terms — Íocón Graphics',
  description:
    'The plain-English commission terms for Íocón Graphics custom Irish dance artwork: ordering, payment, revisions, delivery, refunds, and usage rights.',
  openGraph: { url: '/terms' },
}

const SECTION_H2_CLS =
  'font-heading text-2xl font-bold text-olive-800 border-b border-gold-200 pb-2 mb-4'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className={SECTION_H2_CLS}>{title}</h2>
      <div className="text-stone-600 text-sm leading-relaxed space-y-3">{children}</div>
    </section>
  )
}

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <h1 className="font-heading text-4xl font-bold text-olive-800 mb-3">Commission Terms</h1>
        <p className="text-stone-500 text-sm">Last updated: [LAST_UPDATED]</p>
        <p className="text-stone-600 text-sm leading-relaxed mt-4 max-w-2xl">
          Thanks for supporting a small, one-artist business! These terms are here to keep
          things clear and fair for both of us — written in plain English on purpose. If
          anything is unclear, just{' '}
          <Link
            href="/#contact"
            className="text-gold-700 font-medium underline underline-offset-2 hover:text-gold-600 transition-colors"
          >
            reach out
          </Link>{' '}
          and ask.
        </p>
      </div>

      <Section title="What I make">
        <p>
          Íocón Graphics creates custom digital artwork — Irish dance costume drawings, icons,
          logos, and graphics. Every piece is drawn to order. Finished work is delivered
          electronically as image files; nothing physical ships unless a print product is
          explicitly offered in the shop.
        </p>
      </Section>

      <Section title="Ordering &amp; payment">
        <p>
          Orders are placed through the order forms in the{' '}
          <Link
            href="/shop"
            className="text-gold-700 font-medium underline underline-offset-2 hover:text-gold-600 transition-colors"
          >
            shop
          </Link>
          . Once your order is in, it joins the queue — you can check where things stand on the
          waitlist page.
        </p>
        <p>
          Payment is processed securely by Stripe; your card details never pass through this
          site. Full payment is due up front, before work on your commission begins.
        </p>
      </Section>

      <Section title="Working together &amp; revisions">
        <p>
          Commissions are a collaboration, and your input is welcome throughout the design
          process. Reasonable revisions are included until you approve the design — that&rsquo;s
          part of getting it right.
        </p>
        <p>
          Major changes in scope (for example, switching to a different costume, adding
          dancers, or starting over on a new concept) or revisions requested after you&rsquo;ve
          approved the design may cost extra. If that happens, I&rsquo;ll always tell you the
          cost before doing the work — no surprise charges, ever.
        </p>
      </Section>

      <Section title="Approval &amp; delivery">
        <p>
          When the artwork is ready, you&rsquo;ll get a look at it for final approval. Once you
          approve, I&rsquo;ll deliver the final files electronically, typically within
          [DELIVERY_TIMEFRAME]. Timeframes are estimates rather than guarantees — every piece is
          drawn by hand, and orders are worked through in queue order.
        </p>
      </Section>

      <Section title="Refunds">
        <p>Because every commission is custom work, refunds depend on where things stand:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <span className="font-medium text-stone-700">Before work begins:</span> full refund,
            no questions asked.
          </li>
          <li>
            <span className="font-medium text-stone-700">While work is in progress:</span> a
            partial refund may be offered at Íocón Graphics&rsquo; discretion, reflecting the
            work already done.
          </li>
          <li>
            <span className="font-medium text-stone-700">After final approval and delivery:</span>{' '}
            no refunds — custom digital artwork can&rsquo;t be returned.
          </li>
        </ul>
      </Section>

      <Section title="Usage rights">
        <p>
          When your commission is delivered, you receive a license to use the artwork for
          personal purposes — sharing it on social media, printing it for yourself, and using it
          in personal dance-related materials like good-luck cards or phone wallpapers.
        </p>
        <p>
          Íocón Graphics retains the copyright in the artwork, along with the right to display
          it in the gallery, portfolio, and on social media. If you&rsquo;d rather your piece
          stay private, just say so — that&rsquo;s always respected.
        </p>
        <p>Please don&rsquo;t:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>resell or redistribute the artwork,</li>
          <li>claim the artwork as your own creation, or</li>
          <li>
            use it commercially — on merchandise for sale, in business branding, or anything
            else money-making — without a separate agreement. If you&rsquo;re interested in
            commercial use, get in touch and we&rsquo;ll work something out.
          </li>
        </ul>
      </Section>

      <Section title="A note on AI">
        <p>
          Every piece of Íocón artwork is 100% human-made — drawn by hand, start to finish. Your
          commissioned artwork and the reference photos you provide will never be used to train
          AI systems. In the same spirit, delivered artwork may not be used by you or anyone
          else for AI training or AI datasets.
        </p>
      </Section>

      <Section title="Your reference materials">
        <p>
          By uploading reference photos, logos, or other materials with your order, you confirm
          you have the right to share them and to have artwork based on them. If a photo
          includes someone else&rsquo;s dancer or a school logo, please make sure you have their
          okay first.
        </p>
      </Section>

      <Section title="Communication &amp; conduct">
        <p>
          Commissions work best as a friendly, respectful collaboration — that&rsquo;s expected
          in both directions. As a one-person business, I aim to respond to messages within a
          few days; thanks for your patience during busy stretches like feis season. Orders
          involving disrespectful or abusive behavior may be cancelled and refunded for
          unfinished work.
        </p>
      </Section>

      <Section title="Changes to these terms">
        <p>
          These terms may be updated from time to time. The version in effect when you place
          your order is the one that applies to it.
        </p>
      </Section>

      <Section title="Governing law">
        <p>
          Íocón Graphics is a sole proprietorship based in Vermont, USA, and these terms are
          governed by the laws of the State of Vermont.
        </p>
      </Section>

      <Section title="Questions?">
        <p>
          If anything here is unclear, or you have a situation these terms don&rsquo;t cover,
          use the{' '}
          <Link
            href="/#contact"
            className="text-gold-700 font-medium underline underline-offset-2 hover:text-gold-600 transition-colors"
          >
            contact form
          </Link>{' '}
          — happy to talk it through.
        </p>
      </Section>
    </div>
  )
}
