// src/app/api/proxy/[...path]/route.ts
// Super-admin realm proxy (api/super-admin/…). Shared logic (cookie auth,
// retries, error shaping) lives in ../_lib/proxy-handler.ts; the root-level
// mount for realm-less shared endpoints is /api/proxy-root/[...path].
import { createProxyHandler, REALM_API_BASE } from '../../_lib/proxy-handler'

const handler = createProxyHandler(REALM_API_BASE)

export const GET = handler
export const POST = handler
export const PUT = handler
export const PATCH = handler
export const DELETE = handler
