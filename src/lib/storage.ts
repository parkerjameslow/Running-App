// Stable key for an athlete.
export function athleteKey(name: string, school: string): string {
  return `${name.trim().toLowerCase()}|${school.trim().toLowerCase()}`;
}
