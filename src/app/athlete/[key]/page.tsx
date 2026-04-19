"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useMemo } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardSection, Stat } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { useStore } from "@/lib/store";
import { athletesFromResults, resultsForAthlete } from "@/lib/athletes";
import { computeBadgesFor, pointsFor, runStreak, weeklyMiles } from "@/lib/gamification";
import { formatTime } from "@/lib/time";

export default function AthletePage() {
  const params = useParams<{ key: string }>();
  const key = decodeURIComponent(params.key);
  const { data, update, hydrated } = useStore();

  const athlete = useMemo(
    () => athletesFromResults(data.results).find((a) => a.key === key),
    [data.results, key]
  );

  if (hydrated && !athlete) return notFound();
  if (!athlete) return null;

  const isStarred = data.starred.includes(key);
  const pts = pointsFor(data, key);
  const streak = runStreak(data.trainingLogs, key);
  const miles = weeklyMiles(data.trainingLogs, key);
  const badges = computeBadgesFor(data, key);
  const races = resultsForAthlete(data.results, key);
  const goals = data.goals.filter((g) => g.athleteKey === key);
  const recentLogs = data.trainingLogs
    .filter((l) => l.athleteKey === key)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  function toggleStar() {
    update((prev) => ({
      ...prev,
      starred: isStarred ? prev.starred.filter((k) => k !== key) : [...prev.starred, key],
    }));
  }

  return (
    <>
      <PageHeader
        title={athlete.name}
        subtitle={`${athlete.school} · ${athlete.classification} · ${
          athlete.gender === "M" ? "Boys" : "Girls"
        }`}
        action={
          <Button
            variant={isStarred ? "primary" : "secondary"}
            size="sm"
            onClick={toggleStar}
          >
            {isStarred ? "★ Starred" : "☆ Star"}
          </Button>
        }
      />

      <Card>
        <div className="flex flex-wrap gap-4">
          <Stat label="Points" value={pts.total} tone="accent" sub={`${pts.thisWeek} this week`} />
          <Stat label="Streak" value={`${streak}d`} tone="warning" />
          <Stat label="Wk Miles" value={miles.toFixed(1)} tone="success" />
          <Stat label="Badges" value={badges.length} tone="accent" />
        </div>
      </Card>

      <CardSection
        title="Personal Bests"
        action={
          <Link href={`/goals/new?athlete=${encodeURIComponent(key)}`}>
            <Chip tone="goals">+ Goal</Chip>
          </Link>
        }
      >
        <Card>
          {Object.keys(athlete.bestTimes).length === 0 ? (
            <div className="text-sm text-muted">No race results yet.</div>
          ) : (
            <ul className="divide-y divide-card-border">
              {Object.entries(athlete.bestTimes)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([ev, secs]) => (
                  <li key={ev} className="flex items-center justify-between py-2">
                    <span className="font-medium">{ev}</span>
                    <span className="font-mono tabular">{formatTime(secs ?? NaN)}</span>
                  </li>
                ))}
            </ul>
          )}
        </Card>
      </CardSection>

      {goals.length > 0 && (
        <CardSection title="Goals">
          <div className="flex flex-col gap-2">
            {goals.map((g) => (
              <Card key={g.id}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{g.event}</div>
                    <div className="text-xs text-muted">{g.notes || "—"}</div>
                  </div>
                  <div className="font-mono tabular font-semibold">{g.targetTimeDisplay}</div>
                </div>
              </Card>
            ))}
          </div>
        </CardSection>
      )}

      <CardSection
        title="Recent Training"
        action={
          <Link href={`/log/new?athlete=${encodeURIComponent(key)}`}>
            <Chip tone="training">+ Log</Chip>
          </Link>
        }
      >
        {recentLogs.length === 0 ? (
          <Card className="text-sm text-muted">No runs logged yet.</Card>
        ) : (
          <div className="flex flex-col gap-2">
            {recentLogs.map((l) => (
              <Card key={l.id}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium capitalize">{l.runType} run</div>
                    <div className="text-xs text-muted">
                      {l.date} · {l.distanceMiles} mi · {Math.round(l.durationSeconds / 60)} min
                    </div>
                  </div>
                  {l.mood != null && <div className="text-2xl">{moodEmoji(l.mood)}</div>}
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardSection>

      <CardSection title="Race History">
        {races.length === 0 ? (
          <Card className="text-sm text-muted">No races yet.</Card>
        ) : (
          <Card>
            <ul className="divide-y divide-card-border">
              {races.map((r) => (
                <li key={r.id} className="flex items-center justify-between py-2">
                  <div className="min-w-0">
                    <div className="text-sm font-medium">{r.event}</div>
                    <div className="text-xs text-muted truncate">
                      {r.meetName} · {r.date}
                    </div>
                  </div>
                  <div className="font-mono tabular">{r.timeDisplay}</div>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </CardSection>

      {badges.length > 0 && (
        <CardSection title="Badges">
          <div className="flex flex-wrap gap-2">
            {badges.map((b) => (
              <Chip key={b.kind} tone="rewards">
                {b.label}
              </Chip>
            ))}
          </div>
        </CardSection>
      )}
    </>
  );
}

function moodEmoji(mood: number): string {
  if (mood >= 5) return "🔥";
  if (mood >= 4) return "😄";
  if (mood >= 3) return "🙂";
  if (mood >= 2) return "😕";
  return "😩";
}
