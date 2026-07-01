'use client'

import type { ReactNode, Ref } from 'react'

// ---------------------------------------------------------------------------
// FormStep
//
// One "question" in a progressive (one-at-a-time) form. The parent decides each
// step's state:
//   • active  — fully visible and interactive
//   • preview — the next, not-yet-reached question, shown blurred/greyed as a
//               teaser. `inert` removes it from tab order and blocks clicks.
//   • hidden  — not rendered yet
//
// This is a prototype wrapper, currently used by app/order/logo/page.tsx.
// ---------------------------------------------------------------------------

export type StepState = 'active' | 'preview' | 'hidden'

interface Props {
  state: StepState
  innerRef?: Ref<HTMLDivElement>
  children: ReactNode
}

export function FormStep({ state, innerRef, children }: Props) {
  if (state === 'hidden') return null
  const locked = state === 'preview'

  return (
    <div
      ref={innerRef}
      inert={locked}
      aria-hidden={locked}
      className={`scroll-mt-24 transition-all duration-500 ${
        locked ? 'opacity-40 blur-[3px] select-none' : 'opacity-100'
      }`}
    >
      {children}
    </div>
  )
}
