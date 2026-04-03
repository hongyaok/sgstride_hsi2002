"use client";

import { useEffect } from "react";

export default function StatusToast({ message, onClose }) {
  useEffect(() => {
    if (!message) {
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      onClose();
    }, 2600);

    return () => window.clearTimeout(timeout);
  }, [message, onClose]);

  if (!message) {
    return null;
  }

  return (
    <div className="toast-wrap" aria-live="polite">
      <div className="toast">{message}</div>
    </div>
  );
}
