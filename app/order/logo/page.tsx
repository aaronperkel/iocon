'use client'

import Link from 'next/link'
import { useRef, useState } from 'react'
import { Field } from '@/components/FormField'
import { FormStep, type StepState } from '@/components/FormStep'
import { ImageUpload, type UploadedFile } from '@/components/ImageUpload'
import {
  ContactInfoBlock,
  EMPTY_CONTACT,
  type ContactInfoFields,
  type ContactErrors,
} from '@/components/ContactInfoBlock'
import {
  SharingPreferencesBlock,
  EMPTY_SHARING,
  type SharingPrefsFields,
} from '@/components/SharingPreferencesBlock'

// ---------------------------------------------------------------------------
// PROGRESSIVE FORM PROTOTYPE
//
// Each question reveals as the previous one is answered; upcoming questions
// peek through blurred, and the page scrolls to the next as you go.
//
// Advance behaviour is *hybrid*:
//   • atomic single choices auto-advance on select (the "purpose" chips)
//   • free-text / optional / multi-field steps use a "Continue" button
//
// If this feel works, the same FormStep + step pattern can be lifted into the
// drawing/design forms.
// ---------------------------------------------------------------------------

type Purpose = '' | 'school' | 'academy' | 'competition' | 'brand' | 'other'

const PURPOSE_OPTIONS: { value: Exclude<Purpose, ''>; label: string }[] = [
  { value: 'school', label: 'Dance school' },
  { value: 'academy', label: 'Academy' },
  { value: 'competition', label: 'Competition / feis' },
  { value: 'brand', label: 'Brand or business' },
  { value: 'other', label: 'Something else' },
]

const PURPOSE_LABELS: Record<Exclude<Purpose, ''>, string> = {
  school: 'Dance school',
  academy: 'Academy',
  competition: 'Competition / feis',
  brand: 'Brand or business',
  other: 'Something else',
}

interface FormState {
  purpose: Purpose
  images: UploadedFile[]
  description: string
  contact: ContactInfoFields
  sharing: SharingPrefsFields
}

const EMPTY: FormState = {
  purpose: '',
  images: [],
  description: '',
  contact: EMPTY_CONTACT,
  sharing: EMPTY_SHARING,
}

const TOTAL_STEPS = 5

interface Errors {
  description?: string
  contact?: ContactErrors
}

function buildTagUsername(sharing: SharingPrefsFields): string | undefined {
  const parts: string[] = []
  if (sharing.instagramTag && sharing.instagramHandle)
    parts.push(`Instagram: ${sharing.instagramHandle}`)
  if (sharing.tikTokTag && sharing.tikTokHandle) parts.push(`TikTok: ${sharing.tikTokHandle}`)
  return parts.length > 0 ? parts.join(', ') : undefined
}

