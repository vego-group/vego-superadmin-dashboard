// src/hooks/use-countries.ts
"use client";

import { logger } from "@/lib/logger";
import { useEffect, useState } from "react";
import { Country, DEFAULT_COUNTRIES, parseCountry } from "@/types/country";

// GET /countries is SHARED between dashboards and CONFIRMED (backend answers
// §1) to live at the API root: api/countries, no token required. The
// realm-scoped api/super-admin/countries does not and will not exist.
const COUNTRIES_PATH = "/api/proxy-root/countries";

/**
 * Why the hook renders seeded defaults instead of a server list:
 * - "empty-server": the endpoint answered 200 OK with ZERO rows — the backend
 *   CountrySeeder likely hasn't run on this environment. The UI keeps working
 *   from local defaults, but this must stay VISIBLE (dev warning + login badge)
 *   — a healthy-looking picker over an empty backend is how this ships wrong.
 * - "unreachable": no path produced a usable response (404 / network failure).
 */
export type SeededReason = "empty-server" | "unreachable";

// Static config (dial code, currency, phone regex, top-up amounts, vehicle
// term) — fetch once per session and share across consumers. Only a real
// server list is cached; fallback outcomes retry on later mounts so the app
// self-heals once the seeder runs.
let cache: Country[] | null = null;
let inflight: Promise<FetchOutcome> | null = null;

type FetchOutcome =
  | { ok: true; countries: Country[]; path: string }
  | { ok: false; reason: SeededReason; detail: string };

const parseRows = (json: unknown): Country[] => {
  const rows: unknown[] = Array.isArray(json)
    ? json
    : ((json as { data?: unknown[] } | null)?.data ?? []);
  return rows
    .filter((r): r is Record<string, unknown> => !!r && typeof r === "object")
    .map(parseCountry)
    .filter((c): c is Country => c !== null);
};

const fetchCountries = async (): Promise<FetchOutcome> => {
  try {
    const res = await fetch(COUNTRIES_PATH, { headers: { Accept: "application/json" } });
    if (res.ok) {
      const countries = parseRows(await res.json());
      if (countries.length > 0) return { ok: true, countries, path: COUNTRIES_PATH };
      // 200 OK but zero rows — the seeder hasn't run; outranks "unreachable".
      return {
        ok: false,
        reason: "empty-server",
        detail: `${COUNTRIES_PATH} returned zero countries — CountrySeeder likely not run on this environment`,
      };
    }
  } catch {
    // Network failure — fall through to "unreachable".
  }
  return {
    ok: false,
    reason: "unreachable",
    detail: `no usable response from ${COUNTRIES_PATH}`,
  };
};

// One warning per reason per session — retries must not spam the console.
const warnedReasons = new Set<SeededReason>();
const warnOnce = (reason: SeededReason, message: string) => {
  if (warnedReasons.has(reason)) return;
  warnedReasons.add(reason);
  // Warning, not error: the condition is HANDLED — seeded defaults (SA, JO)
  // keep every consumer working — but it must not be silent.
  logger.warn(message);
};

export function useCountries() {
  const [countries, setCountries] = useState<Country[]>(cache ?? DEFAULT_COUNTRIES);
  const [isLoading, setIsLoading] = useState(cache === null);
  const [error, setError] = useState<string | null>(null);
  /** Non-null when `countries` is the LOCAL seeded list, not a server response. */
  const [seededReason, setSeededReason] = useState<SeededReason | null>(null);

  useEffect(() => {
    if (cache) return;
    let cancelled = false;

    inflight ??= fetchCountries();
    inflight
      .then((outcome) => {
        if (outcome.ok) {
          cache = outcome.countries;
          if (!cancelled) {
            setCountries(outcome.countries);
            setSeededReason(null);
            setError(null);
          }
          return;
        }
        inflight = null; // retry on a later mount — self-heals once the backend is ready
        warnOnce(outcome.reason, `[countries] ${outcome.detail} — using seeded defaults (SA, JO)`);
        if (!cancelled) {
          setSeededReason(outcome.reason);
          if (outcome.reason === "unreachable") setError(outcome.detail);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { countries, isLoading, error, seededReason };
}
