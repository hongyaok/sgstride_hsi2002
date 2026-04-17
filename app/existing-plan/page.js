"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "../../components/AppShell";
import InfoModal from "../../components/InfoModal";
import LoadingModal from "../../components/LoadingModal";
import StatusToast from "../../components/StatusToast";
import { getCurrentPhaseIndex, getDaysToRace, getWeeksToRace, phaseRoadmap } from "../../lib/roadmap";
import { defaultRunnerProfile, loadPlanInputSnapshot } from "../../lib/runnerProfile";

const dailyPlan = {
  Monday: {
    training: "Easy run 8 km (Zone 1: <75% HRmax). Focus on RPE 1-3 and maintain 'Full Sentences' talk test.",
    nutrition: "Daily target: 325g-780g carbs (5-12g/kg) and ~104g protein (1.6g/kg).",
    hydration: "450-750 ml fluid/hour. Aim for net fluid deficit below 2-3% of body mass.",
    sleep: "Aim for 7-9 hours. Endurance performance is significantly impaired in exercises >30 min by sleep deprivation.",
  },
  Tuesday: {  
    training: "Strength Day (ST1): Lower body high load (3-5 reps @ 85-90% 1RM) + core work. Rest legs from running.",
    nutrition: "Consistent protein intake (1.6g/kg) to support neuromuscular adaptations from high-load strength training.",
    hydration: "Maintain consistent hydration throughout the day; keep sodium intake around 500-700mg per liter of fluid.",
    sleep: "Aim for 7-9 hours. Training load increase can reduce objective sleep efficiency.",
  },
  Wednesday: {
    training: "Quality Session: 14 km total. Include 8 km at Marathon Effort (75-82% HRmax, RPE 5-6).",
    nutrition: "Pre-run: 1-4g/kg carbs (65g-260g). During run: 60g carbs/hour (for 2-3 hour duration).",
    hydration: "Electrolyte replenishment mandatory. Target 150-250 ml increments every 20 minutes.",
    sleep: "7-9 hours required for recovery and injury resilience.",
  },
  Thursday: {
    training: "Rest Day. No running or strength to manage cumulative fatigue during Peak Phase.",
    nutrition: "Balanced meals, with protein intake of 104g, carbs intake of around 325g-780g",
    hydration: "450ml-750ml fluid per hour over the day, adjust for weather and sweat rate. Target about 500-700mg of sodium per litre of fluid.",
    sleep: "Aim for 7-9 hours! Sleep deprivation causes a more deleterious effect on endurance performance in exercises lasting more than 30 min.",
  },
  Friday: {
    training: "Rest Day. Optional light mobility only.",
    nutrition: "Consistent carbohydrate intake (5-12g/kg) to top up glycogen for tomorrow's peak long run.",
    hydration: "Ensure you are fully hydrated before the long run; monitor urine color (pale yellow).",
    sleep: "7-9 hours. Prioritize sleep quality to offset high training volume.",
  },
  Saturday: {
    training: "Peak Long Run: 28 km (Zone 1). Keep effort easy and controlled to avoid overtraining.",
    nutrition: "Intake up to 90g carbs/hour for sessions >3 hours. Use multiple transportable carbohydrates (glucose:fructose).",
    hydration: "Singapore heat/humidity strategy: 500-750 ml/hour with 500-700 mg sodium/liter.",
    sleep: "7-9 hours. Post-run stretching (PNF) may be used to relieve marathon-level fatigue.",
  },
  Sunday: {
    training: "Rest Day. Complete recovery to allow for physiological adaptations and tissue repair.",
    nutrition: "Focus on refueling: Post-session carbs + protein within 1 hour to maximize recovery.",
    hydration: "Rehydrate based on body mass loss during Saturday's run.",
    sleep: "7-9 hours to reset for the next high-volume week.",
  },
};

