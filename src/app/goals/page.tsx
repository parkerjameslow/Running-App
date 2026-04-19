"use client";

import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardSection } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useStore } from "@/lib/store";
import { bestTimesForFilter, projectedRank } from "@/lib/rankings";
import { parseTime } from "@/lib/time";
import { STATE_FIELD_SIZE } from "@/lib/types";

export default function GoalsPage() {
  const { data, update } = useStore();
  const goals = data.goals;

  function deleteGoal(id: string) {
    update((prev) => ({ ...prev, goals: prev.goals.filter((g) => g.id !== id) }));
  }

  return (
    <>
      <PageHeader
        title="Goals"
        subtitle={`${goals.length} target${goals.length === 1 ? "" : "s"}`}
        action={
          <Link href="/goals/new">
            <Button size="sm">+ New</Button>
          </Link>
        }
      />

      {goals.length === 0 ? (
        <Card className="text-sm text-muted text-center">
          Set a target time to see how you&apos;d rank in Utah 6A right now.
        </Card>
      ) : (
        <CardSection title="Active Goals">
          <div className="flex flex-col gap-2">
            {goals.map((g) => {
              const ranked = bestTimesForFilter(
                data.results,
                g.event,
                g.gender,
                g.classification
              );
              const rank = projectedRank(ranked, g.targetTimeSeconds, g.athleteKey);
              const wouldMakeField = rank <= STATE_FIELD_SIZE;
              const secs = parseTime(g.targetTimeDisplay);
              return (
                <Card key={g.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        href={`/athlete/${encodeURIComponent(g.athleteKey)}`}
                        className="font-semibold hover:underline block truncate"
                      >
                        {g.athleteName}
                      </Link>
                      <div className="text-xs text-muted truncate">
                        {g.school} · {g.event} · {g.classification}{" "}
                        {g.gender === "M" ? "Boys" : "Girls"}
                      </div>
                      {g.notes && (
                        <div className="text-xs text-muted mt-1 italic">{g.notes}</div>
                      )}
                      {g.deadline && (
                        <div className="text-[11px] text-muted mt-1">By {g.deadline}</div>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-mono font-semibold text-lg tabular">
                        {g.targetTimeDisplay}
                      </div>
                      <div
                        className={`text-xs font-semibold ${
                          wouldMakeField ? "text-success" : "text-muted"
                        }`}
                      >
                        Rank #{rank}
                        {!Number.isFinite(secs) && " —"}
                      </div>
                      {wouldMakeField && (
                        <div className="text-[11px] text-success">Would make field</div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button variant="ghost" size="sm" onClick={() => deleteGoal(g.id)}>
                      Delete
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </CardSection>
      )}
    </>
  );
}