export default function LogoOrderPage() {
  const [form, setForm] = useState<FormState>(EMPTY)
  const [activeStep, setActiveStep] = useState(0)
  const [errors, setErrors] = useState<Errors>({})
  const [warnNoImages, setWarnNoImages] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const stepRefs = useRef<(HTMLDivElement | null)[]>([])

  function goToStep(i: number) {
    setActiveStep((prev) => Math.max(prev, i))
    // Wait for the next step to un-blur/render, then bring it into view.
    setTimeout(() => {
      stepRefs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 80)
  }

  function stepState(i: number): StepState {
    if (i <= activeStep) return 'active'
    if (i === activeStep + 1) return 'preview'
    return 'hidden'
  }

  // ---- Step 0: purpose (auto-advance on select) ----
  function selectPurpose(value: Exclude<Purpose, ''>) {
    setForm((prev) => ({ ...prev, purpose: value }))
    goToStep(1)
  }

  // ---- Step 1: reference images (optional) ----
  function continueFromImages() {
    if (form.images.length === 0) {
      setWarnNoImages(true)
      return
    }
    goToStep(2)
  }

  // ---- Step 2: description (required) ----
  function continueFromDescription() {
    if (form.description.trim().length < 10) {
      setErrors((prev) => ({
        ...prev,
        description: 'Please describe your logo (at least 10 characters).',
      }))
      return
    }
    setErrors((prev) => ({ ...prev, description: undefined }))
    goToStep(3)
  }

  // ---- Step 3: contact (multi-field, required) ----
  function validateContact(): ContactErrors {
    const e: ContactErrors = {}
    if (!form.contact.firstName.trim()) e.firstName = 'First name is required.'
    if (!form.contact.lastName.trim()) e.lastName = 'Last name is required.'
    if (!form.contact.contactValue.trim()) e.contactValue = 'Contact info is required.'
    return e
  }

  function continueFromContact() {
    const contactErrs = validateContact()
    if (Object.keys(contactErrs).length) {
      setErrors((prev) => ({ ...prev, contact: contactErrs }))
      return
    }
    setErrors((prev) => ({ ...prev, contact: undefined }))
    goToStep(4)
  }

  function clearContactError(key: keyof ContactInfoFields) {
    setErrors((prev) => ({ ...prev, contact: { ...prev.contact, [key]: undefined } }))
  }

  // ---- Submit (step 4) ----
  async function doSubmit() {
    setSubmitStatus('loading')
    const tagUsername = buildTagUsername(form.sharing)
    const details = [
      form.purpose && `Logo for: ${PURPOSE_LABELS[form.purpose]}`,
      `Descriptions / preferences: ${form.description}`,
      form.images.length > 0 &&
        `Reference images: ${form.images.length} uploaded — TODO: wire to file storage`,
      form.sharing.platforms.length > 0 && `Sharing: ${form.sharing.platforms.join(', ')}`,
      tagUsername && `Tag: ${tagUsername}`,
    ]
      .filter(Boolean)
      .join('\n')

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.contact.firstName,
          lastName: form.contact.lastName,
          contactMethod: form.contact.contactMethod,
          contactValue: form.contact.contactValue,
          orderType: 'logo',
          details,
          sharingPlatforms: form.sharing.platforms,
          tagUsername,
        }),
      })
      if (!res.ok) throw new Error()
      setSubmitStatus('success')
    } catch {
      setSubmitStatus('error')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // Defensive re-validation — earlier steps were already gated, but make sure
    // nothing was cleared after the fact.
    if (form.description.trim().length < 10) {
      setErrors((prev) => ({ ...prev, description: 'Please describe your logo (at least 10 characters).' }))
      goToStep(2)
      return
    }
    const contactErrs = validateContact()
    if (Object.keys(contactErrs).length) {
      setErrors((prev) => ({ ...prev, contact: contactErrs }))
      goToStep(3)
      return
    }
    await doSubmit()
  }

  if (submitStatus === 'success') {
    return (
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-16 text-center">
        <p className="font-serif text-3xl text-gold-900 mb-3">Order received!</p>
        <p className="text-stone-500 text-sm mb-8">
          Your logo order has been added to the waitlist. I will be in touch to confirm details.
        </p>
        <Link
          href="/waitlist"
          className="inline-block bg-gold hover:bg-gold-400 text-gold-950 text-sm font-medium px-6 py-2.5 rounded-lg transition-colors"
        >
          View Waitlist
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <Breadcrumb />
      <h1 className="font-serif text-4xl font-semibold text-gold-900 mb-2 mt-4">Logo Order</h1>

      <div className="bg-gold-50 border border-gold-200 rounded-xl p-4 mb-8 text-sm text-stone-600 leading-relaxed">
        <p className="font-medium text-stone-700 mb-1">About this service</p>
        <p>
          I design custom digital logos for Irish dance schools, academies, and competitions. Each
          logo is hand-crafted to reflect your school&apos;s identity — from Celtic motifs and
          dancer silhouettes to unique typography. Final files are delivered in print-ready and
          web-ready formats. Answer a few quick questions below and we&apos;ll get started.
        </p>
      </div>

      <ProgressBar active={activeStep} total={TOTAL_STEPS} />

      <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleSubmit} noValidate className="space-y-10">

          {/* ---- Step 1: Purpose (auto-advance) ---- */}
          <FormStep
            state={stepState(0)}
            innerRef={(el) => {
              stepRefs.current[0] = el
            }}
          >
            <StepHeading n={1} title="What is the logo for?" />
            <div className="flex flex-wrap gap-2">
              {PURPOSE_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => selectPurpose(o.value)}
                  className={chipClass(form.purpose === o.value)}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </FormStep>

          {/* ---- Step 2: Reference images (optional) ---- */}
          <FormStep
            state={stepState(1)}
            innerRef={(el) => {
              stepRefs.current[1] = el
            }}
          >
            <StepHeading n={2} title="Add reference images" optional />
            <ImageUpload
              files={form.images}
              onChange={(images) => {
                setForm((prev) => ({ ...prev, images }))
                if (warnNoImages && images.length > 0) setWarnNoImages(false)
              }}
              label="Reference Images"
              helperText="Highly recommended — logos you like, inspiration, or anything that conveys your vision."
            />
            {warnNoImages ? (
              <ContinueWithoutImages
                onCancel={() => setWarnNoImages(false)}
                onConfirm={() => {
                  setWarnNoImages(false)
                  goToStep(2)
                }}
              />
            ) : (
              <ContinueButton onClick={continueFromImages} />
            )}
          </FormStep>

          {/* ---- Step 3: Description (required) ---- */}
          <FormStep
            state={stepState(2)}
            innerRef={(el) => {
              stepRefs.current[2] = el
            }}
          >
            <StepHeading n={3} title="Describe your logo" />
            <Field label="Descriptions, comments & preferences" required error={errors.description}>
              <textarea
                value={form.description}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                  if (errors.description) setErrors((prev) => ({ ...prev, description: undefined }))
                }}
                rows={5}
                className={`w-full rounded-lg border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gold-400 transition resize-y ${
                  errors.description ? 'border-red-400' : 'border-stone-300'
                }`}
                placeholder="Describe your logo vision — style, symbols, colors, vibe, intended use…"
              />
            </Field>
            <ContinueButton onClick={continueFromDescription} />
          </FormStep>

          {/* ---- Step 4: Contact (multi-field) ---- */}
          <FormStep
            state={stepState(3)}
            innerRef={(el) => {
              stepRefs.current[3] = el
            }}
          >
            <StepHeading n={4} title="How can I reach you?" />
            <ContactInfoBlock
              value={form.contact}
              onChange={(contact) => setForm((prev) => ({ ...prev, contact }))}
              errors={errors.contact ?? {}}
              onClearError={clearContactError}
            />
            <ContinueButton onClick={continueFromContact} />
          </FormStep>

          {/* ---- Step 5: Sharing (optional) + submit ---- */}
          <FormStep
            state={stepState(4)}
            innerRef={(el) => {
              stepRefs.current[4] = el
            }}
          >
            <StepHeading n={5} title="Sharing preferences" optional />
            <SharingPreferencesBlock
              value={form.sharing}
              onChange={(sharing) => setForm((prev) => ({ ...prev, sharing }))}
            />

            {submitStatus === 'error' && (
              <p className="mt-5 text-sm text-red-600">Something went wrong — please try again.</p>
            )}

            <button
              type="submit"
              disabled={submitStatus === 'loading'}
              className="mt-6 w-full sm:w-auto bg-gold hover:bg-gold-400 disabled:opacity-60 text-gold-950 font-medium text-sm px-8 py-2.5 rounded-lg transition-colors"
            >
              {submitStatus === 'loading' ? 'Submitting…' : 'Submit Order'}
            </button>
          </FormStep>
        </form>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Small presentational helpers
