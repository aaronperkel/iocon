'use client'

import { useEffect, useRef } from 'react'
import ContactForm from '@/components/ContactForm'

// Contact-me modal for the shop subjects that have no order form (Bulk
// Drawings / Logo / Graphic — they start with a conversation). Clicking those
// tiles used to jump to /#contact, which read like a broken link; instead the
// tile opens this dialog in place, titled and tagged with the inquiry
// ("Bulk Ordering Inquiry", …) so Riley's email says what was clicked.
//
// Built on the native <dialog> element: showModal() gives focus containment,
// Escape-to-close, and a top-layer backdrop for free. (The "no native
// dialogs" rule is about confirm()/alert(), not <dialog>.)

export default function InquiryModal({
  title,
  open,
  onClose,
}: {
  title: string
  open: boolean
  onClose: () => void
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    else if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => {
        // The dialog element itself is only the click target on the backdrop —
        // clicks inside the panel land on its children.
        if (e.target === dialogRef.current) dialogRef.current?.close()
      }}
      aria-labelledby="inquiry-modal-title"
      className="w-full max-w-lg rounded-2xl border border-stone-200 bg-white p-0 shadow-xl backdrop:bg-[rgb(28_25_23/0.55)]"
    >
      <div className="p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4 mb-1">
          <h2
            id="inquiry-modal-title"
            className="font-heading text-2xl font-bold text-olive-800"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Close"
            className="shrink-0 -mr-1 -mt-1 rounded-lg p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              className="w-5 h-5"
              aria-hidden="true"
            >
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
        <p className="text-stone-500 text-sm mb-6">
          Tell me what you have in mind and I&rsquo;ll get back to you with ideas and
          recommendations.
        </p>
        <ContactForm presetSubject={title} />
      </div>
    </dialog>
  )
}
