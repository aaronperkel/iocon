import type { OrderType } from './order-types'

// ---------------------------------------------------------------------------
// Riley's launch pricing (July 2026). Client-safe — the order forms compute a
// live estimate from these, and the shop tiles' "Starting from $N" lines must
// agree with them. These are estimates only: the real charge is whatever
// Riley puts on the Stripe invoice she sends after reviewing the order, so
// the forms always caveat with "taxes and fees may apply".
// ---------------------------------------------------------------------------

// Base price per order type. Group Icons / Through the Years bases cover the
// first figure; each further figure adds ADDED_FIGURE_PRICE.
export const ORDER_BASE_PRICES: Record<OrderType, number> = {
  'solo-icon': 25, // existing costume
  'solo-icon-new': 35, // new costume designed from scratch (+$10 on solo)
  'group-icons': 30,
  'through-the-years': 30,
  'walking-duo': 30, // retired — unreachable, present only to satisfy the Record
}

// Order types whose price grows with the number of figure sections.
export const MULTI_FIGURE_TYPES: OrderType[] = ['group-icons', 'through-the-years']

export const ADDED_FIGURE_PRICE = 5 // each figure beyond the first
export const DANCER_EXTRA_PRICE = 5 // per selected extra (Sash/Belt, Prize held in hand)
export const ADD_TEXT_PRICE = 5
export const ADD_LOGO_PRICE = 5
export const DIGITAL_DOWNLOAD_SURCHARGE = 0 // shown as "+$0" per Riley

export function formatUsd(amount: number): string {
  return `$${amount}`
}

export function estimateOrderCost(opts: {
  orderType: OrderType
  /** Dancer/age sections in the order (Flow B); defaults to 1. */
  sectionCount?: number
  /** Total selected dancer extras across all sections. */
  extrasCount?: number
  addText?: boolean
  addLogo?: boolean
}): number {
  const { orderType, sectionCount = 1, extrasCount = 0, addText, addLogo } = opts
  let total = ORDER_BASE_PRICES[orderType]
  if (MULTI_FIGURE_TYPES.includes(orderType)) {
    total += Math.max(0, sectionCount - 1) * ADDED_FIGURE_PRICE
  }
  total += extrasCount * DANCER_EXTRA_PRICE
  if (addText) total += ADD_TEXT_PRICE
  if (addLogo) total += ADD_LOGO_PRICE
  return total
}
