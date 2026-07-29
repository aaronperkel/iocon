import { NextRequest, NextResponse } from 'next/server'
import {
  addOrder,
  getOrders,
  getQueuePosition,
  type ContactMethod,
  type OrderType,
} from '@/lib/orders'
import { AVAILABLE_PRODUCTS, type ProductFormat } from '@/lib/products'
import { sendNewOrderNotification, sendOrderPlacedEmail } from '@/lib/email'
import { rateLimit } from '@/lib/auth'

// walking-duo is deliberately absent — retired July 2026, no new orders.
const VALID_TYPES: OrderType[] = [
  'solo-icon',
  'solo-icon-new',
  'group-icons',
  'through-the-years',
]
const VALID_METHODS: ContactMethod[] = ['text', 'email', 'whatsapp', 'instagram']

// Column caps from scripts/init-db.mjs — reject over-length input with a 400
// instead of letting the INSERT fail with a 500.
const MAX_NAME = 191
const MAX_CONTACT_VALUE = 191
// details is MEDIUMTEXT; the cap is just a sanity bound (biggest legit orders
// — many dancers, comments, image URLs — stay well under it).
const MAX_DETAILS = 100_000

export async function GET() {
  return NextResponse.json(await getOrders())
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (!rateLimit(`order:${ip}`, 10, 60 * 60 * 1000)) {
    return NextResponse.json(
      { error: 'Too many orders — please try again later.' },
      { status: 429 }
    )
  }

  const body = await req.json().catch(() => null)
  if (body === null || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }
  const {
    firstName,
    lastName,
    contactMethod,
    contactValue,
    orderType,
    product,
    details,
  } = body as {
    firstName?: unknown
    lastName?: unknown
    contactMethod?: unknown
    contactValue?: unknown
    orderType?: unknown
    product?: unknown
    details?: unknown
  }

  if (
    typeof firstName !== 'string' ||
    typeof lastName !== 'string' ||
    typeof contactMethod !== 'string' ||
    typeof contactValue !== 'string' ||
    typeof orderType !== 'string' ||
    !firstName.trim() ||
    !lastName.trim() ||
    !contactValue.trim()
  ) {
    return NextResponse.json(
      { error: 'firstName, lastName, contactMethod, contactValue, and orderType are required.' },
      { status: 400 }
    )
  }

  if (!VALID_TYPES.includes(orderType as OrderType)) {
    return NextResponse.json(
      { error: `orderType must be one of: ${VALID_TYPES.join(', ')}.` },
      { status: 400 }
    )
  }

  if (!VALID_METHODS.includes(contactMethod as ContactMethod)) {
    return NextResponse.json(
      { error: `contactMethod must be one of: ${VALID_METHODS.join(', ')}.` },
      { status: 400 }
    )
  }

  if (product !== undefined && product !== null) {
    if (typeof product !== 'string' || !AVAILABLE_PRODUCTS.includes(product as ProductFormat)) {
      return NextResponse.json(
        { error: `product must be one of: ${AVAILABLE_PRODUCTS.join(', ')}.` },
        { status: 400 }
      )
    }
  }

  if (details !== undefined && (typeof details !== 'string' || details.length > MAX_DETAILS)) {
    return NextResponse.json({ error: 'details is too long.' }, { status: 400 })
  }

  if (
    contactMethod === 'email' &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactValue.trim())
  ) {
    return NextResponse.json(
      { error: 'Please enter a valid email address.' },
      { status: 400 }
    )
  }

  if (contactValue.trim().length > MAX_CONTACT_VALUE) {
    return NextResponse.json({ error: 'Contact info is too long.' }, { status: 400 })
  }

  const name = `${firstName.trim()} ${lastName.trim()}`
  if (name.length > MAX_NAME) {
    return NextResponse.json({ error: 'Name is too long.' }, { status: 400 })
  }
  const initials =
    name
      .trim()
      .split(/\s+/)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .filter(Boolean)
      .join('.') + '.'

  const order = await addOrder({
    name,
    initials,
    contactMethod: contactMethod as ContactMethod,
    contactValue: contactValue.trim(),
    orderType: orderType as OrderType,
    product: product ? (product as ProductFormat) : undefined,
    details: details as string | undefined,
  })

  // Email failures must never lose the order — log and return 201 regardless.
  const queuePosition = (await getQueuePosition(order.id)) ?? 1
  const results = await Promise.allSettled([
    sendOrderPlacedEmail(order, queuePosition),
    sendNewOrderNotification(order, queuePosition),
  ])
  for (const result of results) {
    if (result.status === 'rejected') {
      console.error('[Orders] email failed:', result.reason)
    }
  }

  return NextResponse.json(order, { status: 201 })
}
