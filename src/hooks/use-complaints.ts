"use client";

import { logger } from "@/lib/logger";
import { useState, useEffect, useCallback } from "react";
import {
  Complaint,
  ComplaintsPagination,
  parseComplaint,
} from "@/types/dashboard/complaint";
import { apiErrorFromBody } from "@/lib/api-error";

// Sorting is SERVER-SIDE (?sort=…), across the whole filtered set — never
// reorder client-side; that would fake a global ordering (the truly oldest
// unanswered ticket could sit on a later page). We default to
// "oldest_unanswered" (CR-6 inbox order); an unrecognised value falls back
// server-side rather than erroring, so a sort key can ship before the backend
// knows it. The response echoes meta.sort / meta.sort_default /
// meta.sort_available — the sort control must be driven from sort_available,
// not a hardcoded list.

export interface ComplaintsSortMeta {
  /** The sort the server actually applied. */
  sort: string | null;
  sortDefault: string | null;
  /** Server-advertised sort keys — drives the sort control. */
  sortAvailable: string[];
}

export const DEFAULT_COMPLAINTS_SORT = "oldest_unanswered";

export function useComplaints({
  status = "all",
  category = "all",
  search = "",
  country = "all",
  assignedTo = "all",
  sort = DEFAULT_COMPLAINTS_SORT,
  page = 1,
  perPage = 20,
}: {
  status?: string;
  category?: string;
  search?: string;
  /** ISO country code ("JO") or "all". */
  country?: string;
  /** Staff id as string, or "all". */
  assignedTo?: string;
  /** Server sort key (see meta.sort_available). */
  sort?: string;
  page?: number;
  perPage?: number;
} = {}) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [sortMeta, setSortMeta] = useState<ComplaintsSortMeta>({
    sort: null,
    sortDefault: null,
    sortAvailable: [],
  });
  const [pagination, setPagination] = useState<ComplaintsPagination>({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 20,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComplaints = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        per_page: String(perPage),
        sort,
      });
      if (status !== "all") params.set("status", status);
      if (category !== "all") params.set("category", category);
      if (country !== "all") params.set("country", country);
      if (assignedTo !== "all") params.set("assigned_to", assignedTo);
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/proxy/complaints?${params.toString()}`);
      const json = await res.json();
      if (!res.ok || json.success === false) {
        // A typo'd country returns 422 country_not_supported rather than an
        // unfiltered list — surface it, never swallow it (§0.3).
        throw new Error(
          apiErrorFromBody(res.status, json, "Failed to fetch complaints", country !== "all" ? country : null)
        );
      }

      const paged = json.data;
      const rows: Record<string, unknown>[] = Array.isArray(paged?.data)
        ? paged.data
        : [];
      // No client-side reorder — see the ordering note at the top of this file.
      setComplaints(rows.map(parseComplaint));
      const meta = (json.meta ?? {}) as Record<string, unknown>;
      setSortMeta({
        sort: typeof meta.sort === "string" ? meta.sort : null,
        sortDefault: typeof meta.sort_default === "string" ? meta.sort_default : null,
        sortAvailable: Array.isArray(meta.sort_available)
          ? meta.sort_available.filter((v): v is string => typeof v === "string")
          : [],
      });
      setPagination({
        currentPage: paged.current_page,
        lastPage: paged.last_page,
        total: paged.total,
        perPage: paged.per_page,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch complaints";
      setError(msg);
      logger.error("❌ fetchComplaints:", msg);
    } finally {
      setIsLoading(false);
    }
  }, [status, category, search, country, assignedTo, sort, page, perPage]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  // In-place row update (assignment, unread cleared, status transition) so the
  // list reflects a change WITHOUT refetching — a refetch would reorder rows
  // under the agent's cursor mid-triage (CR-6 §4).
  const patchComplaint = useCallback(
    (id: number, patch: Partial<Complaint>) => {
      setComplaints((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...patch } : c))
      );
    },
    []
  );

  return { complaints, pagination, sortMeta, isLoading, error, fetchComplaints, patchComplaint };
}
