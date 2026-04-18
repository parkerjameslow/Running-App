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
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 snap-x">
        {EVENTS.map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => onChangeEvent(e)}
            className={[
              "px-3 py-1.5 rounded-full text-sm whitespace-nowrap snap-start transition-colors border",
              event === e
                ? "bg-sky-500 border-sky-400 text-white"
                : "bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700",
            ].join(" ")}
          >
            {e}
          </button>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap">
        <div className="flex rounded-lg overflow-hidden border border-neutral-800">
          {GENDERS.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => onChangeGender(g)}
              className={[
                "px-3 py-1.5 text-sm",
                gender === g
                  ? "bg-neutral-100 text-neutral-900 font-semibold"
                  : "bg-neutral-900 text-neutral-300 hover:bg-neutral-800",
              ].join(" ")}
            >
              {g === "M" ? "Boys" : "Girls"}
            </button>
          ))}
        </div>

        <div className="flex rounded-lg overflow-hidden border border-neutral-800">
          {CLASSIFICATIONS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onChangeClassification(c)}
              className={[
                "px-3 py-1.5 text-sm",
                classification === c
                  ? "bg-neutral-100 text-neutral-900 font-semibold"
                  : "bg-neutral-900 text-neutral-300 hover:bg-neutral-800",
              ].join(" ")}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
