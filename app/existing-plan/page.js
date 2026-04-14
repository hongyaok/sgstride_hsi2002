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
    sleep: "Aim for 7-9 hours! Sleep deprivation causes a more deleterious effect on endurance performance in exercises lasting more than 30 min.",
  },
  Tuesday: {  
    training: "Strength day (lower body + trunk), 35 minutes. Optional 20-minute recovery walk.",
    nutrition: "Protein-first meals and omega-3 rich foods to support muscular recovery.",
    hydration: "Aim pale-yellow urine through day; add sodium at lunch and dinner.",
    sleep: "Aim for 7-9 hours, sleep deprivation causes a more deleterious effect on endurance performance in exercises lasting more than 30 min.",
  },
  Wednesday: {
    training: "Quality session: 6 x 400 m comfortably hard, with easy jog recoveries.",
    nutrition: "Pre-session snack with 30-45 g carbs. Post-session carbs + protein within 1 hour.",
    hydration: "Start hydrated and include electrolytes if running in late-afternoon heat.",
    sleep: "Aim for 7-9 hours, sleep deprivation causes a more deleterious effect on endurance performance in exercises lasting more than 30 min.",
  },
  Thursday: {
    training: "85% HRmax tempo run for 10km.",
    nutrition: "Balanced meals, with protein intake of 104g, carbs intake of around 325g-780g",
    hydration: "450ml-750ml fluid per hour over the day, adjust for weather and sweat rate. Target about 500-700mg of sodium per litre of fluid.",
    sleep: "Aim for 7-9 hours! Sleep deprivation causes a more deleterious effect on endurance performance in exercises lasting more than 30 min.",
  },
  Friday: {
    training: "Easy run 6 km + 4 short strides. Keep effort controlled.",
    nutrition: "Moderate carbs through day, light pre-run snack if training after classes/work.",
    hydration: "Sip regularly throughout afternoon; avoid starting the run already dehydrated.",
    sleep: "Aim for 7-9 hours, sleep deprivation causes a more deleterious effect on endurance performance in exercises lasting more than 30 min.",
  },
  Saturday: {
    training: "Long run (gradual build phase): 10-14 km at easy effort.",
    nutrition: "For runs >90 min, take 30-60 g carbs per hour and refuel post-run quickly.",
    hydration: "Use electrolytes during run; account for Singapore humidity and heat stress.",
    sleep: "Aim for 7-9 hours, sleep deprivation causes a more deleterious effect on endurance performance in exercises lasting more than 30 min.",
  },
  Sunday: {
    training: "Recovery day. Optional 25-minute light walk or gentle mobility routine.",
    nutrition: "Keep protein spread across meals; include fruit and whole grains.",
    hydration: "Top up fluids and sodium to prepare for next training week.",
    sleep: "Aim for 7-9 hours, sleep deprivation causes a more deleterious effect on endurance performance in exercises lasting more than 30 min.",
  },
};

const hardcodedHistory = [
  {
    date: "14 Apr 2026",
    expectedPace: "6:40 /km",
    actualPace: "6:44 /km",
    expectedDistance: "16.0 km",
    actualDistance: "15.8 km",
    expectedTime: "107 min",
    actualTime: "106 min",
    nutritionExpected: "90g carbs pre + 45g carbs during + electrolytes",
    nutritionActual: "85g carbs pre + 40g carbs during + electrolytes",
    sleepExpected: "8h 00m",
    sleepActual: "7h 40m",
  },
  {
    date: "12 Apr 2026",
    expectedPace: "6:55 /km",
    actualPace: "7:00 /km",
    expectedDistance: "28.0 km",
    actualDistance: "27.5 km",
    expectedTime: "194 min",
    actualTime: "193 min",
    nutritionExpected: "120g carbs pre + 60g carbs per hour + sodium",
    nutritionActual: "110g carbs pre + 55g carbs per hour + sodium",
    sleepExpected: "8h 00m",
    sleepActual: "7h 35m",
  },
  {
    date: "10 Apr 2026",
    expectedPace: "6:30 /km",
    actualPace: "6:34 /km",
    expectedDistance: "12.0 km",
    actualDistance: "12.0 km",
    expectedTime: "78 min",
    actualTime: "79 min",
    nutritionExpected: "80g carbs pre + recovery meal within 60 min",
    nutritionActual: "75g carbs pre + recovery meal within 60 min",
    sleepExpected: "7h 45m",
    sleepActual: "7h 30m",
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
