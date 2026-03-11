// src/app/api/proxy/[...path]/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API_BASE = process.env.NEXT_PUBLIC_API_URL!

async function handler(request: Request, { params }: { params: { path: string[] } }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value

  const path = params.path.join('/')
  const url = `${API_BASE}/${path}`

  const res = await fetch(url, {
    method: request.method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: ['GET', 'HEAD'].includes(request.method) ? null : await request.text(),
  })

  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}

export const GET = handler
export const POST = handler
export const PUT = handler
export const PATCH = handler
export const DELETE = handler