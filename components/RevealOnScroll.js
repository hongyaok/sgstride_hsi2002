"use client";

import { useEffect, useRef, useState } from "react";

export default function RevealOnScroll({ children, delayMs = 0 }) {
  const nodeRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      setVisible(true);
      return undefined;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 }
    );

    const target = nodeRef.current;
    if (target) {
      observer.observe(target);
    }

    return () => {
      if (target) {
        observer.unobserve(target);
      }
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={nodeRef} className={`reveal-block ${visible ? "is-visible" : ""}`} style={{ transitionDelay: `${delayMs}ms` }}>
      {children}
    </div>
  );
}
