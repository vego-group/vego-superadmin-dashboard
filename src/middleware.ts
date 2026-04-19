import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value
  const role  = request.cookies.get('user-role')?.value
  const { pathname } = request.nextUrl

  const isDashboard = pathname.startsWith('/dashboard')
  const isSales     = pathname.startsWith('/sales')
  const isLogin     = pathname.startsWith('/login') || pathname === '/'

  // ── مش logged in ──────────────────────────────────────────────────────────
  if ((isDashboard || isSales) && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // ── Logged in + يحاول يدخل login ─────────────────────────────────────────
  if (isLogin && token) {
    if (role === 'sales') {
      return NextResponse.redirect(new URL('/sales/dashboard', request.url))
    }
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // ── Sales يحاول يدخل /dashboard ──────────────────────────────────────────
  if (role === 'sales' && isDashboard) {
    return NextResponse.redirect(new URL('/sales/dashboard', request.url))
  }

  // ── SuperAdmin/Admin يحاول يدخل /sales ───────────────────────────────────
  if ((role === 'superadmin' || role === 'admin') && isSales) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg).*)'],
}