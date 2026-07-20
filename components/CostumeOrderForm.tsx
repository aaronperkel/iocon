'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Field } from '@/components/FormField'
import { ImageUpload, type UploadedFile } from '@/components/ImageUpload'
import { ProductSelectionBlock } from '@/components/ProductSelectionBlock'
import {
  ContactInfoBlock,
  EMPTY_CONTACT,
  type ContactInfoFields,
  type ContactErrors,
} from '@/components/ContactInfoBlock'
import type { OrderType } from '@/lib/order-types'
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
// Structure per Riley (2026-07): the dancer section is the ONLY thing that
// repeats. Layout (text / background / logo), product selection, and contact
// info are each asked once per order. Inputs carry no placeholder text —
// Riley wants the forms very simple.
// Sharing/tagging permissions were deliberately removed from the order forms
// (too confusing mid-order) — Riley sorts that out with the client directly.
// ---------------------------------------------------------------------------

type Shoe = '' | 'hard' | 'soft'
type LegShade = '' | 'light' | 'medium-tan' | 'dark-tan' | 'black-tights' | 'black-pants'
type Background = '' | 'white' | 'light-coordinating' | 'dark-coordinating' | 'other'
type SectionNoun = 'dancer' | 'age'

interface DancerSection {
  name: string // dancer first name (unused when sectionNoun is 'age')
  age: string // approximate age (only when sectionNoun is 'age')
  shoe: Shoe
  legShade: LegShade
  designer: string
  school: string
  extras: string[]
  images: UploadedFile[]
  comments: string
}

interface LayoutState {
  addText: '' | 'yes' | 'no'
  textContent: string
  background: Background
  addLogo: '' | 'yes' | 'no'
  images: UploadedFile[]
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
  legShade: '',
  designer: '',
  school: '',
  extras: [],
  images: [],
  comments: '',
})

const EMPTY_LAYOUT: LayoutState = {
  addText: '',
  textContent: '',
  background: '',
  addLogo: '',
  images: [],
  comments: '',
}

const LEG_SHADE_OPTIONS: { value: LegShade; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'medium-tan', label: 'Medium tan' },
  { value: 'dark-tan', label: 'Dark tan' },
  { value: 'black-tights', label: 'Black tights' },
  { value: 'black-pants', label: 'Black pants' },
]

const EXTRA_OPTIONS = ['Sash', 'Belt', 'Prize held in hand']

const BACKGROUND_OPTIONS: { value: Background; label: string }[] = [
  { value: 'white', label: 'White' },
  { value: 'light-coordinating', label: 'A light shade that coordinates with the costume' },
  { value: 'dark-coordinating', label: 'A dark shade that coordinates with the costume' },
  { value: 'other', label: 'Other — please describe in the layout comments or attach an image' },
]

// Riley's copy (2026-07)
const DANCER_IMAGES_HELPER =
  'Clear, front facing images of the costume, headpiece, wig color and style, or anything else you think I’ll need to create an accurate drawing. Please include images of added extras if applicable.'

const LAYOUT_IMAGES_HELPER =
  'Logo files, background references, or anything else that helps with the layout.'

const INPUT_CLS =
  'w-full rounded-lg border border-stone-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gold-400 transition'
const SELECT_CLS =
  'w-full rounded-lg border border-stone-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gold-400 transition'
const SECTION_H2_CLS = 'font-heading text-lg text-olive-800 border-b border-gold-200 pb-2'

interface FormState {
  dancerName: string // 'age' forms only — one dancer across all sections
  sections: DancerSection[]
  layout: LayoutState
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
    layout: EMPTY_LAYOUT,
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
    if (section.name) return section.name
    return form.sections.length === 1 ? 'Dancer' : `Dancer ${i + 1}`
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

  function toggleExtra(i: number, extra: string) {
    setForm((prev) => ({
      ...prev,
      sections: prev.sections.map((s, idx) => {
        if (idx !== i) return s
        const has = s.extras.includes(extra)
        return {
          ...s,
          extras: has ? s.extras.filter((e) => e !== extra) : [...s.extras, extra],
        }
      }),
    }))
  }

