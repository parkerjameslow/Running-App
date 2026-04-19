import type { AppData, Badge, TrainingLog } from "./types";
import { uid } from "./store";

export interface PointsBreakdown {
  total: number;
  lastMonth: number;
  thisWeek: number;
}

export function pointsFor(data: AppData, athleteKey: string): PointsBreakdown {
  const mine = data.points.filter((p) => p.athleteKey === athleteKey);
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 7);
  const monthAgo = new Date(now);
  monthAgo.setMonth(now.getMonth() - 1);

  let total = 0;
  let thisWeek = 0;
  let lastMonth = 0;
  for (const p of mine) {
    total += p.points;
    const d = new Date(p.date);
    if (d >= weekAgo) thisWeek += p.points;
    if (d >= monthAgo) lastMonth += p.points;
  }
  return { total, thisWeek, lastMonth };
}

// Current streak: consecutive days (counting today or yesterday as the anchor) with a run logged.
export function runStreak(logs: TrainingLog[], athleteKey: string): number {
  const mine = logs.filter((l) => l.athleteKey === athleteKey);
  if (mine.length === 0) return 0;
  const days = new Set(mine.map((l) => l.date));
  let streak = 0;
  const cur = new Date();
  // allow today or yesterday to start the streak
  if (!days.has(cur.toISOString().slice(0, 10))) {
    cur.setDate(cur.getDate() - 1);
    if (!days.has(cur.toISOString().slice(0, 10))) return 0;
  }
  while (days.has(cur.toISOString().slice(0, 10))) {
    streak += 1;
    cur.setDate(cur.getDate() - 1);
  }
  return streak;
}

export function weeklyMiles(logs: TrainingLog[], athleteKey: string): number {
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 7);
  return logs
    .filter((l) => l.athleteKey === athleteKey && new Date(l.date) >= weekAgo)
    .reduce((sum, l) => sum + (l.distanceMiles || 0), 0);
}

// Compute badges an athlete has earned based on their data.
export function computeBadgesFor(data: AppData, athleteKey: string): Badge[] {
  const logs = data.trainingLogs.filter((l) => l.athleteKey === athleteKey);
  const earned: Badge[] = [];

  const streak = runStreak(data.trainingLogs, athleteKey);
  const today = new Date().toISOString().slice(0, 10);

  const award = (kind: string, label: string, meta?: string) => {
    const existing = data.badges.find((b) => b.athleteKey === athleteKey && b.kind === kind);
    if (existing) earned.push(existing);
    else earned.push({ id: uid(), athleteKey, kind, label, meta, earnedAt: today });
  };

  if (logs.length >= 1) award("first-run", "First Run");
  if (streak >= 3) award("3-day-streak", "3-Day Streak");
  if (streak >= 5) award("5-day-streak", "5-Day Streak");
  if (streak >= 10) award("10-day-streak", "10-Day Streak");

  const weekly = weeklyMiles(data.trainingLogs, athleteKey);
  if (weekly >= 20) award("20-mile-week", "20-Mile Week");
  if (weekly >= 30) award("30-mile-week", "30-Mile Week");
  if (weekly >= 50) award("50-mile-week", "50-Mile Week");

  const hydrationDays = data.morningCheckins.filter(
    (c) => c.athleteKey === athleteKey && c.hydration >= 4
  ).length;
  if (hydrationDays >= 7) award("hydration-hero", "Hydration Hero");

  const sleepDays = data.morningCheckins.filter(
    (c) => c.athleteKey === athleteKey && c.hoursSlept >= 8
  ).length;
  if (sleepDays >= 7) award("well-rested", "Well-Rested");

  return earned;
}

// How many points should an action earn?
export const POINTS = {
  logRun: 10,
  morningCheckin: 5,
  eveningCheckin: 5,
  newPr: 50,
  hitWeeklyMileage: 25,
  badge: 20,
};
