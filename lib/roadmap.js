export const raceDateSgt = "2026-05-22T17:00:00+08:00";

export const phaseRoadmap = [
  {
    name: "Phase 1: Base Building",
    window: "Weeks 1-4",
    focus: "Get used to running 3 times a week. Try to keep within the 5-10% increase in weekly mileage to let your body adjust. Focus on easy effort runs.",
    minDays: 141,
    maxDays: 180,
  },
  {
    name: "Phase 2: Endurance Training",
    window: "Weeks 5-12",
    focus: "Improve overall endurance and increase weekly volume with moderate long runs. Add quality runs like tempo, intervals.",
    minDays: 99,
    maxDays: 140,
  },
  {
    name: "Phase 3: Marathon Pace Training",
    window: "Weeks 13-18",
    focus: "Incorporate marathon pace training and sustained efforts. Gradually increase your weekly mileage.",
    minDays: 56,
    maxDays: 98,
  },
  {
    name: "Phase 4: Peak Long Run Distance",
    window: "Weeks 19-22",
    focus: "Peaks long-run distance and simulates race demands",
    minDays: 15,
    maxDays: 55,
  },
  {
    name: "Phase 5: Tapering",
    window: "Final 10-14 days",
    focus: "Reduce the training load while keeping the intensity to prepare for race day",
    minDays: 0,
    maxDays: 14,
  },
];

function getSingaporeDateStamp(date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Singapore",
  }).formatToParts(date);

  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const day = Number(parts.find((part) => part.type === "day")?.value);

  return Date.UTC(year, month - 1, day);
}

export function getDaysToRace(now = new Date()) {
  const nowStamp = getSingaporeDateStamp(now);
  const raceStamp = getSingaporeDateStamp(new Date(raceDateSgt));
  return Math.max(0, Math.round((raceStamp - nowStamp) / 86400000));
}

export function getWeeksToRace(daysToRace) {
  return Math.ceil(daysToRace / 7);
}

export function getCurrentPhaseIndex(daysToRace) {
  const index = phaseRoadmap.findIndex((phase) => daysToRace >= phase.minDays && daysToRace <= phase.maxDays);

  if (index >= 0) {
    return index;
  }

  if (daysToRace > phaseRoadmap[0].maxDays) {
    return 0;
  }

  return phaseRoadmap.length - 1;
}
