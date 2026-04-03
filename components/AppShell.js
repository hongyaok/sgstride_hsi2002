import Link from "next/link";
import SingaporeClock from "./SingaporeClock";
import ThemeToggle from "./ThemeToggle";

export default function AppShell({ title, subtitle, children }) {
  return (
    <div className="page">
      <div className="shell">
        <div className="top-row">
          <SingaporeClock />
          <ThemeToggle />
        </div>

        <header className="panel header-card">
          <h1>{title}</h1>
          <p>{subtitle}</p>
          <div className="nav-row">
            <Link href="/home" className="nav-chip">
              Dashboard
            </Link>
            <Link href="/existing-plan" className="nav-chip">
              Today
            </Link>
            <Link href="/new-plan" className="nav-chip">
              Build Plan
            </Link>
          </div>
        </header>

        <main className="grid">{children}</main>
      </div>
    </div>
  );
}
