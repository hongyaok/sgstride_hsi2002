"use client";

import { useMemo, useState } from "react";
import AppShell from "../../components/AppShell";
import LoadingModal from "../../components/LoadingModal";
import StatusToast from "../../components/StatusToast";
import { getCurrentPhaseIndex, getDaysToRace, getWeeksToRace, phaseRoadmap, raceDateSgt } from "../../lib/roadmap";

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

function getSingaporeWeekday() {
  return new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: "Asia/Singapore" }).format(new Date());
}

export default function ExistingPlanPage() {
  const [showProgress, setShowProgress] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [loadingStrava, setLoadingStrava] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const weekday = useMemo(getSingaporeWeekday, []);
  const daysToRace = useMemo(() => getDaysToRace(), []);
  const weeksToRace = useMemo(() => getWeeksToRace(daysToRace), [daysToRace]);
  const today = dailyPlan[weekday] || dailyPlan.Monday;
  const currentPhaseIndex = useMemo(() => getCurrentPhaseIndex(daysToRace), [daysToRace]);

  function handleManualSubmit(event) {
    event.preventDefault();
    setToastMessage("Training entry logged successfully.");
  }

  function handleStravaSync() {
    setLoadingStrava(true);
    window.setTimeout(() => {
      setLoadingStrava(false);
      setToastMessage("Strava entry synced successfully.");
    }, 1800);
  }

  return (
    <AppShell title="Today&apos;s Plan" subtitle="Live guidance for Singapore conditions and evening-race preparation.">
      <section className="card stack">
        <h2>{daysToRace} days to competition</h2>
        <p>
          You are {weeksToRace} weeks away from race flag-off at 5:00 PM SGT.
        </p>
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
                <label htmlFor="distance">Distance (km)</label>
                <input id="distance" name="distance" type="number" min="0" step="0.1" defaultValue="5.0" />
              </div>
              <div className="field">
                <label htmlFor="duration">Duration (minutes)</label>
                <input id="duration" name="duration" type="number" min="0" step="1" defaultValue="35" />
              </div>
            </div>

            <div className="field">
              <label htmlFor="rpe">Effort (RPE 1-10)</label>
              <select id="rpe" name="rpe" defaultValue="4">
                {Array.from({ length: 10 }, (_, index) => index + 1).map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="notes">Session notes</label>
              <textarea id="notes" name="notes" defaultValue="Felt manageable in humid weather. Stayed mostly conversational." />
            </div>

            <button className="btn btn-primary" type="submit">
              Save training log
            </button>
          </form>
        )}

        <StatusToast message={toastMessage} onClose={() => setToastMessage("")} />
      </section>

      <LoadingModal
        open={loadingStrava}
        title="Syncing with Strava"
        description="Pulling your latest activity and updating today&apos;s entry..."
      />
    </AppShell>
  );
}
