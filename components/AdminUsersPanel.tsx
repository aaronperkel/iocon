'use client'

// Admins tab on the admin page — add or remove the emails allowed to sign in
// to the portal (the admin_users table via /api/admin/users). Removal takes
// effect immediately (live sessions are revoked on their next request); you
// cannot remove yourself, so there is always at least one admin left.

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Field } from '@/components/FormField'
import type { AdminUser } from '@/lib/admin-users'

const inputCls =
  'w-full rounded-lg border border-stone-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gold-400 transition'

export default function AdminUsersPanel() {
  const router = useRouter()
  const [users, setUsers] = useState<AdminUser[] | null>(null)
  const [you, setYou] = useState<string | null>(null)

  const [email, setEmail] = useState('')
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const [confirmEmail, setConfirmEmail] = useState<string | null>(null)
  const [removingEmail, setRemovingEmail] = useState<string | null>(null)
  const [listError, setListError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/users')
      .then((r) => {
        if (r.status === 401) {
          router.replace('/admin/login')
          return null
        }
        return r.json()
      })
      .then((data: { users: AdminUser[]; you: string | null } | null) => {
        if (!data) return
        setUsers(data.users)
        setYou(data.you)
      })
      .catch(() => setUsers([]))
  }, [router])

  async function add() {
    setAdding(true)
    setFormError(null)
    setAdded(null)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.status === 401) {
        router.replace('/admin/login')
        return
      }
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.error)
      setUsers((prev) => (prev ? [...prev, data as AdminUser] : prev))
      setAdded((data as AdminUser).email)
      setEmail('')
    } catch (err) {
      setFormError(
        err instanceof Error && err.message
          ? err.message
          : 'Something went wrong — nobody was added. Please try again.'
      )
    } finally {
      setAdding(false)
    }
  }

  async function remove(target: string) {
    setRemovingEmail(target)
    setListError(null)
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(target)}`, {
        method: 'DELETE',
      })
      if (res.status === 401) {
        router.replace('/admin/login')
        return
      }
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.error)
      setUsers((prev) => (prev ? prev.filter((u) => u.email !== target) : prev))
    } catch (err) {
      setListError(
        err instanceof Error && err.message
          ? err.message
          : 'Failed to remove the admin. Please try again.'
      )
    } finally {
      setRemovingEmail(null)
      setConfirmEmail(null)
    }
  }

  if (users === null) {
    return <p className="text-stone-400 text-sm">Loading admins…</p>
  }

  return (
    <div className="space-y-8">
      <p className="text-xs text-stone-400 max-w-xl leading-relaxed">
        Everyone listed here can sign in with a one-time email code and has full
        access to this portal — orders, customer email, reviews, and the
        gallery. Removing someone locks them out right away.
      </p>

      {/* Add form */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 space-y-4">
        <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide">
          Add an admin
        </p>
        <Field label="Email" required>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setAdded(null)
            }}
            className={inputCls}
          />
        </Field>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={email.trim() === '' || adding}
            onClick={add}
            className="bg-gold hover:bg-gold-400 disabled:opacity-60 text-gold-950 font-medium text-sm px-8 py-2.5 rounded-lg transition-colors"
          >
            {adding ? 'Adding…' : 'Add admin'}
          </button>
          {added && (
            <p className="text-sm text-olive-800 font-medium">
              {added} can now sign in.
            </p>
          )}
        </div>
        {formError && <p className="text-xs text-red-600">{formError}</p>}
      </div>

      {/* Admin list */}
      <div>
        <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-3">
          Admins
        </p>
        {listError && <p className="text-xs text-red-600 mb-3">{listError}</p>}
        <div className="space-y-3">
          {users.map((user) => (
            <div
              key={user.email}
              className="bg-white rounded-2xl border border-stone-200 shadow-sm px-5 py-4 flex flex-wrap items-center gap-3"
            >
              <span className="text-sm font-medium text-stone-800">{user.email}</span>
              {user.email === you && (
                <span className="text-[10px] bg-gold-100 text-gold-800 px-2 py-0.5 rounded-full font-medium">
                  you
                </span>
              )}
              <span className="text-xs text-stone-400 flex-1">
                {user.addedBy ? `added by ${user.addedBy}` : 'founder'}
              </span>
              {user.email !== you &&
                (confirmEmail === user.email ? (
                  <span className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={removingEmail === user.email}
                      onClick={() => remove(user.email)}
                      className="text-xs text-red-600 font-medium underline underline-offset-2 disabled:opacity-50"
                    >
                      {removingEmail === user.email ? 'Removing…' : 'Confirm remove'}
                    </button>
                    <button
                      type="button"
                      disabled={removingEmail === user.email}
                      onClick={() => setConfirmEmail(null)}
                      className="text-xs text-stone-500 hover:text-olive-800 underline underline-offset-2 transition-colors"
                    >
                      Cancel
                    </button>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmEmail(user.email)}
                    className="text-xs text-stone-500 hover:text-red-600 underline underline-offset-2 transition-colors"
                  >
                    Remove
                  </button>
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
