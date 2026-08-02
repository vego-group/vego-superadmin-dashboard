// src/app/api/proxy-root/[...path]/route.ts
// Root-level API proxy (api/… — NO realm prefix), for endpoints shared between
// dashboards, e.g. GET /countries. Identical behaviour to /api/proxy (HttpOnly
// cookie auth, retries, error shaping) — only the upstream base differs.
import { createProxyHandler, ROOT_API_BASE } from '../../_lib/proxy-handler'

const handler = createProxyHandler(ROOT_API_BASE)

export const GET = handler
export const POST = handler
export const PUT = handler
export const PATCH = handler
export const DELETE = handler
