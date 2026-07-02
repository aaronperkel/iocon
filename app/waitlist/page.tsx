import { getOpenOrderCount, getOrders, ORDER_STATUS_LABELS, ORDER_TYPE_LABELS } from '@/lib/orders'

// Force dynamic so this page always reflects the latest in-memory state.
// When you swap to a DB, you can remove this and rely on normal Next.js caching.
export const dynamic = 'force-dynamic'

export const metadata = { title: 'Waitlist — Íocón' }

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-gold-100 text-gold-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  completed: 'bg-olive-100 text-olive-800',
}

export default function WaitlistPage() {
  const orders = getOrders()
  const openCount = getOpenOrderCount()

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-serif text-4xl font-semibold text-gold-900 mb-2">Waitlist</h1>
      <p className="text-stone-500 text-sm mb-2">
        Info will come from completed order forms.
      </p>
      <p className="text-stone-700 text-sm font-medium mb-10">
        Current wait:{' '}
        <span className="font-serif text-2xl text-gold-900">{openCount}</span>{' '}
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

      {/* TODO: When real persistence is added, expose a protected admin route to
          update order statuses (pending → in-progress → completed). */}
    </div>
  )
}
