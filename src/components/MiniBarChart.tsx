"use client";

interface Props {
  data: { date: string; value: number }[];
  label?: string;
  tone?: "training" | "insights" | "accent";
}

export function MiniBarChart({ data, label, tone = "training" }: Props) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const toneColor =
    tone === "insights" ? "bg-insights" : tone === "accent" ? "bg-accent" : "bg-training";

  return (
    <div>
      {label && <div className="text-xs text-muted mb-1">{label}</div>}
      <div className="flex items-end gap-0.5 h-20">
        {data.map((d, i) => {
          const h = Math.max(2, Math.round((d.value / max) * 100));
          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center gap-0.5"
              title={`${d.date}: ${d.value}`}
            >
              <div
                className={`w-full rounded-t-sm ${d.value > 0 ? toneColor : "bg-card-border"}`}
                style={{ height: `${h}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[9px] text-muted mt-1">
        <span>{data[0]?.date.slice(5) ?? ""}</span>
        <span>{data[data.length - 1]?.date.slice(5) ?? ""}</span>
      </div>
    </div>
  );
}
