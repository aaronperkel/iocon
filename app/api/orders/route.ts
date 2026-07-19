import { NextRequest, NextResponse } from 'next/server'
import {
  addOrder,
  getOrders,
  getQueuePosition,
  type ContactMethod,
  type OrderType,
  type SharingPlatform,
} from '@/lib/orders'
import { AVAILABLE_PRODUCTS, type ProductFormat } from '@/lib/products'
import { sendNewOrderNotification, sendOrderPlacedEmail } from '@/lib/email'

const VALID_TYPES: OrderType[] = [
  'solo-icon',
  'solo-icon-new',
  'group-icons',
  'through-the-years',
  'walking-duo',
]
const VALID_METHODS: ContactMethod[] = ['text', 'email', 'whatsapp', 'instagram']

export async function GET() {
  return NextResponse.json(await getOrders())
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const {
    firstName,
    lastName,
    contactMethod,
    contactValue,
    orderType,
    product,
    details,
    sharingPlatforms,
    tagUsername,
  } = body as {
    firstName?: string
    lastName?: string
    contactMethod?: string
    contactValue?: string
    orderType?: string
    product?: string
    details?: string
    sharingPlatforms?: SharingPlatform[]
    tagUsername?: string
  }

  if (!firstName || !lastName || !contactMethod || !contactValue || !orderType) {
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

  if (product && !AVAILABLE_PRODUCTS.includes(product as ProductFormat)) {
    return NextResponse.json(
      { error: `product must be one of: ${AVAILABLE_PRODUCTS.join(', ')}.` },
      { status: 400 }
    )
  }

  const name = `${firstName.trim()} ${lastName.trim()}`
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
    contactValue,
    orderType: orderType as OrderType,
    product: product ? (product as ProductFormat) : undefined,
    details,
    sharingPlatforms,
    tagUsername: tagUsername || undefined,
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
