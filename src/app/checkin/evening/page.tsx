"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AthletePicker } from "@/components/AthletePicker";
import { useStore, uid, today } from "@/lib/store";
import { allAthletes } from "@/lib/athletes";
import { POINTS } from "@/lib/gamification";

export default function EveningCheckinPage() {
  const router = useRouter();
  const { data, update } = useStore();
  const athletes = useMemo(() => allAthletes(data), [data.results]);
  const [athleteKey, setAthleteKey] = useState(
    data.activeAthleteKey ?? athletes[0]?.key ?? ""
  );
  const lockedAthlete = !!data.activeAthleteKey;
  const currentAthlete = athletes.find((a) => a.key === athleteKey);
  const [bedtime, setBedtime] = useState("");
  const [nutrition, setNutrition] = useState(4);
  const [waterCups, setWaterCups] = useState(8);
  const [overall, setOverall] = useState(4);

  function save() {
    if (!athleteKey) return;
    const date = today();
    update((prev) => ({
      ...prev,
      eveningCheckins: [
        ...prev.eveningCheckins.filter(
          (c) => !(c.athleteKey === athleteKey && c.date === date)
        ),
        {
          id: uid(),
          athleteKey,
          date,
          bedtime: bedtime || undefined,
          nutrition,
          waterCups,
          overall,
          createdAt: new Date().toISOString(),
        },
      ],
      points: [
        ...prev.points,
        {
          id: uid(),
          athleteKey,
          points: POINTS.eveningCheckin,
          reason: "Evening check-in",
          date,
          createdAt: new Date().toISOString(),
        },
      ],
    }));
    router.push("/log");
  }

  return (
    <>
      <PageHeader title="Evening Check-In" subtitle={`+${POINTS.eveningCheckin} points`} />

      <Card className="flex flex-col gap-4">
        {lockedAthlete ? (
          <div className="text-sm">
            <span className="text-muted">For </span>
            <span className="font-semibold">{currentAthlete?.name ?? "you"}</span>
          </div>
        ) : (
          <div>
            <label className="text-xs text-muted">Athlete</label>
            <div className="mt-1">
              <AthletePicker value={athleteKey} onChange={(k) => setAthleteKey(k)} />
            </div>
          </div>
        )}

        <div>
          <label className="text-xs text-muted">Planned bedtime</label>
          <input
            type="time"
            value={bedtime}
            onChange={(e) => setBedtime(e.target.value)}
            className="w-full mt-1 bg-card border border-card-border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <Slider label="Nutrition today" value={nutrition} onChange={setNutrition} />

        <div>
          <label className="text-xs text-muted">Water (cups): {waterCups}</label>
          <input
            type="range"
            min={0}
            max={16}
            value={waterCups}
            onChange={(e) => setWaterCups(parseInt(e.target.value))}
            className="w-full mt-1 accent-accent"
          />
        </div>

        <Slider
          label="Overall feeling"
          value={overall}
          onChange={setOverall}
          icons={["😩", "😕", "🙂", "😄", "🔥"]}
        />
      </Card>

      <div className="flex gap-2">
        <Button onClick={save} disabled={!athleteKey}>
          Save
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
