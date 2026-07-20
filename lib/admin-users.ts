// ---------------------------------------------------------------------------
// Admin login allowlist — who can sign in to /admin — stored in the
// admin_users table and managed from the admin Admins tab.
//
// This module is imported by the EDGE middleware (through lib/auth.ts's
// verifySessionToken), where mysql2 can't run (no TCP sockets), so it talks
// to the same TiDB cluster over HTTPS via @tidbcloud/serverless, which works
// in both the edge and Node runtimes. Do not import lib/db.ts here, and do
// not value-import this module from client components.
//
// Fail-safe: when DATABASE_URL is absent (fresh clone), the table is empty,
// or the query fails (outage, table not created yet), FALLBACK_ADMIN_EMAILS
// keeps Riley + Aaron able to sign in — the portal can never lock everyone
// out. Otherwise the table is the only source of truth: verifySessionToken
// re-checks it on every request, so removing an email revokes its live
// sessions immediately.
// ---------------------------------------------------------------------------

import { connect } from '@tidbcloud/serverless'

type Conn = ReturnType<typeof connect>

export const FALLBACK_ADMIN_EMAILS = ['riley@iocongraphics.com', 'aaron@iocongraphics.com']

export interface AdminUser {
  email: string
  addedBy: string | null // null = founding admin (seeded by db:init)
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

const memory = ((globalThis as unknown as { __ioconAdminUsers?: { users: AdminUser[] } })
  .__ioconAdminUsers ??= {
  users: FALLBACK_ADMIN_EMAILS.map((email) => ({ email, addedBy: null })),
})

const globalForConn = globalThis as unknown as { __ioconAdminConn?: Conn }

function getConn(): Conn {
  if (!globalForConn.__ioconAdminConn) {
    const url = new URL(process.env.DATABASE_URL!)
    globalForConn.__ioconAdminConn = connect({
      host: url.hostname,
      username: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.replace(/^\//, ''),
    })
  }
  return globalForConn.__ioconAdminConn
}

const FALLBACK_USERS: AdminUser[] = FALLBACK_ADMIN_EMAILS.map((email) => ({
  email,
  addedBy: null,
}))

export async function getAdminUsers(): Promise<AdminUser[]> {
  if (!process.env.DATABASE_URL) return [...memory.users]
  try {
    const rows = (await getConn().execute(
      'SELECT email, added_by FROM admin_users ORDER BY created_at ASC, email ASC'
    )) as { email: string; added_by: string | null }[]
    if (rows.length > 0) {
      return rows.map((row) => ({ email: row.email, addedBy: row.added_by }))
    }
  } catch (error) {
    console.error('Failed to load admin users — falling back to the founders list:', error)
  }
  return [...FALLBACK_USERS]
}

export async function isAllowedAdminEmail(email: string): Promise<boolean> {
  const normalized = normalizeEmail(email)
  return (await getAdminUsers()).some((user) => user.email === normalized)
}

/** Returns the new user, or null if the email is already an admin. */
export async function addAdminUser(
  email: string,
  addedBy: string | null
): Promise<AdminUser | null> {
  const normalized = normalizeEmail(email)
  if (!process.env.DATABASE_URL) {
    if (memory.users.some((user) => user.email === normalized)) return null
    const user: AdminUser = { email: normalized, addedBy }
    memory.users = [...memory.users, user]
    return user
  }
  if (await isAllowedAdminEmail(normalized)) return null
  await getConn().execute(
    'INSERT INTO admin_users (email, added_by, created_at) VALUES (?, ?, NOW(3))',
    [normalized, addedBy]
  )
  return { email: normalized, addedBy }
}

export async function removeAdminUser(email: string): Promise<boolean> {
  const normalized = normalizeEmail(email)
  if (!process.env.DATABASE_URL) {
    const before = memory.users.length
    memory.users = memory.users.filter((user) => user.email !== normalized)
    return memory.users.length < before
  }
  const result = await getConn().execute('DELETE FROM admin_users WHERE email = ?', [normalized], {
    fullResult: true,
  })
  return typeof result === 'object' && result !== null && 'rowsAffected' in result
    ? Number(result.rowsAffected) > 0
    : false
}
