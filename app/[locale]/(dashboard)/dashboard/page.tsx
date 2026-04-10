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
import { Skeleton } from "@/components/ui/skeleton";
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
    RefreshCw,
    ChevronRight,
    Search
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
            <div className="space-y-8 pb-20 mt-2 animate-pulse">
                {/* Header Skeleton */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div className="space-y-3">
                        <Skeleton className="h-12 w-[250px] rounded-xl" />
                        <Skeleton className="h-6 w-[350px] rounded-md" />
                    </div>
                    <Skeleton className="h-10 w-[150px] rounded-xl" />
                </div>
                
                {/* Stats Grid Skeleton */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {Array(4).fill(0).map((_, i) => (
                        <Skeleton key={i} className="h-[120px] rounded-2xl" />
                    ))}
                </div>

                {/* Second Row Skeleton */}
                <div className="grid gap-4 md:grid-cols-12">
                    <Skeleton className="md:col-span-4 h-[300px] rounded-3xl" />
                    <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Skeleton className="h-[180px] rounded-3xl" />
                        <Skeleton className="h-[180px] rounded-3xl" />
                    </div>
                </div>
            </div>
        );
    }

    if (!dashboardData) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 bg-gradient-to-b from-transparent to-muted/20 rounded-3xl mt-4 animate-in fade-in zoom-in duration-500">
                <div className="relative mb-8 mt-12">
                    <div className="absolute inset-0 bg-rose-500/10 blur-2xl rounded-full" />
                    <AlertCircle className="h-20 w-20 text-rose-500 relative z-10 animate-pulse shadow-xl rounded-full bg-white dark:bg-card p-4 border border-rose-500/20" />
                </div>
                <h3 className="text-2xl font-black mb-2 tracking-tight">Analytics Offline</h3>
                <p className="text-muted-foreground mb-8 text-center max-w-sm">We couldn't connect to the analytics engine right now. Please check your connection or try again.</p>
                <Button onClick={() => fetchDashboardData()} size="lg" className="rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 group">
                    <RefreshCw className="mr-2 h-4 w-4 group-hover:rotate-180 transition-transform duration-500" /> Try Again
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out fill-mode-both">
            {/* Header with Live Sync Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-foreground bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text">
                        {t("title")}, {user?.fullName}! 👋
                    </h1>
                    <p className="mt-1.5 text-muted-foreground font-medium">
                        {t("subtitle")}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div 
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/50 border text-[10px] font-bold tracking-widest uppercase cursor-pointer hover:bg-accent hover:border-accent-foreground/20 transition-all duration-300"
                        onClick={() => setIsPolling(!isPolling)}
                    >
                        <span className={cn("h-1.5 w-1.5 rounded-full transition-colors duration-500", isPolling ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/30")} />
                        {isPolling ? "Live Sync Active" : "Sync Paused"}
                    </div>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setIsPolling(!isPolling)}
                        className="h-8 w-8 hover:bg-accent hover:text-accent-foreground transition-colors rounded-full"
                    >
                        {isPolling ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => fetchDashboardData()} 
                        disabled={isLoading} 
                        className="h-8 gap-2 border-primary/20 hover:border-primary/50 hover:bg-primary/5 transition-colors group rounded-full"
                    >
                        <RefreshCw className={cn("h-3.5 w-3.5 group-hover:rotate-180 transition-transform duration-500", isLoading && "animate-spin")} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 delay-100 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
                <StatCard
                    title={t("stats.totalWords")}
                    value={dashboardData.vocabulary?.totalWords || 0}
                    icon={<BookOpen className="text-blue-500 h-5 w-5 drop-shadow-sm" />}
                    className="bg-card dark:bg-card/50"
                />
                <StatCard
                    title={t("stats.activeWords")}
                    value={dashboardData.vocabulary?.activeWords || 0}
                    icon={<Brain className="text-orange-500 h-5 w-5 drop-shadow-sm" />}
                    className="bg-card dark:bg-card/50"
                />
                <StatCard
                    title={t("stats.masteredWords")}
                    value={dashboardData.vocabulary?.masteredWords || 0}
                    icon={<CheckCircle2 className="text-emerald-500 h-5 w-5 drop-shadow-sm" />}
                    className="bg-card dark:bg-card/50"
                    trend={{
                        value: Math.round(((dashboardData.vocabulary?.masteredWords || 0) / Math.max(dashboardData.vocabulary?.totalWords || 1, 1)) * 100),
                        label: "% Mastery",
                        isPositive: true
                    }}
                />
                <StatCard
                    title={t("stats.dueToday")}
                    value={dashboardData.vocabulary?.dueToday || 0}
                    icon={<CalendarClock className="text-rose-500 h-5 w-5 drop-shadow-sm" />}
                    className="bg-card dark:bg-card/50"
                    description="Pending reviews"
                />
            </div>
            
            {/* Recent Vocabulary Quick View - Synchronized with Mobile & Widget */}
            <div className="delay-150 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
                <Card className="shadow-md border-transparent hover:border-primary/20 bg-card/60 backdrop-blur-sm group hover:shadow-xl transition-all duration-500 overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/50">
                        <CardTitle className="text-lg font-bold flex items-center gap-2 group-hover:text-primary transition-colors">
                            <BookOpen className="h-5 w-5 text-primary" />
                            {t("recentVocabulary")}
                        </CardTitle>
                        <Button variant="ghost" size="sm" asChild className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors rounded-full">
                            <Link href="/vocabulary" className="flex items-center gap-1">
                                {t("viewAll")} <ChevronRight className="h-3 w-3" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 divide-x divide-y md:divide-y-0 divide-border/50">
                            {dashboardData.vocabulary.recentVocabulary?.length ? (
                                dashboardData.vocabulary.recentVocabulary.slice(0, 5).map((item) => (
                                    <Link 
                                        key={item.id} 
                                        href={`/vocabulary?id=${item.id}`}
                                        className="flex flex-col p-5 hover:bg-accent/50 transition-all group/item relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 p-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                            <Search className="h-3 w-3 text-primary/40" />
                                        </div>
                                        <div className="space-y-1.5 relative z-10">
                                            <div className="flex items-center justify-between">
                                                <p className="font-extrabold text-sm group-hover/item:text-primary transition-colors tracking-tight">{item.wordText}</p>
                                                {item.partOfSpeech && (
                                                    <span className="text-[9px] font-black uppercase text-muted-foreground/40 bg-muted px-1.5 py-0.5 rounded-sm">{item.partOfSpeech}</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground line-clamp-2 min-h-[32px] leading-relaxed">
                                                {item.customMeaning || (item as any).meaning || "No definition available"}
                                            </p>
                                        </div>
                                        {item.phoneticUs && (
                                            <div className="mt-auto pt-4 flex items-center justify-between">
                                                <span className="text-[10px] font-mono font-medium text-muted-foreground/60 bg-accent/30 px-2 py-0.5 rounded-full">{item.phoneticUs}</span>
                                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500/40" />
                                            </div>
                                        )}
                                    </Link>
                                ))
                            ) : (
                                <div className="col-span-full p-12 text-center text-muted-foreground italic text-sm flex flex-col items-center gap-2">
                                    <BookOpen className="h-8 w-8 opacity-20" />
                                    {t("noRecentWords")}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Second Row: Detailed Analytics */}
            <div className="grid gap-4 md:grid-cols-12 delay-200 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
                {/* Streak and Consistency */}
                <Card className="md:col-span-4 shadow-md overflow-hidden border-none bg-gradient-to-br from-orange-400 to-rose-500 text-white group hover:shadow-xl hover:shadow-orange-500/20 hover:-translate-y-1 transition-all duration-500">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 group-hover:opacity-100 transition-opacity">
                                {t("streak.title")}
                            </span>
                            <Flame className="h-5 w-5 fill-white/20 group-hover:fill-white/60 group-hover:animate-pulse transition-all duration-500" />
                        </div>
                    </CardHeader>
                    <CardContent className="pt-2 text-center pb-8">
                        <div className="relative inline-block group-hover:scale-105 transition-transform duration-500 ease-out">
                             <motion.div 
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                className="text-7xl font-black mb-1 drop-shadow-lg"
                             >
                                {dashboardData.currentStreak || 0}
                             </motion.div>
                             <div className="absolute -top-2 -right-6">
                                <Badge className="bg-white/20 backdrop-blur-md text-white border-none py-0 shadow-sm">{t("streak.badge")}</Badge>
                             </div>
                        </div>
                        <h3 className="text-lg font-bold opacity-90 group-hover:opacity-100 transition-opacity">{t("stats.currentStreak")}</h3>
                        <p className="text-xs opacity-70 mt-2 font-medium">{t("streak.motivationalText")}</p>
                        
                        <div className="mt-8 flex justify-center gap-6 border-t border-white/10 pt-6">
                            <div className="hover:-translate-y-1 transition-transform cursor-default">
                                <p className="text-[9px] font-bold uppercase opacity-60 hover:opacity-100 transition-opacity">{t("streak.personalBest")}</p>
                                <p className="text-xl font-black drop-shadow-sm">{streakDetails?.longestStreak || 0}d</p>
                            </div>
                            <div className="hover:-translate-y-1 transition-transform cursor-default">
                                <p className="text-[9px] font-bold uppercase opacity-60 hover:opacity-100 transition-opacity">{t("streak.completion")}</p>
                                <p className="text-xl font-black drop-shadow-sm">{inDepthStats?.learningProgress || 0}%</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Quota & Reviews */}
                <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <Card className="shadow-md border-transparent hover:border-primary/20 bg-card/60 backdrop-blur-sm group hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold flex items-center gap-2 group-hover:text-primary transition-colors">
                                <Zap className="h-4 w-4 text-yellow-500 group-hover:scale-110 transition-transform" />
                                {t("power.title")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-baseline gap-2 mb-4 group-hover:translate-x-1 transition-transform duration-300">
                                <span className="text-4xl font-black text-foreground">{dashboardData.reviews?.totalReviewsToday || 0}</span>
                                <span className="text-xs text-muted-foreground font-bold uppercase tracking-tighter">{t("power.completed")}</span>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="group/progress">
                                    <div className="flex justify-between text-[10px] font-bold uppercase mb-1.5 opacity-60 group-hover/progress:opacity-100 transition-opacity">
                                        <span>{t("power.averageAccuracy")}</span>
                                        <span>{(dashboardData.reviews?.averageQualityScore || 0).toFixed(1)} / 5.0</span>
                                    </div>
                                    <Progress value={(dashboardData.reviews?.averageQualityScore || 0) * 20} className="h-1.5 transition-all group-hover/progress:h-2" />
                                </div>
                                <div className="p-3 bg-secondary/50 hover:bg-secondary/80 rounded-xl flex items-center justify-between transition-colors duration-300">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-indigo-500 group-hover:animate-pulse" />
                                        <span className="text-xs font-bold">{t("power.retentionRate")}</span>
                                    </div>
                                    <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md">{inDepthStats?.retentionRate || 0}%</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-md border-transparent hover:border-primary/20 bg-card/60 backdrop-blur-sm flex flex-col justify-between group hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-sm font-bold flex items-center gap-2 group-hover:text-primary transition-colors">
                                    <Shield className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                                    {t("quota.title")}
                                </CardTitle>
                                <Badge className="bg-primary/10 text-primary border-none text-[10px] font-black uppercase shadow-sm group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                    {permissions?.plan || "Free"}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-2 flex-grow flex flex-col justify-between">
                            <div className="space-y-2 group/quota">
                                <div className="flex items-center justify-between text-[11px] font-bold uppercase opacity-60 group-hover/quota:opacity-100 transition-opacity">
                                    <span>{t("quota.storageLabel")}</span>
                                    <span className="font-mono">
                                        {quotaMax >= 2147483647 
                                            ? `${dashboardData.vocabulary?.totalWords || 0} / ${t("quota.unlimited")}` 
                                            : `${dashboardData.vocabulary?.totalWords || 0} / ${quotaMax}`}
                                    </span>
                                </div>
                                <div className="w-full bg-secondary/80 rounded-full h-3 overflow-hidden border border-border/50 group-hover/quota:shadow-inner transition-shadow">
                                    {(() => {
                                        const percent = quotaMax > 0 ? Math.min(((dashboardData.vocabulary?.totalWords || 0) / quotaMax) * 100, 100) : 0;
                                        const isWarning = percent >= 90;
                                        return (
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percent}%` }}
                                                transition={{ duration: 1, ease: "easeOut" }}
                                                className={cn(
                                                    "h-full rounded-full transition-colors duration-500 relative overflow-hidden",
                                                    isWarning ? "bg-rose-500" : "bg-primary"
                                                )}
                                            >
                                                <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]" style={{ transform: 'skewX(-20deg)' }} />
                                            </motion.div>
                                        );
                                    })()}
                                </div>
                            </div>

                            {permissions?.plan === "Free" && (
                                <Link 
                                    href={`/pricing`} 
                                    className="block w-full text-center py-2.5 bg-primary/10 text-primary border border-primary/20 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-primary hover:text-primary-foreground hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 hover:-translate-y-0.5"
                                >
                                    {t("quota.unlockPro")}
                                </Link>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Bottom Row: Insights & Heatmap */}
            <div className="grid gap-4 md:grid-cols-12 delay-300 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
                {/* Insights / CEFR Spread */}
                <Card className="md:col-span-4 shadow-md border-transparent hover:border-primary/20 bg-card/60 backdrop-blur-sm group hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
                    <CardHeader>
                        <CardTitle className="text-sm font-bold flex items-center gap-2 group-hover:text-emerald-500 transition-colors">
                            <Trophy className="h-4 w-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                            {t("insight.title")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* CEFR Spread Visualization */}
                        <div className="grid grid-cols-2 gap-3">
                            {Object.entries(inDepthStats?.cefrSpread || { 'A1': 0, 'A2': 0, 'B1': 0, 'B2': 0, 'C1': 0, 'C2': 0 })
                                .sort((a, b) => a[0].localeCompare(b[0]))
                                .map(([level, count]) => (
                                <div key={level} className="p-2.5 bg-secondary/30 hover:bg-secondary/80 rounded-xl border border-border/50 hover:border-border hover:scale-[1.03] transition-all duration-300 cursor-default">
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className="text-[10px] font-black uppercase">{level}</span>
                                        <span className="text-xs font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-md">{count}</span>
                                    </div>
                                    <Progress value={Math.min((count / (dashboardData.vocabulary?.totalWords || 1)) * 200, 100)} className="h-1 shadow-inner bg-secondary-foreground/10" />
                                </div>
                            ))}
                        </div>

                        <div className="pt-4 border-t border-border/50">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase mb-3 px-1">{t("insight.toughChallenges")}</p>
                            <div className="flex flex-wrap gap-1.5">
                                {(inDepthStats?.mostDifficultWords?.length || 0) > 0 ? (
                                    inDepthStats?.mostDifficultWords?.slice(0, 6).map((word, idx) => (
                                        <Badge 
                                            key={idx} 
                                            variant="secondary" 
                                            className="bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white border-transparent text-[10px] font-bold px-2.5 py-1 transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 hover:shadow-md cursor-default"
                                        >
                                            {word}
                                        </Badge>
                                    ))
                                ) : (
                                    <p className="text-[10px] text-muted-foreground italic px-1 bg-muted p-2 rounded-md">{t("insight.noChallenges")}</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Heatmap */}
                <Card className="md:col-span-8 shadow-md border-transparent hover:border-primary/20 bg-card/60 backdrop-blur-sm overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">{t("heatmap.title")}</CardTitle>
                            <p className="text-xs text-muted-foreground">{t("activity.subtitle")}</p>
                        </div>
                        <Badge className="bg-primary/90 text-primary-foreground shadow-sm group-hover:scale-105 transition-transform">{heatmapData?.year || new Date().getFullYear()}</Badge>
                    </CardHeader>
                    <CardContent>
                        {heatmapData ? (
                            <div className="p-3 bg-muted/30 rounded-2xl border border-transparent hover:border-border/50 transition-colors">
                                <Heatmap data={heatmapData} />
                            </div>
                        ) : (
                            <div className="h-48 flex items-center justify-center text-muted-foreground italic text-sm bg-muted/20 rounded-2xl border border-dashed">
                                {t("activity.warming")}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            
            <div className="flex items-center justify-between text-[10px] text-muted-foreground px-4 italic font-medium animate-in fade-in duration-1000 delay-500">
                <span>{t("footer.lastUpdated")} {lastRefresh.toLocaleTimeString()}</span>
                <span className="flex items-center gap-1.5 underline decoration-emerald-500/30 hover:decoration-emerald-500 hover:text-emerald-500 transition-colors underline-offset-4 cursor-help">
                    <Shield className="h-2.5 w-2.5" /> {t("footer.dataProtection")}
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
