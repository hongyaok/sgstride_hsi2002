"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import SingaporeClock from "../components/SingaporeClock";
import ThemeToggle from "../components/ThemeToggle";
import LoadingModal from "../components/LoadingModal";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.2-1.5 3.7-5.5 3.7-3.3 0-6-2.8-6-6.2s2.7-6.2 6-6.2c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 2.7 14.7 2 12 2 6.8 2 2.6 6.4 2.6 12s4.2 10 9.4 10c5.4 0 9-3.8 9-9.2 0-.6-.1-1.1-.2-1.6H12z" />
    </svg>
  );
}

function StravaIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path fill="#fc4c02" d="M10.7 2L5.2 12.8h3.3l2.2-4.4 2.2 4.4h3.3L10.7 2zm5.5 10.8l-2.7 5.3-1.4-2.8H8.8l4.7 8.7 6-11.2h-3.3z" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [loadingProvider, setLoadingProvider] = useState("");

  function startLogin(provider) {
    setLoadingProvider(provider);
    window.setTimeout(() => {
      router.push("/home");
    }, 1500);
  }

  return (
    <div className="page">
      <div className="shell">
        <div className="top-row">
          <SingaporeClock />
          <ThemeToggle />
        </div>

        <section className="panel login-card stack">
          <div>
            <div className="brand-kicker">StrideSG Marathon</div>
            <h1>Train smart for your next marathon.</h1>
            <p style={{ marginTop: "0.7rem" }}>
              Singapore-focused coaching flow with pacing, heat, hydration, and recovery guidance.
            </p>
          </div>

          <div className="stack" style={{ marginTop: "0.2rem" }}>
            <button className="btn btn-primary" type="button" onClick={() => startLogin("Google")}>
              <GoogleIcon /> Continue with Google
            </button>
            <button className="btn btn-secondary" type="button" onClick={() => startLogin("Strava")}>
              <StravaIcon /> Connect with Strava
            </button>
          </div>

          <p className="footer-note">No backend auth yet. This button flow is hardcoded for demo use.</p>
        </section>

        <LoadingModal
          open={Boolean(loadingProvider)}
          title={`Signing in with ${loadingProvider}`}
          description="Preparing your dashboard..."
        />
      </div>
    </div>
  );
}
