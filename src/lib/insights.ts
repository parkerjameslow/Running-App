import type { AppData, MorningCheckin, TrainingLog } from "./types";

// Simple Pearson correlation. Returns NaN if not enough data.
function corr(xs: number[], ys: number[]): number {
  const n = Math.min(xs.length, ys.length);
  if (n < 3) return NaN;
  const mx = xs.slice(0, n).reduce((a, b) => a + b, 0) / n;
  const my = ys.slice(0, n).reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let dx = 0;
  let dy = 0;
  for (let i = 0; i < n; i++) {
    const a = xs[i] - mx;
    const b = ys[i] - my;
    num += a * b;
    dx += a * a;
    dy += b * b;
  }
  const denom = Math.sqrt(dx * dy);
  return denom === 0 ? NaN : num / denom;
}

export interface Insight {
  label: string;
  detail: string;
  tone: "success" | "warning" | "muted" | "accent";
}

export function insightsFor(data: AppData, athleteKey: string): Insight[] {
  const logs = data.trainingLogs.filter((l) => l.athleteKey === athleteKey);
  const mornings = data.morningCheckins.filter((c) => c.athleteKey === athleteKey);

  const insights: Insight[] = [];

  if (logs.length >= 3) {
    const totalMiles = logs.reduce((s, l) => s + (l.distanceMiles || 0), 0);
    const avgMiles = totalMiles / logs.length;
    insights.push({
      label: "Training volume",
      detail: `${totalMiles.toFixed(1)} miles over ${logs.length} runs (avg ${avgMiles.toFixed(1)} mi/run)`,
      tone: "accent",
    });
  }

  if (mornings.length >= 3 && logs.length >= 3) {
    // Match each run to the morning check-in on the same date.
    const pairs: { sleep: number; mood: number; hydration: number; perf: number }[] = [];
    for (const log of logs) {
      const m = mornings.find((c) => c.date === log.date);
      if (m && log.mood != null) {
        pairs.push({
          sleep: m.hoursSlept,
          mood: m.mood,
          hydration: m.hydration,
          perf: log.mood,
        });
      }
    }

    if (pairs.length >= 3) {
      const sleepCorr = corr(
        pairs.map((p) => p.sleep),
        pairs.map((p) => p.perf)
      );
      const hydrCorr = corr(
        pairs.map((p) => p.hydration),
        pairs.map((p) => p.perf)
      );

      if (Number.isFinite(sleepCorr)) {
        if (sleepCorr > 0.3) {
          insights.push({
            label: "Sleep helps performance",
            detail: `Runs feel better when you sleep more (r=${sleepCorr.toFixed(2)})`,
            tone: "success",
          });
        } else if (sleepCorr < -0.3) {
          insights.push({
            label: "Sleep pattern unclear",
            detail: `No positive sleep → performance link yet (r=${sleepCorr.toFixed(2)})`,
            tone: "warning",
          });
        }
      }

      if (Number.isFinite(hydrCorr) && hydrCorr > 0.3) {
        insights.push({
          label: "Hydration matters",
          detail: `Better hydration tracks with better runs (r=${hydrCorr.toFixed(2)})`,
          tone: "success",
        });
      }
    }

    const avgSleep = mornings.reduce((s, c) => s + c.hoursSlept, 0) / mornings.length;
    if (avgSleep < 7.5) {
      insights.push({
        label: "Sleep tip",
        detail: `Averaging ${avgSleep.toFixed(1)}h — aim for 8+ for better training`,
        tone: "warning",
      });
    } else if (avgSleep >= 8) {
      insights.push({
        label: "Great sleep habits",
        detail: `Averaging ${avgSleep.toFixed(1)}h — keep it up`,
        tone: "success",
      });
    }
  }

  // Run type distribution
  if (logs.length >= 5) {
    const byType = new Map<string, number>();
    for (const l of logs) byType.set(l.runType, (byType.get(l.runType) ?? 0) + 1);
    const easy = byType.get("easy") ?? 0;
    const hard = (byType.get("tempo") ?? 0) + (byType.get("intervals") ?? 0);
    if (hard > 0 && easy / Math.max(hard, 1) < 1.5) {
      insights.push({
        label: "Balance your intensity",
        detail: `More easy runs vs hard sessions (${easy}:${hard} so far) builds aerobic base`,
        tone: "warning",
      });
    }
  }

  return insights;
}

export function dailyMileage(logs: TrainingLog[], athleteKey: string, days = 14): { date: string; miles: number }[] {
  const mine = logs.filter((l) => l.athleteKey === athleteKey);
  const out: { date: string; miles: number }[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const miles = mine.filter((l) => l.date === iso).reduce((s, l) => s + l.distanceMiles, 0);
    out.push({ date: iso, miles });
  }
  return out;
}

export function moodTrend(mornings: MorningCheckin[], athleteKey: string, days = 14): { date: string; mood: number | null }[] {
  const mine = mornings.filter((c) => c.athleteKey === athleteKey);
  const out: { date: string; mood: number | null }[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const entry = mine.find((c) => c.date === iso);
    out.push({ date: iso, mood: entry?.mood ?? null });
  }
  return out;
}
