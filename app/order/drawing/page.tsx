'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ColorPicker } from '@/components/ColorPicker'
import { Field } from '@/components/FormField'
import { Icon, type IconName } from '@/components/icons'
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
// Types
// ---------------------------------------------------------------------------

type Layout = 'single' | 'multiple' | 'through-years'
type Shoe = '' | 'hard' | 'soft'
type Tan = '' | 'light' | 'medium' | 'dark'

interface DancerSection {
  shoe: Shoe
  tan: Tan
  images: UploadedFile[]
}

interface Extras {
  backgroundColor: string
  addLogo: '' | 'yes' | 'no'
  logoImages: UploadedFile[]
  addText: '' | 'yes' | 'no'
  textContent: string
  addSash: '' | 'yes' | 'no'
  prizes: string[]
}

interface DrawingState {
  layout: Layout | null
  // Single dancer
  singleName: string
  single: DancerSection
  // Multiple dancers
  multiNamesRaw: string
  multi: DancerSection[]
  // Through the years
  ttyName: string
  ttyAgesRaw: string
  ttyAges: DancerSection[]
  // Shared
  comments: string
  extras: Extras
  contact: ContactInfoFields
  sharing: SharingPrefsFields
}

const emptyDancer = (): DancerSection => ({ shoe: '', tan: '', images: [] })

