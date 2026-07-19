// ---------------------------------------------------------------------------
// Shared order data layer, backed by TiDB (see lib/db.ts).
//
// When DATABASE_URL is absent every helper falls back to an in-memory array
// (cached on globalThis so all of `next dev`'s route bundles share it), so a
// fresh clone works without credentials — same pattern as lib/email.ts.
// State in that mode resets on restart.
// ---------------------------------------------------------------------------

import type { RowDataPacket, ResultSetHeader } from 'mysql2/promise'
import { getPool, isDbConfigured } from './db'
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

// --- In-memory fallback (no DATABASE_URL) ----------------------------------

const memory = ((globalThis as unknown as { __ioconOrders?: { orders: Order[] } })
  .__ioconOrders ??= { orders: [] })

// --- DB row mapping --------------------------------------------------------

interface OrderRow extends RowDataPacket {
  id: string
  initials: string
  name: string
  contact_method: ContactMethod
  contact_value: string
  order_type: OrderType
  product: ProductFormat | null
  status: OrderStatus
  details: string | null
  sharing_platforms: SharingPlatform[] | string | null
  tag_username: string | null
  created_at: Date
}

function rowToOrder(row: OrderRow): Order {
  const platforms =
    typeof row.sharing_platforms === 'string'
      ? (JSON.parse(row.sharing_platforms) as SharingPlatform[])
      : row.sharing_platforms
  return {
    id: row.id,
    initials: row.initials,
    name: row.name,
    contactMethod: row.contact_method,
    contactValue: row.contact_value,
    orderType: row.order_type,
    product: row.product ?? undefined,
    status: row.status,
    details: row.details ?? undefined,
    sharingPlatforms: platforms ?? undefined,
    tagUsername: row.tag_username ?? undefined,
    createdAt: row.created_at.toISOString(),
  }
}

const SELECT_ORDERS =
  'SELECT id, initials, name, contact_method, contact_value, order_type, product, status, details, sharing_platforms, tag_username, created_at FROM orders'

// --- Helpers ---------------------------------------------------------------

export async function getOrders(): Promise<Order[]> {
  if (!isDbConfigured()) return [...memory.orders]
  const [rows] = await getPool().query<OrderRow[]>(
    `${SELECT_ORDERS} ORDER BY created_at ASC, id ASC`
  )
  return rows.map(rowToOrder)
}

export async function getOrder(id: string): Promise<Order | null> {
  if (!isDbConfigured()) return memory.orders.find((o) => o.id === id) ?? null
  const [rows] = await getPool().query<OrderRow[]>(
    `${SELECT_ORDERS} WHERE id = ?`,
    [id]
  )
  return rows.length ? rowToOrder(rows[0]) : null
}

export async function addOrder(
  data: Omit<Order, 'id' | 'status' | 'createdAt'>
): Promise<Order> {
  const newOrder: Order = {
    ...data,
    id: `order-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }
  if (!isDbConfigured()) {
    memory.orders = [...memory.orders, newOrder]
    return newOrder
  }
  await getPool().execute(
    `INSERT INTO orders
       (id, initials, name, contact_method, contact_value, order_type, product, status, details, sharing_platforms, tag_username, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      newOrder.id,
      newOrder.initials,
      newOrder.name,
      newOrder.contactMethod,
      newOrder.contactValue,
      newOrder.orderType,
      newOrder.product ?? null,
      newOrder.status,
      newOrder.details ?? null,
      newOrder.sharingPlatforms ? JSON.stringify(newOrder.sharingPlatforms) : null,
      newOrder.tagUsername ?? null,
      new Date(newOrder.createdAt),
    ]
  )
  return newOrder
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<Order | null> {
  if (!isDbConfigured()) {
    let updated: Order | null = null
    memory.orders = memory.orders.map((o) => {
      if (o.id === id) {
        updated = { ...o, status }
        return updated
      }
      return o
    })
    return updated
  }
  const [result] = await getPool().execute<ResultSetHeader>(
    'UPDATE orders SET status = ? WHERE id = ?',
    [status, id]
  )
  if (result.affectedRows === 0) return null
  return getOrder(id)
}

export async function getOpenOrderCount(): Promise<number> {
  if (!isDbConfigured()) {
    return memory.orders.filter((o) => o.status !== 'completed').length
  }
  const [rows] = await getPool().query<RowDataPacket[]>(
    "SELECT COUNT(*) AS c FROM orders WHERE status <> 'completed'"
  )
  return Number(rows[0].c)
}

// 1-based place in line among open orders, oldest first — what the email
// alerts report as "number N in line". Null once completed (or unknown id).
export async function getQueuePosition(id: string): Promise<number | null> {
  let openIds: string[]
  if (!isDbConfigured()) {
    openIds = memory.orders
      .filter((o) => o.status !== 'completed')
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map((o) => o.id)
  } else {
    const [rows] = await getPool().query<RowDataPacket[]>(
      "SELECT id FROM orders WHERE status <> 'completed' ORDER BY created_at ASC, id ASC"
    )
    openIds = rows.map((r) => r.id as string)
  }
  const index = openIds.indexOf(id)
  return index === -1 ? null : index + 1
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
