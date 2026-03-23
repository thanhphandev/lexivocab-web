"use client";

import { Button } from "@/components/ui/button";
import { BrainCircuit } from "lucide-react";
import { motion } from "framer-motion";

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
        <div className="mx-auto w-20 h-20 bg-primary/10 text-primary rounded-2xl flex flex-col items-center justify-center">
          <BrainCircuit className="h-10 w-10" />
        </div>
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
