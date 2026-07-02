import ContactForm from '@/components/ContactForm'
import CrownMark from '@/components/CrownMark'

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gold-950 text-white py-20 px-4 text-center">
        <CrownMark className="w-16 mx-auto text-gold" />
        {/* Literal string — no CSS transform on this element */}
        {/* Gold crown + olive wordmark = Riley's stacked lockup, in live text */}
        <h1 className="font-display text-5xl sm:text-6xl mt-5 mb-3 tracking-wide text-olive">
          Íocón
        </h1>
        <p className="text-gold-100 text-lg max-w-sm mx-auto leading-relaxed">
          Custom Irish dance costume illustrations — bringing your vision to life.
        </p>
        <a
          href="/order"
          className="inline-block mt-8 bg-gold hover:bg-gold-400 text-gold-950 font-medium text-sm px-8 py-3 rounded-full transition-colors"
        >
          Start Your Order
        </a>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 space-y-20">

        {/* About Me */}
        <section>
          <h2 className="font-serif text-4xl font-semibold text-gold-900 mb-6">
            About Me
          </h2>
          <div className="space-y-4 text-stone-600 leading-relaxed">
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
            <p>
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
              fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa
              qui officia deserunt mollit anim id est laborum. Irish dance has been a passion of
              mine for over a decade, and I love capturing the beauty and detail of every costume.
            </p>
            <p>
              Whether you need a logo for your school, a portrait of a beloved dress, or a
              completely original costume design, I work closely with each client to make sure the
              final piece exceeds expectations.
            </p>
          </div>
        </section>

        {/* Contact Me — id="contact" lets /#contact anchor scrolling work */}
        <section id="contact" className="scroll-mt-20">
          <h2 className="font-serif text-4xl font-semibold text-gold-900 mb-2">
            Contact Me
          </h2>
          <p className="text-stone-500 text-sm mb-8">
            Have a question or a project in mind? Fill out the form below and I will get back to
            you as soon as possible.
          </p>
          <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm">
            <ContactForm />
          </div>
        </section>

      </div>
    </>
  )
}
