"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { paymentApi } from "@/lib/api/api-client";import { useAuth } from "@/lib/auth/auth-context";
import { usePermissions } from "@/lib/hooks/use-permissions";
import type { BillingOverviewDto, PaymentHistoryDto } from "@/lib/api/types";
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
    Download,
    Ban,
} from "lucide-react";
import { downloadInvoicePdf } from "@/lib/pdf/generate-invoice";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { toast } from "sonner";
import { PendingTransactionBanner } from "@/components/billing/pending-transaction-banner";
import { SepayQRDialog } from "@/components/billing/sepay-qr-dialog";
function StatusBadge({ status }: { status: string }) {
    const config: Record<string, { icon: React.ReactNode; color: string }> = {
        Completed: { icon: <CheckCircle2 className="h-3 w-3" />, color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
        Pending: { icon: <Clock className="h-3 w-3" />, color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
        Failed: { icon: <XCircle className="h-3 w-3" />, color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
        Refunded: { icon: <AlertCircle className="h-3 w-3" />, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
        Expired: { icon: <XCircle className="h-3 w-3" />, color: "bg-zinc-100 text-zinc-700 dark:bg-zinc-900/30 dark:text-zinc-300" },
        Cancelled: { icon: <XCircle className="h-3 w-3" />, color: "bg-zinc-100 text-zinc-700 dark:bg-zinc-900/30 dark:text-zinc-300" },
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
    const [pendingTransaction, setPendingTransaction] = useState<PaymentHistoryDto | null>(null);
    const [qrData, setQrData] = useState<{ url: string; ref: string; expiresAt?: string | null } | null>(null);
    const [isPolling, setIsPolling] = useState(false);
    const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    useEffect(() => {
        const fetchBilling = async () => {
            try {
                const [billingRes, historyRes] = await Promise.all([
                    paymentApi.getBillingOverview(),
                    paymentApi.getPaymentHistory(),
                ]);

                console.log("Billing response:", billingRes);
                console.log("History response:", historyRes);

                if (billingRes.success) setBilling(billingRes.data);
                else console.error("Failed to load billing:", billingRes.error);

                if (historyRes.success) {
                    // Handle different response structures
                    const items = (historyRes.data as any)?.items || historyRes.data || [];
                    console.log("History items:", items);
                    setHistory(items);
                    
                    const pending = items.find((tx: any) => tx.status === "Pending" && tx.provider === "Sepay");
                    if (pending) {
                        setPendingTransaction(pending);
                    }
                } else {
                    console.error("Failed to load history:", historyRes.error);
                }
            } catch (err) {
                console.error("Error fetching billing data:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchBilling();
    }, []);

    const handleResumePending = () => {
        if (!pendingTransaction || !pendingTransaction.approvalUrl) return;
        
        setQrData({ 
            url: pendingTransaction.approvalUrl, 
            ref: pendingTransaction.externalOrderId,
            expiresAt: pendingTransaction.expiresAt ?? null
        });
        setIsPolling(true);
    };

    const handleCancelSubscription = async () => {
        setIsCancelling(true);
        try {
            const res = await paymentApi.cancelSubscription();
            if (res.success) {
                toast.success("Subscription cancelled. Access revoked immediately.");
                setBilling(prev => prev ? {
                    ...prev,
                    activeSubscription: prev.activeSubscription
                        ? { ...prev.activeSubscription, status: "Cancelled" }
                        : null
                } : null);
            } else {
                toast.error(res.error || "Failed to cancel subscription.");
            }
        } finally {
            setIsCancelling(false);
            setConfirmCancelOpen(false);
        }
    };

    const handleDownloadInvoice = async (tx: PaymentHistoryDto) => {
        setDownloadingId(tx.id);
        try {
            await downloadInvoicePdf(tx);
            toast.success("Invoice downloaded successfully.");
        } catch {
            toast.error("Failed to generate invoice PDF.");
        } finally {
            setDownloadingId(null);
        }
    };

    // Polling for Sepay payment completion
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPolling && qrData?.ref) {
            interval = setInterval(async () => {
                try {
                    const res = await paymentApi.checkStatus(qrData.ref);
                    if (!res.success) return;

                    if (res.data.status === "Completed") {
                        setIsPolling(false);
                        window.location.href = `/${locale}/checkout/success?token=${qrData.ref}&provider=sepay`;
                        return;
                    }

                    if (res.data.status === "Expired" || res.data.status === "Cancelled" || res.data.status === "Failed") {
                        setIsPolling(false);
                        setQrData(null);
                        setPendingTransaction(null);
                    }
                } catch (err) {
                    console.error("Polling error", err);
                }
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [isPolling, qrData, locale]);

    const t = useTranslations("Billing");
    const tPricing = useTranslations("Pricing");



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
                    {t("title")}
                </h1>
                <p className="mt-1 text-muted-foreground">
                    {t("subtitle")}
                </p>
            </div>

            {/* Pending Transaction Banner */}
            {pendingTransaction && (
                <PendingTransactionBanner 
                    transaction={pendingTransaction}
                    onResume={handleResumePending}
                    onCancel={() => setPendingTransaction(null)}
                    className="mb-8"
                />
            )}

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
                                        {billing?.activeSubscription?.durationMonths 
                                            ? t("current_plan.title_premium", { 
                                                plan: billing.plan || "Premium", 
                                                months: billing.activeSubscription.durationMonths,
                                                month_label: tPricing(billing.activeSubscription.durationMonths > 1 ? "months" : "month")
                                            }) 
                                            : t("current_plan.title_free")}
                                    </CardTitle>
                                    <CardDescription>
                                        {perms.isPremium
                                            ? billing?.planExpiresAt
                                                ? t("current_plan.expires", { date: new Date(billing.planExpiresAt).toLocaleDateString() })
                                                : t("current_plan.lifetime")
                                            : t("current_plan.quota_limit", { count: perms.quotaMax })}
                                    </CardDescription>
                                </div>
                            </div>
                            {perms.isPremium ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                                    <CheckCircle2 className="h-4 w-4" />
                                    {t("current_plan.active")}
                                </span>
                            ) : (
                                <Link href={`/${locale}/pricing`}>
                                    <Button size="sm">
                                        <Crown className="mr-2 h-4 w-4" />
                                        {tPricing("upgrade")}
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
                                        {billing.planExpiresAt ? new Date(billing.planExpiresAt).toLocaleDateString() : t("current_plan.lifetime")}
                                    </span>
                                </div>
                                <div className="p-3 rounded-lg bg-background border shadow-sm">
                                    <span className="block text-muted-foreground mb-1">Status</span>
                                    <StatusBadge status={billing.activeSubscription.status} />
                                </div>
                            </div>
                            {billing.activeSubscription.status === "Active" && (
                                <div className="mt-4 pt-4 border-t flex justify-end">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-destructive hover:bg-destructive/10 border-destructive/30"
                                        onClick={() => setConfirmCancelOpen(true)}
                                        disabled={isCancelling}
                                    >
                                        <Ban className="mr-2 h-4 w-4" />
                                        Cancel Subscription
                                    </Button>
                                </div>
                            )}
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
                            {t("permissions.title")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            <li className="flex items-center justify-between py-2 border-b border-border/50">
                                <span className="text-sm text-muted-foreground">{t("permissions.export")}</span>
                                {perms.canExport ? (
                                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                ) : (
                                    <XCircle className="h-5 w-5 text-muted-foreground/30" />
                                )}
                            </li>
                            <li className="flex items-center justify-between py-2 border-b border-border/50">
                                <span className="text-sm text-muted-foreground">{t("permissions.ai")}</span>
                                {perms.canUseAi ? (
                                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                ) : (
                                    <XCircle className="h-5 w-5 text-muted-foreground/30" />
                                )}
                            </li>
                            <li className="flex items-center justify-between py-2">
                                <span className="text-sm text-muted-foreground">{t("permissions.import")}</span>
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
                            {t("quota.title")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">{t("quota.used")}</span>
                            <span className="text-sm font-bold">
                                {perms.quotaMax >= 2147483647 
                                    ? `${perms.quotaUsed} / ${t("quota.unlimited")}` 
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
                                ? t("quota.desc_premium")
                                : t("quota.desc_free", { used: perms.quotaUsed, max: perms.quotaMax })}
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
                                        {tPricing("premium_plan")}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {tPricing("premium_desc")}
                                    </p>
                                </div>
                            </div>
                            <Link href={`/${locale}/pricing`}>
                                <Button className="shrink-0">
                                    {tPricing("upgrade")} — $9.99
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
                            {t("history.title")}
                        </CardTitle>
                        <CardDescription>
                            {billing?.totalTransactions
                                ? t("history.count", { count: billing.totalTransactions })
                                : t("history.no_transactions")}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {(history?.length ?? 0) === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-30" />
                                <p className="text-lg font-medium">{t("history.no_transactions")}</p>
                                <p className="text-sm mt-1">
                                    {t("history.empty_desc")}
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
                                                        {t("history.payment_label", { provider: tx.provider })}
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
                                            {tx.status === "Completed" && (
                                                <div className="mt-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 px-2 text-xs text-muted-foreground hover:text-primary"
                                                        onClick={() => handleDownloadInvoice(tx)}
                                                        disabled={downloadingId === tx.id}
                                                    >
                                                        {downloadingId === tx.id
                                                            ? <Loader2 className="h-3 w-3 animate-spin" />
                                                            : <Download className="h-3 w-3 mr-1" />
                                                        }
                                                        PDF
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            {/* Sepay QR Modal */}
            <SepayQRDialog 
                qrData={qrData} 
                onOpenChange={(open) => !open && setQrData(null)} 
            />

            <ConfirmDialog
                open={confirmCancelOpen}
                onOpenChange={setConfirmCancelOpen}
                title="Cancel Subscription"
                description="Are you sure you want to cancel your subscription? Your Premium access will be revoked immediately and this action cannot be undone."
                onConfirm={handleCancelSubscription}
                confirmText={isCancelling ? "Cancelling..." : "Yes, Cancel"}
                variant="destructive"
            />
        </div>
    );
}
