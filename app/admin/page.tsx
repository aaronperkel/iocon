'use client'

// Access is gated by middleware.ts (email + one-time code, lib/auth.ts);
// the 401 checks below only cover a session expiring while the page is open.

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ORDER_TYPE_LABELS,
  ORDER_STATUS_LABELS,
  CONTACT_METHOD_LABELS,
  type Order,
  type OrderStatus,
} from '@/lib/orders'
import { PRODUCT_FORMAT_LABELS } from '@/lib/products'
import AdminEmailPortal from '@/components/AdminEmailPortal'
import AdminReviewsPanel from '@/components/AdminReviewsPanel'

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
]

// Waiting = neutral, being drawn = gold (active), finished = olive — brand
// scales only, so the badges also retheme in dark mode (same map as /waitlist).
const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-stone-100 text-stone-600',
  'in-progress': 'bg-gold-100 text-gold-800',
  completed: 'bg-olive-100 text-olive-800',
}

type AdminTab = 'orders' | 'email' | 'reviews'

const TABS: { value: AdminTab; label: string }[] = [
  { value: 'orders', label: 'Orders' },
  { value: 'email', label: 'Email Customers' },
  { value: 'reviews', label: 'Reviews' },
]

export default function AdminPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<AdminTab>('orders')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [updateError, setUpdateError] = useState<string | null>(null)
  // Set when "Email this customer" jumps to the email tab; keys the portal so
  // it mounts with that customer pre-checked.
  const [emailPreselect, setEmailPreselect] = useState<string[]>([])

  useEffect(() => {
    fetch('/api/orders')
      .then((r) => {
        if (r.status === 401) {
          router.replace('/admin/login')
          return null
        }
        return r.json()
      })
      .then((data: Order[] | null) => {
        if (!data) return
        setOrders(data.slice().reverse()) // newest first
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [router])

  async function signOut() {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
    router.replace('/admin/login')
  }

  async function updateStatus(id: string, status: OrderStatus) {
    setUpdatingId(id)
    setUpdateError(null)
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.status === 401) {
        router.replace('/admin/login')
        return
      }
      if (!res.ok) throw new Error()
      const updated: Order = await res.json()
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)))
    } catch {
      setUpdateError('Failed to update the status. Please try again.')
    } finally {
      setUpdatingId(null)
    }
  }

  function emailCustomer(order: Order) {
    setEmailPreselect([order.contactValue])
    setTab('email')
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
        <h1 className="font-heading text-4xl font-bold text-olive-800">Admin</h1>
        <div className="mt-2 flex items-center gap-3">
          <span className="text-xs bg-gold-100 text-gold-800 px-2.5 py-1 rounded-full font-medium">
            {openCount} open
          </span>
          <button
            type="button"
            onClick={signOut}
            className="text-xs text-stone-500 hover:text-olive-800 underline underline-offset-2 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
      <p className="text-stone-400 text-xs mb-6">
        Orders, customer email, and review moderation — not visible to clients.
      </p>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-gold-200 pb-4">
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            aria-pressed={tab === t.value}
            onClick={() => setTab(t.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
              tab === t.value
                ? 'bg-olive-800 text-white border-olive-800'
                : 'bg-white text-stone-600 border-stone-300 hover:border-gold-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'email' && (
        <AdminEmailPortal
          key={emailPreselect.join(',')}
          orders={orders}
          initialSelected={emailPreselect}
        />
      )}

      {tab === 'reviews' && <AdminReviewsPanel />}

      {tab === 'orders' && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="flex items-center gap-2">
              <label className="text-xs text-stone-500 font-medium">Type:</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="text-xs rounded-lg border border-stone-300 px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-gold-400"
              >
                <option value="all">All</option>
                {Object.entries(ORDER_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-stone-500 font-medium">Status:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-xs rounded-lg border border-stone-300 px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-gold-400"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {updateError && <p className="text-xs text-red-600 mb-4">{updateError}</p>}

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
                  onEmail={order.contactMethod === 'email' ? () => emailCustomer(order) : undefined}
                  updating={updatingId === order.id}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function OrderCard({
  order,
  expanded,
  onToggle,
  onStatusChange,
  onEmail,
  updating,
}: {
  order: Order
  expanded: boolean
  onToggle: () => void
  onStatusChange: (id: string, status: OrderStatus) => void
  onEmail?: () => void
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
        aria-expanded={expanded}
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
        <svg
          className={`w-4 h-4 text-stone-400 shrink-0 transition-transform motion-reduce:transition-none ${
            expanded ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-stone-100 px-5 py-5 space-y-4 text-sm">
          <div className="grid sm:grid-cols-2 gap-4">
            <DetailRow label="Order type" value={ORDER_TYPE_LABELS[order.orderType]} />
            <DetailRow label="Received" value={createdDate} />
            {order.product && (
              <DetailRow label="Product" value={PRODUCT_FORMAT_LABELS[order.product]} />
            )}
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
            <div className="flex flex-wrap items-center gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  disabled={order.status === opt.value || updating}
                  onClick={() => onStatusChange(order.id, opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition disabled:opacity-50 ${
                    order.status === opt.value
                      ? 'bg-olive-800 text-white border-olive-800 cursor-default'
                      : 'bg-white text-stone-600 border-stone-300 hover:border-gold-400'
                  }`}
                >
                  {updating && order.status !== opt.value ? '…' : opt.label}
                </button>
              ))}
              {onEmail && (
                <button
                  type="button"
                  onClick={onEmail}
                  className="ml-auto text-xs text-stone-500 hover:text-olive-800 underline underline-offset-2 transition-colors"
                >
                  Email this customer
                </button>
              )}
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
