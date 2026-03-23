import { useRef, useEffect, useState } from "react";

const MAX_REVIEW_TIME_MS = 60000; // Cap at 60s to avoid idle pollution

export function useReviewTimer(isSessionActive: boolean, currentIndex: number) {
  const startTimeRef = useRef<number>(Date.now());
  const accumulatedTimeRef = useRef<number>(0);
  const lastPauseTimeRef = useRef<number>(0);
  const [pauseNotice, setPauseNotice] = useState(false);

  // Reset timer when moving to next card or starting session
  useEffect(() => {
    if (isSessionActive) {
      startTimeRef.current = Date.now();
      accumulatedTimeRef.current = 0;
      setPauseNotice(false);
    }
  }, [currentIndex, isSessionActive]);

  // Handle tab switching / visibility changes
  useEffect(() => {
    let hideTimeout: NodeJS.Timeout;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Pausing: save progress
        accumulatedTimeRef.current += Date.now() - startTimeRef.current;
        lastPauseTimeRef.current = Date.now();
      } else {
        // Resuming: reset start mark
        startTimeRef.current = Date.now();

        // Show notification if paused for > 5 seconds
        if (lastPauseTimeRef.current > 0 && Date.now() - lastPauseTimeRef.current > 5000) {
          setPauseNotice(true);
          clearTimeout(hideTimeout);
          hideTimeout = setTimeout(() => setPauseNotice(false), 3000);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearTimeout(hideTimeout);
    };
  }, []);

  const getTimeSpent = () => {
    const now = Date.now();
    const duration = now - startTimeRef.current + accumulatedTimeRef.current;
    return Math.min(duration, MAX_REVIEW_TIME_MS);
  };

  return { pauseNotice, getTimeSpent };
}
