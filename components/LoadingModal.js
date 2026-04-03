"use client";

export default function LoadingModal({ open, title, description }) {
  if (!open) {
    return null;
  }

  return (
    <div className="loading-overlay" role="dialog" aria-modal="true" aria-live="polite">
      <div className="loading-modal panel">
        <div className="spinner" aria-hidden="true" />
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}
