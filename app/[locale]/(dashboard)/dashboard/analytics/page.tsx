"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { clientApi } from "@/lib/api/api-client";
import type { DashboardDto, HeatmapDataDto } from "@/lib/api/types";
import { Heatmap } from "@/components/dashboard/heatmap";
import { StatCard } from "@/components/dashboard/stat-card";
import { ReviewHistoryTable } from "@/components/dashboard/review-history-table";
import { Flame, Target, Trophy, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function AnalyticsPage() {
    const t = useTranslations("Dashboard.analytics");
    const [dashboardData, setDashboardData] = useState<DashboardDto | null>(null);
    const [heatmapData, setHeatmapData] = useState<HeatmapDataDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            const [dashRes, heatRes] = await Promise.all([
                clientApi.get<DashboardDto>("/api/proxy/analytics/dashboard"),
                clientApi.get<HeatmapDataDto>(`/api/proxy/analytics/heatmap?year=${new Date().getFullYear()}`),
            ]);

            if (dashRes.success) setDashboardData(dashRes.data);
            if (heatRes.success) setHeatmapData(heatRes.data);
            setIsLoading(false);
        };

        fetchAnalytics();
    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!dashboardData) {
        return (
            <div className="text-center py-20 text-muted-foreground">
                Failed to load analytics data.
            </div>
        );
    }

    const masteryRate = Math.round(
        (dashboardData.vocabulary.masteredWords / Math.max(dashboardData.vocabulary.totalWords, 1)) * 100
    );

    return (
        <div className="space-y-8 pb-10">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    {t("title")}
                </h1>
                <p className="mt-1 text-muted-foreground">
                    {t("subtitle")}
                </p>
            </div>

            {/* Streaks & Highlights */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid gap-4 md:grid-cols-3"
            >
                <StatCard
                    title={t("currentStreak")}
                    value={`${dashboardData.currentStreak} Days`}
                    icon={<Flame className="text-orange-500" />}
                    className="border-l-4 border-l-orange-500"
                />
                <StatCard
                    title={t("activeDays")}
                    value={dashboardData.totalStudyDays}
                    icon={<Target className="text-primary" />}
                    className="border-l-4 border-l-primary"
                />
                <StatCard
                    title="Mastery Rate"
                    value={`${masteryRate}%`}
                    icon={<Trophy className="text-yellow-500" />}
                    className="border-l-4 border-l-yellow-500"
                />
            </motion.div>

            {/* Breakdown */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid gap-4 md:grid-cols-2"
            >
                <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <h3 className="font-semibold mb-4">{t("distribution")}</h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>Active Learning</span>
                                <span className="font-medium">{dashboardData.vocabulary.activeWords}</span>
                            </div>
                            <div className="w-full bg-secondary rounded-full h-2">
                                <div
                                    className="bg-primary rounded-full h-2"
                                    style={{ width: `${(dashboardData.vocabulary.activeWords / Math.max(dashboardData.vocabulary.totalWords, 1)) * 100}%` }}
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>Mastered</span>
                                <span className="font-medium">{dashboardData.vocabulary.masteredWords}</span>
                            </div>
                            <div className="w-full bg-secondary rounded-full h-2">
                                <div
                                    className="bg-emerald-500 rounded-full h-2"
                                    style={{ width: `${(dashboardData.vocabulary.masteredWords / Math.max(dashboardData.vocabulary.totalWords, 1)) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <h3 className="font-semibold mb-4">{t("performance")}</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-secondary/50 rounded-lg text-center">
                            <span className="block text-3xl font-bold text-primary mb-1">
                                {dashboardData.reviews.totalReviewsToday}
                            </span>
                            <span className="text-xs text-muted-foreground uppercase tracking-wider">Today</span>
                        </div>
                        <div className="p-4 bg-secondary/50 rounded-lg text-center">
                            <span className="block text-3xl font-bold text-primary mb-1">
                                {dashboardData.reviews.totalReviewsThisWeek}
                            </span>
                            <span className="text-xs text-muted-foreground uppercase tracking-wider">This Week</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Heatmap */}
            {heatmapData && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-xl border bg-card p-6 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-foreground">{t("heatmaps")}</h2>
                        <span className="text-sm font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                            {heatmapData.year}
                        </span>
                    </div>
                    <Heatmap data={heatmapData} />
                </motion.div>
            )}

            {/* Review History Table */}
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
