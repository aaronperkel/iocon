import { NextRequest, NextResponse } from 'next/server'
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth'
import { isPreLaunch } from '@/lib/launch'

// Two jobs (order matters):
//   1. Admin auth — email + code session gating for /admin and the protected
//      APIs (unchanged behavior; see CLAUDE.md "Admin auth").
//   2. The Aug 1 launch gate (lib/launch.ts) — pre-launch, every public page
//      is rewritten to /coming-soon (rewrite, not redirect: URLs stay put and
//      Google gets nothing new to index) and the public POST APIs return 403.
//      /admin and /api/auth stay reachable so Riley can keep using the portal.
//      The check runs per request, so the site appears on its own at the
//      launch instant — no redeploy. Gate branches are deletable after Aug 1.

// Public POSTs that must not accept submissions before launch.
const PRELAUNCH_BLOCKED_POSTS = ['/api/orders', '/api/uploads', '/api/contact', '/api/reviews']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const preLaunch = isPreLaunch()

  if (pathname.startsWith('/api/')) {
    if (
      preLaunch &&
      request.method === 'POST' &&
      PRELAUNCH_BLOCKED_POSTS.includes(pathname)
    ) {
      return NextResponse.json({ error: 'Ordering opens August 1.' }, { status: 403 })
    }

    if (pathname.startsWith('/api/orders')) {
      // Order forms POST here from public pages; everything else on the orders
      // API (GET list, PATCH status) is admin-only.
      if (request.method === 'POST' && pathname === '/api/orders') return NextResponse.next()
      if (!(await sessionEmail(request))) return unauthorized()
      return NextResponse.next()
    }

    if (pathname.startsWith('/api/reviews')) {
      // The home page reads reviews and /review submits them publicly;
      // moderation (PATCH approve / DELETE) is admin-only.
      if (request.method === 'GET' || request.method === 'POST') return NextResponse.next()
      if (!(await sessionEmail(request))) return unauthorized()
      return NextResponse.next()
    }

    if (pathname.startsWith('/api/admin')) {
      if (!(await sessionEmail(request))) return unauthorized()
      return NextResponse.next()
    }

    // Everything else under /api (auth endpoints) passes through untouched.
    return NextResponse.next()
  }

  if (pathname.startsWith('/admin')) {
    const email = await sessionEmail(request)
    if (pathname === '/admin/login') {
      if (email) return NextResponse.redirect(new URL('/admin', request.url))
      return NextResponse.next()
    }
    if (!email) return NextResponse.redirect(new URL('/admin/login', request.url))
    return NextResponse.next()
  }

  // --- Public pages: the launch gate ---
  if (pathname === '/coming-soon') {
    // Post-launch the landing is retired; send stragglers home.
    if (!preLaunch) return NextResponse.redirect(new URL('/', request.url))
    return NextResponse.next()
  }
  if (preLaunch) {
    return NextResponse.rewrite(new URL('/coming-soon', request.url))
  }
  return NextResponse.next()
}

function sessionEmail(request: NextRequest) {
  return verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value)
}

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

export const config = {
  matcher: [
    // All API routes. :path* segments may contain dots (/api/admin/users/[email]),
    // so the APIs get their own matcher rather than relying on the page one.
    '/api/:path*',
    // All pages: everything except Next internals and files with extensions
    // (favicon.ico, sitemap.xml, /brand/*.png, /shop/*.jpeg, …). Also matches
    // /admin and unknown URLs (pre-launch, 404s land on the gate too).
    '/((?!_next/|.*\\..*).*)',
  ],
}
