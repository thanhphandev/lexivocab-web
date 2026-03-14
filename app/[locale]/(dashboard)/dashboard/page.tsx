"use client";

import { useEffect, useState } from "react";
import { clientApi } from "@/lib/api/api-client";
import type { DashboardDto, HeatmapDataDto } from "@/lib/api/types";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth/auth-context";
import { usePermissions } from "@/lib/hooks/use-permissions";
import { StatCard } from "@/components/dashboard/stat-card";
import { Heatmap } from "@/components/dashboard/heatmap";
import Link from "next/link";
import {
    BookOpen,
    Brain,
    CheckCircle2,
    CalendarClock,
    Flame,
    Loader2,
    CalendarDays
} from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardHome() {
    const t = useTranslations("Dashboard.home");
    const { user, permissions } = useAuth();
    const { quotaMax } = usePermissions();

    const [dashboardData, setDashboardData] = useState<DashboardDto | null>(null);
    const [heatmapData, setHeatmapData] = useState<HeatmapDataDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            const [dashRes, heatRes] = await Promise.all([
                clientApi.get<DashboardDto>("/api/proxy/analytics/dashboard"),
                clientApi.get<HeatmapDataDto>(`/api/proxy/analytics/heatmap?year=${new Date().getFullYear()}`),
            ]);

            if (dashRes.success) setDashboardData(dashRes.data);
            if (heatRes.success) setHeatmapData(heatRes.data);
            setIsLoading(false);
        };

        fetchDashboardData();
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
                Failed to load dashboard data.
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    {t("title")}, {user?.fullName?.split(" ")[0]}! 👋
                </h1>
                <p className="mt-2 text-muted-foreground">
                    {t("subtitle")}
                </p>
            </div>

            {/* Stat Cards Row 1: Vocabulary */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
            >
                <StatCard
                    title={t("stats.totalWords")}
                    value={dashboardData.vocabulary.totalWords}
                    icon={<BookOpen className="text-blue-500" />}
                    className="border-l-4 border-l-blue-500"
                />
                <StatCard
                    title={t("stats.activeWords")}
                    value={dashboardData.vocabulary.activeWords}
                    icon={<Brain className="text-orange-500" />}
                    className="border-l-4 border-l-orange-500"
                />
                <StatCard
                    title={t("stats.masteredWords")}
                    value={dashboardData.vocabulary.masteredWords}
                    icon={<CheckCircle2 className="text-emerald-500" />}
                    className="border-l-4 border-l-emerald-500"
                    trend={{
                        value: Math.round((dashboardData.vocabulary.masteredWords / Math.max(dashboardData.vocabulary.totalWords, 1)) * 100),
                        label: "% Mastery",
                        isPositive: true
                    }}
                />
                <StatCard
                    title={t("stats.dueToday")}
                    value={dashboardData.vocabulary.dueToday}
                    icon={<CalendarClock className="text-rose-500" />}
                    className="border-l-4 border-l-rose-500"
                    description="Words to review"
                />
            </motion.div>

            {/* Stat Cards Row 2: Reviews & Streak */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="grid gap-4 md:grid-cols-4"
            >
                <div className="col-span-1 border rounded-xl p-6 bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/20 dark:to-orange-900/10 flex flex-col justify-center items-center text-center shadow-sm">
                    <Flame className="h-10 w-10 text-orange-500 mb-2" />
                    <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("stats.currentStreak")}</h3>
                    <p className="text-3xl font-bold text-orange-500 mt-1">{dashboardData.currentStreak} Days</p>
                </div>

                <StatCard
                    title={t("stats.reviewsToday")}
                    value={dashboardData.reviews.totalReviewsToday}
                    icon={<Brain className="text-primary" />}
                />
                
                {/* Quota Progress Card */}
                <div className="md:col-span-2 border rounded-xl p-6 bg-card shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                <BookOpen className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-foreground">Plan Quota</h3>
                                <p className="text-xs text-muted-foreground">{permissions?.plan || "Free"} Plan</p>
                            </div>
                        </div>
                        {permissions?.plan === "Free" && (
                            <Link href={`/${user ? user.id : ''}/pricing`} className="text-xs font-medium text-primary hover:underline">
                                Upgrade →
                            </Link>
                        )}
                    </div>
                    
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Used Storage</span>
                            <span className="font-medium text-foreground">
                                {quotaMax >= 2147483647 
                                    ? `${dashboardData.vocabulary.totalWords} / Unlimited` 
                                    : `${dashboardData.vocabulary.totalWords} / ${quotaMax}`}
                            </span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ 
                                    width: quotaMax > 0 
                                        ? `${Math.min((dashboardData.vocabulary.totalWords / quotaMax) * 100, 100)}%` 
                                        : '0%' 
                                }}
                                className="h-full bg-primary rounded-full"
                            />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Heatmap Section */}
            {heatmapData && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="rounded-xl border border-border bg-card p-6 shadow-sm overflow-hidden"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-foreground">{t("heatmap.title")}</h2>
                        <span className="text-sm font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                            {heatmapData.year}
                        </span>
                    </div>
                    <Heatmap data={heatmapData} />
                </motion.div>
            )}
        </div>
    );
}
