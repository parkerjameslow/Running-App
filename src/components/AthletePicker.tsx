"use client";

import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { athletesFromResults } from "@/lib/athletes";

interface Props {
  value?: string;
  onChange: (key: string, name: string, school: string) => void;
  placeholder?: string;
}

export function AthletePicker({ value, onChange, placeholder = "Select athlete" }: Props) {
  const { data } = useStore();
  const athletes = useMemo(() => {
    const all = athletesFromResults(data.results);
    // starred first
    return [...all].sort((a, b) => {
      const aStar = data.starred.includes(a.key) ? 0 : 1;
      const bStar = data.starred.includes(b.key) ? 0 : 1;
      if (aStar !== bStar) return aStar - bStar;
      return a.name.localeCompare(b.name);
    });
  }, [data.results, data.starred]);

  return (
    <select
      value={value ?? ""}
      onChange={(e) => {
        const a = athletes.find((x) => x.key === e.target.value);
        if (a) onChange(a.key, a.name, a.school);
      }}
      className="w-full bg-card border border-card-border rounded-lg px-3 py-2 text-sm"
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {athletes.map((a) => (
        <option key={a.key} value={a.key}>
          {data.starred.includes(a.key) ? "★ " : ""}
          {a.name} — {a.school}
        </option>
      ))}
    </select>
  );
}
