"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardSection, Stat } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { AthletePicker } from "@/components/AthletePicker";
import { useStore, uid, today } from "@/lib/store";
import { allAthletes } from "@/lib/athletes";
import { pointsFor, runStreak, weeklyMiles } from "@/lib/gamification";

export default function ParentPage() {
  const { data, update } = useStore();
  const athletes = useMemo(() => allAthletes(data), [data.results]);
  const starred = athletes.filter((a) => data.starred.includes(a.key));
  const kids = starred.length > 0 ? starred : athletes.slice(0, 5);

  const [rewardAthleteKey, setRewardAthleteKey] = useState(kids[0]?.key ?? "");
  const [rewardTitle, setRewardTitle] = useState("");
  const [rewardPoints, setRewardPoints] = useState(100);
  const [rewardKind, setRewardKind] = useState<"monetary" | "custom">("custom");

  function addReward() {
    if (!rewardAthleteKey || !rewardTitle.trim() || !rewardPoints) return;
    update((prev) => ({
      ...prev,
      rewards: [
        ...prev.rewards,
        {
          id: uid(),
          athleteKey: rewardAthleteKey,
          title: rewardTitle.trim(),
          pointsRequired: rewardPoints,
          kind: rewardKind,
          redeemed: false,
          createdAt: today(),
        },
      ],
    }));
    setRewardTitle("");
  }

  function redeemReward(rewardId: string, athleteKey: string, cost: number) {
    update((prev) => {
      const reward = prev.rewards.find((r) => r.id === rewardId);
      if (!reward || reward.redeemed) return prev;
      return {
        ...prev,
        rewards: prev.rewards.map((r) =>
          r.id === rewardId ? { ...r, redeemed: true, redeemedAt: today() } : r
        ),
        points: [
          ...prev.points,
          {
            id: uid(),
            athleteKey,
            points: -cost,
            reason: `Redeemed: ${reward.title}`,
            date: today(),
            createdAt: new Date().toISOString(),
          },
        ],
      };
    });
  }

  function deleteReward(id: string) {
    update((prev) => ({ ...prev, rewards: prev.rewards.filter((r) => r.id !== id) }));
  }

  return (
    <>
      <PageHeader title="Parent Dashboard" subtitle="Manage kids, points, and rewards" />

      {kids.length === 0 ? (
        <Card className="text-sm text-muted text-center">
          Star your kids in Rankings to see them here.
        </Card>
      ) : (
        <CardSection title="Your Kids">
          <div className="flex flex-col gap-2">
            {kids.map((a) => {
              const pts = pointsFor(data, a.key);
              const streak = runStreak(data.trainingLogs, a.key);
              const miles = weeklyMiles(data.trainingLogs, a.key);
              const runs = data.trainingLogs.filter((l) => l.athleteKey === a.key).length;
              const checkIns =
                data.morningCheckins.filter((c) => c.athleteKey === a.key).length +
                data.eveningCheckins.filter((c) => c.athleteKey === a.key).length;

              return (
                <Card key={a.key}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{a.name}</div>
                      <div className="text-xs text-muted">{a.school}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-3 mt-3">
                    <Stat label="Pts" value={pts.total} tone="accent" />
                    <Stat label="Streak" value={`${streak}d`} tone="warning" />
                    <Stat label="Wk mi" value={miles.toFixed(1)} tone="success" />
                    <Stat label="Logs" value={runs + checkIns} tone="muted" />
                  </div>
                </Card>
              );
            })}
          </div>
        </CardSection>
      )}

      <CardSection title="Create a Reward">
        <Card className="flex flex-col gap-3">
          <label className="text-xs text-muted">Athlete</label>
          <AthletePicker value={rewardAthleteKey} onChange={(k) => setRewardAthleteKey(k)} />

          <label className="text-xs text-muted">Reward</label>
          <input
            value={rewardTitle}
            onChange={(e) => setRewardTitle(e.target.value)}
            placeholder="1 hr Xbox time"
            className="bg-card border border-card-border rounded-lg px-3 py-2 text-sm"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted">Points cost</label>
              <input
                type="number"
                value={rewardPoints}
                onChange={(e) => setRewardPoints(parseInt(e.target.value) || 0)}
                className="w-full mt-1 bg-card border border-card-border rounded-lg px-3 py-2 text-sm font-mono"
              />
            </div>
            <div>
              <label className="text-xs text-muted">Type</label>
              <select
                value={rewardKind}
                onChange={(e) => setRewardKind(e.target.value as "monetary" | "custom")}
                className="w-full mt-1 bg-card border border-card-border rounded-lg px-3 py-2 text-sm capitalize"
              >
                <option value="custom">Custom</option>
                <option value="monetary">Monetary</option>
              </select>
            </div>
          </div>

          <Button onClick={addReward} disabled={!rewardAthleteKey || !rewardTitle.trim()}>
            Add reward
          </Button>
        </Card>
      </CardSection>

      <CardSection title="Available Rewards">
        {data.rewards.length === 0 ? (
          <Card className="text-sm text-muted">No rewards yet.</Card>
        ) : (
          <div className="flex flex-col gap-2">
            {data.rewards.map((r) => {
              const athlete = athletes.find((a) => a.key === r.athleteKey);
              const pts = pointsFor(data, r.athleteKey).total;
              const canRedeem = !r.redeemed && pts >= r.pointsRequired;
              return (
                <Card key={r.id}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-semibold truncate">{r.title}</div>
                      <div className="text-xs text-muted truncate">
                        {athlete?.name ?? "—"} · {r.pointsRequired} pts · {r.kind}
                      </div>
                      {r.redeemed && (
                        <Chip tone="success" className="mt-1">
                          Redeemed {r.redeemedAt}
                        </Chip>
                      )}
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      {!r.redeemed && (
                        <Button
                          size="sm"
                          variant={canRedeem ? "primary" : "secondary"}
                          disabled={!canRedeem}
                          onClick={() => redeemReward(r.id, r.athleteKey, r.pointsRequired)}
                        >
                          Redeem
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => deleteReward(r.id)}>
                        ×
                      </Button>
                    </div>
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
