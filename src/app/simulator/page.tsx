"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardSection } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { useStore } from "@/lib/store";
import { simulateMeet, INDIVIDUAL_SCORING } from "@/lib/simulator";
import {
  CLASSIFICATIONS,
  EVENTS,
  type Classification,
  type EventName,
  type Gender,
} from "@/lib/types";

// Only track events for the simulator (not XC distances).
const TRACK_EVENTS: EventName[] = ["100m", "200m", "400m", "800m", "1600m", "3200m"];

export default function SimulatorPage() {
  const { data } = useStore();
  const [gender, setGender] = useState<Gender>("M");
  const [classification, setClassification] = useState<Classification>("6A");

  const sim = useMemo(
    () => simulateMeet(data.results, gender, classification, TRACK_EVENTS),
    [data.results, gender, classification]
  );

  return (
    <>
      <PageHeader title="State Meet Simulator" subtitle="Best times → team scores" />

      <Card>
        <div className="flex flex-wrap gap-2">
          <div className="flex rounded-lg overflow-hidden border border-card-border bg-card">
            {(["M", "F"] as Gender[]).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGender(g)}
                className={`px-3 py-1.5 text-sm ${
                  gender === g ? "bg-foreground text-background font-semibold" : "text-muted"
                }`}
              >
                {g === "M" ? "Boys" : "Girls"}
              </button>
            ))}
          </div>
          <div className="flex rounded-lg overflow-hidden border border-card-border bg-card">
            {CLASSIFICATIONS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setClassification(c)}
                className={`px-3 py-1.5 text-sm ${
                  classification === c
                    ? "bg-foreground text-background font-semibold"
                    : "text-muted"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="text-xs text-muted mt-2">
          Scoring: {INDIVIDUAL_SCORING.join("-")} (top 8 per event)
        </div>
      </Card>

      <CardSection title="Team Standings">
        {sim.teamStandings.length === 0 ? (
          <Card className="text-sm text-muted">No results for this selection.</Card>
        ) : (
          <Card>
            <ol className="flex flex-col gap-1">
              {sim.teamStandings.map((t, i) => (
                <li
                  key={t.school}
                  className="flex items-center justify-between py-1.5 border-b border-card-border last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <span className={`font-mono w-6 text-right ${i === 0 ? "text-warning" : "text-muted"}`}>
                      {i + 1}
                    </span>
                    <span className="font-medium truncate">{t.school}</span>
                    {i === 0 && <Chip tone="warning">Champion</Chip>}
                  </div>
                  <span className="font-mono font-semibold tabular">{t.totalPoints}</span>
                </li>
              ))}
            </ol>
          </Card>
        )}
      </CardSection>

      <CardSection title="Event Winners">
        <div className="flex flex-col gap-2">
          {sim.eventResults.map((er) => (
            <Card key={er.event}>
              <div className="flex items-center justify-between">
                <div className="font-semibold">{er.event}</div>
                <Chip tone="racing">{er.placements.length} scoring</Chip>
              </div>
              {er.placements.length === 0 ? (
                <div className="text-sm text-muted mt-2">No data</div>
              ) : (
                <ol className="mt-2 flex flex-col gap-1">
                  {er.placements.slice(0, 3).map((p) => (
                    <li
                      key={p.result.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="flex items-center gap-2 min-w-0">
                        <span className="font-mono text-muted w-4">{p.rank}</span>
                        <span className="truncate">
                          {p.result.athleteName}
                          <span className="text-muted"> · {p.result.school}</span>
                        </span>
                      </span>
                      <span className="flex items-center gap-2 font-mono tabular">
                        <span>{p.result.timeDisplay}</span>
                        <span className="text-warning text-xs">+{p.points}</span>
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </Card>
          ))}
        </div>
      </CardSection>
    </>
  );
}
