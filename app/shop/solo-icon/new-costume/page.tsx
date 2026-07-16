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
import { PRODUCT_FORMAT_LABELS, type ProductFormat } from '@/lib/products'

// Flow A in Riley's ordering scheme — design a brand-new costume from scratch.
// Solo Icon only; the other subjects always draw existing costumes.

interface FormState {
  images: UploadedFile[]
  description: string
  product: ProductFormat | null
  contact: ContactInfoFields
}

const EMPTY: FormState = {
  images: [],
  description: '',
  product: 'digital-download',
  contact: EMPTY_CONTACT,
}

interface Errors {
  description?: string
  product?: string
  contact?: ContactErrors
}

function validate(form: FormState): Errors {
  const errs: Errors = {}
  if (form.description.trim().length < 10) {
    errs.description = 'Please describe your vision (at least 10 characters).'
  }
  if (!form.product) errs.product = 'Please choose a product format.'
  const contactErrs: ContactErrors = {}
  if (!form.contact.firstName.trim()) contactErrs.firstName = 'First name is required.'
  if (!form.contact.lastName.trim()) contactErrs.lastName = 'Last name is required.'
  if (!form.contact.contactValue.trim()) contactErrs.contactValue = 'Contact info is required.'
  if (Object.keys(contactErrs).length) errs.contact = contactErrs
  return errs
}

export default function NewCostumeDesignPage() {
  const [form, setForm] = useState<FormState>(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
    'idle'
  )
  const [warnNoImages, setWarnNoImages] = useState(false)

  function clearContactError(key: keyof ContactInfoFields) {
    setErrors((prev) => ({ ...prev, contact: { ...prev.contact, [key]: undefined } }))
  }

  async function doSubmit() {
    setWarnNoImages(false)
    setSubmitStatus('loading')
    const details = [
      `Descriptions / preferences: ${form.description}`,
      form.images.length > 0 &&
        `Inspiration images: ${form.images.length} uploaded — TODO: wire to file storage`,
      form.product && `Product: ${PRODUCT_FORMAT_LABELS[form.product]}`,
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
          orderType: 'solo-icon-new',
          product: form.product,
          details,
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
    if (form.images.length === 0) {
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
          Your new costume design request has been added to the waitlist. I will be in touch soon!
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
        <Link href="/shop" className="hover:text-gold-600 transition-colors">
          Shop
        </Link>
        <span aria-hidden="true">/</span>
        <Link href="/shop/solo-icon" className="hover:text-gold-600 transition-colors">
          Solo Icon
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-stone-600">New Costume Design</span>
      </nav>

      <h1 className="font-heading text-4xl font-bold text-olive-800 mb-2 mt-4">
        New Costume Design
      </h1>

      <div className="bg-gold-50 border border-gold-200 rounded-xl p-4 mb-8 text-sm text-stone-600 leading-relaxed">
        <p className="font-medium text-stone-700 mb-1">About this service</p>
        <p>
          Starting from scratch? I&apos;ll design a completely original costume concept just for
          you — from silhouette and embroidery style to color palette and overall mood. Share any
          inspiration images below, then describe your dream look in as much detail as you like.
          We&apos;ll work together to refine the design until it&apos;s exactly right.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleSubmit} noValidate className="space-y-8">
          <ImageUpload
            files={form.images}
            onChange={(images) => {
              setForm((prev) => ({ ...prev, images }))
              if (warnNoImages && images.length > 0) setWarnNoImages(false)
            }}
            label="Inspiration Images"
            helperText="Uploading inspiration images is highly recommended — costumes, colors, embroidery styles, or anything that captures your vision."
          />

          <Field
            label="Descriptions, Comments & Preferences"
            required
            error={errors.description}
          >
            <textarea
              value={form.description}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, description: e.target.value }))
                if (errors.description) setErrors((prev) => ({ ...prev, description: undefined }))
              }}
              rows={6}
              className={`w-full rounded-lg border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gold-400 transition resize-y ${
                errors.description ? 'border-red-400' : 'border-stone-300'
              }`}
            />
          </Field>

          <section className="space-y-4">
            <h2 className="font-heading text-lg text-olive-800 border-b border-gold-200 pb-2">
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

          <section className="space-y-4">
            <h2 className="font-heading text-lg text-olive-800 border-b border-gold-200 pb-2">
              Contact Information
            </h2>
            <ContactInfoBlock
              value={form.contact}
              onChange={(contact) => setForm((prev) => ({ ...prev, contact }))}
              errors={errors.contact ?? {}}
              onClearError={clearContactError}
            />
          </section>

          {submitStatus === 'error' && (
            <p className="text-sm text-red-600">Something went wrong — please try again.</p>
          )}

          {warnNoImages ? (
            <div className="rounded-xl border border-gold-300 bg-gold-50 p-4 space-y-3">
              <p className="font-medium text-gold-900 text-sm">No images uploaded</p>
              <p className="text-gold-800 text-sm">
                Inspiration images are highly recommended — they help ensure the final design
                matches your vision. Are you sure you want to submit without any?
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
