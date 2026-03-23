import { useState, useEffect } from "react";
import { reviewsApi } from "@/lib/api/api-client";
import type { ReviewSessionDto } from "@/lib/api/types";

export function useReviewSession() {
  const [session, setSession] = useState<ReviewSessionDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);

  useEffect(() => {
    const fetchSession = async () => {
      const res = await reviewsApi.getSession();
      if (res.success) {
        setSession(res.data);
      }
      setIsLoading(false);
    };
    fetchSession();
  }, []);

  const startSession = () => {
    if (session && session.cards.length > 0) {
      setIsSessionActive(true);
    }
  };

  const moveToNext = () => {
    setCurrentIndex((prev) => prev + 1);
    setReviewedCount((prev) => prev + 1);
  };

  const finishSession = () => {
    setIsSessionActive(false);
    setSession(null);
  };

  return {
    session,
    isLoading,
    currentIndex,
    isSessionActive,
    reviewedCount,
    startSession,
    moveToNext,
    finishSession,
  };
}
