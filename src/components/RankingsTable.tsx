"use client";

import type { Classification, EventName, Gender, RaceResult } from "@/lib/types";
import { STATE_FIELD_SIZE } from "@/lib/types";
import { formatTime } from "@/lib/time";
import { getQualifyingTime } from "@/lib/qualifiers";
import { athleteKey } from "@/lib/storage";

interface Props {
  results: RaceResult[];
  event: EventName;
  gender: Gender;
  classification: Classification;
  starred: Set<string>;
  onToggleStar: (key: string) => void;
}

// Best (fastest) time per athlete for the selected event/gender/classification.
function bestTimesForFilter(
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
    if (!existing || r.timeSeconds < existing.timeSeconds) {
      byAthlete.set(k, r);
    }
  }
  return [...byAthlete.values()].sort((a, b) => a.timeSeconds - b.timeSeconds);
}

export function RankingsTable({
  results,
  event,
  gender,
  classification,
  starred,
  onToggleStar,
}: Props) {
  const ranked = bestTimesForFilter(results, event, gender, classification);
  const qualTime = getQualifyingTime(classification, event, gender);
  const qualifiedCount = qualTime == null ? 0 : ranked.filter((r) => r.timeSeconds <= qualTime).length;
  const projectedCount = Math.min(ranked.length, STATE_FIELD_SIZE);

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-lg bg-neutral-900 border border-neutral-800 p-4 text-sm">
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <div>
            <div className="text-neutral-400 text-xs uppercase tracking-wide">State Qualifying Time</div>
            <div className="text-lg font-mono">
              {qualTime == null ? (
                <span className="text-neutral-500">Not set — edit src/lib/qualifiers.ts</span>
              ) : (
                formatTime(qualTime)
              )}
            </div>
          </div>
          <div className="flex gap-6">
            <div>
              <div className="text-neutral-400 text-xs uppercase tracking-wide">Qualified</div>
              <div className="text-lg font-semibold text-emerald-400">{qualifiedCount}</div>
            </div>
            <div>
              <div className="text-neutral-400 text-xs uppercase tracking-wide">Projected Field</div>
              <div className="text-lg font-semibold text-sky-400">
                {projectedCount} <span className="text-neutral-500 text-sm">/ {STATE_FIELD_SIZE}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {ranked.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-800 p-8 text-center text-neutral-500">
          No results for this filter yet. Upload a CSV or try different filters.
        </div>
      ) : (
        <ol className="divide-y divide-neutral-800 rounded-lg border border-neutral-800 overflow-hidden">
          {ranked.map((r, i) => {
            const rank = i + 1;
            const isQualified = qualTime != null && r.timeSeconds <= qualTime;
            const isProjected = !isQualified && rank <= STATE_FIELD_SIZE;
            const key = athleteKey(r.athleteName, r.school);
            const isStarred = starred.has(key);
            return (
              <li
                key={r.id}
                className={[
                  "flex items-center gap-3 p-3",
                  isStarred ? "bg-amber-500/10 border-l-4 border-l-amber-400" : "bg-neutral-900",
                ].join(" ")}
              >
                <div className="w-8 text-right font-mono text-neutral-400 tabular-nums">{rank}</div>
                <button
                  type="button"
                  onClick={() => onToggleStar(key)}
                  aria-label={isStarred ? "Unstar athlete" : "Star athlete"}
                  className={[
                    "w-8 h-8 flex items-center justify-center rounded-md text-lg",
                    isStarred ? "text-amber-400" : "text-neutral-600 hover:text-neutral-300",
                  ].join(" ")}
                >
                  {isStarred ? "★" : "☆"}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{r.athleteName}</div>
                  <div className="text-xs text-neutral-400 truncate">
                    {r.school} · {r.meetName || "—"} {r.date ? `· ${r.date}` : ""}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="font-mono font-semibold tabular-nums">{r.timeDisplay}</div>
                  {isQualified && (
                    <span className="text-[10px] uppercase tracking-wide font-semibold text-emerald-400">
                      Qualified
                    </span>
                  )}
                  {isProjected && (
                    <span className="text-[10px] uppercase tracking-wide font-semibold text-sky-400">
                      Projected
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