  function updateLayout(update: Partial<LayoutState>) {
    setForm((prev) => ({ ...prev, layout: { ...prev.layout, ...update } }))
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
      lines.push(
        `Leg shade: ${
          LEG_SHADE_OPTIONS.find((o) => o.value === s.legShade)?.label ?? 'not specified'
        }`
      )
      if (s.designer) lines.push(`Costume designer: ${s.designer}`)
      if (s.school) lines.push(`Dance school: ${s.school}`)
      if (s.extras.length > 0) lines.push(`Extras: ${s.extras.join(', ')}`)
      if (s.images.length > 0)
        lines.push(`Dancer images: ${s.images.length} uploaded — TODO: wire to storage`)
      if (s.comments) lines.push(`Comments: ${s.comments}`)
    })

    const layout = form.layout
    lines.push('\n--- Layout ---')
    if (layout.addText === 'yes' && layout.textContent)
      lines.push(`Text: "${layout.textContent}"`)
    lines.push(
      `Background: ${
        BACKGROUND_OPTIONS.find((o) => o.value === layout.background)?.label ?? 'not specified'
      }`
    )
    if (layout.addLogo === 'yes')
      lines.push('Logo: Yes — see layout images and comments for size/positioning')
    if (layout.images.length > 0)
      lines.push(`Layout images: ${layout.images.length} uploaded — TODO: wire to storage`)
    if (layout.comments) lines.push(`Layout comments: ${layout.comments}`)

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
        <p className="font-heading text-3xl text-olive-800 mb-3">Order received!</p>
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

      <h1 className="font-heading text-4xl font-bold text-olive-800 mb-2 mt-4">{title}</h1>
      <p className="text-stone-500 text-sm mb-10">{intro}</p>

      <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleSubmit} noValidate className="space-y-10">

          {/* ---- One dancer across all ages (Through the Years) ---- */}
          {sectionNoun === 'age' && (
            <section className="space-y-4">
              <h2 className={SECTION_H2_CLS}>Dancer</h2>
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
                />
              </Field>
            </section>
          )}

          {/* ---- Per-dancer / per-age sections (the only repeating part) ---- */}
          {form.sections.map((section, i) => (
            <section
              key={i}
              className="rounded-xl border border-stone-200 bg-stone-50 p-5 space-y-6"
            >
              <div className="flex items-center justify-between border-b border-gold-200 pb-2">
                <h2 className="font-heading text-lg text-olive-800">{sectionTitle(section, i)}</h2>
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
                <Field label="Leg shade" required>
                  <select
                    value={section.legShade}
                    onChange={(e) => updateSection(i, { legShade: e.target.value as LegShade })}
                    className={SELECT_CLS}
                  >
                    <option value="">Select…</option>
                    {LEG_SHADE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Costume Designer (optional)">
                  <input
                    type="text"
                    value={section.designer}
                    onChange={(e) => updateSection(i, { designer: e.target.value })}
                    className={INPUT_CLS}
                  />
                </Field>
                <Field label="Dance School (optional)">
                  <input
                    type="text"
                    value={section.school}
                    onChange={(e) => updateSection(i, { school: e.target.value })}
                    className={INPUT_CLS}
                  />
                </Field>
              </div>

              {/* Extras */}
              <div>
                <p className="text-sm font-medium text-stone-700 mb-2">Select Extras</p>
                <div className="flex flex-wrap gap-2">
                  {EXTRA_OPTIONS.map((extra) => (
                    <button
                      key={extra}
                      type="button"
                      onClick={() => toggleExtra(i, extra)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${
                        section.extras.includes(extra)
                          ? 'bg-olive-800 text-white border-olive-800'
                          : 'bg-white text-stone-600 border-stone-300 hover:border-gold-400'
                      }`}
                    >
                      {extra}
                    </button>
                  ))}
                </div>
              </div>

              {/* Photos */}
              <ImageUpload
                files={section.images}
                onChange={(images) => {
                  updateSection(i, { images })
                  if (warnNoImages && images.length > 0) setWarnNoImages(false)
                }}
                label="Upload Dancer Images"
                helperText={DANCER_IMAGES_HELPER}
              />

              {/* Comments */}
              <Field label="Dancer Comments">
                <textarea
                  value={section.comments}
                  onChange={(e) => updateSection(i, { comments: e.target.value })}
                  rows={3}
                  className={`${INPUT_CLS} resize-y`}
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

          {/* ---- Layout (once per order) ---- */}
          <section className="space-y-5">
            <div className="border-b border-gold-200 pb-2 space-y-0.5">
              <h2 className="font-heading text-lg text-olive-800">Layout</h2>
              <p className="text-xs text-stone-400">
                Positioning, text, and background details for the finished product
              </p>
            </div>

            <YesNoField
              label="Add text?"
              value={form.layout.addText}
              onChange={(v) => updateLayout({ addText: v })}
            />
            {form.layout.addText === 'yes' && (
              <div className="pl-4 border-l-2 border-gold-200">
                <Field label="Type the text as you want it shown on the product">
                  <input
                    type="text"
                    value={form.layout.textContent}
                    onChange={(e) => updateLayout({ textContent: e.target.value })}
                    className={INPUT_CLS}
                  />
                </Field>
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-stone-700 mb-2">Background</p>
              <div className="space-y-2">
                {BACKGROUND_OPTIONS.map((o) => (
                  <label
                    key={o.value}
                    className="flex items-start gap-2.5 text-sm text-stone-600 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="layout-background"
                      checked={form.layout.background === o.value}
                      onChange={() => updateLayout({ background: o.value })}
                      className="mt-0.5 accent-olive-800"
                    />
                    {o.label}
                  </label>
                ))}
              </div>
            </div>

            <YesNoField
              label="Add a logo?"
              value={form.layout.addLogo}
              onChange={(v) => updateLayout({ addLogo: v })}
            />
            {form.layout.addLogo === 'yes' && (
              <p className="pl-4 border-l-2 border-gold-200 text-sm text-stone-500">
                Please attach the logo under “Upload Layout Images” below and describe its size
                and positioning in the layout comments.
              </p>
            )}

            <ImageUpload
              files={form.layout.images}
              onChange={(images) => updateLayout({ images })}
              label="Upload Layout Images"
              helperText={LAYOUT_IMAGES_HELPER}
            />

            <Field label="Layout Comments">
              <textarea
                value={form.layout.comments}
                onChange={(e) => updateLayout({ comments: e.target.value })}
                rows={3}
                className={`${INPUT_CLS} resize-y`}
              />
            </Field>
          </section>

          {/* ---- Product selection (once per order) ---- */}
          <section className="space-y-4">
            <h2 className={SECTION_H2_CLS}>Product Selection</h2>
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
            <h2 className={SECTION_H2_CLS}>Contact Information</h2>
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

          <p className="text-xs text-stone-500">
            By ordering, you agree to the{' '}
            <Link
              href="/terms"
              className="text-gold-700 font-medium underline underline-offset-2 hover:text-gold-600 transition-colors"
            >
              Commission Terms
            </Link>
            .
          </p>

          {warnNoImages ? (
            <div className="rounded-xl border border-gold-300 bg-gold-50 p-4 space-y-3">
              <p className="font-medium text-gold-900 text-sm">No dancer images uploaded</p>
              <p className="text-gold-800 text-sm">
                Dancer images are highly recommended — they help ensure the drawing captures
                every detail accurately. Are you sure you want to submit without any?
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setWarnNoImages(false)}
                  className="px-4 py-1.5 rounded-lg border border-gold-400 text-gold-900 text-sm font-medium hover:bg-gold-100 transition"
                >
                  ← Go back and add images
                </button>
                <button
                  type="button"
                  onClick={doSubmit}
                  className="px-4 py-1.5 rounded-lg bg-gold hover:bg-gold-400 text-gold-950 text-sm font-medium transition"
                >
                  Submit without images
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
                ? 'bg-olive-800 text-white border-olive-800'
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
