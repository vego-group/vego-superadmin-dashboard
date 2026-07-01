import { NextResponse } from 'next/server'

// Server-side route: must call the real backend directly (not the client proxy base).
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://mobility-live.com/api/super-admin'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // بيبعت phone بس عشان يستقبل OTP
    const laravelRes = await fetch(`${API_BASE}/login`, {
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

  } catch {
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}