"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { clientApi } from "@/lib/api/api-client";
import { useAuth } from "@/lib/auth/auth-context";
import { usePermissions } from "@/lib/hooks/use-permissions";
import type { BillingOverviewDto, PaymentHistoryDto, PagedResult } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    Crown,
    CreditCard,
    Loader2,
    Shield,
    Calendar,
    ExternalLink,
    CheckCircle2,
    Clock,
    XCircle,
    AlertCircle,
    BookOpen,
} from "lucide-react";

function StatusBadge({ status }: { status: string }) {
    const config: Record<string, { icon: React.ReactNode; color: string }> = {
        Completed: { icon: <CheckCircle2 className="h-3 w-3" />, color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
        Pending: { icon: <Clock className="h-3 w-3" />, color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
        Failed: { icon: <XCircle className="h-3 w-3" />, color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
        Refunded: { icon: <AlertCircle className="h-3 w-3" />, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
    };

    const c = config[status] || config["Pending"];

    return (
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${c.color}`}>
            {c.icon}
            {status}
        </span>
    );
}

export default function BillingPage() {
    const locale = useLocale();
    const { user } = useAuth();
    const perms = usePermissions();

    const [billing, setBilling] = useState<BillingOverviewDto | null>(null);
    const [history, setHistory] = useState<PaymentHistoryDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchBilling = async () => {
            const [billingRes, historyRes] = await Promise.all([
                clientApi.get<BillingOverviewDto>("/api/proxy/payments/billing"),
                clientApi.get<PagedResult<PaymentHistoryDto>>("/api/proxy/payments/history"),
            ]);

            if (billingRes.success) setBilling(billingRes.data);
            if (historyRes.success) setHistory(historyRes.data.items);
            setIsLoading(false);
        };

        fetchBilling();
    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-10 max-w-4xl">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    Billing & Subscription
                </h1>
                <p className="mt-1 text-muted-foreground">
                    Manage your plan and view payment history.
                </p>
            </div>

            {/* Current Plan Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <Card className={perms.isPremium ? "border-primary/30 bg-gradient-to-br from-primary/5 to-transparent" : ""}>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${perms.isPremium ? "bg-primary/10" : "bg-secondary"}`}>
                                    {perms.isPremium ? (
                                        <Crown className="h-6 w-6 text-primary" />
                                    ) : (
                                        <Shield className="h-6 w-6 text-muted-foreground" />
                                    )}
                                </div>
                                <div>
                                    <CardTitle className="text-xl">
                                        {billing?.plan || "Free"} Plan
                                    </CardTitle>
                                    <CardDescription>
                                        {perms.isPremium
                                            ? billing?.planExpiresAt
                                                ? `Expires: ${new Date(billing.planExpiresAt).toLocaleDateString()}`
                                                : "Lifetime access"
                                            : `Limited to ${perms.quotaMax} vocabulary words`}
                                    </CardDescription>
                                </div>
                            </div>
                            {perms.isPremium ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Active
                                </span>
                            ) : (
                                <Link href={`/${locale}/pricing`}>
                                    <Button size="sm">
                                        <Crown className="mr-2 h-4 w-4" />
                                        Upgrade to Premium
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </CardHeader>

                    {billing?.activeSubscription && (
                        <CardContent>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm mt-4">
                                <div className="p-3 rounded-lg bg-background border shadow-sm">
                                    <span className="block text-muted-foreground mb-1">Provider</span>
                                    <span className="font-medium flex items-center gap-2">
                                        <CreditCard className="h-4 w-4 text-primary" />
                                        {billing.activeSubscription.provider}
                                    </span>
                                </div>
                                <div className="p-3 rounded-lg bg-background border shadow-sm">
                                    <span className="block text-muted-foreground mb-1">Start Date</span>
                                    <span className="font-medium font-mono text-xs">
                                        {new Date(billing.activeSubscription.startDate).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="p-3 rounded-lg bg-background border shadow-sm">
                                    <span className="block text-muted-foreground mb-1">Renewal Date</span>
                                    <span className="font-medium font-mono text-xs">
                                        {billing.planExpiresAt ? new Date(billing.planExpiresAt).toLocaleDateString() : "Lifetime"}
                                    </span>
                                </div>
                                <div className="p-3 rounded-lg bg-background border shadow-sm">
                                    <span className="block text-muted-foreground mb-1">Status</span>
                                    <StatusBadge status={billing.activeSubscription.status} />
                                </div>
                            </div>
                        </CardContent>
                    )}
                </Card>
            </motion.div>

            {/* Quota & Permissions Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid gap-4 sm:grid-cols-2"
            >
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Shield className="h-5 w-5 text-primary" />
                            Plan Permissions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            <li className="flex items-center justify-between py-2 border-b border-border/50">
                                <span className="text-sm text-muted-foreground">Export Data (PDF/CSV)</span>
                                {perms.canExport ? (
                                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                ) : (
                                    <XCircle className="h-5 w-5 text-muted-foreground/30" />
                                )}
                            </li>
                            <li className="flex items-center justify-between py-2 border-b border-border/50">
                                <span className="text-sm text-muted-foreground">AI Meaning & Context</span>
                                {perms.canUseAi ? (
                                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                ) : (
                                    <XCircle className="h-5 w-5 text-muted-foreground/30" />
                                )}
                            </li>
                            <li className="flex items-center justify-between py-2">
                                <span className="text-sm text-muted-foreground">Batch Import</span>
                                {perms.canBatchImport ? (
                                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                ) : (
                                    <XCircle className="h-5 w-5 text-muted-foreground/30" />
                                )}
                            </li>
                        </ul>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-primary" />
                            Vocabulary Quota
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Used Space</span>
                            <span className="text-sm font-bold">
                                {perms.quotaMax >= 2147483647 
                                    ? `${perms.quotaUsed} / Unlimited` 
                                    : `${perms.quotaUsed} / ${perms.quotaMax}`}
                            </span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden">
                            <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                    perms.isPremium ? 'w-full bg-primary' : 
                                    perms.quotaMax > 0 
                                        ? `bg-primary` 
                                        : 'w-[0%] bg-orange-500'
                                }`}
                                style={{ 
                                    width: perms.quotaMax > 0 
                                        ? `${Math.min((perms.quotaUsed / perms.quotaMax) * 100, 100)}%` 
                                        : '0%' 
                                }}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {perms.isPremium 
                                ? "You have premium access to all LexiVocab features without heavy restrictions."
                                : `You have used ${perms.quotaUsed} of your ${perms.quotaMax} available vocabulary slots.`}
                        </p>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Premium Upgrade CTA for Free users */}
            {!perms.isPremium && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="border-dashed border-2 border-primary/30">
                        <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6">
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center">
                                    <Crown className="h-7 w-7 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground text-lg">
                                        Unlock Premium Features
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Unlimited vocabulary, AI features, batch import/export, and more.
                                    </p>
                                </div>
                            </div>
                            <Link href={`/${locale}/pricing`}>
                                <Button className="shrink-0">
                                    View Plans — $9.99
                                    <ExternalLink className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Payment History */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Payment History
                        </CardTitle>
                        <CardDescription>
                            {billing?.totalTransactions
                                ? `${billing.totalTransactions} transaction(s)`
                                : "No transactions yet"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {history.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-30" />
                                <p className="text-lg font-medium">No payment history</p>
                                <p className="text-sm mt-1">
                                    Your transactions will appear here after you make a purchase.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {history.map((tx) => (
                                    <div
                                        key={tx.id}
                                        className="flex items-center justify-between p-4 rounded-lg border bg-background hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                <CreditCard className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-sm text-foreground">
                                                        {tx.provider} Payment
                                                    </span>
                                                    <StatusBadge status={tx.status} />
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(tx.createdAt).toLocaleDateString(undefined, {
                                                        year: "numeric",
                                                        month: "short",
                                                        day: "numeric",
                                                    })}
                                                    <span className="font-mono text-xs">
                                                        #{tx.externalOrderId.slice(0, 12)}...
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-semibold text-foreground">
                                                ${tx.amount.toFixed(2)}
                                            </span>
                                            <span className="text-xs text-muted-foreground ml-1">
                                                {tx.currency}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
