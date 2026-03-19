"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api/api-client";
import { SystemStatsDto, AdvancedSystemStatsDto } from "@/lib/api/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, CreditCard, Activity, GraduationCap, DollarSign, UserPlus, Zap } from "lucide-react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, LineChart, Line
} from 'recharts';

export default function AdminOverviewPage() {
    const [metrics, setMetrics] = useState<SystemStatsDto | null>(null);
    const [advMetrics, setAdvMetrics] = useState<AdvancedSystemStatsDto | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchMetrics() {
            try {
                const [basicRes, advRes] = await Promise.all([
                    adminApi.getMetrics(),
                    adminApi.getAdvancedMetrics()
                ]);

                if (!basicRes.success || !advRes.success) {
                    setError((basicRes as any).error || (advRes as any).error || "Failed to load metrics");
                    return;
                }

                setMetrics(basicRes.data);
                setAdvMetrics(advRes.data);
            } catch (err: any) {
                setError(err.message || "An unexpected error occurred");
            } finally {
                setLoading(false);
            }
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
                        <Card key={i} className="border-none shadow-md">
                            <CardHeader className="pb-2"><Skeleton className="h-4 w-24" /></CardHeader>
                            <CardContent className="space-y-2">
                                <Skeleton className="h-10 w-20" />
                                <Skeleton className="h-3 w-32" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="border-none shadow-md h-72"><CardHeader><Skeleton className="h-6 w-32" /></CardHeader></Card>
                    <Card className="border-none shadow-md h-72"><CardHeader><Skeleton className="h-6 w-32" /></CardHeader></Card>
                </div>
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

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
    };

    const cards = [
        {
            title: "Daily Active Users",
            value: advMetrics?.userGrowth.dailyActiveUsers.toLocaleString() || "0",
            label: "Active today",
            icon: Users,
            color: "from-blue-500 to-indigo-600",
            bg: "bg-blue-500/10"
        },
        {
            title: "Monthly Recurring Rev",
            value: formatCurrency(advMetrics?.financial.monthlyRecurringRevenue || 0),
            label: "Estimated 30-day MRR",
            icon: DollarSign,
            color: "from-emerald-500 to-teal-600",
            bg: "bg-emerald-500/10"
        },
        {
            title: "Churn Rate",
            value: `${advMetrics?.financial.churnRatePercentage || 0}%`,
            label: "Lapsed subscribers",
            icon: AlertCircle,
            color: "from-amber-500 to-orange-600",
            bg: "bg-amber-500/10"
        },
        {
            title: "Total Vocabularies",
            value: metrics?.totalVocabularies?.toLocaleString() || "0",
            label: "Across the platform",
            icon: GraduationCap,
            color: "from-rose-500 to-pink-600",
            bg: "bg-rose-500/10"
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
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
                    <Card key={idx} className="relative overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300 group bg-card">
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

            {/* Charts Section */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="shadow-sm border-muted/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-emerald-500" />
                            Revenue Momentum
                        </CardTitle>
                        <CardDescription>Daily revenue generated over the last 30 days</CardDescription>
                    </CardHeader>
                    <CardContent className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={advMetrics?.financial.revenueByDay || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} opacity={0.5} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} opacity={0.5} tickFormatter={(val) => `$${val}`} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    formatter={(value: any) => [`$${value}`, "Revenue"]}
                                />
                                <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-muted/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UserPlus className="w-5 h-5 text-blue-500" />
                            User Acquisition
                        </CardTitle>
                        <CardDescription>New user registrations over the last 30 days</CardDescription>
                    </CardHeader>
                    <CardContent className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={advMetrics?.userGrowth.newUsersByDay || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} opacity={0.5} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} opacity={0.5} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
                                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                    formatter={(value: any) => [value, "New Users"]}
                                />
                                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-muted/20 md:col-span-2">
                    <CardHeader className="flex flex-row items-start justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Zap className="w-5 h-5 text-purple-500" />
                                Learning Engagement
                            </CardTitle>
                            <CardDescription>Flashcard review activity indicating platform retention</CardDescription>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-muted-foreground">Avg Time/Review</div>
                            <div className="text-xl font-bold">{advMetrics?.engagement.averageTimeSpentPerReviewMs ? (advMetrics.engagement.averageTimeSpentPerReviewMs / 1000).toFixed(1) : 0}s</div>
                        </div>
                    </CardHeader>
                    <CardContent className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={advMetrics?.engagement.reviewsByDay || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} opacity={0.5} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} opacity={0.5} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    formatter={(value: any) => [value, "Total Reviews"]}
                                />
                                <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
            
        </div>
    );
}
