// ---------------------------------------------------------------------------
// Admin auth — email + 6-digit one-time code.
//
// Stateless by design: the code is never stored server-side. Requesting a
// code sets an HMAC-signed challenge cookie holding a hash of (email, code,
// expiry); verifying recomputes the hash and, on match, sets an HMAC-signed
// session cookie. This survives serverless (request-code and verify may hit
// different lambdas) and `next dev`'s per-bundle module copies.
//
// Uses only Web Crypto so it can run in both the edge runtime (middleware)
// and Node route handlers. Secret comes from AUTH_SECRET (.env.local locally;
// mirror into Vercel) — without it, a hardcoded dev fallback keeps local
// login working but offers no security.
// ---------------------------------------------------------------------------

export const ADMIN_EMAILS = ['riley@iocongraphics.com', 'aaron@iocongraphics.com']

export const SESSION_COOKIE = 'iocon_admin_session'
export const CHALLENGE_COOKIE = 'iocon_admin_challenge'

export const CODE_TTL_MS = 10 * 60 * 1000
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(normalizeEmail(email))
}

let warnedMissingSecret = false

function getSecret(): string {
  const secret = process.env.AUTH_SECRET
  if (secret) return secret
  if (!warnedMissingSecret) {
    console.warn(
      '[auth] AUTH_SECRET is not set — using an insecure dev fallback. Set it in .env.local and Vercel.'
    )
    warnedMissingSecret = true
  }
  return 'iocon-dev-fallback-secret'
}

const encoder = new TextEncoder()

async function hmacHex(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(getSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

export function generateCode(): string {
  // Rejection-sample so every 6-digit code is equally likely.
  const buf = new Uint32Array(1)
  do {
    crypto.getRandomValues(buf)
  } while (buf[0] >= 4_294_000_000) // largest multiple of 1e6 that fits in 2^32
  return String(buf[0] % 1_000_000).padStart(6, '0')
}

// --- Challenge token: "email|expires|codeHmac|sig" --------------------------

export async function createChallengeToken(email: string, code: string): Promise<string> {
  const expires = Date.now() + CODE_TTL_MS
  const codeHmac = await hmacHex(`code:${email}:${expires}:${code}`)
  const payload = `${encodeURIComponent(email)}|${expires}|${codeHmac}`
  return `${payload}|${await hmacHex(`challenge:${payload}`)}`
}

export async function verifyChallengeToken(
  token: string,
  email: string,
  code: string
): Promise<boolean> {
  const parts = token.split('|')
  if (parts.length !== 4) return false
  const [emailEnc, expStr, codeHmac, sig] = parts
  const payload = `${emailEnc}|${expStr}|${codeHmac}`
  if (!timingSafeEqual(await hmacHex(`challenge:${payload}`), sig)) return false
  try {
    if (decodeURIComponent(emailEnc) !== email) return false
  } catch {
    return false
  }
  const expires = Number(expStr)
  if (!Number.isFinite(expires) || Date.now() > expires) return false
  return timingSafeEqual(await hmacHex(`code:${email}:${expires}:${code}`), codeHmac)
}

// --- Session token: "email|expires|sig" -------------------------------------

export async function createSessionToken(email: string): Promise<string> {
  const payload = `${encodeURIComponent(normalizeEmail(email))}|${Date.now() + SESSION_TTL_MS}`
  return `${payload}|${await hmacHex(`session:${payload}`)}`
}

// Returns the signed-in admin email, or null. Re-checks the allowlist so
// removing an address from ADMIN_EMAILS also revokes its existing sessions.
export async function verifySessionToken(token: string | undefined): Promise<string | null> {
  if (!token) return null
  const parts = token.split('|')
  if (parts.length !== 3) return null
  const [emailEnc, expStr, sig] = parts
  const payload = `${emailEnc}|${expStr}`
  if (!timingSafeEqual(await hmacHex(`session:${payload}`), sig)) return null
  const expires = Number(expStr)
  if (!Number.isFinite(expires) || Date.now() > expires) return null
  let email: string
  try {
    email = decodeURIComponent(emailEnc)
  } catch {
    return null
  }
  return isAdminEmail(email) ? email : null
}

// --- Best-effort rate limiting ----------------------------------------------
// In-memory, so on Vercel it only throttles requests that land on the same
// lambda instance — the codes' 10-minute expiry is the real guard. Stored on
// globalThis because `next dev` gives each route bundle its own module copy.

type RateBucket = { count: number; resetAt: number }

const rateBuckets: Map<string, RateBucket> = ((globalThis as Record<string, unknown>)
  .__ioconAuthRate ??= new Map()) as Map<string, RateBucket>

export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now()
  const bucket = rateBuckets.get(key)
  if (!bucket || now > bucket.resetAt) {
    rateBuckets.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  bucket.count += 1
  return bucket.count <= max
}
