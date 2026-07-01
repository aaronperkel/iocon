import { NextRequest, NextResponse } from 'next/server'
import { updateOrderStatus, type OrderStatus } from '@/lib/orders'

// TODO: Protect this endpoint with authentication before production.

const VALID_STATUSES: OrderStatus[] = ['pending', 'in-progress', 'completed']

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const { status } = body as { status?: string }

  if (!status || !VALID_STATUSES.includes(status as OrderStatus)) {
    return NextResponse.json(
      { error: `status must be one of: ${VALID_STATUSES.join(', ')}.` },
      { status: 400 }
    )
  }

  const updated = updateOrderStatus(id, status as OrderStatus)
  if (!updated) {
    return NextResponse.json({ error: 'Order not found.' }, { status: 404 })
  }

  return NextResponse.json(updated)
}
