"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AthletePicker } from "@/components/AthletePicker";
import { useStore, uid, today } from "@/lib/store";
import { athletesFromResults } from "@/lib/athletes";
import { POINTS } from "@/lib/gamification";
import { RUN_TYPES, type RunType } from "@/lib/types";

export default function NewLogPage() {
  return (
    <Suspense fallback={null}>
      <NewLogForm />
    </Suspense>
  );
}

function NewLogForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const { data, update } = useStore();
  const athletes = useMemo(() => athletesFromResults(data.results), [data.results]);

  const initialKey = sp.get("athlete") ?? athletes[0]?.key ?? "";
  const [athleteKey, setAthleteKey] = useState(initialKey);
  const [date, setDate] = useState(today());
  const [distance, setDistance] = useState("");
  const [minutes, setMinutes] = useState("");
  const [runType, setRunType] = useState<RunType>("easy");
  const [ranWith, setRanWith] = useState("");
  const [weather, setWeather] = useState("");
  const [mood, setMood] = useState<number | null>(null);
  const [notes, setNotes] = useState("");

  function save() {
    if (!athleteKey) return;
    const dist = parseFloat(distance);
    const mins = parseFloat(minutes);
    if (!Number.isFinite(dist) || !Number.isFinite(mins)) return;

    update((prev) => ({
      ...prev,
      trainingLogs: [
        ...prev.trainingLogs,
        {
          id: uid(),
          date,
          athleteKey,
          distanceMiles: dist,
          durationSeconds: Math.round(mins * 60),
          runType,
          ranWith: ranWith || undefined,
          weather: weather || undefined,
          mood: mood ?? undefined,
          notes: notes || undefined,
          createdAt: new Date().toISOString(),
        },
      ],
      points: [
        ...prev.points,
        {
          id: uid(),
          athleteKey,
          points: POINTS.logRun,
          reason: "Logged a run",
          date,
          createdAt: new Date().toISOString(),
        },
      ],
    }));
    router.push("/log");
  }

  return (
    <>
      <PageHeader title="Log a Run" subtitle={`+${POINTS.logRun} points`} />

      <Card className="flex flex-col gap-3">
        <Label>Athlete</Label>
        <AthletePicker
          value={athleteKey}
          onChange={(k) => setAthleteKey(k)}
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Date</Label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full mt-1 bg-card border border-card-border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <Label>Type</Label>
            <select
              value={runType}
              onChange={(e) => setRunType(e.target.value as RunType)}
              className="w-full mt-1 bg-card border border-card-border rounded-lg px-3 py-2 text-sm capitalize"
            >
              {RUN_TYPES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Distance (mi)</Label>
            <input
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              inputMode="decimal"
              placeholder="5.0"
              className="w-full mt-1 bg-card border border-card-border rounded-lg px-3 py-2 text-sm font-mono"
            />
          </div>
          <div>
            <Label>Time (min)</Label>
            <input
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              inputMode="decimal"
              placeholder="40"
              className="w-full mt-1 bg-card border border-card-border rounded-lg px-3 py-2 text-sm font-mono"
            />
          </div>
        </div>

        <Label>Mood after the run</Label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMood(m === mood ? null : m)}
              className={`flex-1 py-2 rounded-lg border text-2xl ${
                mood === m
                  ? "bg-accent/15 border-accent"
                  : "bg-card border-card-border"
              }`}
            >
              {["😩", "😕", "🙂", "😄", "🔥"][m - 1]}
            </button>
          ))}
        </div>

        <Label>Ran with</Label>
        <input
          value={ranWith}
          onChange={(e) => setRanWith(e.target.value)}
          placeholder="Team, coach, solo…"
          className="bg-card border border-card-border rounded-lg px-3 py-2 text-sm"
        />

        <Label>Weather</Label>
        <input
          value={weather}
          onChange={(e) => setWeather(e.target.value)}
          placeholder="Sunny 65°F"
          className="bg-card border border-card-border rounded-lg px-3 py-2 text-sm"
        />

        <Label>Reflection</Label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="How did it feel?"
          className="bg-card border border-card-border rounded-lg px-3 py-2 text-sm"
        />
      </Card>

      <div className="flex gap-2">
        <Button
          onClick={save}
          disabled={!athleteKey || !distance || !minutes}
        >
          Save run
        </Button>
        <Button variant="ghost" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-xs text-muted">{children}</label>;
}
