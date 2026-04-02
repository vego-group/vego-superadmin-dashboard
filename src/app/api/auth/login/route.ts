import { NextResponse } from 'next/server'
import { API_ENDPOINTS } from '@/config/api'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // بيبعت phone بس عشان يستقبل OTP
    const laravelRes = await fetch(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ phone: body.phone }),
    })

    const data = await laravelRes.json()

    if (!laravelRes.ok) {
      return NextResponse.json(
        { message: data.message || 'Failed to send OTP' },
        { status: laravelRes.status }
      )
    }

    // ✅ بعد
return NextResponse.json(data)

  } catch (error) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}