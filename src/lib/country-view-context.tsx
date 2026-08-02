"use client";

// CR-1 §3 / §0.3: the topbar country switcher is a VIEW filter, not a
// permission. It is persisted in localStorage exactly like the language toggle.
//
// Staff scoping: `users.iso_country_code` is NULLABLE on staff — NULL means the
// staff member sees everything and may switch between All / JO / SA. A scoped
// staff member is locked to their own country: the switcher only offers that
// country and `setView` refuses anything else.

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { IsoCountryCode, asIsoCountryCode } from "@/types/country";

/** "ALL" = no country filter; otherwise a branded ISO code ("JO" | "SA"). */
export type CountryView = IsoCountryCode | "ALL";

const STORAGE_KEY = "country_view";

interface CountryViewContextType {
  view: CountryView;
  setView: (v: CountryView) => void;
  /** Non-null when the logged-in staff row carries an iso_country_code. */
  scopedTo: IsoCountryCode | null;
  /** Value for the `?country=` list param; null means "send no param" (All). */
  countryParam: string | null;
}

const CountryViewContext = createContext<CountryViewContextType>({
  view: "ALL",
  setView: () => {},
  scopedTo: null,
  countryParam: null,
});

/** iso_country_code of the logged-in staff member, from the login payload. */
const readStaffScope = (): IsoCountryCode | null => {
  try {
    const raw = localStorage.getItem("user_data");
    if (!raw) return null;
    const iso = JSON.parse(raw)?.iso_country_code;
    return iso ? asIsoCountryCode(String(iso)) : null;
  } catch {
    return null;
  }
};

const readSavedView = (): CountryView => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw || raw === "ALL") return "ALL";
    return asIsoCountryCode(raw);
  } catch {
    return "ALL";
  }
};

export function CountryViewProvider({ children }: { children: ReactNode }) {
  // "ALL" on first render (SSR-safe); localStorage is read after mount.
  const [view, setViewState] = useState<CountryView>("ALL");
  const [scopedTo, setScopedTo] = useState<IsoCountryCode | null>(null);

  useEffect(() => {
    const scope = readStaffScope();
    setScopedTo(scope);
    // A scoped staff member's view is always their own country, whatever a
    // stale saved value says.
    setViewState(scope ?? readSavedView());
  }, []);

  const setView = (v: CountryView) => {
    if (scopedTo && v !== scopedTo) return; // locked — never widen a scoped view
    setViewState(v);
    try {
      localStorage.setItem(STORAGE_KEY, v);
    } catch {
      // Persistence is best-effort, like the language toggle.
    }
  };

  const value = useMemo<CountryViewContextType>(
    () => ({
      view,
      setView,
      scopedTo,
      countryParam: view === "ALL" ? null : view,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [view, scopedTo]
  );

  return <CountryViewContext.Provider value={value}>{children}</CountryViewContext.Provider>;
}

export const useCountryView = () => useContext(CountryViewContext);
