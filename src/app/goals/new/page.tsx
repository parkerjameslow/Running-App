"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AthletePicker } from "@/components/AthletePicker";
import { useStore, uid, today } from "@/lib/store";
import { athletesFromResults } from "@/lib/athletes";
import { bestTimesForFilter, projectedRank } from "@/lib/rankings";
import { formatTime, parseTime } from "@/lib/time";
import {
  EVENTS,
  STATE_FIELD_SIZE,
  type EventName,
} from "@/lib/types";

export default function NewGoalPage() {
  return (
    <Suspense fallback={null}>
      <NewGoalForm />
    </Suspense>
  );
}

function NewGoalForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const { data, update } = useStore();

  const athletes = useMemo(() => athletesFromResults(data.results), [data.results]);
  const initialKey = sp.get("athlete") ?? athletes[0]?.key ?? "";
  const initialAthlete = athletes.find((a) => a.key === initialKey);

  const [athleteKey, setAthleteKey] = useState(initialKey);
  const [athleteName, setAthleteName] = useState(initialAthlete?.name ?? "");
  const [school, setSchool] = useState(initialAthlete?.school ?? "");
  const [event, setEvent] = useState<EventName>("1600m");
  const [targetTime, setTargetTime] = useState("");
  const [deadline, setDeadline] = useState("");
  const [notes, setNotes] = useState("");

  const targetSeconds = parseTime(targetTime);
  const currentAthlete = athletes.find((a) => a.key === athleteKey);
  const gender = currentAthlete?.gender ?? "M";
  const classification = currentAthlete?.classification ?? "6A";

  const ranked = Number.isFinite(targetSeconds)
    ? bestTimesForFilter(data.results, event, gender, classification)
    : [];
  const rank = Number.isFinite(targetSeconds)
    ? projectedRank(ranked, targetSeconds, athleteKey)
    : null;
  const wouldMakeField = rank != null && rank <= STATE_FIELD_SIZE;

  function save() {
    if (!athleteKey || !Number.isFinite(targetSeconds)) return;
    update((prev) => ({
      ...prev,
      goals: [
        ...prev.goals,
        {
          id: uid(),
          athleteKey,
          athleteName,
          school,
          event,
          gender,
          classification,
          targetTimeSeconds: targetSeconds,
          targetTimeDisplay: targetTime,
          deadline: deadline || undefined,
          notes: notes || undefined,
          createdAt: today(),
        },
      ],
    }));
    router.push("/goals");
  }

  return (
    <>
      <PageHeader title="New Goal" subtitle="See your projected rank in real time" />

      <Card className="flex flex-col gap-3">
        <label className="text-xs text-muted">Athlete</label>
        <AthletePicker
          value={athleteKey}
          onChange={(k, name, sch) => {
            setAthleteKey(k);
            setAthleteName(name);
            setSchool(sch);
          }}
        />

        <label className="text-xs text-muted mt-2">Event</label>
        <select
          value={event}
          onChange={(e) => setEvent(e.target.value as EventName)}
          className="bg-card border border-card-border rounded-lg px-3 py-2 text-sm"
        >
          {EVENTS.map((ev) => (
            <option key={ev} value={ev}>
              {ev}
            </option>
          ))}
        </select>

        <label className="text-xs text-muted mt-2">Target time (e.g. 4:20.00)</label>
        <input
          value={targetTime}
          onChange={(e) => setTargetTime(e.target.value)}
          placeholder="4:20.00"
          inputMode="decimal"
          className="bg-card border border-card-border rounded-lg px-3 py-2 text-sm font-mono"
        />

        <label className="text-xs text-muted mt-2">Deadline (optional)</label>
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="bg-card border border-card-border rounded-lg px-3 py-2 text-sm"
        />

        <label className="text-xs text-muted mt-2">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Why this goal?"
          className="bg-card border border-card-border rounded-lg px-3 py-2 text-sm"
        />
      </Card>

      {Number.isFinite(targetSeconds) && rank != null && (
        <Card className={wouldMakeField ? "border-success/50 bg-success/5" : ""}>
          <div className="text-xs uppercase text-muted tracking-wide">If you ran this today</div>
          <div className="text-3xl font-bold">
            Rank #{rank}{" "}
            <span className="text-muted text-base font-normal">
              in {classification} {gender === "M" ? "Boys" : "Girls"} {event}
            </span>
          </div>
          <div className={`text-sm mt-1 ${wouldMakeField ? "text-success" : "text-muted"}`}>
            {wouldMakeField
              ? `✓ Within top ${STATE_FIELD_SIZE} — would make the state field`
              : `Need to move up ${rank - STATE_FIELD_SIZE} spots to make top ${STATE_FIELD_SIZE}`}
          </div>
          <div className="text-xs text-muted mt-2">
            {ranked.length > 0
              ? `Currently: #${Math.min(ranked.length, STATE_FIELD_SIZE)} runs ${formatTime(
                  ranked[Math.min(ranked.length, STATE_FIELD_SIZE) - 1]?.timeSeconds ?? NaN
                )}`
              : "No comparison data — upload race results first"}
          </div>
        </Card>
      )}

      <div className="flex gap-2">
        <Button onClick={save} disabled={!athleteKey || !Number.isFinite(targetSeconds)}>
          Save goal
        </Button>
        <Button variant="ghost" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </>
  );
}
