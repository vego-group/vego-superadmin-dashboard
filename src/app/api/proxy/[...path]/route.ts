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

  // Preserve the query string (?page=…&start_date=…) when forwarding upstream.
  const search = new URL(request.url).search;
  const url = `${API_BASE}/${pathSegments.join('/')}${search}`;

  const contentType = request.headers.get('content-type') ?? '';
  const isMultipart = contentType.includes('multipart/form-data');

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  // Build the forwarded body:
  // - multipart: re-parse to FormData so fetch regenerates a valid boundary + Content-Type.
  //   (Forwarding the raw blob loses the boundary and the backend sees empty fields.)
  // - everything else: forward as text with a JSON Content-Type.
  let body: BodyInit | null = null;
  if (!['GET', 'HEAD'].includes(request.method)) {
    if (isMultipart) {
      body = await request.formData();
    } else {
      headers['Content-Type'] = 'application/json';
      body = await request.text();
    }
  }

  const res = await fetch(url, {
    method: request.method,
    headers,
    body,
  });

  const text = await res.text();
  let data: unknown = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text };
  }
  return NextResponse.json(data, { status: res.status });
}

export const GET = handler
export const POST = handler
export const PUT = handler
export const PATCH = handler
export const DELETE = handler