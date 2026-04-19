"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AppData } from "./types";

const STORAGE_KEY = "running-stats:v2";

const DEFAULT_DATA: AppData = {
  results: [],
  starred: [],
  athletes: [],
  goals: [],
  trainingLogs: [],
  morningCheckins: [],
  eveningCheckins: [],
  badges: [],
  rewards: [],
  points: [],
  userRole: null,
  isParent: false,
};

type Updater = (prev: AppData) => AppData;

interface StoreValue {
  data: AppData;
  hydrated: boolean;
  update: (updater: Updater) => void;
  reset: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

function loadFromStorage(): AppData {
  if (typeof window === "undefined") return DEFAULT_DATA;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DATA;
    const parsed = JSON.parse(raw) as Partial<AppData>;
    return { ...DEFAULT_DATA, ...parsed };
  } catch {
    return DEFAULT_DATA;
  }
}

function saveToStorage(data: AppData) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore quota errors
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(DEFAULT_DATA);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setData(loadFromStorage());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveToStorage(data);
  }, [data, hydrated]);

  const update = useCallback((updater: Updater) => {
    setData((prev) => updater(prev));
  }, []);

  const reset = useCallback(() => {
    setData(DEFAULT_DATA);
  }, []);

  const value = useMemo(
    () => ({ data, hydrated, update, reset }),
    [data, hydrated, update, reset]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}

// helpers
export function uid(): string {
  return (
    Math.random().toString(36).slice(2, 10) +
    Date.now().toString(36).slice(-4)
  );
}

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}
