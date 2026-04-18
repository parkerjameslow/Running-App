import Papa from "papaparse";
import { parseTime } from "./time";
import {
  CLASSIFICATIONS,
  EVENTS,
  GENDERS,
  type Classification,
  type EventName,
  type Gender,
  type RaceResult,
} from "./types";

export interface CsvRow {
  "Athlete Name"?: string;
  "School"?: string;
  "Gender"?: string;
  "Classification"?: string;
  "Event"?: string;
  "Time"?: string;
  "Meet"?: string;
  "Date"?: string;
  // tolerate common alternate headers
  "Name"?: string;
  "Meet Name"?: string;
}

export interface ParseReport {
  results: RaceResult[];
  errors: { row: number; message: string }[];
}

function normGender(v: string | undefined): Gender | null {
  if (!v) return null;
  const g = v.trim().toUpperCase();
  if (g === "M" || g === "MALE" || g === "BOY" || g === "BOYS") return "M";
  if (g === "F" || g === "FEMALE" || g === "GIRL" || g === "GIRLS") return "F";
  return null;
}

function normClassification(v: string | undefined): Classification | null {
  if (!v) return null;
  const c = v.trim().toUpperCase();
  return (CLASSIFICATIONS as string[]).includes(c) ? (c as Classification) : null;
}

function normEvent(v: string | undefined): EventName | null {
  if (!v) return null;
  const e = v.trim();
  const match = (EVENTS as readonly string[]).find(
    (ev) => ev.toLowerCase() === e.toLowerCase()
  );
  return (match as EventName) ?? null;
}

function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function parseCsv(text: string): ParseReport {
  const parsed = Papa.parse<CsvRow>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  const results: RaceResult[] = [];
  const errors: ParseReport["errors"] = [];

  parsed.data.forEach((row, i) => {
    const rowNum = i + 2; // header is row 1
    const athleteName = (row["Athlete Name"] ?? row["Name"] ?? "").trim();
    const school = (row["School"] ?? "").trim();
    const gender = normGender(row["Gender"]);
    const classification = normClassification(row["Classification"]);
    const event = normEvent(row["Event"]);
    const timeRaw = (row["Time"] ?? "").trim();
    const timeSeconds = parseTime(timeRaw);
    const meetName = (row["Meet"] ?? row["Meet Name"] ?? "").trim();
    const date = (row["Date"] ?? "").trim();

    if (!athleteName) return errors.push({ row: rowNum, message: "Missing athlete name" });
    if (!school) return errors.push({ row: rowNum, message: "Missing school" });
    if (!gender) return errors.push({ row: rowNum, message: `Invalid gender: "${row["Gender"] ?? ""}"` });
    if (!classification)
      return errors.push({ row: rowNum, message: `Invalid classification: "${row["Classification"] ?? ""}"` });
    if (!event) return errors.push({ row: rowNum, message: `Unknown event: "${row["Event"] ?? ""}"` });
    if (!Number.isFinite(timeSeconds))
      return errors.push({ row: rowNum, message: `Invalid time: "${timeRaw}"` });

    results.push({
      id: uid(),
      athleteName,
      school,
      gender,
      classification,
      event,
      timeSeconds,
      timeDisplay: timeRaw,
      meetName,
      date,
    });
  });

  return { results, errors };
}

export const SAMPLE_CSV = `Athlete Name,School,Gender,Classification,Event,Time,Meet,Date
Ethan Parker,Lone Peak HS,M,6A,1600m,4:14.23,Region Championship,2025-05-02
Noah Jensen,American Fork HS,M,6A,1600m,4:16.88,Region Championship,2025-05-02
Liam Brown,Corner Canyon HS,M,6A,1600m,4:17.50,BYU Invitational,2025-04-18
Jackson Lee,Herriman HS,M,6A,1600m,4:18.12,State Prelims,2025-05-09
Mason Smith,Riverton HS,M,6A,1600m,4:19.34,Region Championship,2025-05-02
Logan Clark,Davis HS,M,6A,1600m,4:20.01,State Prelims,2025-05-09
Olivia Hansen,Lone Peak HS,F,6A,1600m,4:55.12,Region Championship,2025-05-02
Emma Wright,American Fork HS,F,6A,1600m,4:58.44,Region Championship,2025-05-02
Sophia Nielsen,Corner Canyon HS,F,6A,1600m,5:01.10,BYU Invitational,2025-04-18
Ava Martinez,Davis HS,F,6A,1600m,5:03.72,State Prelims,2025-05-09
Ethan Parker,Lone Peak HS,M,6A,800m,1:55.43,Region Championship,2025-05-02
Noah Jensen,American Fork HS,M,6A,800m,1:56.72,Region Championship,2025-05-02
Ethan Parker,Lone Peak HS,M,6A,3200m,9:12.55,Region Championship,2025-05-02
Liam Brown,Corner Canyon HS,M,6A,3200m,9:18.20,BYU Invitational,2025-04-18
Ethan Parker,Lone Peak HS,M,6A,XC 5K,15:22.40,Region XC,2024-10-12
Noah Jensen,American Fork HS,M,6A,XC 5K,15:31.88,Region XC,2024-10-12
Olivia Hansen,Lone Peak HS,F,6A,XC 5K,17:45.20,Region XC,2024-10-12
`;
