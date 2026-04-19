"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardSection } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { DataControls } from "@/components/DataControls";
import { useStore } from "@/lib/store";
import { allAthletes } from "@/lib/athletes";

const LINKS: { href: string; label: string; tone: "training" | "racing" | "goals" | "insights" | "rewards" }[] = [
  { href: "/goals", label: "Goals", tone: "goals" },
  { href: "/simulator", label: "State Meet Simulator", tone: "racing" },
  { href: "/parent", label: "Parent Dashboard", tone: "rewards" },
  { href: "/stats", label: "Trends & Insights", tone: "insights" },
];

export default function MorePage() {
  const router = useRouter();
  const { data, update, reset } = useStore();
  const athletes = allAthletes(data);
  const current = data.activeAthleteKey
    ? athletes.find((a) => a.key === data.activeAthleteKey)
    : null;

  function switchUser() {
    update((prev) => ({
      ...prev,
      userRole: null,
      activeAthleteKey: undefined,
      isParent: false,
    }));
    router.push("/setup");
  }

  return (
    <>
      <PageHeader title="More" />

      <CardSection title="Profile">
        <Card className="flex items-center justify-between">
          <div className="min-w-0">
            <div className="font-semibold">
              {current
                ? current.name
                : data.userRole === "parent"
                ? "Parent / Coach"
                : "Not set up"}
            </div>
            <div className="text-xs text-muted truncate">
              {current
                ? `${current.school} · ${current.classification} · ${
                    current.gender === "M" ? "Boys" : "Girls"
                  }`
                : data.userRole === "parent"
                ? "You see all athletes"
                : ""}
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={switchUser}>
            Switch
          </Button>
        </Card>
      </CardSection>

      <CardSection title="Features">
        <div className="grid grid-cols-2 gap-2">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href}>
              <Card className="h-full flex flex-col gap-2">
                <Chip tone={l.tone}>&nbsp;</Chip>
                <div className="font-semibold text-sm">{l.label}</div>
              </Card>
            </Link>
          ))}
        </div>
      </CardSection>

      <CardSection title="Data">
        <DataControls />
      </CardSection>

      <CardSection title="Summary">
        <Card>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Line label="Race results" value={data.results.length} />
            <Line label="Starred" value={data.starred.length} />
            <Line label="Runs logged" value={data.trainingLogs.length} />
            <Line label="Morning check-ins" value={data.morningCheckins.length} />
            <Line label="Evening check-ins" value={data.eveningCheckins.length} />
            <Line label="Goals" value={data.goals.length} />
            <Line label="Rewards" value={data.rewards.length} />
            <Line label="Point entries" value={data.points.length} />
          </div>
        </Card>
      </CardSection>

      <CardSection title="Danger Zone">
        <Card className="flex flex-col gap-2">
          <div className="text-sm text-muted">
            Wipes all data from this device. This cannot be undone.
          </div>
          <Button
            variant="danger"
            onClick={() => {
              if (confirm("Erase ALL data from this device?")) reset();
            }}
          >
            Erase all data
          </Button>
        </Card>
      </CardSection>

      <div className="text-center text-xs text-muted py-4">
        Running Stats, etc. · Phase 4 MVP · Data stored on this device
      </div>
    </>
  );
}

function Line({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted">{label}</span>
      <span className="font-semibold tabular">{value}</span>
    </div>
  );
}
