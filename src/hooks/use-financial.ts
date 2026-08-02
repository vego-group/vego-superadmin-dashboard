"use client";

import { logger } from '@/lib/logger';
import { useState, useEffect, useCallback } from "react";
import { API_ENDPOINTS, authHeaders } from "@/config/api";
import { appendDateRangeParams } from "@/lib/format-date";
import { apiErrorMessage } from "@/lib/api-error";
import { useCountryView } from "@/lib/country-view-context";

// CR-1 defect fix: this hook used to re-format the pickers' ISO dates into
// MM/DD/YYYY under `date_from/date_to` while the transactions call sent ISO
// under `start_date/end_date` — two formats, two param names, one pair of date
// pickers. Both callers now build their range through appendDateRangeParams
// (one ISO format, both param-name pairs).
//
// §13: the response is the multi-currency aggregate envelope — `by_currency`
// always present; flat keys carry a currency only under a `?country=` filter
// (sent here from the topbar view) and are null otherwise. `convertTo` is the
// OPT-IN `?currency=` conversion target; an unknown code is a 422
// currency_not_supported, surfaced verbatim.

export function useFinancial(fromDate: string, toDate: string, convertTo?: string | null) {
  const { countryParam } = useCountryView();
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFinancialData = useCallback(async () => {
    if (fromDate && toDate && new Date(toDate) < new Date(fromDate)) {
      setError("تاريخ النهاية يجب أن يكون بعد تاريخ البداية");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const endpoint = API_ENDPOINTS.DASHBOARD_FINANCIAL;

      const params = new URLSearchParams();
      appendDateRangeParams(params, fromDate, toDate);
      if (countryParam) params.set("country", countryParam);
      if (convertTo) params.set("currency", convertTo);

      const finalUrl = params.toString() ? `${endpoint}?${params.toString()}` : endpoint;

      logger.log("📡 Calling Financial API:", finalUrl);

      const response = await fetch(finalUrl, {
        method: "GET",
        headers: {
          ...authHeaders(),
        },
      });

      if (!response.ok) {
        throw new Error(
          await apiErrorMessage(response, "Failed to fetch financial data", countryParam, convertTo)
        );
      }

      const result = await response.json();

      setData(result.data || result);

    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch financial data";
      logger.error("🔥 Financial Fetch Error:", msg);
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [fromDate, toDate, countryParam, convertTo]);

  useEffect(() => {
    fetchFinancialData();
  }, [fetchFinancialData]);

  return { data, isLoading, error, refetch: fetchFinancialData };
}
