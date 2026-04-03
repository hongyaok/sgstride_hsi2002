export const raceDateSgt = "2026-05-22T17:00:00+08:00";

export const phaseRoadmap = [
  {
    name: "Foundation Build",
    window: "Weeks 1-4",
    focus: "Establish routine and keep weekly mileage jumps conservative.",
    minDays: 141,
    maxDays: 180,
  },
  {
    name: "Capacity Build",
    window: "Weeks 5-12",
    focus: "Build aerobic consistency with most sessions at easy intensity.",
    minDays: 99,
    maxDays: 140,
  },
  {
    name: "Marathon Specific",
    window: "Weeks 13-18",
    focus: "Gradually stretch long runs toward the 30-31 km peak range.",
    minDays: 56,
    maxDays: 98,
  },
  {
    name: "Race Sharpening",
    window: "Weeks 19-22",
    focus: "Refine pacing, hydration timing, and evening heat readiness.",
    minDays: 15,
    maxDays: 55,
  },
  {
    name: "Taper",
    window: "Final 10-14 days",
    focus: "Reduce fatigue while maintaining race feel and confidence.",
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
