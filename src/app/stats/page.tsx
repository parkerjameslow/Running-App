"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardSection, Stat } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { MiniBarChart } from "@/components/MiniBarChart";
import { AthletePicker } from "@/components/AthletePicker";
import { useStore } from "@/lib/store";
import { athletesFromResults } from "@/lib/athletes";
import { computeBadgesFor, pointsFor, runStreak, weeklyMiles } from "@/lib/gamification";
import { dailyMileage, insightsFor, moodTrend } from "@/lib/insights";

export default function StatsPage() {
  const { data } = useStore();
  const athletes = useMemo(() => athletesFromResults(data.results), [data.results]);
  const defaultKey = data.starred.find((k) => athletes.some((a) => a.key === k)) ?? athletes[0]?.key ?? "";
  const [athleteKey, setAthleteKey] = useState(defaultKey);

  const pts = pointsFor(data, athleteKey);
  const streak = runStreak(data.trainingLogs, athleteKey);
  const miles = weeklyMiles(data.trainingLogs, athleteKey);
  const badges = computeBadgesFor(data, athleteKey);
  const insights = insightsFor(data, athleteKey);
  const mileage = dailyMileage(data.trainingLogs, athleteKey);
  const moods = moodTrend(data.morningCheckins, athleteKey);

  return (
    <>
      <PageHeader title="Trends & Insights" subtitle="Last 14 days" />

      {athletes.length === 0 ? (
        <Card className="text-sm text-muted text-center">
          No athletes yet. Upload race data to start tracking.
        </Card>
      ) : (
        <>
          <Card>
            <AthletePicker value={athleteKey} onChange={(k) => setAthleteKey(k)} />
          </Card>

          <Card>
            <div className="flex flex-wrap gap-4">
              <Stat label="Points" value={pts.total} tone="accent" sub={`+${pts.thisWeek} this week`} />
              <Stat label="Streak" value={`${streak}d`} tone="warning" />
              <Stat label="Week" value={`${miles.toFixed(1)} mi`} tone="success" />
              <Stat label="Badges" value={badges.length} tone="accent" />
            </div>
          </Card>

          <CardSection title="Training Volume">
            <Card>
              <MiniBarChart
                data={mileage.map((d) => ({ date: d.date, value: d.miles }))}
                label="Miles per day"
                tone="training"
              />
            </Card>
          </CardSection>

          <CardSection title="Mood">
            <Card>
              <MiniBarChart
                data={moods.map((d) => ({ date: d.date, value: d.mood ?? 0 }))}
                label="Morning mood (1-5)"
                tone="insights"
              />
            </Card>
          </CardSection>

          <CardSection title="Insights">
            {insights.length === 0 ? (
              <Card className="text-sm text-muted">
                Log a few runs and morning check-ins to unlock insights.
              </Card>
            ) : (
              <div className="flex flex-col gap-2">
                {insights.map((i, idx) => (
                  <Card key={idx}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-semibold">{i.label}</div>
                        <div className="text-sm text-muted mt-0.5">{i.detail}</div>
                      </div>
                      <Chip tone={i.tone === "warning" ? "warning" : i.tone === "success" ? "success" : "accent"}>
                        &nbsp;
                      </Chip>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardSection>

          {badges.length > 0 && (
            <CardSection title="Badges Earned">
              <Card>
                <div className="flex flex-wrap gap-2">
                  {badges.map((b) => (
                    <Chip key={b.kind} tone="rewards">
                      {b.label}
                    </Chip>
                  ))}
                </div>
              </Card>
            </CardSection>
          )}
        </>
      )}
    </>
  );
}
