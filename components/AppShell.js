"use client";

import { Children, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import InfoModal from "./InfoModal";
import RevealOnScroll from "./RevealOnScroll";
import SingaporeClock from "./SingaporeClock";
import ThemeToggle from "./ThemeToggle";
import { loadRunnerProfile } from "../lib/runnerProfile";

export default function AppShell({ title, subtitle, children, detailsMenu }) {
  const pathname = usePathname();
  const router = useRouter();
  const [showNav, setShowNav] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [runnerProfile, setRunnerProfile] = useState(loadRunnerProfile);

  function handleLogout() {
    router.push("/");
  }

  useEffect(() => {
    setRunnerProfile(loadRunnerProfile());
  }, []);

  useEffect(() => {
    setShowNav(false);
    setShowDetails(false);
  }, [pathname]);

  return (
    <div className="page">
      <div className="shell">
        <div className="top-row">
          <SingaporeClock />
          <div className="top-actions">
            <ThemeToggle />
            <button type="button" className="top-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        <header className="panel header-card">
          <div className="header-brand-row">
            {/* <Image src="/horse.png" alt="StrideSG logo" width={42} height={42} className="header-logo" /> */}
            <div>
              <div className="brand-kicker header-kicker">StrideSG Marathon</div>
              <h1>{title}</h1>
            </div>
          </div>
          <p>{subtitle}</p>
          <div className="header-actions">
            <button
              type="button"
              className="nav-toggle"
              onClick={() => {
                setShowNav((value) => !value);
                setShowDetails(false);
              }}
            >
              {showNav ? "Hide pages" : "Pages"}
            </button>
            <button
              type="button"
              className="nav-toggle details-toggle"
              onClick={() => {
                setShowDetails((value) => !value);
                setShowNav(false);
              }}
            >
              {showDetails ? "Hide details" : "Details"}
            </button>
          </div>

          {showNav && (
            <nav className="nav-dropdown panel" aria-label="Page navigation">
              <Link href="/home" className="nav-item">
                Dashboard
              </Link>
              <Link href="/existing-plan" className="nav-item">
                Today
              </Link>
              <Link href="/new-plan" className="nav-item">
                Build Plan
              </Link>
            </nav>
          )}

          {showDetails && (
            <nav className="nav-dropdown panel" aria-label="Detail navigation">
              {detailsMenu}
              <button type="button" className="nav-item nav-item-button" onClick={() => setShowProfile(true)}>
                Runner Profile
              </button>
            </nav>
          )}
        </header>

        <main className="grid">
          {Children.toArray(children).map((child, index) => (
            <RevealOnScroll key={index} delayMs={index * 60}>
              {child}
            </RevealOnScroll>
          ))}
        </main>

        <InfoModal open={showProfile} onClose={() => setShowProfile(false)} title="Runner profile">
          <div className="profile-grid">
            <p>
              <strong>Name:</strong> {runnerProfile.name}
            </p>
            <p>
              <strong>Age:</strong> {runnerProfile.age} years old
            </p>
            <p>
              <strong>Gender:</strong> {runnerProfile.gender}
            </p>
            <p>
              <strong>Body:</strong> {runnerProfile.height} m, {runnerProfile.weight} kg
            </p>
            <p>
              <strong>Running experience:</strong> {runnerProfile.runningExperience}
            </p>
            <p>
              <strong>Marathon experience:</strong> {runnerProfile.marathonExperience}
            </p>
            <p>
              <strong>Injury status:</strong> {runnerProfile.injuryHistory}
            </p>
            <p>
              <strong>Target timing:</strong> {runnerProfile.targetTiming}
            </p>
          </div>
        </InfoModal>
      </div>
    </div>
  );
}
