export type Gender = "M" | "F";

export type Classification = "1A" | "2A" | "3A" | "4A" | "5A" | "6A";

export const GENDERS: Gender[] = ["M", "F"];
export const CLASSIFICATIONS: Classification[] = ["1A", "2A", "3A", "4A", "5A", "6A"];

// Common Utah HS track + XC events. Add more as needed.
export const EVENTS = [
  "100m",
  "200m",
  "400m",
  "800m",
  "1600m",
  "3200m",
  "XC 5K",
  "XC 3 Mile",
] as const;
export type EventName = (typeof EVENTS)[number];

export interface RaceResult {
  id: string;
  athleteName: string;
  school: string;
  gender: Gender;
  classification: Classification;
  event: EventName;
  timeSeconds: number;
  timeDisplay: string; // original time string, e.g. "4:17.50"
  meetName: string;
  date: string; // ISO yyyy-mm-dd
}

// How many athletes qualify for the state meet in each event.
export const STATE_FIELD_SIZE = 27;
