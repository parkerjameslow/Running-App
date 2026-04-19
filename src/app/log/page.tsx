"use client";

import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardSection, Stat } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { useStore } from "@/lib/store";
import { allAthletes } from "@/lib/athletes";
import { runStreak, weeklyMiles } from "@/lib/gamification";

export default function LogPage() {
  const { data } = useStore();
  const athletes = allAthletes(data);
  const starredAthletes = athletes.filter((a) => data.starred.includes(a.key));
  const displayed = starredAthletes.length > 0 ? starredAthletes : athletes.slice(0, 5);

  const recent = [...data.trainingLogs]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 10);

  return (
    <>
      <PageHeader
        title="Training Log"
        subtitle={`${data.trainingLogs.length} run${data.trainingLogs.length === 1 ? "" : "s"} logged`}
        action={
          <Link href="/log/new">
            <Button size="sm">+ Log</Button>
          </Link>
        }
      />

      <CardSection title="Quick Actions">
        <div className="grid grid-cols-2 gap-2">
          <Link href="/log/new">
            <Card className="flex flex-col gap-1">
              <Chip tone="training">Run</Chip>
              <div className="font-semibold text-sm">Log a run</div>
            </Card>
          </Link>
          <Link href="/checkin/morning">
            <Card className="flex flex-col gap-1">
              <Chip tone="insights">Morning</Chip>
              <div className="font-semibold text-sm">Check in</div>
            </Card>
          </Link>
          <Link href="/checkin/evening">
            <Card className="flex flex-col gap-1">
              <Chip tone="goals">Evening</Chip>
              <div className="font-semibold text-sm">Reflect</div>
            </Card>
          </Link>
          <Link href="/stats">
            <Card className="flex flex-col gap-1">
              <Chip tone="insights">Trends</Chip>
              <div className="font-semibold text-sm">View stats</div>
            </Card>
          </Link>
        </div>
      </CardSection>

      {displayed.length > 0 && (
        <CardSection title="Athletes">
          <div className="flex flex-col gap-2">
            {displayed.map((a) => {
              const streak = runStreak(data.trainingLogs, a.key);
              const miles = weeklyMiles(data.trainingLogs, a.key);
              return (
                <Link key={a.key} href={`/athlete/${encodeURIComponent(a.key)}`}>
                  <Card>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{a.name}</div>
                        <div className="text-xs text-muted">{a.school}</div>
                      </div>
                      <div className="flex gap-4">
                        <Stat label="Streak" value={`${streak}d`} tone="warning" />
                        <Stat label="Week" value={`${miles.toFixed(1)} mi`} tone="success" />
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </CardSection>
      )}

      <CardSection title="Recent Runs">
        {recent.length === 0 ? (
          <Card className="text-sm text-muted text-center">
            No runs yet. Tap “Log a run” above.
          </Card>
        ) : (
          <div className="flex flex-col gap-2">
            {recent.map((l) => {
              const athlete = athletes.find((a) => a.key === l.athleteKey);
              return (
                <Card key={l.id}>
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <div className="font-semibold capitalize truncate">
                        {l.runType} · {l.distanceMiles} mi
                      </div>
                      <div className="text-xs text-muted truncate">
                        {l.date} · {Math.round(l.durationSeconds / 60)} min
                        {athlete ? ` · ${athlete.name}` : ""}
                      </div>
                    </div>
                    <Chip tone="training">+10</Chip>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </CardSection>
    </>
  );
}
