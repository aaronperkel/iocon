import { NextRequest, NextResponse } from 'next/server'
import {
  getOrder,
  getOrders,
  getQueuePosition,
  updateOrderStatus,
  type OrderStatus,
} from '@/lib/orders'
import { sendOrderStatusEmail, sendQueueUpdateEmail } from '@/lib/email'

const VALID_STATUSES: OrderStatus[] = ['pending', 'in-progress', 'completed']

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json().catch(() => null)
  const { status } = (body ?? {}) as { status?: string }

  if (!status || !VALID_STATUSES.includes(status as OrderStatus)) {
    return NextResponse.json(
      { error: `status must be one of: ${VALID_STATUSES.join(', ')}.` },
      { status: 400 }
    )
  }

  const previous = await getOrder(id)
  const updated = await updateOrderStatus(id, status as OrderStatus)
  if (!updated) {
    return NextResponse.json({ error: 'Order not found.' }, { status: 404 })
  }

  // Alert the customer on real transitions only (not admin re-saves), and
  // never fail the status update over an email problem.
  if (previous && previous.status !== updated.status) {
    const emailJobs: Promise<void>[] = []

    if (updated.status === 'in-progress' || updated.status === 'completed') {
      emailJobs.push(sendOrderStatusEmail(updated, updated.status))
    }

    // Completing an order moves everyone behind it up one place.
    if (updated.status === 'completed') {
      const movedUp = (await getOrders()).filter(
        (o) => o.status !== 'completed' && o.createdAt > updated.createdAt
      )
      for (const order of movedUp) {
        const position = await getQueuePosition(order.id)
        if (position !== null) {
          emailJobs.push(sendQueueUpdateEmail(order, position))
        }
      }
    }

    const results = await Promise.allSettled(emailJobs)
    for (const result of results) {
      if (result.status === 'rejected') {
        console.error('[Orders] status email failed:', result.reason)
      }
    }
  }

  return NextResponse.json(updated)
}