const hardcodedHistory = [
  {
    date: "15 Apr 2026", // Wednesday Quality Run
    expectedIntensity: "Marathon Effort (75-82% HRmax)",
    actualIntensity: "80% HRmax (Average)",
    expectedPace: "7:00 /km",
    actualPace: "7:04 /km",
    expectedDistance: "14.0 km",
    actualDistance: "14.0 km",
    expectedTime: "98 min",
    actualTime: "100 min",
    nutritionExpected: "60g CHO/hour (approx. 90g total)",
    nutritionActual: "80g total (gels + sports drink)",
    sleepExpected: "8h 00m",
    sleepActual: "7h 50m",
  },
  {
    date: "13 Apr 2026", // Monday Easy Run
    expectedIntensity: "Zone 1 (<75% HRmax)",
    actualIntensity: "72% HRmax",
    expectedPace: "7:30 /km", // Based on Zone 1 recovery effort
    actualPace: "7:35 /km",
    expectedDistance: "8.0 km",
    actualDistance: "8.2 km",
    expectedTime: "60 min",
    actualTime: "62 min",
    nutritionExpected: "Daily 1.6g/kg Protein",
    nutritionActual: "105g Protein recorded",
    sleepExpected: "8h 00m",
    sleepActual: "7h 15m",
  },
  {
    date: "11 Apr 2026", // Saturday Long Run
    expectedIntensity: "Zone 1 (RPE 1-3)",
    actualIntensity: "RPE 3 (Zone 1 HR)",
    expectedPace: "7:30 /km", 
    actualPace: "7:40 /km",
    expectedDistance: "28.0 km",
    actualDistance: "28.0 km",
    expectedTime: "210 min",
    actualTime: "215 min",
    nutritionExpected: "90g CHO/hour (multiple transportable)",
    nutritionActual: "Approx 85g CHO/hour (gels + liquid)",
    sleepExpected: "8h 00m",
    sleepActual: "8h 10m",
  },
];

function getSingaporeWeekday() {
  return new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: "Asia/Singapore" }).format(new Date());
}

function getSingaporeDateLabel(date = new Date()) {
  return new Intl.DateTimeFormat("en-SG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Singapore",
  }).format(date);
}

