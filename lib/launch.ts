// ---------------------------------------------------------------------------
// The Aug 1 launch gate (Riley, July 2026). Client-, server-, and edge-safe.
//
// Until the launch instant, middleware rewrites every public page to
// /coming-soon and blocks the public POST APIs; at that instant the real
// site appears on its own — the check runs per request, so no redeploy or
// env flip is needed. After launch this module and the gate branches in
// middleware.ts can be deleted whenever convenient.
// ---------------------------------------------------------------------------

// Midnight August 1, 2026 in Riley's timezone (US Eastern, EDT = UTC-4).
export const LAUNCH_AT_MS = Date.UTC(2026, 7, 1, 4, 0, 0)

// PRELAUNCH env (set in Vercel/.env.local, needs a deploy/restart to change):
//   '1' forces the gate on, '0' forces it off — both override the date.
// Unset: date-based in production; always off in local dev so the real site
// stays workable before Aug 1 (preview the landing with PRELAUNCH=1).
export function isPreLaunch(): boolean {
  const override = process.env.PRELAUNCH
  if (override === '1') return true
  if (override === '0') return false
  if (process.env.NODE_ENV === 'development') return false
  return Date.now() < LAUNCH_AT_MS
}
