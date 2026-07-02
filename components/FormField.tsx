import { ReactNode } from 'react'

interface FieldProps {
  label: string
  required?: boolean
  error?: string
  children: ReactNode
}

export function Field({ label, required, error, children }: FieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-stone-700 mb-1">
        {label}
        {required && <span className="text-gold-600 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