// ---------------------------------------------------------------------------

const chipClass = (active: boolean) =>
  `px-4 py-2 rounded-lg text-sm font-medium border transition ${
    active
      ? 'bg-gold-900 text-white border-gold-900'
      : 'bg-white text-stone-600 border-stone-300 hover:border-gold-400'
  }`

function ProgressBar({ active, total }: { active: number; total: number }) {
  const pct = Math.round(((active + 1) / total) * 100)
  return (
    <div className="mb-6">
      <div className="h-1.5 w-full rounded-full bg-stone-200 overflow-hidden">
        <div
          className="h-full rounded-full bg-gold-600 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function StepHeading({ n, title, optional }: { n: number; title: string; optional?: boolean }) {
  return (
    <div className="mb-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gold-700 mb-1">
        Question {n} of {TOTAL_STEPS}
      </p>
      <h2 className="font-serif text-2xl text-gold-900">
        {title}
        {optional && (
          <span className="text-stone-400 text-base font-sans font-normal"> · optional</span>
        )}
      </h2>
    </div>
  )
}

function ContinueButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-gold hover:bg-gold-400 text-gold-950 text-sm font-medium px-6 py-2.5 transition-colors"
    >
      Continue
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-4 h-4"
        aria-hidden="true"
      >
        <path d="M12 5v14M19 12l-7 7-7-7" />
      </svg>
    </button>
  )
}

function ContinueWithoutImages({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <div className="mt-5 rounded-xl border border-gold-300 bg-gold-50 p-4 space-y-3">
      <p className="font-medium text-gold-900 text-sm">No images added</p>
      <p className="text-gold-800 text-sm">
        Reference images are highly recommended — they help ensure the final logo matches your
        vision. Continue without any?
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-1.5 rounded-lg border border-gold-400 text-gold-900 text-sm font-medium hover:bg-gold-100 transition"
        >
          ← Go back and add images
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="px-4 py-1.5 rounded-lg bg-gold hover:bg-gold-400 text-gold-950 text-sm font-medium transition"
        >
          Continue without images
        </button>
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
      <span>/</span>
      <Link href="/order/digital-image" className="hover:text-gold-600 transition-colors">
        Digital Image
      </Link>
      <span>/</span>
      <span className="text-stone-600">Logo</span>
    </nav>
  )
}
