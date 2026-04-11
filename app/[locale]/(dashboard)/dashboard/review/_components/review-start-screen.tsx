"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Image from "next/image";

interface ReviewStartScreenProps {
  t: (key: string, params?: Record<string, number>) => string;
  cardCount: number;
  onStart: () => void;
}

export function ReviewStartScreen({ t, cardCount, onStart }: ReviewStartScreenProps) {
  return (
    <div className="flex h-[70vh] items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md text-center space-y-6 p-8 border bg-card rounded-3xl shadow-lg"
      >
        <Image
          src="/illustrations/review-start.png"
          alt="Ready to review"
          width={180}
          height={180}
          className="mx-auto opacity-90 dark:opacity-80"
        />
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">{t("title")}</h2>
          <p className="text-muted-foreground">{t("dueToday", { count: cardCount })}</p>
        </div>
        <Button size="lg" className="w-full text-lg h-14" onClick={onStart}>
          {t("startSession")}
        </Button>
      </motion.div>
    </div>
  );
}
