// Shared API error extraction.
//
// §0.3: an unknown `?country=` code returns `422 country_not_supported` rather
// than silently returning everything — a typo can never masquerade as an
// unfiltered list. That error must reach the user verbatim, never be swallowed
// or rewritten into a generic "failed to fetch".

/** True when the response is the 422 country_not_supported contract error. */
const isCountryNotSupported = (status: number, body: unknown): boolean => {
  if (status !== 422 || !body || typeof body !== "object") return false;
  const rec = body as Record<string, unknown>;
  return [rec.error, rec.code, rec.message].some(
    (v) => typeof v === "string" && v.includes("country_not_supported")
  );
};

/**
 * True for the 422 `country_filter_not_supported` error (§3): a `?country=`
 * sent to an endpoint that does not honour it is refused, with the list of
 * endpoints that DO honour it in `meta.supported_endpoints`. Exported so list
 * fetchers can fall back to the unfiltered list (with a visible warning)
 * instead of leaving the whole section unusable.
 */
export const isCountryFilterNotSupported = (status: number, body: unknown): boolean => {
  if (status !== 422 || !body || typeof body !== "object") return false;
  const rec = body as Record<string, unknown>;
  return [rec.error_code, rec.error, rec.code, rec.message].some(
    (v) => typeof v === "string" && v.includes("country_filter_not_supported")
  );
};

/**
 * True for the 422 `currency_not_supported` error (§13): an unknown
 * `?currency=` conversion target is refused, never silently ignored.
 */
const isCurrencyNotSupported = (status: number, body: unknown): boolean => {
  if (status !== 422 || !body || typeof body !== "object") return false;
  const rec = body as Record<string, unknown>;
  return [rec.error_code, rec.error, rec.code, rec.message].some(
    (v) => typeof v === "string" && v.includes("currency_not_supported")
  );
};

const countryFilterNotSupportedMessage = (body: unknown): string => {
  const meta =
    body && typeof body === "object" && typeof (body as Record<string, unknown>).meta === "object"
      ? ((body as Record<string, unknown>).meta as Record<string, unknown>)
      : {};
  const endpoint = typeof meta.endpoint === "string" ? ` (${meta.endpoint})` : "";
  const supported = Array.isArray(meta.supported_endpoints)
    ? meta.supported_endpoints.filter((v): v is string => typeof v === "string")
    : [];
  const supportedNote =
    supported.length > 0 ? ` Endpoints that support it: ${supported.join(", ")}.` : "";
  return `This endpoint${endpoint} does not support the country filter (country_filter_not_supported).${supportedNote}`;
};

/**
 * Error message from an already-parsed response body. Surfaces
 * `country_not_supported` explicitly (naming the rejected code), otherwise
 * prefers the server's own `message`, falling back to `"<fallback> (<status>)"`.
 */
export function apiErrorFromBody(
  status: number,
  body: unknown,
  fallback: string,
  requestedCountry?: string | null,
  requestedCurrency?: string | null
): string {
  if (isCountryFilterNotSupported(status, body)) {
    return countryFilterNotSupportedMessage(body);
  }
  if (isCountryNotSupported(status, body)) {
    const code = requestedCountry ? ` "${requestedCountry}"` : "";
    return `Country${code} is not supported by the server (country_not_supported). Check the country filter.`;
  }
  if (isCurrencyNotSupported(status, body)) {
    const code = requestedCurrency ? ` "${requestedCurrency}"` : "";
    return `Currency${code} is not supported for conversion (currency_not_supported). Pick a supported currency.`;
  }

  const message =
    body && typeof body === "object" && typeof (body as Record<string, unknown>).message === "string"
      ? ((body as Record<string, unknown>).message as string)
      : null;

  return message || `${fallback} (${status})`;
}

/**
 * Same, for a caught exception from `apiClient` (a typed `ApiError` carrying
 * status + parsed body) or any other thrown value.
 */
export function apiErrorFromCaught(
  err: unknown,
  fallback: string,
  requestedCountry?: string | null
): string {
  if (err && typeof err === "object" && "status" in err && "data" in err) {
    const e = err as { status: number; data: unknown; message?: string };
    if (isCountryNotSupported(e.status, e.data)) {
      return apiErrorFromBody(e.status, e.data, fallback, requestedCountry);
    }
    return e.message || fallback;
  }
  return err instanceof Error ? err.message : fallback;
}

/**
 * Same, for callers that have not consumed the response body yet — reads the
 * JSON via clone() so the caller may still consume the response afterwards.
 */
export async function apiErrorMessage(
  res: Response,
  fallback: string,
  requestedCountry?: string | null,
  requestedCurrency?: string | null
): Promise<string> {
  let body: unknown = null;
  try {
    body = await res.clone().json();
  } catch {
    // Non-JSON body — fall through to the generic message.
  }
  return apiErrorFromBody(res.status, body, fallback, requestedCountry, requestedCurrency);
}
