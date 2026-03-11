// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { API_ENDPOINTS } from '@/config/api'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // ✅ الـ fetch دي بتحصل على السيرفر مش البراوزر
    const laravelRes = await fetch(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await laravelRes.json()

    if (!laravelRes.ok) {
      return NextResponse.json(
        { message: data.message || data.error || 'Invalid credentials' },
        { status: laravelRes.status }
      )
    }

    const token = data.token || data.data?.token
    const user  = data.user  || data.data?.user

    if (!token) {
      return NextResponse.json(
        { message: 'No token received from server' },
        { status: 500 }
      )
    }

    // ✅ Set httpOnly cookie على السيرفر (أأمن)
    const cookieStore = await cookies()
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24h
      path: '/',
    })

    return NextResponse.json({ token, user })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    )
  }
}