const EMPTY_STATE: DrawingState = {
  layout: null,
  singleName: '',
  single: emptyDancer(),
  multiNamesRaw: '',
  multi: [],
  ttyName: '',
  ttyAgesRaw: '',
  ttyAges: [],
  comments: '',
  extras: {
    backgroundColor: '#ffffff',
    addLogo: '',
    logoImages: [],
    addText: '',
    textContent: '',
    addSash: '',
    prizes: [],
  },
  contact: EMPTY_CONTACT,
  sharing: EMPTY_SHARING,
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const LAYOUTS: { id: Layout; title: string; subtitle: string; icon: IconName }[] = [
  {
    id: 'single',
    title: 'Single Dancer',
    subtitle: 'One dancer in costume',
    icon: 'dancer',
  },
  {
    id: 'multiple',
    title: 'Multiple Dancers',
    subtitle: 'Side-by-side group',
    icon: 'dancers',
  },
  {
    id: 'through-years',
    title: 'Through the Years',
    subtitle: 'One dancer across ages',
    icon: 'timeline',
  },
]

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

const COSTUME_HELPER =
  'Please ensure wig color and style (if applicable) and the details/color of the costume are visible.'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseCsv(raw: string): string[] {
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function syncSections(arr: DancerSection[], targetLen: number): DancerSection[] {
  if (arr.length === targetLen) return arr
  if (arr.length > targetLen) return arr.slice(0, targetLen)
  const additions = Array.from({ length: targetLen - arr.length }, emptyDancer)
  return [...arr, ...additions]
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const SELECT_CLS =
  'w-full rounded-lg border border-stone-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 transition'

function ShoeSelect({ value, onChange }: { value: Shoe; onChange: (v: Shoe) => void }) {
  return (
    <Field label="Hard or soft shoe" required>
      <select value={value} onChange={(e) => onChange(e.target.value as Shoe)} className={SELECT_CLS}>
        <option value="">Select…</option>
        <option value="hard">Hard shoe</option>
        <option value="soft">Soft shoe</option>
      </select>
    </Field>
  )
}

function TanSelect({ value, onChange }: { value: Tan; onChange: (v: Tan) => void }) {
  return (
    <Field label="Tan" required>
      <select value={value} onChange={(e) => onChange(e.target.value as Tan)} className={SELECT_CLS}>
        <option value="">Select…</option>
        <option value="light">Light</option>
        <option value="medium">Medium</option>
        <option value="dark">Dark</option>
      </select>
    </Field>
  )
}

function DancerCard({
  title,
  section,
  onChange,
}: {
  title: string
  section: DancerSection
  onChange: (update: Partial<DancerSection>) => void
}) {
  return (
    <div className="rounded-xl border border-stone-200 bg-stone-50 p-5 space-y-5">
      <p className="font-medium text-stone-700 text-sm">{title}</p>
      <div className="grid sm:grid-cols-2 gap-4">
        <ShoeSelect value={section.shoe} onChange={(shoe) => onChange({ shoe })} />
        <TanSelect value={section.tan} onChange={(tan) => onChange({ tan })} />
      </div>
      <ImageUpload
        files={section.images}
        onChange={(images) => onChange({ images })}
        label="Costume photos"
        helperText={COSTUME_HELPER}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Validation & details builder
// ---------------------------------------------------------------------------

interface FormErrors {
  layout?: string
  multiNames?: string
  ttyName?: string
  ttyAges?: string
  contact?: ContactErrors
}

function validate(form: DrawingState): FormErrors {
  const errs: FormErrors = {}
  if (!form.layout) {
    errs.layout = 'Please select a layout.'
    return errs
  }
  if (form.layout === 'multiple' && parseCsv(form.multiNamesRaw).length === 0) {
    errs.multiNames = 'Enter at least one dancer name.'
  }
  if (form.layout === 'through-years') {
    if (!form.ttyName.trim()) errs.ttyName = 'Dancer name is required.'
    if (parseCsv(form.ttyAgesRaw).length === 0) errs.ttyAges = 'Enter at least one age.'
  }
  const contactErrs: ContactErrors = {}
  if (!form.contact.firstName.trim()) contactErrs.firstName = 'First name is required.'
  if (!form.contact.lastName.trim()) contactErrs.lastName = 'Last name is required.'
  if (!form.contact.contactValue.trim()) contactErrs.contactValue = 'Contact info is required.'
  if (Object.keys(contactErrs).length) errs.contact = contactErrs
  return errs
}

function buildDetails(form: DrawingState): string {
  const lines: string[] = []

  if (form.layout === 'single') {
    lines.push('Layout: Single Dancer')
    if (form.singleName) lines.push(`Dancer: ${form.singleName}`)
    lines.push(`Shoe: ${form.single.shoe || 'not specified'}`)
    lines.push(`Tan: ${form.single.tan || 'not specified'}`)
    if (form.single.images.length > 0)
      lines.push(`Costume images: ${form.single.images.length} uploaded — TODO: wire to storage`)
  }

  if (form.layout === 'multiple') {
    const names = parseCsv(form.multiNamesRaw)
    lines.push('Layout: Multiple Dancers')
    names.forEach((name, i) => {
      const d = form.multi[i] ?? emptyDancer()
      lines.push(`\n--- ${name} ---`)
      lines.push(`Shoe: ${d.shoe || 'not specified'}`)
      lines.push(`Tan: ${d.tan || 'not specified'}`)
      if (d.images.length > 0)
        lines.push(`Costume images: ${d.images.length} uploaded — TODO: wire to storage`)
    })
  }

  if (form.layout === 'through-years') {
    const ages = parseCsv(form.ttyAgesRaw)
    lines.push('Layout: Through the Years')
    if (form.ttyName) lines.push(`Dancer: ${form.ttyName}`)
    ages.forEach((age, i) => {
      const d = form.ttyAges[i] ?? emptyDancer()
      lines.push(`\n--- Age ${age} ---`)
      lines.push(`Shoe: ${d.shoe || 'not specified'}`)
      lines.push(`Tan: ${d.tan || 'not specified'}`)
      if (d.images.length > 0)
        lines.push(`Costume images: ${d.images.length} uploaded — TODO: wire to storage`)
    })
  }

  if (form.comments) lines.push(`\nComments: ${form.comments}`)

  const { extras } = form
  const extrasLines: string[] = []
  extrasLines.push(`Background color: ${extras.backgroundColor}`)
  if (extras.addLogo === 'yes') {
    extrasLines.push(
      `Logo: Yes${extras.logoImages.length > 0 ? ` (${extras.logoImages.length} image uploaded — TODO: wire to storage)` : ''}`
    )
  }
  if (extras.addText === 'yes' && extras.textContent) {
    extrasLines.push(`Text: "${extras.textContent}"`)
  }
  if (extras.addSash === 'yes') extrasLines.push('Sash: Yes')
  if (extras.prizes.length > 0) extrasLines.push(`Prizes: ${extras.prizes.join(', ')}`)
  if (extrasLines.length) lines.push('\nExtras (to be discussed):\n' + extrasLines.join('\n'))

  if (form.sharing.platforms.length > 0)
    lines.push(`\nSharing: ${form.sharing.platforms.join(', ')}`)

  const tagParts: string[] = []
  if (form.sharing.instagramTag && form.sharing.instagramHandle)
    tagParts.push(`Instagram: ${form.sharing.instagramHandle}`)
  if (form.sharing.tikTokTag && form.sharing.tikTokHandle)
    tagParts.push(`TikTok: ${form.sharing.tikTokHandle}`)
  if (tagParts.length) lines.push(`Tag: ${tagParts.join(', ')}`)

  return lines.join('\n')
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function DrawingOrderPage() {
  const [form, setForm] = useState<DrawingState>(EMPTY_STATE)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
    'idle'
  )
  const [warnNoImages, setWarnNoImages] = useState(false)

  function hasNoImages(): boolean {
    if (!form.layout) return false
    if (form.layout === 'single') return form.single.images.length === 0
    if (form.layout === 'multiple')
      return form.multi.length === 0 || form.multi.every((d) => d.images.length === 0)
    return form.ttyAges.length === 0 || form.ttyAges.every((d) => d.images.length === 0)
  }

  // ---- Layout selection ----
  function selectLayout(layout: Layout) {
    setForm((prev) => ({ ...prev, layout }))
    if (errors.layout) setErrors((prev) => ({ ...prev, layout: undefined }))
  }

  // ---- Multi-dancer names ----
  function setMultiNames(raw: string) {
    const count = parseCsv(raw).length
    setForm((prev) => ({
      ...prev,
      multiNamesRaw: raw,
      multi: syncSections(prev.multi, count),
    }))
    if (errors.multiNames && parseCsv(raw).length > 0)
      setErrors((prev) => ({ ...prev, multiNames: undefined }))
  }

  function updateMulti(i: number, update: Partial<DancerSection>) {
    setForm((prev) => ({
      ...prev,
      multi: prev.multi.map((d, idx) => (idx === i ? { ...d, ...update } : d)),
    }))
  }

  // ---- Through the years ----
  function setTtyAges(raw: string) {
    const count = parseCsv(raw).length
    setForm((prev) => ({
      ...prev,
      ttyAgesRaw: raw,
      ttyAges: syncSections(prev.ttyAges, count),
    }))
    if (errors.ttyAges && parseCsv(raw).length > 0)
      setErrors((prev) => ({ ...prev, ttyAges: undefined }))
  }

  function updateTty(i: number, update: Partial<DancerSection>) {
    setForm((prev) => ({
      ...prev,
      ttyAges: prev.ttyAges.map((d, idx) => (idx === i ? { ...d, ...update } : d)),
    }))
  }

  // ---- Extras ----
  function setExtras(update: Partial<Extras>) {
    setForm((prev) => ({ ...prev, extras: { ...prev.extras, ...update } }))
  }

  function togglePrize(prize: string) {
    setForm((prev) => {
      const has = prev.extras.prizes.includes(prize)
      return {
        ...prev,
        extras: {
          ...prev.extras,
          prizes: has
            ? prev.extras.prizes.filter((p) => p !== prize)
            : [...prev.extras.prizes, prize],
        },
      }
    })
  }

  // ---- Submit ----
  async function doSubmit() {
    setWarnNoImages(false)
    setSubmitStatus('loading')
    const tagParts: string[] = []
    if (form.sharing.instagramTag && form.sharing.instagramHandle)
      tagParts.push(`Instagram: ${form.sharing.instagramHandle}`)
    if (form.sharing.tikTokTag && form.sharing.tikTokHandle)
      tagParts.push(`TikTok: ${form.sharing.tikTokHandle}`)
    const tagUsername = tagParts.length > 0 ? tagParts.join(', ') : undefined
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.contact.firstName,
          lastName: form.contact.lastName,
          contactMethod: form.contact.contactMethod,
          contactValue: form.contact.contactValue,
          orderType: 'drawing',
          details: buildDetails(form),
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
    const errs = validate(form)
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }
    if (hasNoImages()) {
      setWarnNoImages(true)
      return
    }
    await doSubmit()
  }

  if (submitStatus === 'success') {
    return (
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-16 text-center">
        <p className="font-serif text-3xl text-emerald-900 mb-3">Order received!</p>
        <p className="text-stone-500 text-sm mb-8">
          Your costume drawing request has been added to the waitlist. I will reach out to discuss
          details.
        </p>
        <Link
          href="/waitlist"
          className="inline-block bg-emerald-900 hover:bg-emerald-800 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors"
        >
          View Waitlist
        </Link>
      </div>
    )
  }

  const multiNames = parseCsv(form.multiNamesRaw)
  const ttyAges = parseCsv(form.ttyAgesRaw)

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <Breadcrumb />
      <h1 className="font-serif text-4xl font-semibold text-emerald-900 mb-2 mt-4">
        Existing Costume Drawing
      </h1>
      <p className="text-stone-500 text-sm mb-10">
        I will create a digital illustration of a costume you already own. Fill in the details
        below and upload costume photos — the more info the better!
      </p>

      <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleSubmit} noValidate className="space-y-10">

          {/* ---- Layout selection ---- */}
          <section className="space-y-4">
            <h2 className="font-serif text-lg text-emerald-900 border-b border-stone-100 pb-2">
              Select a Layout
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {LAYOUTS.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => selectLayout(l.id)}
                  className={`relative rounded-xl border-2 overflow-hidden text-left transition ${
                    form.layout === l.id
                      ? 'border-emerald-900 ring-2 ring-emerald-900/20'
                      : 'border-stone-200 hover:border-amber-400'
                  }`}
                >
                  <div
                    className={`h-24 w-full flex items-center justify-center transition-colors ${
                      form.layout === l.id
                        ? 'bg-emerald-50 text-emerald-800'
                        : 'bg-stone-50 text-stone-500'
                    }`}
                    aria-hidden="true"
                  >
                    <Icon name={l.icon} className="w-9 h-9" />
                  </div>
                  <div className="p-3 bg-white">
                    <p className="font-medium text-sm text-stone-800">{l.title}</p>
                    <p className="text-xs text-stone-500 mt-0.5">{l.subtitle}</p>
                  </div>
                  {form.layout === l.id && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-emerald-900 rounded-full flex items-center justify-center">
                      <svg
                        viewBox="0 0 12 10"
                        fill="none"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-3 h-3"
                      >
                        <polyline points="1,5 4,8 11,1" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
            {errors.layout && <p className="text-xs text-red-600">{errors.layout}</p>}
          </section>

          {/* ---- Single Dancer ---- */}
          {form.layout === 'single' && (
            <section className="space-y-5">
              <h2 className="font-serif text-lg text-emerald-900 border-b border-stone-100 pb-2">
                Dancer Details
              </h2>
              <Field label="First name of dancer">
                <input
                  type="text"
                  value={form.singleName}
                  onChange={(e) => setForm((prev) => ({ ...prev, singleName: e.target.value }))}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
                  placeholder="Emma"
                />
              </Field>
              <div className="grid sm:grid-cols-2 gap-4">
                <ShoeSelect
                  value={form.single.shoe}
                  onChange={(shoe) => setForm((prev) => ({ ...prev, single: { ...prev.single, shoe } }))}
                />
                <TanSelect
                  value={form.single.tan}
                  onChange={(tan) => setForm((prev) => ({ ...prev, single: { ...prev.single, tan } }))}
                />
              </div>
              <ImageUpload
                files={form.single.images}
                onChange={(images) => {
                  setForm((prev) => ({ ...prev, single: { ...prev.single, images } }))
                  if (warnNoImages && images.length > 0) setWarnNoImages(false)
                }}
                label="Costume photos"
                helperText={COSTUME_HELPER}
              />
            </section>
          )}

          {/* ---- Multiple Dancers ---- */}
          {form.layout === 'multiple' && (
            <section className="space-y-5">
              <h2 className="font-serif text-lg text-emerald-900 border-b border-stone-100 pb-2">
                Dancer Details
              </h2>
              <Field
                label="First names of dancers, left to right (comma-separated)"
                required
                error={errors.multiNames}
              >
                <input
                  type="text"
                  value={form.multiNamesRaw}
                  onChange={(e) => setMultiNames(e.target.value)}
                  className={`w-full rounded-lg border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 transition ${
                    errors.multiNames ? 'border-red-400' : 'border-stone-300'
                  }`}
                  placeholder="Emma, Sophie, Lily"
                />
                <p className="mt-1 text-xs text-stone-400">
                  A section will appear below for each name.
                </p>
              </Field>
              <div className="space-y-4">
                {multiNames.map((name, i) => (
                  <DancerCard
                    key={i}
                    title={name}
                    section={form.multi[i] ?? emptyDancer()}
                    onChange={(update) => updateMulti(i, update)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* ---- Through the Years ---- */}
          {form.layout === 'through-years' && (
            <section className="space-y-5">
              <h2 className="font-serif text-lg text-emerald-900 border-b border-stone-100 pb-2">
                Dancer Details
              </h2>
              <Field label="First name of dancer" required error={errors.ttyName}>
                <input
                  type="text"
                  value={form.ttyName}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, ttyName: e.target.value }))
                    if (errors.ttyName) setErrors((prev) => ({ ...prev, ttyName: undefined }))
                  }}
                  className={`w-full rounded-lg border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 transition ${
                    errors.ttyName ? 'border-red-400' : 'border-stone-300'
                  }`}
                  placeholder="Emma"
                />
              </Field>
              <Field
                label="Approximate ages, left to right (comma-separated)"
                required
                error={errors.ttyAges}
              >
                <input
                  type="text"
                  value={form.ttyAgesRaw}
                  onChange={(e) => setTtyAges(e.target.value)}
                  className={`w-full rounded-lg border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 transition ${
                    errors.ttyAges ? 'border-red-400' : 'border-stone-300'
                  }`}
                  placeholder="8, 12, 16, 20"
                />
                <p className="mt-1 text-xs text-stone-400">
                  A section will appear below for each age.
                </p>
              </Field>
              <div className="space-y-4">
                {ttyAges.map((age, i) => (
                  <DancerCard
                    key={i}
                    title={`Age ${age}`}
                    section={form.ttyAges[i] ?? emptyDancer()}
                    onChange={(update) => updateTty(i, update)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* ---- Comments (shown when layout selected) ---- */}
          {form.layout && (
            <Field label="Any comments or clarifications?">
              <textarea
                value={form.comments}
                onChange={(e) => setForm((prev) => ({ ...prev, comments: e.target.value }))}
                rows={3}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 transition resize-y"
                placeholder="Pose preference, background ideas, anything else I should know…"
              />
            </Field>
          )}

          {/* ---- Extras (shown when layout selected) ---- */}
          {form.layout && (
            <section className="space-y-5">
              <div className="flex items-baseline gap-3 border-b border-stone-100 pb-2">
                <h2 className="font-serif text-lg text-emerald-900">Extras</h2>
                <p className="text-xs text-stone-400">I will contact you about specifics</p>
              </div>

              {/* Background color */}
              <div>
                <p className="text-sm font-medium text-stone-700 mb-2">Background color</p>
                <ColorPicker
                  value={form.extras.backgroundColor}
                  onChange={(hex) => setExtras({ backgroundColor: hex })}
                  swatches={BACKGROUND_SWATCHES}
                />
                <p className="mt-2 text-xs text-stone-400">
                  Selected: <span className="font-mono">{form.extras.backgroundColor}</span>
                </p>
              </div>

              {/* Add logo */}
              <YesNoField
                label="Add school or major logo?"
                value={form.extras.addLogo}
                onChange={(v) => setExtras({ addLogo: v })}
              />
              {form.extras.addLogo === 'yes' && (
                <div className="pl-4 border-l-2 border-amber-200">
                  <ImageUpload
                    files={form.extras.logoImages}
                    onChange={(logoImages) => setExtras({ logoImages })}
                    label="Logo image"
                    helperText="Upload the logo file or a clear photo of it."
                  />
                </div>
              )}

              {/* Add text */}
              <YesNoField
                label="Add text?"
                value={form.extras.addText}
                onChange={(v) => setExtras({ addText: v })}
              />
              {form.extras.addText === 'yes' && (
                <div className="pl-4 border-l-2 border-amber-200">
                  <Field label="Text to include">
                    <input
                      type="text"
                      value={form.extras.textContent}
                      onChange={(e) => setExtras({ textContent: e.target.value })}
                      className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
                      placeholder="Name, school, year…"
                    />
                  </Field>
                </div>
              )}

              {/* Add sash */}
              <YesNoField
                label="Add sash?"
                value={form.extras.addSash}
                onChange={(v) => setExtras({ addSash: v })}
              />

              {/* Prizes */}
              <div>
                <p className="text-sm font-medium text-stone-700 mb-2">
                  Add trophy / plaque / prize / globe?
                </p>
                <div className="flex flex-wrap gap-2">
                  {PRIZE_OPTIONS.map((prize) => (
                    <button
                      key={prize}
                      type="button"
                      onClick={() => togglePrize(prize)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${
                        form.extras.prizes.includes(prize)
                          ? 'bg-emerald-900 text-white border-emerald-900'
                          : 'bg-white text-stone-600 border-stone-300 hover:border-amber-400'
                      }`}
                    >
                      {prize}
                    </button>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ---- Contact ---- */}
          <section className="space-y-4">
            <h2 className="font-serif text-lg text-emerald-900 border-b border-stone-100 pb-2">
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

          {/* ---- Sharing ---- */}
          <section className="space-y-4">
            <h2 className="font-serif text-lg text-emerald-900 border-b border-stone-100 pb-2">
              Sharing Preferences
            </h2>
            <SharingPreferencesBlock
              value={form.sharing}
              onChange={(sharing) => setForm((prev) => ({ ...prev, sharing }))}
            />
          </section>

          {submitStatus === 'error' && (
            <p className="text-sm text-red-600">Something went wrong — please try again.</p>
          )}

          {warnNoImages ? (
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 space-y-3">
              <p className="font-medium text-amber-900 text-sm">No costume photos uploaded</p>
              <p className="text-amber-800 text-sm">
                Costume photos are highly recommended — they help ensure the illustration captures
                every detail accurately. Are you sure you want to submit without any?
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setWarnNoImages(false)}
                  className="px-4 py-1.5 rounded-lg border border-amber-400 text-amber-900 text-sm font-medium hover:bg-amber-100 transition"
                >
                  ← Go back and add photos
                </button>
                <button
                  type="button"
                  onClick={doSubmit}
                  className="px-4 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium transition"
                >
                  Submit without photos
                </button>
              </div>
            </div>
          ) : (
            <button
              type="submit"
              disabled={submitStatus === 'loading'}
              className="w-full sm:w-auto bg-amber-700 hover:bg-amber-800 disabled:opacity-60 text-white font-medium text-sm px-8 py-2.5 rounded-lg transition-colors"
            >
              {submitStatus === 'loading' ? 'Submitting…' : 'Submit Order'}
            </button>
          )}
        </form>
      </div>
    </div>
  )
}

// ---- Shared sub-components ----

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
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border capitalize transition ${
              value === v
                ? 'bg-emerald-900 text-white border-emerald-900'
                : 'bg-white text-stone-600 border-stone-300 hover:border-amber-400'
            }`}
          >
            {v === 'yes' ? 'Yes' : 'No'}
          </button>
        ))}
      </div>
    </div>
  )
}

function Breadcrumb() {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-stone-400" aria-label="Breadcrumb">
      <Link href="/order" className="hover:text-amber-600 transition-colors">Order</Link>
      <span>/</span>
      <Link href="/order/digital-image" className="hover:text-amber-600 transition-colors">
        Digital Image
      </Link>
      <span>/</span>
      <Link href="/order/costume" className="hover:text-amber-600 transition-colors">
        Costume
      </Link>
      <span>/</span>
      <span className="text-stone-600">Drawing</span>
    </nav>
  )
}
