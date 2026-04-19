import type { AppData, Athlete, RaceResult } from "./types";
import { athleteKey } from "./storage";

export interface AthleteSummary {
  key: string;
  name: string;
  school: string;
  gender: RaceResult["gender"];
  classification: RaceResult["classification"];
  raceCount: number;
  events: RaceResult["event"][];
  bestTimes: Partial<Record<RaceResult["event"], number>>;
  lastRaceDate?: string;
}

export function athletesFromResults(
  results: RaceResult[],
  extras: Athlete[] = []
): AthleteSummary[] {
  const map = new Map<string, AthleteSummary>();

  // Seed with manually-added athletes so they appear even without race data.
  for (const a of extras) {
    map.set(a.key, {
      key: a.key,
      name: a.name,
      school: a.school,
      gender: a.gender,
      classification: a.classification,
      raceCount: 0,
      events: [],
      bestTimes: {},
    });
  }

  for (const r of results) {
    const key = athleteKey(r.athleteName, r.school);
    const existing = map.get(key);
    if (!existing) {
      map.set(key, {
        key,
        name: r.athleteName,
        school: r.school,
        gender: r.gender,
        classification: r.classification,
        raceCount: 1,
        events: [r.event],
        bestTimes: { [r.event]: r.timeSeconds },
        lastRaceDate: r.date,
      });
    } else {
      existing.raceCount += 1;
      if (!existing.events.includes(r.event)) existing.events.push(r.event);
      const prev = existing.bestTimes[r.event];
      if (prev == null || r.timeSeconds < prev) existing.bestTimes[r.event] = r.timeSeconds;
      if (!existing.lastRaceDate || (r.date && r.date > existing.lastRaceDate)) {
        existing.lastRaceDate = r.date;
      }
    }
  }

  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function allAthletes(data: AppData): AthleteSummary[] {
  return athletesFromResults(data.results, data.athletes);
}

export function findAthlete(data: AppData, key: string): AthleteSummary | undefined {
  return allAthletes(data).find((a) => a.key === key);
}

export function resultsForAthlete(results: RaceResult[], key: string): RaceResult[] {
  return results
    .filter((r) => athleteKey(r.athleteName, r.school) === key)
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
}
