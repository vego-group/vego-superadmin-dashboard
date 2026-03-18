// src/app/api/proxy/[...path]/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://mobility-live.com/api/super-admin'


async function handler(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  const url = `${API_BASE}/${pathSegments.join('/')}`;

  // ✅ لو multipart، مش بنحط Content-Type عشان الـ browser يحطه تلقائياً
  const contentType = request.headers.get('content-type') ?? '';
  const isMultipart = contentType.includes('multipart/form-data');

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(!isMultipart ? { 'Content-Type': 'application/json' } : {}),
  };

  const res = await fetch(url, {
    method: request.method,
    headers,
    body: ['GET', 'HEAD'].includes(request.method) ? null : await request.blob(),
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  return NextResponse.json(data, { status: res.status });
}

export const GET = handler
export const POST = handler
export const PUT = handler
export const PATCH = handler
export const DELETE = handler