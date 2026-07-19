// ---------------------------------------------------------------------------
// Order types + display labels, split from lib/orders.ts so client components
// (the admin page) can import them without dragging the mysql2 data layer
// into the browser bundle — webpack can't compile mysql2's node: imports.
// Server code keeps importing from lib/orders.ts, which re-exports all of
// this.
// ---------------------------------------------------------------------------

import type { ProductFormat } from './products'

// Shop subjects that go through an order form. Logo / custom graphic / bulk
// requests skip the order flow entirely and arrive via the contact form.
export type OrderType =
  | 'solo-icon' // Flow B, one dancer (existing costume)
  | 'solo-icon-new' // Flow A, new costume designed from scratch
  | 'group-icons'
  | 'through-the-years'
  | 'walking-duo'
export type OrderStatus = 'pending' | 'in-progress' | 'completed'
export type ContactMethod = 'text' | 'email' | 'whatsapp' | 'instagram'
export type SharingPlatform = 'instagram' | 'tiktok' | 'website' | 'none'

export interface Order {
  id: string
  initials: string
  name: string
  contactMethod: ContactMethod
  contactValue: string
  orderType: OrderType
  product?: ProductFormat
  status: OrderStatus
  details?: string
  sharingPlatforms?: SharingPlatform[]
  tagUsername?: string
  createdAt: string // ISO 8601
}

export const ORDER_TYPE_LABELS: Record<OrderType, string> = {
  'solo-icon': 'Solo Icon',
  'solo-icon-new': 'Solo Icon (New Design)',
  'group-icons': 'Group Icons',
  'through-the-years': 'Through the Years',
  'walking-duo': 'Walking Duo',
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  'in-progress': 'In Progress',
  completed: 'Completed',
}

export const CONTACT_METHOD_LABELS: Record<ContactMethod, string> = {
  text: 'Text',
  email: 'Email',
  whatsapp: 'WhatsApp',
  instagram: 'Instagram DM',
}
