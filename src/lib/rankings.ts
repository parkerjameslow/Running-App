import type { Classification, EventName, Gender, RaceResult } from "./types";
import { athleteKey } from "./storage";

// Best (fastest) time per athlete for the given event/gender/classification.
export function bestTimesForFilter(
  results: RaceResult[],
  event: EventName,
  gender: Gender,
  classification: Classification
): RaceResult[] {
  const filtered = results.filter(
    (r) => r.event === event && r.gender === gender && r.classification === classification
  );
  const byAthlete = new Map<string, RaceResult>();
  for (const r of filtered) {
    const k = athleteKey(r.athleteName, r.school);
    const existing = byAthlete.get(k);
    if (!existing || r.timeSeconds < existing.timeSeconds) byAthlete.set(k, r);
  }
  return [...byAthlete.values()].sort((a, b) => a.timeSeconds - b.timeSeconds);
}

// Projected rank of a target time in the ranking.
// 1-indexed. Returns the rank the athlete would finish at.
export function projectedRank(
  ranked: RaceResult[],
  targetSeconds: number,
  exemptKey?: string
): number {
  const filtered = exemptKey
    ? ranked.filter((r) => athleteKey(r.athleteName, r.school) !== exemptKey)
    : ranked;
  let rank = 1;
  for (const r of filtered) {
    if (r.timeSeconds < targetSeconds) rank += 1;
    else break;
  }
  return rank;
}
