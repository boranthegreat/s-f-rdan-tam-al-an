"use client";

import { useEffect, useMemo, useRef } from "react";

const segmentCount = 48;
const frameMs = 32;

export function AutoSlitherStage() {
  const sizes = useMemo(() => Array.from({ length: segmentCount }, (_, index) => Math.max(6, 26 - index * 0.34)), []);
  const stageRef = useRef<HTMLDivElement>(null);
  const segmentRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const stageSize = useRef({ width: 512, height: 184 });

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) {
      return;
    }

    const updateSize = () => {
      const rect = stage.getBoundingClientRect();
      stageSize.current = { width: rect.width, height: rect.height };
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let frame = 0;
    let last = 0;
    const start = performance.now();

    function animate(now: number) {
      if (now - last >= frameMs) {
        last = now;
        const elapsed = (now - start) / 1000;
        const { width, height } = stageSize.current;

        segmentRefs.current.forEach((segment, index) => {
          if (!segment) {
            return;
          }

          const phase = elapsed * 0.85 - index * 0.105;
          const scale = 1 - index * 0.004;
          const sin = Math.sin(phase);
          const x = width / 2 + sin * width * 0.43 * scale;
          const y = height * 0.48 + Math.sin(phase * 2) * height * 0.3 * scale;

          segment.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
          segment.style.opacity = String(Math.max(0.28, 1 - index * 0.012));
        });
      }

      frame = window.requestAnimationFrame(animate);
    }

    frame = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <div ref={stageRef} className="auto-slither-stage" aria-hidden="true">
      <svg className="auto-slither-orbit" viewBox="0 0 500 176" role="presentation">
        <path d="M 60 88 C 118 18 190 18 250 88 C 310 158 382 158 440 88 C 382 18 310 18 250 88 C 190 158 118 158 60 88" />
      </svg>
      <div className="auto-slither-core">BG</div>
      {sizes.map((size, index) => (
        <span
          key={index}
          ref={(node) => {
            segmentRefs.current[index] = node;
          }}
          className={index === 0 ? "auto-slither-segment auto-slither-head" : "auto-slither-segment"}
          style={{
            width: `${size}px`,
            height: `${size}px`
          }}
        >
          {index === 0 ? (
            <>
              <i className="auto-slither-eye left-[3px]" />
              <i className="auto-slither-eye right-[3px]" />
            </>
          ) : null}
        </span>
      ))}
    </div>
  );
}
