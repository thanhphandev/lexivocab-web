"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api/api-client";
import { SystemStatsDto } from "@/lib/api/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, Activity, GraduationCap } from "lucide-react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function AdminOverviewPage() {
    const [metrics, setMetrics] = useState<SystemStatsDto | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchMetrics() {
            const res = await adminApi.getMetrics();
            if (res.success) {
                setMetrics(res.data);
            } else {
                setError(res.error || "Failed to load metrics");
            }
            setLoading(false);
        }
        fetchMetrics();
    }, []);

    if (loading) {
        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-2xl" />
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i} className="overflow-hidden border-none shadow-md">
                            <CardHeader className="pb-2">
                                <Skeleton className="h-4 w-24" />
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Skeleton className="h-10 w-20" />
                                <Skeleton className="h-3 w-32" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <Card className="border-none shadow-md">
                    <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
                    <CardContent><Skeleton className="h-24 w-full" /></CardContent>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive" className="border-red-500/50 bg-red-500/5">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>System Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    const cards = [
        {
            title: "Total Users",
            value: metrics?.totalUsers?.toLocaleString(),
            label: "Registered accounts",
            icon: Users,
            color: "from-blue-500 to-indigo-600",
            bg: "bg-blue-500/10"
        },
        {
            title: "Active Subscriptions",
            value: metrics?.totalActiveSubscriptions?.toLocaleString(),
            label: "Generating revenue",
            icon: CreditCard,
            color: "from-emerald-500 to-teal-600",
            bg: "bg-emerald-500/10"
        },
        {
            title: "Premium Users",
            value: metrics?.totalPremiumUsers?.toLocaleString(),
            label: "Tier-based access",
            icon: GraduationCap,
            color: "from-amber-500 to-orange-600",
            bg: "bg-amber-500/10"
        },
        {
            title: "Engagement",
            value: metrics?.totalReviews?.toLocaleString(),
            label: "Flashcard reviews",
            icon: Activity,
            color: "from-rose-500 to-pink-600",
            bg: "bg-rose-500/10"
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
                        <Activity className="h-7 w-7 text-white" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">System Insights</h2>
                        <p className="text-muted-foreground mt-0.5">
                            Real-time platform performance and growth metrics.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-sm font-medium">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    System Online
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {cards.map((card, idx) => (
                    <Card key={idx} className="relative overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 group">
                        <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${card.color}`} />
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                                {card.title}
                            </CardTitle>
                            <div className={`p-2 rounded-lg ${card.bg} transition-transform group-hover:scale-110 duration-300`}>
                                <card.icon className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-extrabold tracking-tight">{card.value}</div>
                            <p className="text-[11px] font-medium text-muted-foreground mt-1 flex items-center gap-1">
                                {card.label}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Detailed Stats */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="col-span-1 md:col-span-2 shadow-md border-muted/20">
                    <CardHeader className="flex flex-row items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <GraduationCap className="h-5 w-5 text-primary" />
                        </div>
                        <CardTitle>Content Ecosystem</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-muted/50 border border-muted-foreground/5">
                                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Total Vocabularies</p>
                                <p className="text-2xl font-bold mt-1">{metrics?.totalVocabularies?.toLocaleString()}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-muted/50 border border-muted-foreground/5">
                                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Review Density</p>
                                <p className="text-2xl font-bold mt-1">
                                    {metrics?.totalVocabularies && metrics.totalVocabularies > 0 
                                        ? (metrics.totalReviews! / metrics.totalVocabularies).toFixed(1)
                                        : "0"}
                                    <span className="text-xs font-normal text-muted-foreground ml-1">avg/word</span>
                                </p>
                            </div>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary w-[75%] rounded-full animate-progress" />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            System resource utilization is within optimal parameters. High engagement detected in flashcard modules.
                        </p>
                    </CardContent>
                </Card>

                <Card className="shadow-md border-muted/20">
                    <CardHeader>
                        <CardTitle>Quick Navigation</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Button variant="outline" className="w-full justify-start gap-2 h-11" asChild>
                            <a href="/admin/users"><Users className="h-4 w-4" /> Manage Users</a>
                        </Button>
                        <Button variant="outline" className="w-full justify-start gap-2 h-11" asChild>
                            <a href="/admin/plans"><CreditCard className="h-4 w-4" /> Subscription Plans</a>
                        </Button>
                        <Button variant="outline" className="w-full justify-start gap-2 h-11" asChild>
                            <a href="/admin/vocabularies"><GraduationCap className="h-4 w-4" /> Global Dictionary</a>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
