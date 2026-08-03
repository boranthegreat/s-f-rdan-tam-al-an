"use client";

import clsx from "clsx";
import { useEffect, useRef } from "react";
import { useLiveMarket, type LiveDirection } from "@/components/live-market/LiveMarketProvider";

export function LivePrice({
  marketKey,
  numericValue,
  children,
  className,
  title
}: {
  marketKey: string;
  numericValue?: number | null;
  children: React.ReactNode;
  className?: string;
  title?: string;
}) {
  const { getMovement, hasLivePrice } = useLiveMarket();
  const previousValueRef = useRef<number | null>(null);
  const usesNumericValue = typeof numericValue === "number" && Number.isFinite(numericValue);
  const previousValue = previousValueRef.current;
  const numericDirection: LiveDirection =
    usesNumericValue && previousValue !== null && numericValue !== previousValue
      ? numericValue > previousValue
        ? "up"
        : "down"
      : "same";

  useEffect(() => {
    if (usesNumericValue && numericValue !== null && numericValue !== undefined) previousValueRef.current = numericValue;
  }, [numericValue, usesNumericValue]);

  const streamMovement = getMovement(marketKey);
  const direction = usesNumericValue ? numericDirection : streamMovement.direction;
  const animationKey = usesNumericValue ? String(numericValue) : String(streamMovement.sequence);
  const shouldAnimate = usesNumericValue ? numericDirection !== "same" : hasLivePrice(marketKey);

  return (
    <span
      key={`${marketKey}-${animationKey}`}
      className={clsx(
        "live-price-value",
        shouldAnimate && direction === "up" && "live-price-up",
        shouldAnimate && direction === "down" && "live-price-down",
        className
      )}
      title={title}
    >
      {children}
    </span>
  );
}
