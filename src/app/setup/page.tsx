"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useStore, today } from "@/lib/store";
import { athleteKey } from "@/lib/storage";
import {
  CLASSIFICATIONS,
  type Classification,
  type Gender,
} from "@/lib/types";

type Step = "role" | "athlete";

export default function SetupPage() {
  const router = useRouter();
  const { update } = useStore();
  const [step, setStep] = useState<Step>("role");

  const [name, setName] = useState("");
  const [school, setSchool] = useState("");
  const [gender, setGender] = useState<Gender>("M");
  const [classification, setClassification] = useState<Classification>("6A");

  function pickParent() {
    update((prev) => ({
      ...prev,
      userRole: "parent",
      isParent: true,
      activeAthleteKey: undefined,
    }));
    router.replace("/");
  }

  function saveAthlete() {
    const cleanName = name.trim();
    const cleanSchool = school.trim();
    if (!cleanName || !cleanSchool) return;
    const key = athleteKey(cleanName, cleanSchool);
    update((prev) => {
      const existing = prev.athletes.find((a) => a.key === key);
      const athletes = existing
        ? prev.athletes
        : [
            ...prev.athletes,
            {
              key,
              name: cleanName,
              school: cleanSchool,
              gender,
              classification,
              createdAt: today(),
            },
          ];
      return {
        ...prev,
        athletes,
        userRole: "athlete",
        isParent: false,
        activeAthleteKey: key,
        starred: prev.starred.includes(key) ? prev.starred : [...prev.starred, key],
      };
    });
    router.replace("/");
  }

  if (step === "role") {
    return (
      <>
        <PageHeader title="Welcome" subtitle="Let's get you set up" />

        <Card onClick={() => setStep("athlete")} className="flex flex-col gap-1">
          <div className="text-2xl">🏃</div>
          <div className="font-semibold">I'm an athlete</div>
          <div className="text-sm text-muted">
            This phone is mine. Skip picking my name every time I log a run.
          </div>
        </Card>

        <Card onClick={pickParent} className="flex flex-col gap-1">
          <div className="text-2xl">👨‍👧</div>
          <div className="font-semibold">I'm a parent or coach</div>
          <div className="text-sm text-muted">
            I manage multiple athletes and want to see everyone's data.
          </div>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader title="About you" subtitle="Just the basics" />

      <Card className="flex flex-col gap-3">
        <div>
          <label className="text-xs text-muted">Your name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            placeholder="Ethan Parker"
            className="w-full mt-1 bg-card border border-card-border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-xs text-muted">School</label>
          <input
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            placeholder="Lone Peak HS"
            className="w-full mt-1 bg-card border border-card-border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-xs text-muted">Gender</label>
          <div className="flex gap-2 mt-1">
            {(["M", "F"] as Gender[]).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGender(g)}
                className={`flex-1 py-2 rounded-lg border text-sm ${
                  gender === g
                    ? "bg-accent/15 border-accent text-accent font-semibold"
                    : "bg-card border-card-border text-muted"
                }`}
              >
                {g === "M" ? "Boys" : "Girls"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-muted">Classification</label>
          <div className="flex gap-2 mt-1 flex-wrap">
            {CLASSIFICATIONS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setClassification(c)}
                className={`flex-1 min-w-[50px] py-2 rounded-lg border text-sm ${
                  classification === c
                    ? "bg-accent/15 border-accent text-accent font-semibold"
                    : "bg-card border-card-border text-muted"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div className="flex gap-2">
        <Button onClick={saveAthlete} disabled={!name.trim() || !school.trim()}>
          Continue
        </Button>
        <Button variant="ghost" onClick={() => setStep("role")}>
          Back
        </Button>
      </div>
    </>
  );
}
