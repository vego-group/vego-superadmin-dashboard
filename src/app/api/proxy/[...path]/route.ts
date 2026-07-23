// src/app/api/proxy/[...path]/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://mobility-live.com/api/super-admin'

// Errors thrown *before* the request reaches the upstream — the connection was
// never established, so the backend never saw the request. These are safe to
// retry for ANY method (including POST/PUT/DELETE) because nothing was applied.
const CONNECT_PHASE_CODES = new Set([
  'UND_ERR_CONNECT_TIMEOUT', // TCP connect timed out
  'ECONNREFUSED',            // upstream refused the connection
  'ENOTFOUND',               // DNS lookup failed
  'EAI_AGAIN',               // transient DNS failure
]);

/** Reads the underlying error code behind undici's generic "fetch failed" wrapper. */
function errCode(err: unknown): string {
  const cause = (err as { cause?: { code?: string } } | null)?.cause;
  return cause?.code ?? (err as { code?: string } | null)?.code ?? '';
}


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

  // Under a burst of concurrent requests, undici can hand back a keep-alive
  // socket the upstream has already closed, or a fresh connection can time out
  // while the pool is saturated, so the fetch throws "fetch failed". These are
  // transient — a retry opens a fresh socket.
  //
  // Retry policy:
  //  - Idempotent methods (GET/HEAD): retry on any thrown fetch.
  //  - Non-idempotent (POST/PUT/PATCH/DELETE): retry ONLY when the connection
  //    was never established (CONNECT_PHASE_CODES), so the mutation can't have
  //    been applied twice. A post-send error (e.g. ECONNRESET) is not retried
  //    for these — the request may already have reached the backend.
  const isIdempotent = ['GET', 'HEAD'].includes(request.method);

  let res: Response | null = null;
  let lastErr: unknown = null;
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      res = await fetch(url, { method: request.method, headers, body });
      break;
    } catch (err) {
      lastErr = err;
      const retriable = isIdempotent || CONNECT_PHASE_CODES.has(errCode(err));
      if (!retriable || attempt >= maxAttempts) break;
      await new Promise((r) => setTimeout(r, 100 * attempt)); // 100ms, 200ms backoff
    }
  }

  if (!res) {
    // A thrown fetch (connection reset / socket hang-up / DNS) would otherwise
    // bubble up as Next's opaque HTML 500. Turn it into a readable JSON 502 so
    // the client shows a real reason instead of a bare "(500)".
    // `err.cause` carries the real reason (ECONNRESET, ETIMEDOUT, …) behind
    // undici's generic "fetch failed" message — log and surface it.
    const code = errCode(lastErr);
    const cause = code ? ` (${code})` : '';
    console.error(`[proxy] ${request.method} ${url} — upstream fetch failed after ${maxAttempts} attempt(s):`, lastErr);
    return NextResponse.json(
      { message: `Upstream request failed: ${lastErr instanceof Error ? lastErr.message : 'unknown error'}${cause}` },
      { status: 502 }
    );
  }

  const text = await res.text();
  let data: unknown = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text };
  }
  // Log real upstream failures (status + body) so the cause is visible in the
  // dev terminal rather than swallowed behind a generic client-side message.
  if (!res.ok) {
    console.error(`[proxy] ${request.method} ${url} → ${res.status}`, text.slice(0, 500));
  }
  return NextResponse.json(data, { status: res.status });
}

export const GET = handler
export const POST = handler
export const PUT = handler
export const PATCH = handler
export const DELETE = handler