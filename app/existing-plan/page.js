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
    training: "Easy run 5 km (Zone 2), focus on conversational pace and relaxed cadence.",
    nutrition: "Prioritize carbs and protein at dinner (rice + lean protein + vegetables).",
    hydration: "500 ml in the hour pre-run, then 150-250 ml every 20 minutes in humid conditions.",
  },
  Tuesday: {
    training: "Strength day (lower body + trunk), 35 minutes. Optional 20-minute recovery walk.",
    nutrition: "Protein-first meals and omega-3 rich foods to support muscular recovery.",
    hydration: "Aim pale-yellow urine through day; add sodium at lunch and dinner.",
  },
  Wednesday: {
    training: "Quality session: 6 x 400 m comfortably hard, with easy jog recoveries.",
    nutrition: "Pre-session snack with 30-45 g carbs. Post-session carbs + protein within 1 hour.",
    hydration: "Start hydrated and include electrolytes if running in late-afternoon heat.",
  },
  Thursday: {
    training: "Rest or mobility (hips, calves, ankles). Keep total load low.",
    nutrition: "Balanced intake with vegetables, iron-rich foods, and adequate total calories.",
    hydration: "2.2-2.8 L fluid over the day, adjusted for weather and sweat rate.",
  },
  Friday: {
    training: "Easy run 6 km + 4 short strides. Keep effort controlled.",
    nutrition: "Moderate carbs through day, light pre-run snack if training after classes/work.",
    hydration: "Sip regularly throughout afternoon; avoid starting the run already dehydrated.",
  },
  Saturday: {
    training: "Long run (gradual build phase): 10-14 km at easy effort.",
    nutrition: "For runs >90 min, take 30-60 g carbs per hour and refuel post-run quickly.",
    hydration: "Use electrolytes during run; account for Singapore humidity and heat stress.",
  },
  Sunday: {
    training: "Recovery day. Optional 25-minute light walk or gentle mobility routine.",
    nutrition: "Keep protein spread across meals; include fruit and whole grains.",
    hydration: "Top up fluids and sodium to prepare for next training week.",
  },
};

const hardcodedHistory = [
  {
    date: "10 Apr 2026",
    expectedPace: "7:05 /km",
    actualPace: "7:12 /km",
    expectedDistance: "6.0 km",
    actualDistance: "5.8 km",
    expectedTime: "42 min",
    actualTime: "41 min",
    nutritionExpected: "60g carbs + 20g protein",
    nutritionActual: "55g carbs + 18g protein",
    sleepExpected: "7h 30m",
    sleepActual: "7h 05m",
  },
  {
    date: "08 Apr 2026",
    expectedPace: "6:55 /km",
    actualPace: "7:01 /km",
    expectedDistance: "8.0 km",
    actualDistance: "8.0 km",
    expectedTime: "55 min",
    actualTime: "56 min",
    nutritionExpected: "70g carbs + electrolytes",
    nutritionActual: "70g carbs + electrolytes",
    sleepExpected: "8h 00m",
    sleepActual: "7h 40m",
  },
  {
    date: "06 Apr 2026",
    expectedPace: "7:20 /km",
    actualPace: "7:18 /km",
    expectedDistance: "5.0 km",
    actualDistance: "5.1 km",
    expectedTime: "37 min",
    actualTime: "37 min",
    nutritionExpected: "Balanced dinner + hydration",
    nutritionActual: "Balanced dinner + hydration",
    sleepExpected: "7h 30m",
    sleepActual: "7h 20m",
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
          Suggested sessions for {weekday} <span className="badge">Singapore local day</span>
        </h2>
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

      <section className="card stack">
        <h3>Daily wellness check-in</h3>
        <p>Record nutrition intake and sleep schedule for better recovery tracking.</p>
        <form className="form-grid" onSubmit={handleWellnessSubmit}>
          <div className="split">
            <div className="field">
              <label htmlFor="nutritionIntake">Nutrition intake</label>
              <input id="nutritionIntake" name="nutritionIntake" type="text" placeholder="E.g. 2200 kcal, 320g carbs" required />
            </div>
            <div className="field">
              <label htmlFor="hydrationIntake">Hydration (ml)</label>
              <input id="hydrationIntake" name="hydrationIntake" type="number" min="0" step="50" placeholder="2800" required />
            </div>
          </div>

          <div className="split">
            <div className="field">
              <label htmlFor="sleepStart">Sleep start</label>
              <input id="sleepStart" name="sleepStart" type="time" required />
            </div>
            <div className="field">
              <label htmlFor="sleepEnd">Wake up</label>
              <input id="sleepEnd" name="sleepEnd" type="time" required />
            </div>
          </div>

          <div className="field">
            <label htmlFor="sleepHours">Total sleep hours</label>
            <input id="sleepHours" name="sleepHours" type="number" min="0" max="24" step="0.1" placeholder="7.5" required />
          </div>

          <button type="submit" className="btn btn-secondary">
            Save wellness input
          </button>
        </form>
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
