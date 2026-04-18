import type { RaceResult } from "./types";

const KEY_RESULTS = "running-stats:results";
const KEY_STARRED = "running-stats:starred";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadResults(): RaceResult[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(KEY_RESULTS);
    return raw ? (JSON.parse(raw) as RaceResult[]) : [];
  } catch {
    return [];
  }
}

export function saveResults(results: RaceResult[]): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(KEY_RESULTS, JSON.stringify(results));
}

export function clearResults(): void {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(KEY_RESULTS);
}

export function loadStarred(): Set<string> {
  if (!canUseStorage()) return new Set();
  try {
    const raw = window.localStorage.getItem(KEY_STARRED);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

export function saveStarred(starred: Set<string>): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(KEY_STARRED, JSON.stringify([...starred]));
}

// Stable key for an athlete (name + school is usually unique enough).
export function athleteKey(name: string, school: string): string {
  return `${name.trim().toLowerCase()}|${school.trim().toLowerCase()}`;
}
