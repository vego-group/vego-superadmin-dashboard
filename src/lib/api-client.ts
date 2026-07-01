// src/lib/api-client.ts
//
// Single client for all backend calls. Every request goes through the Next proxy
// (`/api/proxy/[...path]`), which injects the auth cookie server-side — so no token
// is ever read on the client. It also normalizes the three response envelopes used
// across the app (`{ data }`, `{ success, data }`, `{ status, data }`) into a single
// typed result, and throws a typed `ApiError` on failure.
//
// This module is additive: existing inline `fetch("/api/proxy/...")` calls keep
// working. Migrate call sites to `apiClient` incrementally.

import { logger } from "./logger";

const PROXY_BASE = "/api/proxy";

export class ApiError extends Error {
  readonly status: number;
  readonly data: unknown;
  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

interface Envelope {
  success?: boolean;
  status?: boolean | string;
  message?: string;
  data?: unknown;
}

function isEnvelope(json: unknown): json is Envelope {
  return !!json && typeof json === "object";
}

/** Pulls the payload out of `{ data }` / `{ data: { data } }`, else returns json as-is. */
export function unwrap<T = unknown>(json: unknown): T {
  if (isEnvelope(json) && "data" in json) {
    const inner = json.data;
    // Some endpoints double-wrap: { data: { data: [...] } }
    if (isEnvelope(inner) && "data" in inner) return inner.data as T;
    return inner as T;
  }
  return json as T;
}

/** Decides success across the three envelope conventions plus the HTTP status. */
function isOk(json: unknown, res: Response): boolean {
  if (!res.ok) return false;
  if (isEnvelope(json)) {
    if (typeof json.success === "boolean") return json.success;
    if (typeof json.status === "boolean") return json.status;
    if (typeof json.status === "string") return json.status.toLowerCase() !== "error";
  }
  return true;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${PROXY_BASE}/${path.replace(/^\/+/, "")}`;

  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...init?.headers,
      },
    });
  } catch (err) {
    logger.error("apiClient network error:", url, err);
    throw new ApiError("Network error", 0, err);
  }

  const text = await res.text();
  let json: unknown = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { message: text };
  }

  if (!isOk(json, res)) {
    const message = (isEnvelope(json) && json.message) || `Request failed (${res.status})`;
    throw new ApiError(message, res.status, json);
  }

  return unwrap<T>(json);
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body != null ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body: body != null ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: body != null ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
  unwrap,
};

export type ApiClient = typeof apiClient;
