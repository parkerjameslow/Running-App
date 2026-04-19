"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { Card, Stat } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { bestTimesForFilter } from "@/lib/rankings";
import { getQualifyingTime } from "@/lib/qualifiers";
import { athleteKey } from "@/lib/storage";
import { formatTime } from "@/lib/time";
import { STATE_FIELD_SIZE, type Classification, type EventName, type Gender } from "@/lib/types";

interface Props {
  event: EventName;
  gender: Gender;
  classification: Classification;
}

export function RankingsTable({ event, gender, classification }: Props) {
  const { data, update } = useStore();
  const starred = new Set(data.starred);
  const ranked = bestTimesForFilter(data.results, event, gender, classification);
  const qualTime = getQualifyingTime(classification, event, gender);
  const qualifiedCount =
    qualTime == null ? 0 : ranked.filter((r) => r.timeSeconds <= qualTime).length;
  const projectedCount = Math.min(ranked.length, STATE_FIELD_SIZE);

  function toggleStar(key: string) {
    update((prev) => ({
      ...prev,
      starred: prev.starred.includes(key)
        ? prev.starred.filter((k) => k !== key)
        : [...prev.starred, key],
    }));
  }

  return (
    <div className="flex flex-col gap-3">
      <Card>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <Stat
            label="Qualifying Time"
            value={qualTime == null ? "—" : formatTime(qualTime)}
            sub={qualTime == null ? "Not set" : `${classification} ${gender === "M" ? "Boys" : "Girls"} ${event}`}
            tone={qualTime == null ? "muted" : "accent"}
          />
          <Stat label="Qualified" value={qualifiedCount} tone="success" />
          <Stat
            label="Projected Field"
            value={
              <>
                {projectedCount}
                <span className="text-muted text-sm"> / {STATE_FIELD_SIZE}</span>
              </>
            }
            tone="accent"
          />
        </div>
      </Card>

      {ranked.length === 0 ? (
        <Card className="text-center text-muted">
          No results for this filter yet. Try different filters or upload a CSV.
        </Card>
      ) : (
        <ol className="flex flex-col gap-1.5">
          {ranked.map((r, i) => {
            const rank = i + 1;
            const isQualified = qualTime != null && r.timeSeconds <= qualTime;
            const isProjected = !isQualified && rank <= STATE_FIELD_SIZE;
            const key = athleteKey(r.athleteName, r.school);
            const isStarred = starred.has(key);
            return (
              <li
                key={r.id}
                className={`flex items-center gap-3 p-3 rounded-xl border ${
                  isStarred
                    ? "bg-warning/10 border-warning/40"
                    : "bg-card border-card-border"
                }`}
              >
                <div className="w-7 text-center font-mono text-muted tabular">{rank}</div>
                <button
                  type="button"
                  onClick={() => toggleStar(key)}
                  aria-label={isStarred ? "Unstar" : "Star"}
                  className={`w-8 h-8 flex items-center justify-center rounded-md text-lg ${
                    isStarred ? "text-warning" : "text-muted hover:text-foreground"
                  }`}
                >
                  {isStarred ? "★" : "☆"}
                </button>
                <Link
                  href={`/athlete/${encodeURIComponent(key)}`}
                  className="flex-1 min-w-0"
                >
                  <div className="font-medium truncate">{r.athleteName}</div>
                  <div className="text-xs text-muted truncate">
                    {r.school}
                    {r.meetName ? ` · ${r.meetName}` : ""}
                    {r.date ? ` · ${r.date}` : ""}
                  </div>
                </Link>
                <div className="flex flex-col items-end gap-1">
                  <div className="font-mono font-semibold tabular">{r.timeDisplay}</div>
                  {isQualified && <Chip tone="success">Qualified</Chip>}
                  {isProjected && <Chip tone="accent">Projected</Chip>}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
