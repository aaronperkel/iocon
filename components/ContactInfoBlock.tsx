'use client'

import { Field } from './FormField'
import type { ContactMethod } from '@/lib/orders'

export interface ContactInfoFields {
  firstName: string
  lastName: string
  contactMethod: ContactMethod
  contactValue: string
}

export const EMPTY_CONTACT: ContactInfoFields = {
  firstName: '',
  lastName: '',
  contactMethod: 'email',
  contactValue: '',
}

export type ContactErrors = Partial<Record<keyof ContactInfoFields, string>>

const CONTACT_OPTIONS: {
  value: ContactMethod
  label: string
  placeholder: string
  inputType: string
}[] = [
  { value: 'text', label: 'Text', placeholder: 'Your phone number', inputType: 'tel' },
  { value: 'email', label: 'Email', placeholder: 'your@email.com', inputType: 'email' },
  { value: 'whatsapp', label: 'WhatsApp', placeholder: 'Your WhatsApp number', inputType: 'tel' },
  { value: 'instagram', label: 'Instagram DM', placeholder: '@yourhandle', inputType: 'text' },
]

interface Props {
  value: ContactInfoFields
  onChange: (value: ContactInfoFields) => void
  errors: ContactErrors
  onClearError: (key: keyof ContactInfoFields) => void
}

export function ContactInfoBlock({ value, onChange, errors, onClearError }: Props) {
  const selected =
    CONTACT_OPTIONS.find((o) => o.value === value.contactMethod) ?? CONTACT_OPTIONS[1]

  const inputCls = (key: keyof ContactInfoFields) =>
    `w-full rounded-lg border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gold-400 transition ${
      errors[key] ? 'border-red-400' : 'border-stone-300'
    }`

  function set<K extends keyof ContactInfoFields>(key: K, val: ContactInfoFields[K]) {
    onChange({ ...value, [key]: val })
    if (errors[key]) onClearError(key)
  }

  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="First Name" required error={errors.firstName}>
          <input
            type="text"
            value={value.firstName}
            onChange={(e) => set('firstName', e.target.value)}
            className={inputCls('firstName')}
            placeholder="Jane"
            autoComplete="given-name"
          />
        </Field>
        <Field label="Last Name" required error={errors.lastName}>
          <input
            type="text"
            value={value.lastName}
            onChange={(e) => set('lastName', e.target.value)}
            className={inputCls('lastName')}
            placeholder="Doe"
            autoComplete="family-name"
          />
        </Field>
      </div>

      <div>
        <p className="block text-sm font-medium text-stone-700 mb-2">
          Preferred Contact Method <span className="text-gold-600">*</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {CONTACT_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => set('contactMethod', o.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${
                value.contactMethod === o.value
                  ? 'bg-gold-900 text-white border-gold-900'
                  : 'bg-white text-stone-600 border-stone-300 hover:border-gold-400'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
        {errors.contactMethod && (
          <p className="mt-1 text-xs text-red-600">{errors.contactMethod}</p>
        )}
      </div>

      <Field label={`Your ${selected.label}`} required error={errors.contactValue}>
        <input
          type={selected.inputType}
          value={value.contactValue}
          onChange={(e) => set('contactValue', e.target.value)}
          className={inputCls('contactValue')}
          placeholder={selected.placeholder}
          autoComplete={value.contactMethod === 'email' ? 'email' : 'off'}
        />
        <p className="mt-1 text-xs text-stone-400">
          This is how I&apos;ll send order confirmation, ask clarifying questions, and deliver the
          final drawing.
        </p>
      </Field>
    </div>
  )
}
