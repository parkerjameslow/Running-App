export type Gender = "M" | "F";

export type Classification = "1A" | "2A" | "3A" | "4A" | "5A" | "6A";

export const GENDERS: Gender[] = ["M", "F"];
export const CLASSIFICATIONS: Classification[] = ["1A", "2A", "3A", "4A", "5A", "6A"];

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
  timeDisplay: string;
  meetName: string;
  date: string;
}

export interface Goal {
  id: string;
  athleteKey: string; // athleteName|school
  athleteName: string;
  school: string;
  event: EventName;
  gender: Gender;
  classification: Classification;
  targetTimeSeconds: number;
  targetTimeDisplay: string;
  deadline?: string;
  notes?: string;
  createdAt: string;
}

export type RunType = "easy" | "tempo" | "intervals" | "long" | "race" | "recovery";
export const RUN_TYPES: RunType[] = ["easy", "tempo", "intervals", "long", "race", "recovery"];

export interface TrainingLog {
  id: string;
  date: string; // YYYY-MM-DD
  athleteKey: string;
  distanceMiles: number;
  durationSeconds: number;
  runType: RunType;
  ranWith?: string;
  weather?: string;
  mood?: number; // 1-5
  notes?: string;
  createdAt: string;
}

export interface MorningCheckin {
  id: string;
  date: string;
  athleteKey: string;
  sleepQuality: number; // 1-5
  hoursSlept: number;
  hydration: number; // 1-5
  mood: number; // 1-5
  readiness: number; // 1-5
  createdAt: string;
}

export interface EveningCheckin {
  id: string;
  date: string;
  athleteKey: string;
  bedtime?: string; // HH:MM
  nutrition: number; // 1-5
  waterCups: number;
  overall: number; // 1-5
  createdAt: string;
}

export interface Badge {
  id: string;
  athleteKey: string;
  kind: string; // e.g. "5-day-streak", "new-pr", "hydration-hero"
  label: string;
  earnedAt: string;
  meta?: string;
}

export interface Reward {
  id: string;
  athleteKey: string;
  title: string;
  pointsRequired: number;
  kind: "monetary" | "custom";
  redeemed: boolean;
  createdAt: string;
  redeemedAt?: string;
}

export interface PointsLedger {
  id: string;
  athleteKey: string;
  points: number; // positive or negative
  reason: string;
  date: string;
  createdAt: string;
}

export interface AppData {
  results: RaceResult[];
  starred: string[]; // athlete keys
  goals: Goal[];
  trainingLogs: TrainingLog[];
  morningCheckins: MorningCheckin[];
  eveningCheckins: EveningCheckin[];
  badges: Badge[];
  rewards: Reward[];
  points: PointsLedger[];
  activeAthleteKey?: string; // whose log / check-in we're viewing
  isParent: boolean;
}

export const STATE_FIELD_SIZE = 27;
