"use client";

import { Progress } from "@/components/ui/progress";
import { Flashcard } from "@/components/dashboard/flashcard";
import { Timer } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { ReviewCardDto } from "@/lib/api/types";

interface ReviewActiveSessionProps {
  t: (key: string, params?: Record<string, number>) => string;
  currentCard: ReviewCardDto;
  currentIndex: number;
  totalCards: number;
  progress: number;
  pauseNotice: boolean;
  onRate: (quality: 0 | 1 | 2 | 3 | 4 | 5) => void;
}

export function ReviewActiveSession({
  t,
  currentCard,
  currentIndex,
  totalCards,
  progress,
  pauseNotice,
  onRate,
}: ReviewActiveSessionProps) {
  return (
    <div className="max-w-3xl mx-auto flex flex-col min-h-[70vh] pt-6 relative">
      {/* Pause Notification Overlay */}
      <AnimatePresence>
        {pauseNotice && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200 border border-amber-200 dark:border-amber-800 rounded-full shadow-md flex items-center gap-2 text-sm font-medium z-50 whitespace-nowrap"
          >
            <Timer className="h-4 w-4" />
            <span>Timer paused to ensure accurate tracking</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Bar */}
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-xl font-semibold text-foreground">{t("title")}</h1>
        <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
          <span>{t("progress", { current: currentIndex + 1, total: totalCards })}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full mb-12">
        <Progress value={progress} className="h-2" />
      </div>

      {/* Flashcard Area */}
      <div className="flex-1 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -50, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <Flashcard card={currentCard} onRate={onRate as any} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
