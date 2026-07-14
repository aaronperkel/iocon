'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ColorPicker } from '@/components/ColorPicker'
import { Field } from '@/components/FormField'
import { ImageUpload, type UploadedFile } from '@/components/ImageUpload'
import { ProductSelectionBlock } from '@/components/ProductSelectionBlock'
import {
  ContactInfoBlock,
  EMPTY_CONTACT,
  type ContactInfoFields,
  type ContactErrors,
} from '@/components/ContactInfoBlock'
import type { OrderType } from '@/lib/orders'
import { PRODUCT_FORMAT_LABELS, type ProductFormat } from '@/lib/products'

// ---------------------------------------------------------------------------
// Shared "draw an existing costume" order form (Flow B in Riley's ordering
// scheme). Used by four shop subjects:
//
//   Solo Icon (existing costume)  — one fixed dancer section
//   Group Icons                   — one section per dancer, add as many as needed
//   Through the Years             — one dancer, one section per age
//   Walking Duo                   — exactly two dancer sections
//
// Each dancer/age section carries its own details, photos, extras, and
// comments. Product selection and contact info are asked once per order.
// Sharing/tagging permissions were deliberately removed from the order forms
// (too confusing mid-order) — Riley sorts that out with the client directly.
// ---------------------------------------------------------------------------

type Shoe = '' | 'hard' | 'soft'
type Tan = '' | 'light' | 'medium' | 'dark'
type SectionNoun = 'dancer' | 'age'

interface Extras {
  backgroundColor: string
  addLogo: '' | 'yes' | 'no'
  logoImages: UploadedFile[]
  addText: '' | 'yes' | 'no'
  textContent: string
  addSash: '' | 'yes' | 'no'
  prizes: string[]
}

interface DancerSection {
  name: string // dancer first name (unused when sectionNoun is 'age')
  age: string // approximate age (only when sectionNoun is 'age')
  shoe: Shoe
  tan: Tan
  designer: string
  images: UploadedFile[]
  extras: Extras
  comments: string
}

export interface CostumeOrderFormProps {
  orderType: OrderType
  title: string
  intro: string
  /** Breadcrumb ancestors; the current page label is `title`. */
  trail?: { label: string; href: string }[]
  sectionNoun: SectionNoun
  minSections: number
  /** Hard cap on sections (e.g. 2 for Walking Duo). */
  maxSections?: number
  /** When true the section count cannot change (Solo Icon, Walking Duo). */
  fixedCount?: boolean
}

const emptySection = (): DancerSection => ({
  name: '',
  age: '',
  shoe: '',
  tan: '',
  designer: '',
  images: [],
  extras: {
    backgroundColor: '#ffffff',
    addLogo: '',
    logoImages: [],
    addText: '',
    textContent: '',
    addSash: '',
    prizes: [],
  },
  comments: '',
})

const BACKGROUND_SWATCHES = [
  { hex: '#ffffff', label: 'White' },
  { hex: '#f5f0e8', label: 'Cream' },
  { hex: '#1a3c2b', label: 'Emerald' },
  { hex: '#92400e', label: 'Amber' },
  { hex: '#1e3a5f', label: 'Navy' },
  { hex: '#7c3aed', label: 'Purple' },
  { hex: '#be123c', label: 'Rose' },
  { hex: '#000000', label: 'Black' },
]

const PRIZE_OPTIONS = ['Trophy', 'Plaque', 'Prize', 'Globe']

// Riley: "I need to see wig color/style (if applicable)"
const COSTUME_HELPER =
  'I need to see wig color/style (if applicable). Upload as many photos of the costume and headpiece as you like — the more detail the better.'

const INPUT_CLS =
  'w-full rounded-lg border border-stone-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gold-400 transition'
const SELECT_CLS =
  'w-full rounded-lg border border-stone-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gold-400 transition'

interface FormState {
  dancerName: string // 'age' forms only — one dancer across all sections
  sections: DancerSection[]
  product: ProductFormat | null
  contact: ContactInfoFields
}

interface FormErrors {
  dancerName?: string
  sections?: Record<number, string>
  product?: string
  contact?: ContactErrors
}

