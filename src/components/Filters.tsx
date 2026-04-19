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
      <div className="flex gap-2 overflow-x-auto hide-scrollbar -mx-1 px-1 snap-x">
        {EVENTS.map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => onChangeEvent(e)}
            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap snap-start border ${
              event === e
                ? "bg-accent border-accent text-white"
                : "bg-card border-card-border text-muted hover:text-foreground"
            }`}
          >
            {e}
          </button>
        ))}
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
