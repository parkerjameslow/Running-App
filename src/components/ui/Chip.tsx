import type { ReactNode } from "react";

type Tone =
  | "default"
  | "accent"
  | "success"
  | "warning"
  | "danger"
  | "training"
  | "racing"
  | "goals"
  | "insights"
  | "rewards";

const TONES: Record<Tone, string> = {
  default: "bg-card-border text-foreground",
  accent: "bg-accent/15 text-accent",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-danger/15 text-danger",
  training: "bg-training/15 text-training",
  racing: "bg-racing/15 text-racing",
  goals: "bg-goals/15 text-goals",
  insights: "bg-insights/15 text-insights",
  rewards: "bg-rewards/15 text-rewards",
};

export function Chip({
  children,
  tone = "default",
  className = "",
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
