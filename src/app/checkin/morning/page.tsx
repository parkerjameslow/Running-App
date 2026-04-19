"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AthletePicker } from "@/components/AthletePicker";
import { useStore, uid, today } from "@/lib/store";
import { athletesFromResults } from "@/lib/athletes";
import { POINTS } from "@/lib/gamification";

export default function MorningCheckinPage() {
  const router = useRouter();
  const { data, update } = useStore();
  const athletes = useMemo(() => athletesFromResults(data.results), [data.results]);
  const [athleteKey, setAthleteKey] = useState(athletes[0]?.key ?? "");
  const [sleepQuality, setSleepQuality] = useState(4);
  const [hoursSlept, setHoursSlept] = useState(8);
  const [hydration, setHydration] = useState(3);
  const [mood, setMood] = useState(4);
  const [readiness, setReadiness] = useState(4);

  function save() {
    if (!athleteKey) return;
    const date = today();
    update((prev) => ({
      ...prev,
      morningCheckins: [
        ...prev.morningCheckins.filter(
          (c) => !(c.athleteKey === athleteKey && c.date === date)
        ),
        {
          id: uid(),
          athleteKey,
          date,
          sleepQuality,
          hoursSlept,
          hydration,
          mood,
          readiness,
          createdAt: new Date().toISOString(),
        },
      ],
      points: [
        ...prev.points,
        {
          id: uid(),
          athleteKey,
          points: POINTS.morningCheckin,
          reason: "Morning check-in",
          date,
          createdAt: new Date().toISOString(),
        },
      ],
    }));
    router.push("/log");
  }

  return (
    <>
      <PageHeader title="Morning Check-In" subtitle={`+${POINTS.morningCheckin} points`} />

      <Card className="flex flex-col gap-4">
        <div>
          <label className="text-xs text-muted">Athlete</label>
          <div className="mt-1">
            <AthletePicker value={athleteKey} onChange={(k) => setAthleteKey(k)} />
          </div>
        </div>

        <Slider label="Sleep quality" value={sleepQuality} onChange={setSleepQuality} />

        <div>
          <label className="text-xs text-muted">Hours slept: {hoursSlept}h</label>
          <input
            type="range"
            min={4}
            max={12}
            step={0.5}
            value={hoursSlept}
            onChange={(e) => setHoursSlept(parseFloat(e.target.value))}
            className="w-full mt-1 accent-accent"
          />
        </div>

        <Slider label="Hydration level" value={hydration} onChange={setHydration} />
        <Slider label="Mood" value={mood} onChange={setMood} icons={["😩", "😕", "🙂", "😄", "🔥"]} />
        <Slider label="Readiness to train" value={readiness} onChange={setReadiness} />
      </Card>

      <div className="flex gap-2">
        <Button onClick={save} disabled={!athleteKey}>
          Save check-in
        </Button>
        <Button variant="ghost" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </>
  );
}

function Slider({
  label,
  value,
  onChange,
  icons,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  icons?: string[];
}) {
  return (
    <div>
      <label className="text-xs text-muted">{label}</label>
      <div className="flex gap-2 mt-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`flex-1 py-2 rounded-lg border text-lg ${
              value === n ? "bg-accent/15 border-accent" : "bg-card border-card-border"
            }`}
          >
            {icons ? icons[n - 1] : n}
          </button>
        ))}
      </div>
    </div>
  );
}
