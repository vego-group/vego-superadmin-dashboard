// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { phone, password } = body

    // TODO: التحقق من صحة البيانات من قاعدة البيانات
    // هذا مجرد مثال - يجب استبداله بالتحقق الفعلي
    if (phone === 'admin' && password === 'admin') {
      // الحصول على cookieStore بشكل غير متزامن
      const cookieStore = await cookies()
      
      // إنشاء كوكيز للمصادقة
      cookieStore.set('auth-token', 'dummy-token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 24 ساعة
        path: '/',
      })

      return NextResponse.json({ 
        success: true, 
        message: 'تم تسجيل الدخول بنجاح' 
      })
    }

    return NextResponse.json(
      { success: false, message: 'بيانات الدخول غير صحيحة' },
      { status: 401 }
    )
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}