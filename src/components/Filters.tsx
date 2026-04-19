"use client";

import {
  CLASSIFICATIONS,
  EVENTS,
  GENDERS,
  type Classification,
  type EventName,
  type Gender,
} from "@/lib/types";

interface Props {
  event: EventName;
  gender: Gender;
  classification: Classification;
  onChangeEvent: (e: EventName) => void;
  onChangeGender: (g: Gender) => void;
  onChangeClassification: (c: Classification) => void;
}

export function Filters({
  event,
  gender,
  classification,
  onChangeEvent,
  onChangeGender,
  onChangeClassification,
}: Props) {
  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <select
          value={event}
          onChange={(e) => onChangeEvent(e.target.value as EventName)}
          className="w-full appearance-none bg-card border border-card-border rounded-full pl-4 pr-10 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:border-accent"
        >
          {EVENTS.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      <div className="flex gap-2 flex-wrap">
        <div className="flex rounded-lg overflow-hidden border border-card-border bg-card">
          {GENDERS.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => onChangeGender(g)}
              className={`px-3 py-1.5 text-sm ${
                gender === g ? "bg-foreground text-background font-semibold" : "text-muted"
              }`}
            >
              {g === "M" ? "Boys" : "Girls"}
            </button>
          ))}
        </div>

        <div className="flex rounded-lg overflow-hidden border border-card-border bg-card">
          {CLASSIFICATIONS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onChangeClassification(c)}
              className={`px-3 py-1.5 text-sm ${
                classification === c
                  ? "bg-foreground text-background font-semibold"
                  : "text-muted"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
