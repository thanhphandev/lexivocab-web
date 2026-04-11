"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

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
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Image
            src="/illustrations/review-complete.png"
            alt="Review complete"
            width={220}
            height={220}
            className="mx-auto opacity-90 dark:opacity-80"
            priority
          />
        </motion.div>
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
