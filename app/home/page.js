"use client";

import { useMemo } from "react";
import Link from "next/link";
import AppShell from "../../components/AppShell";
import { getCurrentPhaseIndex, getDaysToRace, getWeeksToRace, phaseRoadmap } from "../../lib/roadmap";

export default function HomePage() {
  const daysToRace = useMemo(() => getDaysToRace(), []);
  const weeksToRace = useMemo(() => getWeeksToRace(daysToRace), [daysToRace]);
  const currentPhaseIndex = useMemo(() => getCurrentPhaseIndex(daysToRace), [daysToRace]);

  return (
    <AppShell
      title="Welcome back, Xavier!"
      subtitle="Pick your next step: review today&apos;s guidance or build your race setup."
    >
      <section className="option-grid">
        <article className="option-card">
          <h2>Today&apos;s Guidance</h2>
          <p>
            View today&apos;s training, hydration, and nutrition suggestions based on your evening race goal.
          </p>
          <Link href="/existing-plan" className="btn btn-primary">
            Open Today&apos;s View
          </Link>
        </article>

        <article className="option-card">
          <h2>Build Race Setup</h2>
          <p>
            Configure your profile, distance, and race timing to generate a structured plan.
          </p>
          <Link href="/new-plan" className="btn btn-secondary">
            Start Setup
          </Link>
        </article>

        {/* <article className="option-card">
          <h2>Training History</h2>
          <p>
            Review expected vs actual pace, distance, time, nutrition, and sleep logs in one timeline.
          </p>
          <Link href="/existing-plan?view=history" className="btn btn-ghost">
            Open History
          </Link>
        </article> */}
      </section>

      <section className="card stack">
        <h2>Roadmap snapshot</h2>
        <p>
          {daysToRace} days to race day ({weeksToRace} weeks). Current phase highlighted below.
        </p>
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
      </section>

      <section className="card">
        <h3>Performance focus</h3>
        <p>
          This app is tuned for the Singapore climate and references evidence-informed pacing, heat adaptation,
          and low-intensity volume balance for novice marathon preparation.
        </p>
      </section>
    </AppShell>
  );
}
