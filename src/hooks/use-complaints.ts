"use client";

import { logger } from '@/lib/logger';
import { useState, useEffect, useCallback } from "react";
import { Complaint, ComplaintsPagination } from "@/types/dashboard/complaint";

export function useComplaints({
  status = "all",
  category = "all",
  search = "",
  page = 1,
  perPage = 20,
}: {
  status?: string;
  category?: string;
  search?: string;
  page?: number;
  perPage?: number;
} = {}) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
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
      const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
      if (status !== "all") params.set("status", status);
      if (category !== "all") params.set("category", category);
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/proxy/complaints?${params.toString()}`);
      if (!res.ok) throw new Error(`Failed to fetch complaints (${res.status})`);

      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Failed to fetch complaints");

      const paged = json.data;
      setComplaints(paged.data ?? []);
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
  }, [status, category, search, page, perPage]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  return { complaints, pagination, isLoading, error, fetchComplaints };
}
