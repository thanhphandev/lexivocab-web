"use client";

import { useEffect, useState } from "react";
import { clientApi, analyticsApi } from "@/lib/api/api-client";
import type { DashboardDto, HeatmapDataDto, StreakDetailsDto, VocabularyInDepthStatsDto } from "@/lib/api/types";

import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth/auth-context";
import { usePermissions } from "@/lib/hooks/use-permissions";
import { StatCard } from "@/components/dashboard/stat-card";
import { Heatmap } from "@/components/dashboard/heatmap";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import Link from "next/link";
import {
    BookOpen,
    Brain,
    CheckCircle2,
    CalendarClock,
    Flame,
    Loader2,
    CalendarDays,
    TrendingUp,
    Zap,
    Trophy,
    AlertCircle,
    RefreshCw
} from "lucide-react";


import { motion } from "framer-motion";

export default function DashboardHome() {
    const t = useTranslations("Dashboard.home");
    const { user, permissions } = useAuth();
    const { quotaMax } = usePermissions();

    const [dashboardData, setDashboardData] = useState<DashboardDto | null>(null);
    const [heatmapData, setHeatmapData] = useState<HeatmapDataDto | null>(null);
    const [streakDetails, setStreakDetails] = useState<StreakDetailsDto | null>(null);
    const [inDepthStats, setInDepthStats] = useState<VocabularyInDepthStatsDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPolling, setIsPolling] = useState(true);
    const [lastRefresh, setLastRefresh] = useState(new Date());

    const fetchDashboardData = async (silent = false) => {
        if (!silent) setIsLoading(true);
        try {
            const [dashRes, heatRes, streakRes, statsRes] = await Promise.all([
                clientApi.get<DashboardDto>("/api/proxy/analytics/dashboard"),
                clientApi.get<HeatmapDataDto>(`/api/proxy/analytics/heatmap?year=${new Date().getFullYear()}`),
                analyticsApi.getStreak(),
                analyticsApi.getStats(),
            ]);

            if (dashRes.success) setDashboardData(dashRes.data);
            if (heatRes.success) setHeatmapData(heatRes.data);
            if (streakRes.success) setStreakDetails(streakRes.data);
            if (statsRes.success) setInDepthStats(statsRes.data);
        } catch (err) {
            console.error("Dashboard sync error", err);
        } finally {
            setIsLoading(false);
            setLastRefresh(new Date());
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPolling) {
            interval = setInterval(() => fetchDashboardData(true), 30000);
        }
        return () => clearInterval(interval);
    }, [isPolling]);


    if (isLoading) {
        return (
            <div className="flex flex-col justify-center items-center py-32 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
                <p className="text-sm text-muted-foreground animate-pulse">Syncing your progress...</p>
            </div>
        );
    }

    if (!dashboardData) {
        return (
            <div className="text-center py-32 border-2 border-dashed rounded-3xl">
                <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold">Failed to load dashboard</h3>
                <p className="text-sm text-muted-foreground mb-6">We couldn't reach the analytics engine.</p>
                <Button onClick={() => fetchDashboardData()}>Try Again</Button>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20">
            {/* Header with Live Sync Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-foreground bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text">
                        {t("title")}, {user?.fullName?.split(" ")[0]}! 👋
                    </h1>
                    <p className="mt-1.5 text-muted-foreground font-medium">
                        {t("subtitle")}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/50 border text-[10px] font-bold tracking-widest uppercase">
                        <span className={cn("h-1.5 w-1.5 rounded-full", isPolling ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/30")} />
                        {isPolling ? "Live Sync Active" : "Sync Paused"}
                    </div>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setIsPolling(!isPolling)}
                        className="h-8 w-8 hover:bg-accent"
                    >
                        {isPolling ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => fetchDashboardData()} disabled={isLoading} className="h-8 gap-2 border-primary/20 hover:border-primary/50">
                        <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title={t("stats.totalWords")}
                    value={dashboardData.vocabulary?.totalWords || 0}
                    icon={<BookOpen className="text-blue-500" />}
                    className="border-none shadow-md bg-white dark:bg-card/50"
                />
                <StatCard
                    title={t("stats.activeWords")}
                    value={dashboardData.vocabulary?.activeWords || 0}
                    icon={<Brain className="text-orange-500" />}
                    className="border-none shadow-md bg-white dark:bg-card/50"
                />
                <StatCard
                    title={t("stats.masteredWords")}
                    value={dashboardData.vocabulary?.masteredWords || 0}
                    icon={<CheckCircle2 className="text-emerald-500" />}
                    className="border-none shadow-md bg-white dark:bg-card/50"
                    trend={{
                        value: Math.round(((dashboardData.vocabulary?.masteredWords || 0) / Math.max(dashboardData.vocabulary?.totalWords || 1, 1)) * 100),
                        label: "% Mastery",
                        isPositive: true
                    }}
                />
                <StatCard
                    title={t("stats.dueToday")}
                    value={dashboardData.vocabulary?.dueToday || 0}
                    icon={<CalendarClock className="text-rose-500" />}
                    className="border-none shadow-md bg-white dark:bg-card/50"
                    description="Pending reviews"
                />
            </div>

            {/* Second Row: Detailed Analytics */}
            <div className="grid gap-4 md:grid-cols-12">
                {/* Streak and Consistency */}
                <Card className="md:col-span-4 shadow-md overflow-hidden border-none bg-gradient-to-br from-orange-400 to-rose-500 text-white">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Consistency Engine</span>
                            <Flame className="h-5 w-5 fill-white/20" />
                        </div>
                    </CardHeader>
                    <CardContent className="pt-2 text-center pb-8">
                        <div className="relative inline-block">
                             <motion.div 
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-7xl font-black mb-1 drop-shadow-lg"
                             >
                                {dashboardData.currentStreak || 0}
                             </motion.div>
                             <div className="absolute -top-2 -right-6">
                                <Badge className="bg-white/20 backdrop-blur-md text-white border-none py-0">DAYS</Badge>
                             </div>
                        </div>
                        <h3 className="text-lg font-bold opacity-90">{t("stats.currentStreak")}</h3>
                        <p className="text-xs opacity-70 mt-2 font-medium">Keep going! You're in the top 5% of learners.</p>
                        
                        <div className="mt-8 flex justify-center gap-6 border-t border-white/10 pt-6">
                            <div>
                                <p className="text-[9px] font-bold uppercase opacity-60">Personal Best</p>
                                <p className="text-xl font-black">{streakDetails?.longestStreak || 0}d</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-bold uppercase opacity-60">Completion</p>
                                <p className="text-xl font-black">{inDepthStats?.learningProgress || 0}%</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Quota & Reviews */}
                <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <Card className="shadow-md border-none bg-card/60 backdrop-blur-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <Zap className="h-4 w-4 text-yellow-500" />
                                Today's Review Power
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-baseline gap-2 mb-4">
                                <span className="text-4xl font-black text-foreground">{dashboardData.reviews?.totalReviewsToday || 0}</span>
                                <span className="text-xs text-muted-foreground font-bold uppercase tracking-tighter">Completed</span>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-[10px] font-bold uppercase mb-1.5 opacity-60">
                                        <span>Average Accuracy</span>
                                        <span>{(dashboardData.reviews?.averageQualityScore || 0).toFixed(1)} / 5.0</span>
                                    </div>
                                    <Progress value={(dashboardData.reviews?.averageQualityScore || 0) * 20} className="h-1.5" />
                                </div>
                                <div className="p-3 bg-secondary/50 rounded-xl flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-indigo-500" />
                                        <span className="text-xs font-bold">Retention Rate</span>
                                    </div>
                                    <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">{inDepthStats?.retentionRate || 0}%</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-md border-none bg-card/60 backdrop-blur-sm flex flex-col justify-between">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-primary" />
                                    Account Quota
                                </CardTitle>
                                <Badge className="bg-primary/10 text-primary border-none text-[10px] font-black uppercase">
                                    {permissions?.plan || "Free"}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-2">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-[11px] font-bold uppercase opacity-60">
                                    <span>Library Storage</span>
                                    <span>
                                        {quotaMax >= 2147483647 
                                            ? `${dashboardData.vocabulary?.totalWords || 0} / ∞` 
                                            : `${dashboardData.vocabulary?.totalWords || 0} / ${quotaMax}`}
                                    </span>
                                </div>
                                <div className="w-full bg-secondary rounded-full h-3 overflow-hidden border border-border/50">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ 
                                            width: quotaMax > 0 
                                                ? `${Math.min(((dashboardData.vocabulary?.totalWords || 0) / quotaMax) * 100, 100)}%` 
                                                : '0%' 
                                        }}
                                        className="h-full bg-primary rounded-full"
                                    />
                                </div>
                            </div>

                            {permissions?.plan === "Free" && (
                                <Link 
                                    href={`/pricing`} 
                                    className="block w-full text-center py-2.5 bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest rounded-xl hover:shadow-lg transition-all"
                                >
                                    Unlock Pro 🚀
                                </Link>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Bottom Row: Insights & Heatmap */}
            <div className="grid gap-4 md:grid-cols-12">
                {/* Insights / CEFR Spread */}
                <Card className="md:col-span-4 shadow-md border-none bg-card/60 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <Trophy className="h-4 w-4 text-emerald-500" />
                            Level Insight
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* CEFR Spread Visualization */}
                        <div className="grid grid-cols-2 gap-3">
                            {Object.entries(inDepthStats?.cefrSpread || { 'A1': 0, 'A2': 0, 'B1': 0, 'B2': 0, 'C1': 0, 'C2': 0 })
                                .sort((a, b) => a[0].localeCompare(b[0]))
                                .map(([level, count]) => (
                                <div key={level} className="p-2.5 bg-secondary/30 rounded-xl border border-border/50">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[10px] font-black">{level}</span>
                                        <span className="text-xs font-bold text-primary">{count}</span>
                                    </div>
                                    <Progress value={Math.min((count / (dashboardData.vocabulary?.totalWords || 1)) * 200, 100)} className="h-1 shadow-inner" />
                                </div>
                            ))}
                        </div>

                        <div className="pt-4 border-t border-border/50">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase mb-3 px-1">Tough Challenges</p>
                            <div className="flex flex-wrap gap-1.5">
                                {(inDepthStats?.mostDifficultWords?.length || 0) > 0 ? (
                                    inDepthStats?.mostDifficultWords?.slice(0, 6).map((word, idx) => (
                                        <Badge key={idx} variant="secondary" className="bg-rose-500/5 text-rose-600 hover:bg-rose-500/10 border-none text-[9px] font-bold px-2.5 py-1">
                                            {word}
                                        </Badge>
                                    ))
                                ) : (
                                    <p className="text-[10px] text-muted-foreground italic px-1">Zero friction found. Solid!</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Heatmap */}
                <Card className="md:col-span-8 shadow-md border-none bg-card/60 backdrop-blur-sm overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg font-bold">{t("heatmap.title")}</CardTitle>
                            <p className="text-xs text-muted-foreground">Daily activity frequency</p>
                        </div>
                        <Badge className="bg-primary shadow-sm">{heatmapData?.year || new Date().getFullYear()}</Badge>
                    </CardHeader>
                    <CardContent>
                        {heatmapData ? (
                            <div className="p-2 bg-muted/30 rounded-2xl border border-border/50">
                                <Heatmap data={heatmapData} />
                            </div>
                        ) : (
                            <div className="h-48 flex items-center justify-center text-muted-foreground italic text-sm">
                                Warming up engine...
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            
            <div className="flex items-center justify-between text-[10px] text-muted-foreground px-4 italic font-medium">
                <span>Last updated: {lastRefresh.toLocaleTimeString()}</span>
                <span className="flex items-center gap-1.5 underline decoration-emerald-500/30 underline-offset-4 cursor-help">
                    <Shield className="h-2.5 w-2.5" /> Data protected by LexiGuard Engine v1.0
                </span>
            </div>
        </div>
    );
}

function Pause(props: any) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
    )
}

function Play(props: any) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>
    )
}

function Shield(props: any) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /></svg>
    )
}
