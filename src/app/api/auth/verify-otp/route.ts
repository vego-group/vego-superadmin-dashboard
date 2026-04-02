import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://mobility-live.com/api/super-admin'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const laravelRes = await fetch(`${API_BASE}/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ phone: body.phone, code: body.code }),
    })

    const data = await laravelRes.json()

    if (!laravelRes.ok) {
      return NextResponse.json(
        { message: data.message || 'Invalid OTP' },
        { status: laravelRes.status }
      )
    }

    const token = data.token || data.data?.token
    const user  = data.user  || data.data?.user

    if (!token) {
      return NextResponse.json({ message: 'No token received' }, { status: 500 })
    }

    const cookieStore = await cookies()
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24,
      path: '/',
    })

    return NextResponse.json({ token, user })

  } catch (error) {
    console.error('Verify OTP error:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}