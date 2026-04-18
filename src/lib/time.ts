// Parse a time string like "4:17.50", "15:23", "58.23" into total seconds.
// Returns NaN on invalid input.
export function parseTime(input: string): number {
  if (!input) return NaN;
  const s = input.trim();
  // Split on colon: HH:MM:SS.ms or MM:SS.ms or SS.ms
  const parts = s.split(":");
  if (parts.length === 1) {
    const n = Number(parts[0]);
    return Number.isFinite(n) ? n : NaN;
  }
  if (parts.length === 2) {
    const mins = Number(parts[0]);
    const secs = Number(parts[1]);
    if (!Number.isFinite(mins) || !Number.isFinite(secs)) return NaN;
    return mins * 60 + secs;
  }
  if (parts.length === 3) {
    const hrs = Number(parts[0]);
    const mins = Number(parts[1]);
    const secs = Number(parts[2]);
    if (!Number.isFinite(hrs) || !Number.isFinite(mins) || !Number.isFinite(secs)) return NaN;
    return hrs * 3600 + mins * 60 + secs;
  }
  return NaN;
}

// Format total seconds back to a readable time string.
// <60s: "58.23"   >=60s: "M:SS.ms"   >=3600s: "H:MM:SS"
export function formatTime(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds)) return "—";
  if (totalSeconds < 60) {
    return totalSeconds.toFixed(2);
  }
  if (totalSeconds < 3600) {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds - mins * 60;
    return `${mins}:${secs.toFixed(2).padStart(5, "0")}`;
  }
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds - hrs * 3600) / 60);
  const secs = Math.floor(totalSeconds - hrs * 3600 - mins * 60);
  return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}
