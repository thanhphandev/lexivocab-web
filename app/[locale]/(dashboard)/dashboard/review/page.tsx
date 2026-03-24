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
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function ReviewPage() {
  const t = useTranslations("Dashboard.review");
  const locale = useLocale();
  const [isRating, setIsRating] = useState(false);

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
    if (!session || isRating) return;
    
    setIsRating(true);
    const currentCard = session.cards[currentIndex];

    // Calculate actual time spent
    const timeSpentMs = getTimeSpent();

    // Add slight delay for visual feedback
    await new Promise(resolve => setTimeout(resolve, 300));

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
    
    setIsRating(false);
  };

  if (isLoading) {
    return (
      <motion.div 
        className="flex h-[70vh] items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 1, repeat: Infinity, ease: "linear" },
            scale: { duration: 0.5, repeat: Infinity }
          }}
        >
          <Loader2 className="h-10 w-10 text-primary" />
        </motion.div>
      </motion.div>
    );
  }

  // Finished or Empty State
  if (!session || session.cards.length === 0) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="complete"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <ReviewCompleteScreen t={t} locale={locale} reviewedCount={reviewedCount} />
        </motion.div>
      </AnimatePresence>
    );
  }

  // Pre-start screen
  if (!isSessionActive) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="start"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <ReviewStartScreen t={t} cardCount={session.cards.length} onStart={startSession} />
        </motion.div>
      </AnimatePresence>
    );
  }

  // Active session
  const progress = (currentIndex / session.cards.length) * 100;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`card-${currentIndex}`}
        initial={{ opacity: 0, x: 50, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: -50, scale: 0.95 }}
        transition={{ 
          duration: 0.3,
          ease: "easeInOut"
        }}
      >
        <ReviewActiveSession
          t={t}
          currentCard={session.cards[currentIndex]}
          currentIndex={currentIndex}
          totalCards={session.cards.length}
          progress={progress}
          pauseNotice={pauseNotice}
          onRate={handleRate}
        />
      </motion.div>
    </AnimatePresence>
  );
}
