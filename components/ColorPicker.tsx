'use client'

import { useState } from 'react'
import { HexColorInput, HexColorPicker } from 'react-colorful'

// ---------------------------------------------------------------------------
// ColorPicker
//
// An in-page color picker — preset swatches plus an inline saturation/hue
// picker (react-colorful) and a hex field. Deliberately avoids the native
// <input type="color"> popup, which renders an OS-level dialog that feels
// disconnected from the form.
//
// `value` / `onChange` use a hex string (e.g. "#1a3c2b").
// ---------------------------------------------------------------------------

export interface Swatch {
  hex: string
  label: string
}

interface Props {
  value: string
  onChange: (hex: string) => void
  swatches?: Swatch[]
}

const RAINBOW =
  'conic-gradient(from 0deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)'

export function ColorPicker({ value, onChange, swatches = [] }: Props) {
  const isSwatch = swatches.some((s) => s.hex.toLowerCase() === value.toLowerCase())
  // Open the inline picker by default when the current value isn't a preset.
  const [showCustom, setShowCustom] = useState(!isSwatch)

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {swatches.map((s) => {
          const active = s.hex.toLowerCase() === value.toLowerCase()
          return (
            <button
              key={s.hex}
              type="button"
              title={s.label}
              aria-label={s.label}
              aria-pressed={active}
              onClick={() => {
                onChange(s.hex)
                setShowCustom(false)
              }}
              className={`w-8 h-8 rounded-full border-2 transition ${
                active
                  ? 'border-emerald-900 ring-2 ring-emerald-900/30'
                  : 'border-stone-200 hover:border-stone-400'
              }`}
              style={{ backgroundColor: s.hex }}
            />
          )
        })}

        {/* Custom-color toggle — opens the inline picker, not a browser popup */}
        <button
          type="button"
          onClick={() => setShowCustom((v) => !v)}
          aria-pressed={showCustom}
          aria-expanded={showCustom}
          title="Custom color"
          className={`inline-flex items-center gap-1.5 h-8 pl-1.5 pr-3 rounded-full border-2 text-xs font-medium transition ${
            showCustom || !isSwatch
              ? 'border-emerald-900 ring-2 ring-emerald-900/30 text-emerald-900'
              : 'border-stone-200 text-stone-600 hover:border-stone-400'
          }`}
        >
          <span
            className="w-5 h-5 rounded-full border border-stone-300 shrink-0"
            style={isSwatch ? { backgroundImage: RAINBOW } : { backgroundColor: value }}
            aria-hidden="true"
          />
          Custom
        </button>
      </div>

      {showCustom && (
        <div className="mt-3 inline-flex flex-col gap-3 rounded-xl border border-stone-200 bg-white p-3 shadow-sm">
          <HexColorPicker color={value} onChange={onChange} />
          <div className="flex items-center gap-2">
            <span
              className="w-7 h-7 rounded-md border border-stone-200 shrink-0"
              style={{ backgroundColor: value }}
              aria-hidden="true"
            />
            <HexColorInput
              color={value}
              onChange={onChange}
              prefixed
              aria-label="Hex color value"
              className="w-28 rounded-lg border border-stone-300 px-2 py-1.5 text-sm uppercase bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
            />
          </div>
        </div>
      )}
    </div>
  )
}
