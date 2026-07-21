import { getOpenOrderCount, getOrders, ORDER_STATUS_LABELS, ORDER_TYPE_LABELS } from '@/lib/orders'

// Force dynamic so this page always reflects the live order queue instead of
// a build-time snapshot.
export const dynamic = 'force-dynamic'

export const metadata = { title: 'Waitlist — Íocón Graphics' }

// Waiting = neutral, being drawn = gold (active), finished = olive — brand
// scales only, so the badges also retheme in dark mode (same map as /admin).
const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-stone-100 text-stone-600',
  'in-progress': 'bg-gold-100 text-gold-800',
  completed: 'bg-olive-100 text-olive-800',
}

// Completed orders linger briefly (nice to see the queue moving), then drop
// off. Legacy completed rows without a completed_at timestamp are hidden too.
const COMPLETED_VISIBLE_MS = 14 * 24 * 60 * 60 * 1000

export default async function WaitlistPage() {
  const cutoff = Date.now() - COMPLETED_VISIBLE_MS
  const orders = (await getOrders()).filter(
    (o) =>
      o.status !== 'completed' ||
      (o.completedAt !== undefined && new Date(o.completedAt).getTime() > cutoff)
  )
  const openCount = await getOpenOrderCount()

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-heading text-4xl font-bold text-olive-800 mb-2">Waitlist</h1>
      <p className="text-stone-500 text-sm mb-2">
        The live order queue, oldest first. Finished pieces stay listed for two weeks.
      </p>
      <p className="text-stone-700 text-sm font-medium mb-10">
        Current wait:{' '}
        <span className="font-heading text-2xl text-olive-800">{openCount}</span>{' '}
        open order{openCount !== 1 ? 's' : ''}
      </p>

      {orders.length === 0 ? (
        <p className="text-stone-400 italic text-sm">No orders yet.</p>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">
                  Initials
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">
                  Order Type
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-stone-700">{order.initials}</td>
                  <td className="px-6 py-4 text-stone-600">
                    {ORDER_TYPE_LABELS[order.orderType]}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        STATUS_COLORS[order.status] ?? 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
