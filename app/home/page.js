"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppShell from "../../components/AppShell";
import InfoModal from "../../components/InfoModal";
import { getCurrentPhaseIndex, getDaysToRace, getWeeksToRace, phaseRoadmap } from "../../lib/roadmap";

export default function HomePage() {
  const [showRoadmapIntro, setShowRoadmapIntro] = useState(false);
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [isRoadmapMoving, setIsRoadmapMoving] = useState(false);
  const [showPhaseDetails, setShowPhaseDetails] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const daysToRace = useMemo(() => getDaysToRace(), []);
  const weeksToRace = useMemo(() => getWeeksToRace(daysToRace), [daysToRace]);
  const currentPhaseIndex = useMemo(() => getCurrentPhaseIndex(daysToRace), [daysToRace]);

  useEffect(() => {
    setAnimatedProgress(0);
    setShowRoadmapIntro(true);
  }, []);

  useEffect(() => {
    if (!showRoadmapIntro) {
      setIsRoadmapMoving(false);
      setShowPhaseDetails(false);
      setShowConfetti(false);
      return;
    }

    setAnimatedProgress(0);
    setShowPhaseDetails(false);
    setIsRoadmapMoving(true);
    setShowConfetti(false);

    const duration = 2100;
    const detailDelay = 260;
    const startTime = window.performance.now();
    let rafId = null;
    let detailTimerId = null;
    let confettiTimerId = null;

    const easeInOutCubic = (value) => {
      if (value < 0.5) {
        return 4 * value * value * value;
      }

      return 1 - ((-2 * value + 2) ** 3) / 2;
    };

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeInOutCubic(progress);

      setAnimatedProgress(eased * currentPhaseIndex);

      if (progress < 1) {
        rafId = window.requestAnimationFrame(animate);
        return;
      }

      setAnimatedProgress(currentPhaseIndex);
      setIsRoadmapMoving(false);
      setShowConfetti(true);
      detailTimerId = window.setTimeout(() => {
        setShowPhaseDetails(true);
      }, detailDelay);
      confettiTimerId = window.setTimeout(() => {
        setShowConfetti(false);
      }, 2200);
    };

    rafId = window.requestAnimationFrame(animate);

    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }

      if (detailTimerId !== null) {
        window.clearTimeout(detailTimerId);
      }

      if (confettiTimerId !== null) {
        window.clearTimeout(confettiTimerId);
      }
    };
  }, [currentPhaseIndex, showRoadmapIntro]);

  const stepWidth = 150;
  const edgePadding = 110;
  const railWidth = edgePadding * 2 + Math.max(phaseRoadmap.length - 1, 0) * stepWidth;
  const trackWidth = Math.max(phaseRoadmap.length - 1, 0) * stepWidth;
  const pointerPosition = edgePadding + animatedProgress * stepWidth;
  const roundedAnimatedIndex = isRoadmapMoving ? Math.round(animatedProgress) : currentPhaseIndex;
  const currentPhase = phaseRoadmap[currentPhaseIndex];
  const progressPercent =
    phaseRoadmap.length > 1 ? Math.round((animatedProgress / (phaseRoadmap.length - 1)) * 100) : 100;

  return (
    <>
      <AppShell
        title="Welcome back, Xavier!"
        subtitle="Pick your next step: review today&apos;s guidance or build your race setup."
      >
        <section className="option-grid">
          <article className="option-card">
            <h2>Today&apos;s training plan</h2>
            <p>
              View today&apos;s training, hydration, and nutrition suggestions based on your evening race goal.
            </p>
            <Link href="/existing-plan" className="btn btn-primary">
              Open Today&apos;s Plan
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
          <h2>Training roadmap</h2>
          <p>
            {daysToRace} days to race day ({weeksToRace} weeks). Current phase highlighted below.
          </p>
          <details>
            <summary>Show roadmap details</summary>
            <div className="phase-list" style={{ marginTop: "0.8rem" }}>
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
          </details>
        </section>

        <section className="card">
          <h3>Performance focus</h3>
          <p>
            This app is tuned for the Singapore climate and references evidence-informed pacing, heat adaptation,
            and low-intensity volume balance for novice marathon preparation.
          </p>
        </section>
      </AppShell>

      <InfoModal
        open={showRoadmapIntro}
        onClose={() => setShowRoadmapIntro(false)}
        title="Your training roadmap"
        scrollable={false}
      >
        <div className="stack">
          <p className="meta">
            We mapped your current position from Start to <strong>{phaseRoadmap[currentPhaseIndex]?.name}</strong>.
          </p>
          <p className="intro-progress-copy">You are {progressPercent}% there.</p>
          <div className="intro-roadmap" aria-live="polite">
            {showConfetti && (
              <div className="intro-confetti" aria-hidden="true">
                {Array.from({ length: 14 }).map((_, index) => (
                  <span key={`confetti-${index}`} className={`confetti-piece c-${(index % 7) + 1}`} />
                ))}
              </div>
            )}
            <div className="intro-roadmap-viewport" role="presentation">
              <div
                className="intro-roadmap-rail"
                style={{
                  width: `${railWidth}px`,
                  left: "50%",
                  transform: `translateX(-${pointerPosition}px)`,
                }}
              >
                <div className="intro-roadmap-line" style={{ left: `${edgePadding}px`, width: `${trackWidth}px` }}>
                  <div className="intro-roadmap-progress" style={{ width: `${animatedProgress * stepWidth}px` }} />
                </div>

                {phaseRoadmap.map((phase, index) => {
                  const stopLeft = edgePadding + index * stepWidth;
                  const isReached = index <= animatedProgress + 0.02;
                  const isCurrentStop = index === roundedAnimatedIndex;

                  return (
                    <div
                      key={phase.name}
                      className={`intro-roadmap-stop ${isReached ? "is-reached" : ""} ${isCurrentStop ? "is-current" : ""}`}
                      style={{ left: `${stopLeft}px` }}
                    >
                      <span className="intro-roadmap-dot" />
                      <span className="intro-roadmap-label">{phase.name}</span>
                    </div>
                  );
                })}
              </div>
              <div className={`intro-roadmap-pointer ${isRoadmapMoving ? "is-moving" : ""}`}>Runner</div>
            </div>
            <div className={`intro-phase-detail ${showPhaseDetails ? "is-visible" : ""}`}>
              <p className="intro-phase-title">{currentPhase?.name}</p>
              <p>{currentPhase?.focus}</p>
            </div>
          </div>

          <div className="split">
            <Link href="/existing-plan" className="btn btn-primary">
              Go to today&apos;s training plan
            </Link>
            <Link href="/existing-plan?view=history" className="btn btn-secondary">
              Show training history
            </Link>
          </div>
        </div>
      </InfoModal>
    </>
  );
}
