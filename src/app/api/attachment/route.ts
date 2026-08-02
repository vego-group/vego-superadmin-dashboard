// src/app/api/attachment/route.ts
// Same-origin relay for complaint attachments. HEIC/HEIF files (the iPhone
// default) can't be rendered natively by Chromium — they are converted
// client-side, which requires fetching the raw bytes. Storage URLs live on the
// API host (cross-origin, no CORS headers), so the bytes are streamed through
// here instead. Locked to the API host to prevent SSRF.
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://mobility-live.com/api/super-admin'
const ALLOWED_HOST = new URL(API_BASE).host

// Attachments are contractually capped at 5 MB — allow headroom, refuse more.
const MAX_BYTES = 10 * 1024 * 1024
const UPSTREAM_TIMEOUT_MS = 30_000

export async function GET(request: Request) {
  // Session-gated: without this the host lock still leaves an open relay for
  // anyone holding an attachment URL.
  const token = (await cookies()).get('auth-token')?.value
  if (!token) {
    return NextResponse.json({ message: 'unauthenticated' }, { status: 401 })
  }

  const target = new URL(request.url).searchParams.get('url')
  if (!target) {
    return NextResponse.json({ message: 'url is required' }, { status: 400 })
  }

  let parsed: URL
  try {
    // Relative storage paths resolve against the API origin.
    parsed = new URL(target, API_BASE)
  } catch {
    return NextResponse.json({ message: 'invalid url' }, { status: 400 })
  }
  if (parsed.host !== ALLOWED_HOST || !['https:', 'http:'].includes(parsed.protocol)) {
    return NextResponse.json({ message: 'host not allowed' }, { status: 400 })
  }

  let res: Response
  try {
    res = await fetch(parsed, {
      headers: { Authorization: `Bearer ${token}` },
      // Aborts the whole exchange — including body streaming — if it stalls.
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    })
  } catch {
    return NextResponse.json({ message: 'Upstream request failed' }, { status: 502 })
  }
  if (!res.ok || !res.body) {
    return NextResponse.json({ message: `Upstream returned ${res.status}` }, { status: res.status })
  }

  const declared = Number(res.headers.get('content-length'))
  if (Number.isFinite(declared) && declared > MAX_BYTES) {
    return NextResponse.json({ message: 'attachment too large' }, { status: 413 })
  }

  // Content-Length may be absent (chunked) or lie — enforce the cap on the
  // actual bytes as they stream through.
  let sent = 0
  const capped = res.body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        sent += chunk.byteLength
        if (sent > MAX_BYTES) {
          controller.error(new Error('attachment exceeds size cap'))
        } else {
          controller.enqueue(chunk)
        }
      },
    })
  )

  return new Response(capped, {
    headers: {
      'Content-Type': res.headers.get('content-type') ?? 'application/octet-stream',
      'Cache-Control': 'private, max-age=3600',
    },
  })
}
