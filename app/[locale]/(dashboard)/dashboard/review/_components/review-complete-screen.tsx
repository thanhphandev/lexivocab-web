"use client";

import { Button } from "@/components/ui/button";
import { PartyPopper, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface ReviewCompleteScreenProps {
  t: (key: string, params?: Record<string, number>) => string;
  locale: string;
  reviewedCount: number;
}

export function ReviewCompleteScreen({ t, locale, reviewedCount }: ReviewCompleteScreenProps) {
  return (
    <div className="flex h-[70vh] items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md text-center space-y-6"
      >
        <div className="mx-auto w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
          <PartyPopper className="h-12 w-12" />
        </div>
        <h2 className="text-3xl font-bold text-foreground">
          {reviewedCount > 0 ? t("sessionComplete") : t("allCaughtUp")}
        </h2>
        <p className="text-muted-foreground text-lg">
          {reviewedCount > 0 ? t("sessionStats", { count: reviewedCount }) : t("noReviews")}
        </p>
        <div className="pt-6">
          <Link href={`/${locale}/dashboard`}>
            <Button size="lg" className="w-full sm:w-auto">
              <ArrowRight className="mr-2 h-5 w-5" />
              {t("backToDashboard")}
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
