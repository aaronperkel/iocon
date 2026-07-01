// ---------------------------------------------------------------------------
// Shared order data layer
//
// TODO: Replace this module-level in-memory array with a real database.
//   Options: Prisma + PostgreSQL, Supabase, PlanetScale, SQLite via Turso…
//   Reserve the env var DATABASE_URL for the connection string.
//   Swap getOrders() / addOrder() / updateOrderStatus() for DB queries and
//   delete the array below.
// ---------------------------------------------------------------------------

export type OrderType = 'logo' | 'drawing' | 'design'
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
  status: OrderStatus
  details?: string
  sharingPlatforms?: SharingPlatform[]
  tagUsername?: string
  createdAt: string // ISO 8601
}

// Seed rows so the waitlist page is never empty out of the box
const seedOrders: Order[] = [
  {
    id: 'seed-1',
    initials: 'S.M.',
    name: 'Sample McSample',
    contactMethod: 'email',
    contactValue: 'sample@example.com',
    orderType: 'logo',
    status: 'completed',
    details: 'School logo for Aoife Academy of Irish Dance.',
    sharingPlatforms: ['website'],
    createdAt: new Date('2024-05-01').toISOString(),
  },
  {
    id: 'seed-2',
    initials: 'C.R.',
    name: 'Casey Reilly',
    contactMethod: 'instagram',
    contactValue: '@caseyreilly',
    orderType: 'drawing',
    status: 'in-progress',
    details: 'Layout: Single Dancer\nDancer: Casey\nShoe: Hard\nTan: Medium\nComments: Blue velvet solo dress with gold Celtic trim.',
    sharingPlatforms: ['instagram', 'tiktok'],
    tagUsername: '@caseyreilly',
    createdAt: new Date('2024-06-10').toISOString(),
  },
  {
    id: 'seed-3',
    initials: 'K.L.',
    name: 'Kate Lennon',
    contactMethod: 'text',
    contactValue: '555-0199',
    orderType: 'design',
    status: 'pending',
    details: 'New championship dress design — forest green with silver embroidery.',
    sharingPlatforms: ['none'],
    createdAt: new Date('2024-06-20').toISOString(),
  },
]

// In-memory store — state resets on server restart.
// This is intentional for the stub; swap for DB queries when ready.
let orders: Order[] = [...seedOrders]

export function getOrders(): Order[] {
  return [...orders]
}

export function addOrder(
  data: Omit<Order, 'id' | 'status' | 'createdAt'>
): Order {
  const newOrder: Order = {
    ...data,
    id: `order-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }
  orders = [...orders, newOrder]
  return newOrder
}

export function updateOrderStatus(id: string, status: OrderStatus): Order | null {
  let updated: Order | null = null
  orders = orders.map((o) => {
    if (o.id === id) {
      updated = { ...o, status }
      return updated
    }
    return o
  })
  return updated
}

export function getOpenOrderCount(): number {
  return orders.filter((o) => o.status !== 'completed').length
}

export const ORDER_TYPE_LABELS: Record<OrderType, string> = {
  logo: 'Logo',
  drawing: 'Costume Drawing',
  design: 'Costume Design',
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
