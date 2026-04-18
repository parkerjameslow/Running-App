import type { Classification, EventName, Gender } from "./types";
import { parseTime } from "./time";

// State qualifying times, in seconds. Edit these as official standards update.
// Only 6A is seeded accurately for boys 1600m (4:17) per user spec.
// Other values are placeholders — replace with official times.
// null = unknown/not yet set.
type QualifyingTable = Partial<
  Record<Classification, Partial<Record<EventName, Partial<Record<Gender, number | null>>>>>
>;

export const QUALIFYING_TIMES: QualifyingTable = {
  "6A": {
    "1600m": { M: parseTime("4:17.00"), F: null },
    "800m":  { M: null, F: null },
    "3200m": { M: null, F: null },
    "400m":  { M: null, F: null },
    "200m":  { M: null, F: null },
    "100m":  { M: null, F: null },
    "XC 5K": { M: null, F: null },
    "XC 3 Mile": { M: null, F: null },
  },
  "5A": {},
  "4A": {},
  "3A": {},
  "2A": {},
  "1A": {},
};

export function getQualifyingTime(
  classification: Classification,
  event: EventName,
  gender: Gender
): number | null {
  return QUALIFYING_TIMES[classification]?.[event]?.[gender] ?? null;
}
