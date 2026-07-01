'use client'

// TODO: Protect this page with authentication before production.
//   Options: NextAuth.js, Clerk, a middleware password check, or Vercel's
//   password protection feature. Anyone with the URL can currently access it.

import { useEffect, useState } from 'react'
import {
  ORDER_TYPE_LABELS,
  ORDER_STATUS_LABELS,
  CONTACT_METHOD_LABELS,
  type Order,
  type OrderStatus,
} from '@/lib/orders'

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
]

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  completed: 'bg-emerald-100 text-emerald-800',
}

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/orders')
      .then((r) => r.json())
      .then((data: Order[]) => {
        setOrders(data.slice().reverse()) // newest first
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  async function updateStatus(id: string, status: OrderStatus) {
    setUpdatingId(id)
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error()
      const updated: Order = await res.json()
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)))
    } catch {
      alert('Failed to update status.')
    } finally {
      setUpdatingId(null)
    }
  }

  const filtered = orders.filter((o) => {
    if (filterType !== 'all' && o.orderType !== filterType) return false
    if (filterStatus !== 'all' && o.status !== filterStatus) return false
    return true
  })

  const openCount = orders.filter((o) => o.status !== 'completed').length

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <p className="text-stone-400 text-sm">Loading orders…</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-start justify-between mb-2">
        <h1 className="font-serif text-4xl font-semibold text-emerald-900">Admin</h1>
        <span className="mt-2 text-xs bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full font-medium">
          {openCount} open
        </span>
      </div>
      <p className="text-stone-400 text-xs mb-8">
        Full order details — not visible to clients. Update statuses below.
      </p>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-2">
          <label className="text-xs text-stone-500 font-medium">Type:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-xs rounded-lg border border-stone-300 px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <option value="all">All</option>
            <option value="logo">Logo</option>
            <option value="drawing">Drawing</option>
            <option value="design">Design</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-stone-500 font-medium">Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs rounded-lg border border-stone-300 px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-stone-400 italic text-sm">No orders match these filters.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              expanded={expanded === order.id}
              onToggle={() => setExpanded((prev) => (prev === order.id ? null : order.id))}
              onStatusChange={updateStatus}
              updating={updatingId === order.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function OrderCard({
  order,
  expanded,
  onToggle,
  onStatusChange,
  updating,
}: {
  order: Order
  expanded: boolean
  onToggle: () => void
  onStatusChange: (id: string, status: OrderStatus) => void
  updating: boolean
}) {
  const createdDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
      {/* Header row */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-stone-50 transition"
      >
        <span className="font-medium text-stone-700 w-10 shrink-0">{order.initials}</span>
        <span className="text-stone-800 font-medium flex-1 truncate">{order.name}</span>
        <span className="text-xs text-stone-400 shrink-0 hidden sm:block">
          {ORDER_TYPE_LABELS[order.orderType]}
        </span>
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0 ${
            STATUS_COLORS[order.status]
          }`}
        >
          {ORDER_STATUS_LABELS[order.status]}
        </span>
        <span className="text-stone-300 shrink-0 text-sm">{expanded ? '▲' : '▼'}</span>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-stone-100 px-5 py-5 space-y-4 text-sm">
          <div className="grid sm:grid-cols-2 gap-4">
            <DetailRow label="Order type" value={ORDER_TYPE_LABELS[order.orderType]} />
            <DetailRow label="Received" value={createdDate} />
            <DetailRow
              label="Contact"
              value={`${CONTACT_METHOD_LABELS[order.contactMethod]}: ${order.contactValue}`}
            />
            {order.sharingPlatforms && order.sharingPlatforms.length > 0 && (
              <DetailRow label="Sharing" value={order.sharingPlatforms.join(', ')} />
            )}
            {order.tagUsername && (
              <DetailRow label="Tag username" value={order.tagUsername} />
            )}
          </div>

          {order.details && (
            <div>
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-1">
                Order details
              </p>
              <pre className="whitespace-pre-wrap text-stone-600 text-sm bg-stone-50 rounded-lg p-3 border border-stone-100 font-sans leading-relaxed">
                {order.details}
              </pre>
            </div>
          )}

          {/* Status update */}
          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2">
              Update status
            </p>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  disabled={order.status === opt.value || updating}
                  onClick={() => onStatusChange(order.id, opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition disabled:opacity-50 ${
                    order.status === opt.value
                      ? 'bg-emerald-900 text-white border-emerald-900 cursor-default'
                      : 'bg-white text-stone-600 border-stone-300 hover:border-amber-400'
                  }`}
                >
                  {updating && order.status !== opt.value ? '…' : opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-0.5">
        {label}
      </p>
      <p className="text-stone-700">{value}</p>
    </div>
  )
}
