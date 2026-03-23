"use client";

import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { ReviewHistoryTable } from "@/components/dashboard/review-history-table";
import { useAnalyticsData } from "./_hooks/use-analytics-data";
import { calculateMasteryRate } from "./_utils/calculations";
import { StatsOverview } from "./_components/stats-overview";
import { VocabularyDistribution } from "./_components/vocabulary-distribution";
import { PerformanceStats } from "./_components/performance-stats";
import { HeatmapSection } from "./_components/heatmap-section";

export default function AnalyticsPage() {
  const t = useTranslations("Dashboard.analytics");
  const { dashboardData, heatmapData, isLoading } = useAnalyticsData();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-20 text-muted-foreground">{t("loadError")}</div>
    );
  }

  const masteryRate = calculateMasteryRate(
    dashboardData.vocabulary.masteredWords,
    dashboardData.vocabulary.totalWords
  );

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("title")}</h1>
        <p className="mt-1 text-muted-foreground">{t("subtitle")}</p>
      </div>

      <StatsOverview
        currentStreak={dashboardData.currentStreak}
        totalStudyDays={dashboardData.totalStudyDays}
        masteryRate={masteryRate}
        t={t}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-4 md:grid-cols-2"
      >
        <VocabularyDistribution
          activeWords={dashboardData.vocabulary.activeWords}
          masteredWords={dashboardData.vocabulary.masteredWords}
          totalWords={dashboardData.vocabulary.totalWords}
          t={t}
        />
        <PerformanceStats
          reviewsToday={dashboardData.reviews.totalReviewsToday}
          reviewsThisWeek={dashboardData.reviews.totalReviewsThisWeek}
          t={t}
        />
      </motion.div>

      {heatmapData && <HeatmapSection data={heatmapData} t={t} />}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <ReviewHistoryTable />
      </motion.div>
    </div>
  );
}
