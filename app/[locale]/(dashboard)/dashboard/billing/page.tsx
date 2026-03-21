"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { paymentApi } from "@/lib/api/api-client";
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
    const perms = usePermissions();
    const t = useTranslations("Billing");
    const tPricing = useTranslations("Pricing");

    const [billing, setBilling] = useState<BillingOverviewDto | null>(null);
    const [history, setHistory] = useState<PaymentHistoryDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pendingTransaction, setPendingTransaction] = useState<PaymentHistoryDto | null>(null);
    const [qrData, setQrData] = useState<{ url: string; ref: string; expiresAt?: string | null } | null>(null);
    const [isPolling, setIsPolling] = useState(false);
    const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [confirmCancelPendingOpen, setConfirmCancelPendingOpen] = useState(false);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    useEffect(() => {
        const fetchBilling = async () => {
            try {
                const [billingRes, historyRes] = await Promise.all([
                    paymentApi.getBillingOverview(),
                    paymentApi.getPaymentHistory(),
                ]);

                if (billingRes.success) setBilling(billingRes.data);
                else console.error("Failed to load billing:", billingRes.error);

                if (historyRes.success) {
                    // Handle different response structures
                    const items = (historyRes.data as any)?.items || historyRes.data || [];
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

    const handleCancelPending = async () => {
        if (!pendingTransaction) return;

        setIsCancelling(true);
        const reference = pendingTransaction.externalOrderId;
        try {
            const res = await paymentApi.cancelPayment(reference);
            if (res.success) {
                toast.success(tPricing("pending_transaction.cancel_success"));
                setPendingTransaction(null);
                setQrData(null);
                setIsPolling(false);
            } else {
                toast.error(res.error || tPricing("pending_transaction.cancel_error"));
            }
        } catch (err) {
            console.error("Cancel error", err);
            toast.error(t("subscription_details.cancel_pending_error"));
        } finally {
            setIsCancelling(false);
            setConfirmCancelPendingOpen(false);
        }
    };

    const handleCancelSubscription = async () => {
        setIsCancelling(true);
        try {
            const res = await paymentApi.cancelSubscription();
            if (res.success) {
                toast.success(t("subscription_details.cancel_success"));
                setBilling(prev => prev ? {
                    ...prev,
                    activeSubscription: prev.activeSubscription
                        ? { ...prev.activeSubscription, status: "Cancelled" }
                        : null
                } : null);
            } else {
                toast.error(res.error || t("subscription_details.cancel_error"));
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
            toast.success(t("invoice.download_success"));
        } catch {
            toast.error(t("invoice.download_error"));
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
                    onCancel={() => setConfirmCancelPendingOpen(true)}
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
                                        {(() => {
                                            if (!billing?.activeSubscription) return t("current_plan.title_free");

                                            const planNameLocal = tPricing("plan_" + (billing.plan || "Premium").toLowerCase());
                                            if (!billing.activeSubscription.endDate) return t("current_plan.title_lifetime", { plan: planNameLocal });

                                            // Calculate months based on start and end dates
                                            const start = new Date(billing.activeSubscription.startDate);
                                            const end = new Date(billing.activeSubscription.endDate);
                                            const msPerMonth = 1000 * 60 * 60 * 24 * 30.436875;
                                            const months = Math.max(1, Math.round((end.getTime() - start.getTime()) / msPerMonth));

                                            return t("current_plan.title_premium", {
                                                plan: planNameLocal,
                                                months: months,
                                                month_label: tPricing(months > 1 ? "comparison.months" : "comparison.month")
                                            });
                                        })()}
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
                                    <span className="block text-muted-foreground mb-1">{t("subscription_details.provider")}</span>
                                    <span className="font-medium flex items-center gap-2">
                                        <CreditCard className="h-4 w-4 text-primary" />
                                        {billing.activeSubscription.provider}
                                    </span>
                                </div>
                                <div className="p-3 rounded-lg bg-background border shadow-sm">
                                    <span className="block text-muted-foreground mb-1">{t("subscription_details.start_date")}</span>
                                    <span className="font-medium font-mono text-xs">
                                        {new Date(billing.activeSubscription.startDate).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="p-3 rounded-lg bg-background border shadow-sm">
                                    <span className="block text-muted-foreground mb-1">{t("subscription_details.renewal_date")}</span>
                                    <span className="font-medium font-mono text-xs">
                                        {billing.planExpiresAt ? new Date(billing.planExpiresAt).toLocaleDateString() : t("current_plan.lifetime")}
                                    </span>
                                </div>
                                <div className="p-3 rounded-lg bg-background border shadow-sm">
                                    <span className="block text-muted-foreground mb-1">{t("subscription_details.status")}</span>
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
                                        {t("subscription_details.cancel")}
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
                        {/* Vocabulary Quota */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">{t("quota.used")}</span>
                                <span className="text-sm font-bold">
                                    {perms.quotaMax === -1
                                        ? `${perms.quotaUsed} / ${t("quota.unlimited")}`
                                        : `${perms.quotaUsed} / ${perms.quotaMax}`}
                                </span>
                            </div>
                            <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${perms.quotaMax === -1 ? 'bg-primary' :
                                            perms.quotaMax > 0 ? `bg-primary` : 'w-[0%] bg-orange-500'
                                        }`}
                                    style={{
                                        width: perms.quotaMax === -1
                                            ? '100%'
                                            : perms.quotaMax > 0 ? `${Math.min((perms.quotaUsed / perms.quotaMax) * 100, 100)}%` : '0%'
                                    }}
                                />
                            </div>
                        </div>

                        {/* AI Explanation Quota */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">AI Explanations</span>
                                <span className="text-sm font-bold">
                                    {perms.aiMax === -1
                                        ? `${perms.aiUsed} / ${t("quota.unlimited")}`
                                        : `${perms.aiUsed} / ${perms.aiMax}`}
                                </span>
                            </div>
                            <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 bg-primary`}
                                    style={{
                                        width: perms.aiMax === -1
                                            ? '100%'
                                            : perms.aiMax > 0 ? `${Math.min((perms.aiUsed / perms.aiMax) * 100, 100)}%` : '0%'
                                    }}
                                />
                            </div>
                        </div>

                        {/* AI Translation Quota */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">AI Translations</span>
                                <span className="text-sm font-bold">
                                    {perms.transMax === -1
                                        ? `${perms.transUsed} / ${t("quota.unlimited")}`
                                        : `${perms.transUsed} / ${perms.transMax}`}
                                </span>
                            </div>
                            <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 bg-primary`}
                                    style={{
                                        width: perms.transMax === -1
                                            ? '100%'
                                            : perms.transMax > 0 ? `${Math.min((perms.transUsed / perms.transMax) * 100, 100)}%` : '0%'
                                    }}
                                />
                            </div>
                        </div>

                        {/* <div className="pt-2 border-t border-border flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Active Model</span>
                            <span className="text-xs font-semibold">{perms.activeAiModel}</span>
                        </div> */}
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
                                    {tPricing("upgrade")}
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
                title={t("subscription_details.cancel_title")}
                description={t("subscription_details.cancel_desc")}
                onConfirm={handleCancelSubscription}
                confirmText={isCancelling ? t("subscription_details.cancelling") : t("subscription_details.cancel_confirm")}
                variant="destructive"
            />

            <ConfirmDialog
                open={confirmCancelPendingOpen}
                onOpenChange={setConfirmCancelPendingOpen}
                title={tPricing("pending_transaction.cancel_confirm_title")}
                description={tPricing("pending_transaction.cancel_confirm_desc")}
                onConfirm={handleCancelPending}
                confirmText={isCancelling ? tPricing("processing") : tPricing("pending_transaction.cancel_confirm_btn")}
                variant="destructive"
            />
        </div>
    );
}
