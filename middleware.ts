import { NextRequest, NextResponse } from 'next/server'
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const email = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value)

  if (pathname.startsWith('/api/orders')) {
    // Order forms POST here from public pages; everything else on the orders
    // API (GET list, PATCH status) is admin-only.
    if (request.method === 'POST' && pathname === '/api/orders') return NextResponse.next()
    if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.next()
  }

  if (pathname.startsWith('/api/reviews')) {
    // The home page reads and submits reviews publicly; moderation (DELETE)
    // is admin-only.
    if (request.method === 'GET' || request.method === 'POST') return NextResponse.next()
    if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.next()
  }

  if (pathname.startsWith('/api/admin')) {
    if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.next()
  }

  if (pathname === '/admin/login') {
    if (email) return NextResponse.redirect(new URL('/admin', request.url))
    return NextResponse.next()
  }

  if (!email) return NextResponse.redirect(new URL('/admin/login', request.url))
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/orders/:path*',
    '/api/reviews/:path*',
    '/api/admin/:path*',
  ],
}
