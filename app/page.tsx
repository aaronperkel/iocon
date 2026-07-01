import ContactForm from '@/components/ContactForm'

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-emerald-950 text-white py-20 px-4 text-center">
        <HeroCrown />
        {/* Literal string — no CSS transform on this element */}
        <h1 className="font-display text-5xl sm:text-6xl mt-5 mb-3 tracking-wide">
          Íocón
        </h1>
        <p className="text-emerald-200 text-lg max-w-sm mx-auto leading-relaxed">
          Custom Irish dance costume illustrations — bringing your vision to life.
        </p>
        <a
          href="/order"
          className="inline-block mt-8 bg-amber-600 hover:bg-amber-500 text-white font-medium text-sm px-8 py-3 rounded-full transition-colors"
        >
          Start Your Order
        </a>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 space-y-20">

        {/* About Me */}
        <section>
          <h2 className="font-serif text-4xl font-semibold text-emerald-900 mb-6">
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
          <h2 className="font-serif text-4xl font-semibold text-emerald-900 mb-2">
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

function HeroCrown() {
  return (
    <svg
      width="48"
      height="40"
      viewBox="0 0 22 18"
      fill="currentColor"
      className="mx-auto text-amber-400"
      aria-hidden="true"
    >
      <path d="M1 16 L3.5 6 L8.5 12 L11 2 L13.5 12 L18.5 6 L21 16 Z" />
      <rect x="1" y="16" width="20" height="2" rx="1" />
    </svg>
  )
}
