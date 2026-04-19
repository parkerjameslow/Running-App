"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Filters } from "@/components/Filters";
import { RankingsTable } from "@/components/RankingsTable";
import { DataControls } from "@/components/DataControls";
import type { Classification, EventName, Gender } from "@/lib/types";

export default function RankingsPage() {
  const [event, setEvent] = useState<EventName>("1600m");
  const [gender, setGender] = useState<Gender>("M");
  const [classification, setClassification] = useState<Classification>("6A");

  return (
    <>
      <PageHeader title="Rankings" subtitle="Utah HS — fastest times" />
      <Filters
        event={event}
        gender={gender}
        classification={classification}
        onChangeEvent={setEvent}
        onChangeGender={setGender}
        onChangeClassification={setClassification}
      />
      <RankingsTable event={event} gender={gender} classification={classification} />
      <details className="text-sm text-muted">
        <summary className="cursor-pointer py-2">Manage data</summary>
        <DataControls />
      </details>
    </>
  );
}
