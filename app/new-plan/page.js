"use client";

import { useState } from "react";
import AppShell from "../../components/AppShell";
import LoadingModal from "../../components/LoadingModal";
import StatusToast from "../../components/StatusToast";

const distanceOptions = [
  { value: "42", label: "42.195 km Marathon", enabled: true },
  { value: "21", label: "21.1 km Half Marathon", enabled: false },
  { value: "10", label: "10 km", enabled: false },
];

const profileFields = [
  {
    id: "age",
    label: "Age",
    kind: "input",
    inputType: "number",
    defaultValue: "25",
    min: 10,
    max: 100,
    step: 1,
    unit: "years",
  },
  {
    id: "gender",
    label: "Gender",
    options: ["Male", "Female"],
    defaultValue: "Male",
  },
  {
    id: "height",
    label: "Height",
    kind: "input",
    inputType: "number",
    defaultValue: "1.70",
    min: 1.2,
    max: 2.3,
    step: 0.01,
    unit: "m",
  },
  {
    id: "weight",
    label: "Weight",
    kind: "input",
    inputType: "number",
    defaultValue: "65",
    min: 30,
    max: 200,
    step: 0.1,
    unit: "kg",
  },
  {
    id: "fitness",
    label: "Current Fitness Level",
    options: ["Beginner", "Intermediate"],
    defaultValue: "Beginner",
  },
  {
    id: "experience",
    label: "Running Experience",
    options: ["Runs <2km a week", "Runs 2-5km a week", "Runs 5-10km a week", "Runs >10km a week"],
    defaultValue: "Runs 2-5km a week",
  },
  {
    id: "marathonExp",
    label: "Marathon Experience",
    options: ["None", "Completed one half marathon", "One full marathon completed", "Two or more marathons completed"],
    defaultValue: "None",
  },
  {
    id: "injury",
    label: "Injury History",
    options: ["No prior injuries or health conditions", "Minor prior knee discomfort"],
    defaultValue: "No prior injuries or health conditions",
  },
  {
    id: "goal",
    label: "Training Goal",
    options: ["Complete marathon under 5 hours", "Complete marathon comfortably"],
    defaultValue: "Complete marathon under 5 hours",
  },
  {
    id: "preference",
    label: "Training Preference",
    options: ["3 runs per week, preferably in the evenings", "4 runs per week, mixed timings"],
    defaultValue: "3 runs per week, preferably in the evenings",
  },
];

const initialProfile = profileFields.reduce((accumulator, field) => {
  accumulator[field.id] = field.defaultValue;
  return accumulator;
}, {});

export default function NewPlanPage() {
  const [distance, setDistance] = useState("42");
  const [profile, setProfile] = useState(initialProfile);
  const [raceDateTime, setRaceDateTime] = useState("");
  const [submitted, setSubmitted] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  function updateField(fieldId, value) {
    setProfile((current) => ({ ...current, [fieldId]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setLoadingPlan(true);

    const payload = {
      distance,
      profile,
      raceDateTime,
    };

    window.setTimeout(() => {
      setSubmitted(payload);
      setLoadingPlan(false);
      setToastMessage("Plan created successfully.");
    }, 1500);
  }

  return (
    <AppShell title="Plan Builder" subtitle="Set your runner profile and lock race details in Singapore local timing.">
      <form onSubmit={handleSubmit} className="grid">
        <section className="card stack">
          <h2>Select race distance</h2>
          <p>Only full marathon is enabled right now.</p>
          <div className="distance-grid">
            {distanceOptions.map((option) => {
              const isSelected = distance === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  className={`distance-card ${isSelected ? "is-selected" : ""}`}
                  onClick={() => option.enabled && setDistance(option.value)}
                  disabled={!option.enabled}
                >
                  <span className="distance-title">{option.label}</span>
                  <span className="distance-meta">{option.enabled ? "Available now" : "Coming soon"}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="card stack">
          <h2>Runner profile</h2>
          <div className="form-grid">
            {profileFields.map((field) => {
              if (field.kind === "input") {
                return (
                  <div key={field.id} className="mcq-block">
                    <label className="mcq-label" htmlFor={field.id}>
                      {field.label}
                    </label>
                    <div className="field">
                      <input
                        id={field.id}
                        type={field.inputType}
                        min={field.min}
                        max={field.max}
                        step={field.step}
                        value={profile[field.id]}
                        onChange={(event) => updateField(field.id, event.target.value)}
                        required
                      />
                    </div>
                    <p className="meta">Unit: {field.unit}</p>
                  </div>
                );
              }

              return (
                <div key={field.id} className="mcq-block">
                  <p className="mcq-label">{field.label}</p>
                  <div className="mcq-options">
                    {field.options.map((option) => (
                      <button
                        key={option}
                        type="button"
                        className={`mcq-pill ${profile[field.id] === option ? "is-selected" : ""}`}
                        onClick={() => updateField(field.id, option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="card stack">
          <h2>Marathon date and time</h2>
          <div className="field">
            <label htmlFor="raceDateTime">Race date and time (SGT)</label>
            <input
              id="raceDateTime"
              type="datetime-local"
              value={raceDateTime}
              onChange={(event) => setRaceDateTime(event.target.value)}
              required
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loadingPlan}>
            {loadingPlan ? "Creating plan..." : "Generate plan"}
          </button>
        </section>
      </form>

      {submitted && (
        <section className="card stack">
          <h3>Generated plan summary</h3>
          <p>
            Target distance: {distanceOptions.find((option) => option.value === submitted.distance)?.label || "42.195 km Marathon"} | Goal: {submitted.profile.goal}
          </p>
          <div className="notice">
            Suggested framework: 6-month progression, low initial mileage jump, ~80% easy-intensity training,
            peak long run around 30-31 km, and heat adaptation focus in the final 10-14 days before race day.
          </div>
          <p className="meta">Race date/time recorded: {submitted.raceDateTime} (interpreted as local Singapore timing).</p>
        </section>
      )}

      <StatusToast message={toastMessage} onClose={() => setToastMessage("")} />
      <LoadingModal open={loadingPlan} title="Creating training plan" description="Calibrating your marathon roadmap..." />
    </AppShell>
  );
}
