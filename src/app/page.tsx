"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardSection, Stat } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { allAthletes } from "@/lib/athletes";
import { pointsFor, runStreak, weeklyMiles } from "@/lib/gamification";
import { formatTime } from "@/lib/time";

export default function HomePage() {
  const { data } = useStore();
  const athletes = allAthletes(data);
  const activeAthlete = data.activeAthleteKey
    ? athletes.find((a) => a.key === data.activeAthleteKey)
    : null;
  const starredAthletes = athletes.filter(
    (a) => data.starred.includes(a.key) && a.key !== data.activeAthleteKey
  );
  const hasData = data.results.length > 0;

  return (
    <>
      <PageHeader
        title={activeAthlete ? `Hi, ${activeAthlete.name.split(" ")[0]}` : "Running Stats"}
        subtitle={
          activeAthlete
            ? `${activeAthlete.school} · ${activeAthlete.classification} ${
                activeAthlete.gender === "M" ? "Boys" : "Girls"
              }`
            : hasData
            ? `${athletes.length} athletes tracked`
            : "Get started"
        }
      />

      {activeAthlete && (
        <Link href={`/athlete/${encodeURIComponent(activeAthlete.key)}`}>
          <Card className="border-accent/40 bg-accent/5">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="text-xs uppercase tracking-wide text-accent">
                  Your stats
                </div>
                <div className="font-semibold truncate">{activeAthlete.name}</div>
              </div>
              {(() => {
                const best = Object.entries(activeAthlete.bestTimes).sort(
                  ([, a], [, b]) => (a ?? 0) - (b ?? 0)
                )[0];
                return best ? (
                  <div className="text-right">
                    <div className="text-[10px] uppercase text-muted tracking-wide">
                      {best[0]} PR
                    </div>
                    <div className="font-mono font-semibold tabular">
                      {formatTime(best[1] ?? NaN)}
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
            <div className="flex gap-4 mt-3">
              <Stat
                label="Points"
                value={pointsFor(data, activeAthlete.key).total}
                tone="accent"
              />
              <Stat
                label="Streak"
                value={`${runStreak(data.trainingLogs, activeAthlete.key)}d`}
                tone="warning"
              />
              <Stat
                label="Week"
                value={`${weeklyMiles(data.trainingLogs, activeAthlete.key).toFixed(1)} mi`}
                tone="success"
              />
            </div>
          </Card>
        </Link>
      )}

      {!hasData && (
        <Card className="flex flex-col gap-3">
          <div className="text-sm">
            Welcome! Upload a CSV of race results, load sample data, or star athletes to track them.
          </div>
          <div className="flex gap-2">
            <Link href="/rankings">
              <Button>Go to Rankings</Button>
            </Link>
            <Link href="/more">
              <Button variant="secondary">Manage data</Button>
            </Link>
          </div>
        </Card>
      )}

      {starredAthletes.length > 0 && (
        <CardSection title={activeAthlete ? "Also Tracking" : "Your Athletes"}>
          <div className="flex flex-col gap-2">
            {starredAthletes.map((a) => {
              const pts = pointsFor(data, a.key);
              const streak = runStreak(data.trainingLogs, a.key);
              const miles = weeklyMiles(data.trainingLogs, a.key);
              const bestEvent = Object.entries(a.bestTimes).sort(
                ([, ta], [, tb]) => (ta ?? 0) - (tb ?? 0)
              )[0];
              return (
                <Link key={a.key} href={`/athlete/${encodeURIComponent(a.key)}`}>
                  <Card>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-warning">★</span>
                          <span className="font-semibold truncate">{a.name}</span>
                        </div>
                        <div className="text-xs text-muted truncate">
                          {a.school} · {a.classification} · {a.gender === "M" ? "Boys" : "Girls"}
                        </div>
                      </div>
                      {bestEvent && (
                        <div className="text-right">
                          <div className="text-[10px] uppercase text-muted tracking-wide">
                            {bestEvent[0]} best
                          </div>
                          <div className="font-mono font-semibold tabular">
                            {formatTime(bestEvent[1] ?? NaN)}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-4 mt-3">
                      <Stat label="Points" value={pts.total} tone="accent" />
                      <Stat label="Streak" value={`${streak}d`} tone="warning" />
                      <Stat label="This Week" value={`${miles.toFixed(1)} mi`} tone="success" />
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </CardSection>
      )}

      <CardSection title="Quick Actions">
        <div className="grid grid-cols-2 gap-2">
          <QuickAction href="/log/new" label="Log a run" tone="training" />
          <QuickAction href="/checkin/morning" label="Morning check-in" tone="insights" />
          <QuickAction href="/checkin/evening" label="Evening check-in" tone="goals" />
          <QuickAction href="/goals/new" label="Set a goal" tone="rewards" />
        </div>
      </CardSection>

      <CardSection title="Explore">
        <div className="grid grid-cols-2 gap-2">
          <QuickAction href="/rankings" label="Rankings" tone="racing" />
          <QuickAction href="/stats" label="Trends" tone="insights" />
          <QuickAction href="/simulator" label="State Sim" tone="goals" />
          <QuickAction href="/parent" label="Parent" tone="rewards" />
        </div>
      </CardSection>
    </>
  );
}

function QuickAction({
  href,
  label,
  tone,
}: {
  href: string;
  label: string;
  tone: "training" | "racing" | "goals" | "insights" | "rewards";
}) {
  return (
    <Link href={href}>
      <Card className="h-full flex flex-col justify-between gap-3">
        <Chip tone={tone}>&nbsp;</Chip>
        <div className="font-semibold">{label}</div>
      </Card>
    </Link>
  );
}
