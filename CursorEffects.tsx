"use client";

import { useEffect } from "react";

export function CursorEffects() {
  useEffect(() => {
    let frame = 0;
    let last = 0;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;

    if (reduceMotion || coarsePointer) {
      return;
    }

    function update(event: PointerEvent) {
      const now = performance.now();
      if (now - last < 48) {
        return;
      }

      last = now;
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        document.documentElement.style.setProperty("--pointer-x", `${event.clientX}px`);
        document.documentElement.style.setProperty("--pointer-y", `${event.clientY}px`);
      });
    }

    window.addEventListener("pointermove", update, { passive: true });
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", update);
    };
  }, []);

  return <div className="pointer-ripple-layer hidden md:block" aria-hidden="true" />;
}