export default function ExistingPlanPage() {
  const [showProgress, setShowProgress] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [showPlanInputs, setShowPlanInputs] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [loadingStrava, setLoadingStrava] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [historyEntries, setHistoryEntries] = useState(hardcodedHistory);
  const [planSnapshot, setPlanSnapshot] = useState(null);

  const weekday = useMemo(getSingaporeWeekday, []);
  const daysToRace = useMemo(() => getDaysToRace(), []);
  const weeksToRace = useMemo(() => getWeeksToRace(daysToRace), [daysToRace]);
  const today = dailyPlan[weekday] || dailyPlan.Monday;
  const currentPhaseIndex = useMemo(() => getCurrentPhaseIndex(daysToRace), [daysToRace]);

  useEffect(() => {
    setPlanSnapshot(loadPlanInputSnapshot());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get("view") === "history") {
      setShowHistory(true);
    }
  }, []);

  const activePlanProfile = planSnapshot || {
    name: defaultRunnerProfile.name,
    age: defaultRunnerProfile.age,
    gender: defaultRunnerProfile.gender,
    height: defaultRunnerProfile.height,
    weight: defaultRunnerProfile.weight,
    runningExperience: defaultRunnerProfile.runningExperience,
    marathonExperience: defaultRunnerProfile.marathonExperience,
    injuryHistory: defaultRunnerProfile.injuryHistory,
    targetTiming: defaultRunnerProfile.targetTiming,
  };

  function handleManualSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const entry = {
      date: getSingaporeDateLabel(),
      expectedPace: String(formData.get("expectedPace") || "-"),
      actualPace: String(formData.get("actualPace") || "-"),
      expectedDistance: `${String(formData.get("expectedDistance") || "-")} km`,
      actualDistance: `${String(formData.get("actualDistance") || "-")} km`,
      expectedTime: `${String(formData.get("expectedTime") || "-")} min`,
      actualTime: `${String(formData.get("actualTime") || "-")} min`,
      nutritionExpected: String(formData.get("nutritionExpected") || "-"),
      nutritionActual: String(formData.get("nutritionActual") || "-"),
      sleepExpected: String(formData.get("sleepExpected") || "-"),
      sleepActual: String(formData.get("sleepActual") || "-"),
    };

    setHistoryEntries((current) => [entry, ...current]);
    setToastMessage("Training entry logged successfully.");
    event.currentTarget.reset();
    setManualMode(false);
  }

  function handleWellnessSubmit(event) {
    event.preventDefault();
    setToastMessage("Nutrition and sleep check-in saved.");
    event.currentTarget.reset();
  }

  function handleStravaSync() {
    setLoadingStrava(true);
    window.setTimeout(() => {
      setLoadingStrava(false);
      setToastMessage("Strava entry synced successfully.");
    }, 1800);
  }

  return (
    <>
      <AppShell
        title="Today&apos;s Plan"
        subtitle="Live guidance for Singapore conditions and evening-race preparation."
        detailsMenu={
          <>
            <button type="button" className="nav-item nav-item-button" onClick={() => setShowPlanInputs(true)}>
              View plan inputs
            </button>
            <button type="button" className="nav-item nav-item-button" onClick={() => setShowHistory(true)}>
              Training history
            </button>
          </>
        }
      >
      <section className="card stack">
        <h2>{daysToRace} days to competition</h2>
        <p>
          You are {weeksToRace} weeks away from race flag-off at 5:00 PM SGT.
        </p>
        <div className="quick-stats">
          <div className="stat-pill">Current phase: {phaseRoadmap[currentPhaseIndex]?.name}</div>
        </div>
        <div className="notice">
          Countdown target: Singapore Standard Chartered Marathon, 22 May 2026, 5:00 PM (SGT).
        </div>
      </section>

      <section className="card stack">
        <h2>
          Suggested training for {weekday} <span className="badge">Singapore local day</span>
        </h2>
        <details>
          <summary>Show suggested training details</summary>
          <div className="stack" style={{ marginTop: "0.8rem" }}>
            <div className="split">
              <article className="card">
                <h3>Training</h3>
                <p>{today.training}</p>
              </article>
              <article className="card">
                <h3>Nutrition</h3>
                <p>{today.nutrition}</p>
              </article>
            </div>
            <article className="card">
              <h3>Hydration</h3>
              <p>{today.hydration}</p>
            </article>
            <article className="card">
              <h3>Sleep</h3>
              <p>{today.sleep}</p>
            </article>
          </div>
        </details>
      </section>

      <section className="card stack">
        <button className="btn btn-ghost" type="button" onClick={() => setShowProgress((value) => !value)}>
          {showProgress ? "Hide full roadmap" : "View full roadmap"}
        </button>

        {showProgress && (
          <div className="phase-list">
            {phaseRoadmap.map((phase, index) => {
              const isCurrent = currentPhaseIndex === index;

              return (
                <article key={phase.name} className={`phase-item ${isCurrent ? "is-current" : ""}`}>
                  {isCurrent && <div className="phase-pointer">You are here</div>}
                  <h3>{phase.name}</h3>
                  <p className="meta">{phase.window}</p>
                  <p>{phase.focus}</p>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="card stack">
        <h3>Log today&apos;s training</h3>
        <div className="split">
          <button type="button" className="btn btn-secondary" onClick={handleStravaSync}>
            Log with Strava
          </button>
          <button type="button" className="btn btn-primary" onClick={() => setManualMode((value) => !value)}>
            {manualMode ? "Close manual entry" : "Manual entry"}
          </button>
        </div>

        {manualMode && (
          <form className="form-grid" onSubmit={handleManualSubmit}>
            <div className="split">
              <div className="field">
                <label htmlFor="expectedPace">Expected pace</label>
                <input id="expectedPace" name="expectedPace" type="text" defaultValue="7:05 /km" required />
              </div>
              <div className="field">
                <label htmlFor="actualPace">Actual pace</label>
                <input id="actualPace" name="actualPace" type="text" placeholder="7:10 /km" required />
              </div>
            </div>

            <div className="split">
              <div className="field">
                <label htmlFor="expectedDistance">Expected distance (km)</label>
                <input id="expectedDistance" name="expectedDistance" type="number" min="0" step="0.1" defaultValue="5.0" required />
              </div>
              <div className="field">
                <label htmlFor="actualDistance">Actual distance (km)</label>
                <input id="actualDistance" name="actualDistance" type="number" min="0" step="0.1" required />
              </div>
            </div>

            <div className="split">
              <div className="field">
                <label htmlFor="expectedTime">Expected time (minutes)</label>
                <input id="expectedTime" name="expectedTime" type="number" min="0" step="1" defaultValue="35" required />
              </div>
              <div className="field">
                <label htmlFor="actualTime">Actual time (minutes)</label>
                <input id="actualTime" name="actualTime" type="number" min="0" step="1" required />
              </div>
            </div>

            <div className="field">
              <label htmlFor="nutritionExpected">Nutrition expected</label>
              <input
                id="nutritionExpected"
                name="nutritionExpected"
                type="text"
                defaultValue="60g carbs + hydration before run"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="nutritionActual">Nutrition actual</label>
              <input id="nutritionActual" name="nutritionActual" type="text" placeholder="What did you consume?" required />
            </div>

            <div className="split">
              <div className="field">
                <label htmlFor="sleepExpected">Sleep expected</label>
                <input id="sleepExpected" name="sleepExpected" type="text" defaultValue="7h 30m" required />
              </div>
              <div className="field">
                <label htmlFor="sleepActual">Sleep actual</label>
                <input id="sleepActual" name="sleepActual" type="text" placeholder="7h 10m" required />
              </div>
            </div>

            <button className="btn btn-primary" type="submit">
              Save training log
            </button>
          </form>
        )}

      </section>


      </AppShell>

      <LoadingModal
        open={loadingStrava}
        title="Syncing with Strava"
        description="Pulling your latest activity and updating today&apos;s entry..."
      />

      <InfoModal open={showPlanInputs} onClose={() => setShowPlanInputs(false)} title="Inputs used for this plan">
        <div className="profile-grid">
          <p>
            <strong>Age:</strong> {activePlanProfile.age} years old
          </p>
          <p>
            <strong>Gender:</strong> {activePlanProfile.gender}
          </p>
          <p>
            <strong>Body:</strong> {activePlanProfile.height}m, {activePlanProfile.weight}kg
          </p>
          <p>
            <strong>Running experience:</strong> {activePlanProfile.runningExperience}
          </p>
          <p>
            <strong>Marathon experience:</strong> {activePlanProfile.marathonExperience}
          </p>
          <p>
            <strong>Injury status:</strong> {activePlanProfile.injuryHistory}
          </p>
          <p>
            <strong>Target timing:</strong> {activePlanProfile.targetTiming}
          </p>
        </div>
      </InfoModal>

      <InfoModal open={showHistory} onClose={() => setShowHistory(false)} title="Training history">
        <p className="meta" style={{ marginBottom: "0.55rem" }}>
          Compare expected versus actual values for pace, distance, time, nutrition, and sleep.
        </p>
        <div className="history-list">
          {historyEntries.map((entry, index) => (
            <article key={`${entry.date}-${index}`} className="history-card">
              <h4>{entry.date}</h4>
              <div className="metrics-grid">
                <div className="metric">
                  <span>Expected pace</span>
                  <strong>{entry.expectedPace}</strong>
                </div>
                <div className="metric">
                  <span>Actual pace</span>
                  <strong>{entry.actualPace}</strong>
                </div>
                <div className="metric">
                  <span>Expected distance</span>
                  <strong>{entry.expectedDistance}</strong>
                </div>
                <div className="metric">
                  <span>Actual distance</span>
                  <strong>{entry.actualDistance}</strong>
                </div>
                <div className="metric">
                  <span>Expected time</span>
                  <strong>{entry.expectedTime}</strong>
                </div>
                <div className="metric">
                  <span>Actual time</span>
                  <strong>{entry.actualTime}</strong>
                </div>
                <div className="metric">
                  <span>Nutrition expected</span>
                  <strong>{entry.nutritionExpected}</strong>
                </div>
                <div className="metric">
                  <span>Nutrition actual</span>
                  <strong>{entry.nutritionActual}</strong>
                </div>
                <div className="metric">
                  <span>Sleep expected</span>
                  <strong>{entry.sleepExpected}</strong>
                </div>
                <div className="metric">
                  <span>Sleep actual</span>
                  <strong>{entry.sleepActual}</strong>
                </div>
              </div>
            </article>
          ))}
        </div>
      </InfoModal>

      <StatusToast message={toastMessage} onClose={() => setToastMessage("")} />
    </>
  );
}
