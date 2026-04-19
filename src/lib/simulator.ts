import type { Classification, EventName, Gender, RaceResult } from "./types";
import { bestTimesForFilter } from "./rankings";

// Standard track scoring for individual events (top 8): 10-8-6-5-4-3-2-1.
export const INDIVIDUAL_SCORING = [10, 8, 6, 5, 4, 3, 2, 1];

export interface SimulatorEventResult {
  event: EventName;
  placements: { rank: number; result: RaceResult; points: number }[];
}

export interface TeamStanding {
  school: string;
  totalPoints: number;
  byEvent: Record<string, number>;
}

export function simulateMeet(
  results: RaceResult[],
  gender: Gender,
  classification: Classification,
  events: readonly EventName[]
): { eventResults: SimulatorEventResult[]; teamStandings: TeamStanding[] } {
  const eventResults: SimulatorEventResult[] = [];
  const teamTotals = new Map<string, TeamStanding>();

  for (const event of events) {
    const ranked = bestTimesForFilter(results, event, gender, classification);
    const placements = ranked.slice(0, 8).map((result, i) => {
      const points = INDIVIDUAL_SCORING[i] ?? 0;
      if (points > 0) {
        const team = teamTotals.get(result.school) ?? {
          school: result.school,
          totalPoints: 0,
          byEvent: {},
        };
        team.totalPoints += points;
        team.byEvent[event] = (team.byEvent[event] ?? 0) + points;
        teamTotals.set(result.school, team);
      }
      return { rank: i + 1, result, points };
    });
    eventResults.push({ event, placements });
  }

  const teamStandings = [...teamTotals.values()].sort(
    (a, b) => b.totalPoints - a.totalPoints
  );
  return { eventResults, teamStandings };
}
