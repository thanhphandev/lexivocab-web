"use client";

import { useTranslations, useLocale } from "next-intl";
import { reviewsApi } from "@/lib/api/api-client";
import { Loader2 } from "lucide-react";
import { ReviewStartScreen } from "./_components/review-start-screen";
import { ReviewCompleteScreen } from "./_components/review-complete-screen";
import { ReviewActiveSession } from "./_components/review-active-session";
import { useReviewSession } from "./_hooks/use-review-session";
import { useReviewTimer } from "./_hooks/use-review-timer";
import { triggerConfetti } from "./_utils/confetti";

export default function ReviewPage() {
  const t = useTranslations("Dashboard.review");
  const locale = useLocale();

  const {
    session,
    isLoading,
    currentIndex,
    isSessionActive,
    reviewedCount,
    startSession,
    moveToNext,
    finishSession,
  } = useReviewSession();

  const { pauseNotice, getTimeSpent } = useReviewTimer(isSessionActive, currentIndex);

  const handleRate = async (quality: 0 | 1 | 2 | 3 | 4 | 5) => {
    if (!session) return;
    const currentCard = session.cards[currentIndex];

    // Calculate actual time spent
    const timeSpentMs = getTimeSpent();

    // Optimistic UI update
    moveToNext();

    // Background API call
    reviewsApi
      .submitReview({
        userVocabularyId: currentCard.vocabularyId,
        qualityScore: quality,
        timeSpentMs: timeSpentMs,
      })
      .catch(console.error);

    // Move to next card or finish
    if (currentIndex + 1 >= session.cards.length) {
      finishSession();
      triggerConfetti();
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // Finished or Empty State
  if (!session || session.cards.length === 0) {
    return <ReviewCompleteScreen t={t} locale={locale} reviewedCount={reviewedCount} />;
  }

  // Pre-start screen
  if (!isSessionActive) {
    return (
      <ReviewStartScreen t={t} cardCount={session.cards.length} onStart={startSession} />
    );
  }

  // Active session
  const progress = (currentIndex / session.cards.length) * 100;

  return (
    <ReviewActiveSession
      t={t}
      currentCard={session.cards[currentIndex]}
      currentIndex={currentIndex}
      totalCards={session.cards.length}
      progress={progress}
      pauseNotice={pauseNotice}
      onRate={handleRate}
    />
  );
}