export default function CostumeOrderForm({
  orderType,
  title,
  intro,
  trail = [{ label: 'Shop', href: '/shop' }],
  sectionNoun,
  minSections,
  maxSections,
  fixedCount,
}: CostumeOrderFormProps) {
  const [form, setForm] = useState<FormState>({
    dancerName: '',
    sections: Array.from({ length: minSections }, emptySection),
    product: 'digital-download',
    contact: EMPTY_CONTACT,
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
    'idle'
  )
  const [warnNoImages, setWarnNoImages] = useState(false)

  const nounLabel = sectionNoun === 'age' ? 'age' : 'dancer'

  function sectionTitle(section: DancerSection, i: number): string {
    if (sectionNoun === 'age') {
      return section.age ? `Age ${section.age}` : `Age ${i + 1}`
    }
    return section.name || `Dancer ${i + 1}`
  }

  // ---- Section state helpers ----

  function updateSection(i: number, update: Partial<DancerSection>) {
    setForm((prev) => ({
      ...prev,
      sections: prev.sections.map((s, idx) => (idx === i ? { ...s, ...update } : s)),
    }))
    if (errors.sections?.[i] && (update.name || update.age)) {
      setErrors((prev) => ({
        ...prev,
        sections: { ...prev.sections, [i]: '' },
      }))
    }
  }

  function updateExtras(i: number, update: Partial<Extras>) {
    setForm((prev) => ({
      ...prev,
      sections: prev.sections.map((s, idx) =>
        idx === i ? { ...s, extras: { ...s.extras, ...update } } : s
      ),
    }))
  }

  function togglePrize(i: number, prize: string) {
    setForm((prev) => ({
      ...prev,
      sections: prev.sections.map((s, idx) => {
        if (idx !== i) return s
        const has = s.extras.prizes.includes(prize)
        return {
          ...s,
          extras: {
            ...s.extras,
            prizes: has ? s.extras.prizes.filter((p) => p !== prize) : [...s.extras.prizes, prize],
          },
        }
      }),
    }))
  }

  function addSection() {
    setForm((prev) => ({ ...prev, sections: [...prev.sections, emptySection()] }))
  }

  function removeSection(i: number) {
    setForm((prev) => ({
      ...prev,
      sections: prev.sections.filter((_, idx) => idx !== i),
    }))
    setErrors((prev) => ({ ...prev, sections: undefined }))
  }

  const canAdd =
    !fixedCount && (maxSections === undefined || form.sections.length < maxSections)
  const canRemove = !fixedCount && form.sections.length > minSections

  // ---- Validation ----

  function validate(): FormErrors {
    const errs: FormErrors = {}
    if (sectionNoun === 'age' && !form.dancerName.trim()) {
      errs.dancerName = 'Dancer name is required.'
    }
    const sectionErrs: Record<number, string> = {}
    form.sections.forEach((s, i) => {
      if (sectionNoun === 'age' && !s.age.trim()) {
        sectionErrs[i] = 'Approximate age is required.'
      }
      if (sectionNoun === 'dancer' && form.sections.length > 1 && !s.name.trim()) {
        sectionErrs[i] = 'Dancer first name is required.'
      }
    })
    if (Object.values(sectionErrs).some(Boolean)) errs.sections = sectionErrs
    if (!form.product) errs.product = 'Please choose a product format.'
    const contactErrs: ContactErrors = {}
    if (!form.contact.firstName.trim()) contactErrs.firstName = 'First name is required.'
    if (!form.contact.lastName.trim()) contactErrs.lastName = 'Last name is required.'
    if (!form.contact.contactValue.trim()) contactErrs.contactValue = 'Contact info is required.'
    if (Object.keys(contactErrs).length) errs.contact = contactErrs
    return errs
  }

  // ---- Details builder ----

  function buildDetails(): string {
    const lines: string[] = []
    if (sectionNoun === 'age' && form.dancerName) lines.push(`Dancer: ${form.dancerName}`)

    form.sections.forEach((s, i) => {
      lines.push(`\n--- ${sectionTitle(s, i)} ---`)
      lines.push(`Shoe: ${s.shoe || 'not specified'}`)
      lines.push(`Tan: ${s.tan || 'not specified'}`)
      if (s.designer) lines.push(`Costume designed by: ${s.designer}`)
      if (s.images.length > 0)
        lines.push(
          `Costume/headpiece photos: ${s.images.length} uploaded — TODO: wire to storage`
        )
      lines.push(`Background color: ${s.extras.backgroundColor}`)
      if (s.extras.addLogo === 'yes') {
        lines.push(
          `Logo: Yes${
            s.extras.logoImages.length > 0
              ? ` (${s.extras.logoImages.length} image uploaded — TODO: wire to storage)`
              : ''
          }`
        )
      }
      if (s.extras.addText === 'yes' && s.extras.textContent)
        lines.push(`Text: "${s.extras.textContent}"`)
      if (s.extras.addSash === 'yes') lines.push('Sash: Yes')
      if (s.extras.prizes.length > 0) lines.push(`Prizes: ${s.extras.prizes.join(', ')}`)
      if (s.comments) lines.push(`Comments: ${s.comments}`)
    })

    if (form.product) lines.push(`\nProduct: ${PRODUCT_FORMAT_LABELS[form.product]}`)

    return lines.join('\n').trim()
  }

  // ---- Submit ----

  async function doSubmit() {
    setWarnNoImages(false)
    setSubmitStatus('loading')
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.contact.firstName,
          lastName: form.contact.lastName,
          contactMethod: form.contact.contactMethod,
          contactValue: form.contact.contactValue,
          orderType,
          product: form.product,
          details: buildDetails(),
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
    const errs = validate()
    if (
      errs.dancerName ||
      errs.product ||
      errs.contact ||
      (errs.sections && Object.values(errs.sections).some(Boolean))
    ) {
      setErrors(errs)
      return
    }
    if (form.sections.every((s) => s.images.length === 0)) {
      setWarnNoImages(true)
      return
    }
    await doSubmit()
  }

  if (submitStatus === 'success') {
    return (
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-16 text-center">
        <p className="font-heading text-3xl text-gold-900 mb-3">Order received!</p>
        <p className="text-stone-500 text-sm mb-8">
          Your {title.toLowerCase()} request has been added to the waitlist. I will reach out to
          discuss details.
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
      <nav className="flex items-center gap-1.5 text-xs text-stone-400" aria-label="Breadcrumb">
        {trail.map((t) => (
          <span key={t.href} className="flex items-center gap-1.5">
            <Link href={t.href} className="hover:text-gold-600 transition-colors">
              {t.label}
            </Link>
            <span aria-hidden="true">/</span>
          </span>
        ))}
        <span className="text-stone-600">{title}</span>
      </nav>

      <h1 className="font-heading text-4xl font-bold text-gold-900 mb-2 mt-4">{title}</h1>
      <p className="text-stone-500 text-sm mb-10">{intro}</p>

      <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleSubmit} noValidate className="space-y-10">

          {/* ---- One dancer across all ages (Through the Years) ---- */}
          {sectionNoun === 'age' && (
            <section className="space-y-4">
              <h2 className="font-heading text-lg text-gold-900 border-b border-stone-100 pb-2">
                Dancer
              </h2>
              <Field label="First name of dancer" required error={errors.dancerName}>
                <input
                  type="text"
                  value={form.dancerName}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, dancerName: e.target.value }))
                    if (errors.dancerName)
                      setErrors((prev) => ({ ...prev, dancerName: undefined }))
                  }}
                  className={INPUT_CLS}
                  placeholder="Emma"
                />
              </Field>
            </section>
          )}

          {/* ---- Per-dancer / per-age sections ---- */}
          {form.sections.map((section, i) => (
            <section
              key={i}
              className="rounded-xl border border-stone-200 bg-stone-50 p-5 space-y-6"
            >
              <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                <h2 className="font-heading text-lg text-gold-900">{sectionTitle(section, i)}</h2>
                {canRemove && (
                  <button
                    type="button"
                    onClick={() => removeSection(i)}
                    className="text-xs text-stone-400 hover:text-red-600 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>

              {/* Dancer details */}
              <div className="grid sm:grid-cols-2 gap-4">
                {sectionNoun === 'age' ? (
                  <Field label="Approximate age" required error={errors.sections?.[i] || undefined}>
                    <input
                      type="text"
                      value={section.age}
                      onChange={(e) => updateSection(i, { age: e.target.value })}
                      className={INPUT_CLS}
                      placeholder="8"
                    />
                  </Field>
                ) : (
                  <Field
                    label="First name of dancer"
                    required={form.sections.length > 1}
                    error={errors.sections?.[i] || undefined}
                  >
                    <input
                      type="text"
                      value={section.name}
                      onChange={(e) => updateSection(i, { name: e.target.value })}
                      className={INPUT_CLS}
                      placeholder="Emma"
                    />
                  </Field>
                )}
                <Field label="Hard or soft shoe" required>
                  <select
                    value={section.shoe}
                    onChange={(e) => updateSection(i, { shoe: e.target.value as Shoe })}
                    className={SELECT_CLS}
                  >
                    <option value="">Select…</option>
                    <option value="hard">Hard shoe</option>
                    <option value="soft">Soft shoe</option>
                  </select>
                </Field>
                <Field label="Tan" required>
                  <select
                    value={section.tan}
                    onChange={(e) => updateSection(i, { tan: e.target.value as Tan })}
                    className={SELECT_CLS}
                  >
                    <option value="">Select…</option>
                    <option value="light">Light</option>
                    <option value="medium">Medium</option>
                    <option value="dark">Dark</option>
                  </select>
                </Field>
                <Field label="Who designed the costume?">
                  <input
                    type="text"
                    value={section.designer}
                    onChange={(e) => updateSection(i, { designer: e.target.value })}
                    className={INPUT_CLS}
                    placeholder="Designer, dressmaker, or brand"
                  />
                </Field>
              </div>

              {/* Photos */}
              <ImageUpload
                files={section.images}
                onChange={(images) => {
                  updateSection(i, { images })
                  if (warnNoImages && images.length > 0) setWarnNoImages(false)
                }}
                label="Costume & headpiece photos"
                helperText={COSTUME_HELPER}
              />

              {/* Extras */}
              <div className="space-y-5">
                <div className="flex items-baseline gap-3 border-b border-stone-200 pb-2">
                  <h3 className="font-heading text-base text-gold-900">Extras</h3>
                  <p className="text-xs text-stone-400">I will contact you about specifics</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-stone-700 mb-2">Background color</p>
                  <ColorPicker
                    value={section.extras.backgroundColor}
                    onChange={(hex) => updateExtras(i, { backgroundColor: hex })}
                    swatches={BACKGROUND_SWATCHES}
                  />
                  <p className="mt-2 text-xs text-stone-400">
                    Selected:{' '}
                    <span className="font-mono">{section.extras.backgroundColor}</span>
                  </p>
                </div>

                <YesNoField
                  label="Add school or major logo?"
                  value={section.extras.addLogo}
                  onChange={(v) => updateExtras(i, { addLogo: v })}
                />
                {section.extras.addLogo === 'yes' && (
                  <div className="pl-4 border-l-2 border-gold-200">
                    <ImageUpload
                      files={section.extras.logoImages}
                      onChange={(logoImages) => updateExtras(i, { logoImages })}
                      label="Logo image"
                      helperText="Upload the logo file or a clear photo of it."
                    />
                  </div>
                )}

                <YesNoField
                  label="Add text?"
                  value={section.extras.addText}
                  onChange={(v) => updateExtras(i, { addText: v })}
                />
                {section.extras.addText === 'yes' && (
                  <div className="pl-4 border-l-2 border-gold-200">
                    <Field label="Text to include">
                      <input
                        type="text"
                        value={section.extras.textContent}
                        onChange={(e) => updateExtras(i, { textContent: e.target.value })}
                        className={INPUT_CLS}
                        placeholder="Name, school, year…"
                      />
                    </Field>
                  </div>
                )}

                <YesNoField
                  label="Add sash?"
                  value={section.extras.addSash}
                  onChange={(v) => updateExtras(i, { addSash: v })}
                />

                <div>
                  <p className="text-sm font-medium text-stone-700 mb-2">
                    Add trophy / plaque / prize / globe?
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {PRIZE_OPTIONS.map((prize) => (
                      <button
                        key={prize}
                        type="button"
                        onClick={() => togglePrize(i, prize)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${
                          section.extras.prizes.includes(prize)
                            ? 'bg-gold-900 text-white border-gold-900'
                            : 'bg-white text-stone-600 border-stone-300 hover:border-gold-400'
                        }`}
                      >
                        {prize}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Comments */}
              <Field label="Any comments or clarifications?">
                <textarea
                  value={section.comments}
                  onChange={(e) => updateSection(i, { comments: e.target.value })}
                  rows={3}
                  className={`${INPUT_CLS} resize-y`}
                  placeholder="Pose preference, background ideas, anything else I should know…"
                />
              </Field>
            </section>
          ))}

          {canAdd && (
            <button
              type="button"
              onClick={addSection}
              className="w-full rounded-xl border-2 border-dashed border-stone-300 hover:border-gold-400 hover:bg-gold-50/50 py-3 text-sm font-medium text-stone-500 hover:text-gold-700 transition"
            >
              + Add another {nounLabel}
            </button>
          )}

          {/* ---- Product selection (once per order) ---- */}
          <section className="space-y-4">
            <h2 className="font-heading text-lg text-gold-900 border-b border-stone-100 pb-2">
              Product Selection
            </h2>
            <ProductSelectionBlock
              value={form.product}
              onChange={(product) => {
                setForm((prev) => ({ ...prev, product }))
                if (errors.product) setErrors((prev) => ({ ...prev, product: undefined }))
              }}
              error={errors.product}
            />
          </section>

          {/* ---- Contact (once per order) ---- */}
          <section className="space-y-4">
            <h2 className="font-heading text-lg text-gold-900 border-b border-stone-100 pb-2">
              Contact Information
            </h2>
            <ContactInfoBlock
              value={form.contact}
              onChange={(contact) => setForm((prev) => ({ ...prev, contact }))}
              errors={errors.contact ?? {}}
              onClearError={(key) =>
                setErrors((prev) => ({ ...prev, contact: { ...prev.contact, [key]: undefined } }))
              }
            />
          </section>

          {submitStatus === 'error' && (
            <p className="text-sm text-red-600">Something went wrong — please try again.</p>
          )}

          {warnNoImages ? (
            <div className="rounded-xl border border-gold-300 bg-gold-50 p-4 space-y-3">
              <p className="font-medium text-gold-900 text-sm">No costume photos uploaded</p>
              <p className="text-gold-800 text-sm">
                Costume photos are highly recommended — they help ensure the illustration captures
                every detail accurately. Are you sure you want to submit without any?
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setWarnNoImages(false)}
                  className="px-4 py-1.5 rounded-lg border border-gold-400 text-gold-900 text-sm font-medium hover:bg-gold-100 transition"
                >
                  ← Go back and add photos
                </button>
                <button
                  type="button"
                  onClick={doSubmit}
                  className="px-4 py-1.5 rounded-lg bg-gold hover:bg-gold-400 text-gold-950 text-sm font-medium transition"
                >
                  Submit without photos
                </button>
              </div>
            </div>
          ) : (
            <button
              type="submit"
              disabled={submitStatus === 'loading'}
              className="w-full sm:w-auto bg-gold hover:bg-gold-400 disabled:opacity-60 text-gold-950 font-medium text-sm px-8 py-2.5 rounded-lg transition-colors"
            >
              {submitStatus === 'loading' ? 'Submitting…' : 'Submit Order'}
            </button>
          )}
        </form>
      </div>
    </div>
  )
}

function YesNoField({
  label,
  value,
  onChange,
}: {
  label: string
  value: '' | 'yes' | 'no'
  onChange: (v: '' | 'yes' | 'no') => void
}) {
  return (
    <div>
      <p className="text-sm font-medium text-stone-700 mb-2">{label}</p>
      <div className="flex gap-2">
        {(['yes', 'no'] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(value === v ? '' : v)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${
              value === v
                ? 'bg-gold-900 text-white border-gold-900'
                : 'bg-white text-stone-600 border-stone-300 hover:border-gold-400'
            }`}
          >
            {v === 'yes' ? 'Yes' : 'No'}
          </button>
        ))}
      </div>
    </div>
  )
}
