"use client";

import { useEffect, useMemo, useState } from "react";
import { DataControls } from "@/components/DataControls";
import { Filters } from "@/components/Filters";
import { RankingsTable } from "@/components/RankingsTable";
import {
  athleteKey,
  clearResults as clearStoredResults,
  loadResults,
  loadStarred,
  saveResults,
  saveStarred,
} from "@/lib/storage";
import type { Classification, EventName, Gender, RaceResult } from "@/lib/types";

export default function HomePage() {
  const [results, setResults] = useState<RaceResult[]>([]);
  const [starred, setStarred] = useState<Set<string>>(new Set());
  const [event, setEvent] = useState<EventName>("1600m");
  const [gender, setGender] = useState<Gender>("M");
  const [classification, setClassification] = useState<Classification>("6A");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setResults(loadResults());
    setStarred(loadStarred());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveResults(results);
  }, [results, hydrated]);

  useEffect(() => {
    if (hydrated) saveStarred(starred);
  }, [starred, hydrated]);

  const starredCount = useMemo(() => {
    const keys = new Set(results.map((r) => athleteKey(r.athleteName, r.school)));
    return [...starred].filter((k) => keys.has(k)).length;
  }, [results, starred]);

  function handleLoad(next: RaceResult[], mode: "replace" | "append") {
    setResults((prev) => (mode === "replace" ? next : [...prev, ...next]));
  }

  function handleClear() {
    clearStoredResults();
    setResults([]);
  }

  function toggleStar(key: string) {
    setStarred((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-6 flex flex-col gap-5">
      <header className="flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Running Stats, etc.</h1>
          <p className="text-xs text-neutral-500">
            Utah HS rankings · {results.length} results · {starredCount} starred
          </p>
        </div>
      </header>

      <DataControls resultCount={results.length} onLoad={handleLoad} onClear={handleClear} />

      <Filters
        event={event}
        gender={gender}
        classification={classification}
        onChangeEvent={setEvent}
        onChangeGender={setGender}
        onChangeClassification={setClassification}
      />

      <RankingsTable
        results={results}
        event={event}
        gender={gender}
        classification={classification}
        starred={starred}
        onToggleStar={toggleStar}
      />

      <footer className="mt-auto pt-8 text-center text-xs text-neutral-600">
        Data stays on your device (localStorage). Phase 1 MVP.
      </footer>
    </main>
  );
}
