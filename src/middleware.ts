// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // التحقق من وجود التوكن في الكوكيز
  const token = request.cookies.get('auth-token')?.value
  const { pathname } = request.nextUrl

  // إذا كان المستخدم يحاول الوصول للداشبورد أو أي صفحة محمية بدون توكن
  const isDashboardRoute = pathname.startsWith('/dashboard')
  const isAuthRoute = pathname.startsWith('/login') || pathname === '/'

  if (isDashboardRoute && !token) {
    // إعادة توجيه إلى صفحة تسجيل الدخول
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // إذا كان المستخدم لديه توكن ويحاول الوصول لصفحة تسجيل الدخول أو الصفحة الرئيسية
  if (isAuthRoute && token) {
    // إعادة توجيه إلى الداشبورد
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // السماح بالوصول في الحالات الأخرى
  return NextResponse.next()
}

// تحديد المسارات التي سيطبق عليها middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}