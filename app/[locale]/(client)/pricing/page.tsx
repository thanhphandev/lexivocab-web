"use client";

import { useTranslations, useLocale } from "next-intl";
import { useAuth } from "@/lib/auth/auth-context";
import { usePermissions } from "@/lib/hooks/use-permissions";
import { useState, useEffect } from "react";
import { clientApi, paymentApi } from "@/lib/api/api-client";
import type { CreatePaymentOrderResponse, SubscriptionPlanDto, PaymentHistoryDto } from "@/lib/api/types";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    Check,
    X,
    Loader2,
    Sparkles,
    Crown,
    Zap,
    Shield,
    ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PendingTransactionBanner } from "@/components/billing/pending-transaction-banner";
import { SepayQRDialog } from "@/components/billing/sepay-qr-dialog";
import { useRouter } from "next/navigation";

export default function PricingPage() {
    const locale = useLocale();
    const t = useTranslations("Pricing");
    const { user, isAuthenticated } = useAuth();
    const { isPremium } = usePermissions();

    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState<number>(1); // 1: PayPal, 3: Sepay
    const [qrData, setQrData] = useState<{ url: string; ref: string; expiresAt?: string | null } | null>(null);
    const [isPolling, setIsPolling] = useState(false);
    const [plans, setPlans] = useState<SubscriptionPlanDto[]>([]);
    const [isLoadingPlans, setIsLoadingPlans] = useState(true);
    const [durationMonths, setDurationMonths] = useState<number>(1); // 1, 3, 6, 12 months for Premium
    const [pendingTransaction, setPendingTransaction] = useState<PaymentHistoryDto | null>(null);
    const [lastSepayRequest, setLastSepayRequest] = useState<{ planId: string; durationMonths: number } | null>(null);

    // Duration options with discount
    const durationOptions = [
        { months: 1, discount: 0, labelKey: "duration_1m" },
        { months: 3, discount: 5, labelKey: "duration_3m" },
        { months: 6, discount: 10, labelKey: "duration_6m" },
        { months: 12, discount: 20, labelKey: "duration_12m" },
    ];

    useEffect(() => {
        const fetchPlansAndHistory = async () => {
            try {
                const [plansRes, historyRes] = await Promise.all([
                    paymentApi.getPlans(),
                    isAuthenticated ? paymentApi.getPaymentHistory(1, 10) : Promise.resolve({ success: true, data: { items: [] } })
                ]);
                
                if (plansRes.success) {
                    setPlans(plansRes.data);
                }

                if (historyRes.success) {
                    const items = (historyRes.data as any)?.items || historyRes.data || [];
                    const pending = items.find((tx: any) => tx.status === "Pending" && tx.provider === "Sepay");
                    if (pending) {
                        setPendingTransaction(pending);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setIsLoadingPlans(false);
            }
        };

        fetchPlansAndHistory();
    }, [isAuthenticated]);

    const calculatePrice = (basePrice: number, months: number) => {
        const option = durationOptions.find(o => o.months === months);
        const discount = option?.discount || 0;
        const total = basePrice * months;
        const discounted = total * (1 - discount / 100);
        return {
            total,
            discounted,
            discount,
            monthly: discounted / months
        };
    };

    const handleUpgrade = async (plan: SubscriptionPlanDto, months: number = 1) => {
        if (!isAuthenticated) {
            window.location.href = `/${locale}/auth/login?redirect=/${locale}/pricing`;
            return;
        }

        const isFree = plan.nameKey.toLowerCase().includes("free");
        if (isFree) return;
        
        setIsProcessing(true);
        try {
            const res = await paymentApi.createOrder({ 
                planId: plan.id,
                provider: selectedProvider,
                durationMonths: months
            });

            if (res.success && res.data.approvalUrl) {
                if (selectedProvider === 3) {
                    // Sepay: Show QR Modal
                    const url = new URL(res.data.approvalUrl);
                    const ref = url.searchParams.get("des") || "";
                    setLastSepayRequest({ planId: plan.id, durationMonths: months });
                    setQrData({ url: res.data.approvalUrl, ref });
                    setIsPolling(true);
                    setPendingTransaction(null);

                    // Fetch expiresAt immediately for better UX
                    const statusRes = await paymentApi.checkStatus(ref);
                    if (statusRes.success && statusRes.data.expiresAt) {
                        setQrData(prev => prev && prev.ref === ref ? { ...prev, expiresAt: statusRes.data.expiresAt } : prev);
                    }
                } else {
                    // PayPal: Redirect
                    window.location.href = res.data.approvalUrl;
                }
            } else {
                alert("error" in res ? res.error : "Failed to create order");
            }
        } catch (err) {
            alert("An error occurred. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleResumePending = () => {
        if (!pendingTransaction || !pendingTransaction.approvalUrl) return;
        
        setQrData({ 
            url: pendingTransaction.approvalUrl, 
            ref: pendingTransaction.externalOrderId,
            expiresAt: pendingTransaction.expiresAt ?? null
        });
        setIsPolling(true);
    };

    const handleCreateNewSepay = async () => {
        if (!lastSepayRequest) {
            // fallback: reload to reselect plan
            window.location.reload();
            return;
        }

        setIsProcessing(true);
        try {
            const res = await paymentApi.createOrder({
                planId: lastSepayRequest.planId,
                provider: 3,
                durationMonths: lastSepayRequest.durationMonths
            });
            if (res.success && res.data.approvalUrl) {
                const url = new URL(res.data.approvalUrl);
                const ref = url.searchParams.get("des") || "";
                setQrData({ url: res.data.approvalUrl, ref });
                setIsPolling(true);
                setPendingTransaction(null);

                const statusRes = await paymentApi.checkStatus(ref);
                if (statusRes.success && statusRes.data.expiresAt) {
                    setQrData(prev => prev && prev.ref === ref ? { ...prev, expiresAt: statusRes.data.expiresAt } : prev);
                }
            }
        } finally {
            setIsProcessing(false);
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

    // Build comparison rows dynamically from API data — no hard coding
    const freePlan = plans.find(p => p.nameKey.toLowerCase().includes("free"));
    const premiumPlan2 = plans.find(p => p.nameKey.toLowerCase().includes("premium"));

    const comparisonRows = freePlan && premiumPlan2
        ? freePlan.features.map(freeFeature => {
            const premiumFeature = premiumPlan2.features.find(f => f.textKey === freeFeature.textKey);

            const renderValue = (feature: typeof freeFeature | undefined) => {
                if (!feature) return false;
                if (feature.params?.count !== undefined) {
                    const count = feature.params.count;
                    return count === 0 || String(count).toLowerCase() === "unlimited"
                        ? t("comparison.unlimited")
                        : t("comparison.words_limit", { count: Number(count) });
                }
                if (feature.params?.value !== undefined) return String(feature.params.value);
                return feature.included;
            };

            return {
                key: freeFeature.textKey,
                free: renderValue(freeFeature),
                premium: renderValue(premiumFeature),
            };
        })
        : [];

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Pending Transaction Banner */}
            {pendingTransaction && (
                <div className="mx-auto max-w-5xl px-4 pt-8">
                    <PendingTransactionBanner 
                        transaction={pendingTransaction}
                        onResume={handleResumePending}
                        onCancel={() => setPendingTransaction(null)}
                    />
                </div>
            )}

            {/* Hero */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
                <div className="mx-auto max-w-5xl px-4 pt-20 pb-16 text-center relative">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 mb-6">
                            <Sparkles className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-primary">
                                {t("badge")}
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
                            {t("title")}
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            {t("subtitle")}
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Pricing Cards */}
            <div className="mx-auto max-w-5xl px-4">
                {isLoadingPlans ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="grid md:grid-cols-3 gap-8">
                        {plans.map((plan, index) => {
                            const isFree = plan.nameKey.toLowerCase().includes("free");
                            const isPremiumPlan = plan.nameKey.toLowerCase().includes("premium");
                            const delay = 0.2 + index * 0.1;

                            return (
                                <motion.div
                                    key={plan.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay, duration: 0.4 }}
                                    className={`rounded-2xl bg-card p-8 relative flex flex-col ${isFree
                                            ? "border border-border shadow-sm"
                                            : "border-2 border-primary shadow-lg overflow-hidden"
                                        }`}
                                >
                                    {plan.isRecommended && (
                                        <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                                            {t("best_value")}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3 mb-6">
                                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${isFree ? "bg-secondary" : "bg-primary/10"}`}>
                                            {isFree ? (
                                                <Zap className="h-6 w-6 text-foreground" />
                                            ) : (
                                                <Crown className="h-6 w-6 text-primary" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-foreground text-left">
                                                {t(plan.nameKey.replace("Pricing.", ""))}
                                            </h3>
                                            <p className="text-sm text-muted-foreground text-left">
                                                {t(plan.descriptionKey.replace("Pricing.", ""))}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mb-8 text-left">
                                        {isFree ? (
                                            <span className="text-5xl font-bold text-foreground">
                                                {t("free")}
                                            </span>
                                        ) : plan.intervalKey === "lifetime" ? (
                                            <>
                                                <span className="text-5xl font-bold text-foreground">
                                                    {locale === "vi" 
                                                        ? `${parseInt(plan.price).toLocaleString("vi-VN")}đ`
                                                        : `$${(parseInt(plan.price) / 1000).toFixed(2)}`}
                                                </span>
                                                <span className="text-muted-foreground ml-2">{t("lifetime_label")}</span>
                                            </>
                                        ) : (
                                            <>
                                                {isPremiumPlan && (
                                                    <div className="mb-6">
                                                        <div className="flex flex-wrap gap-2">
                                                            {durationOptions.map((opt) => (
                                                                <button
                                                                    key={opt.months}
                                                                    onClick={() => setDurationMonths(opt.months)}
                                                                    className={`flex-1 min-w-[80px] px-3 py-2 rounded-xl text-xs font-bold transition-all border-2 ${
                                                                        durationMonths === opt.months
                                                                            ? "border-primary bg-primary/10 text-primary shadow-sm"
                                                                            : "border-border bg-muted/30 text-muted-foreground hover:border-primary/30"
                                                                    }`}
                                                                >
                                                                    {t(opt.labelKey)}
                                                                    {opt.discount > 0 && (
                                                                        <span className="block text-[10px] mt-0.5 text-emerald-600 dark:text-emerald-400">
                                                                            -{opt.discount}%
                                                                        </span>
                                                                    )}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {(() => {
                                                    const calc = calculatePrice(parseInt(plan.price), durationMonths);
                                                    return (
                                                        <>
                                                            <span className="text-5xl font-bold text-foreground">
                                                                {locale === "vi"
                                                                    ? `${Math.round(calc.discounted).toLocaleString("vi-VN")}đ`
                                                                    : `$${(calc.discounted / 1000).toFixed(2)}`}
                                                            </span>
                                                            <div className="text-sm text-muted-foreground mt-1">
                                                                {calc.discount > 0 && (
                                                                    <>
                                                                        <span className="line-through mr-2">
                                                                            {locale === "vi"
                                                                                ? `${Math.round(calc.total).toLocaleString("vi-VN")}đ`
                                                                                : `$${(calc.total / 1000).toFixed(2)}`}
                                                                        </span>
                                                                        <span className="text-emerald-500 font-medium">
                                                                            -{calc.discount}%
                                                                        </span>
                                                                    </>
                                                                )}
                                                                <span className="ml-2">{t("for")} {durationMonths} {durationMonths === 1 ? t("month") : t("months")}</span>
                                                            </div>
                                                        </>
                                                    );
                                                })()}
                                            </>
                                        )}
                                    </div>

                                    <ul className="space-y-3 mb-8 flex-1">
                                        {plan.features.map((feature, fIndex) => (
                                            <li
                                                key={fIndex}
                                                className="flex items-center gap-3 text-sm"
                                            >
                                                {feature.included ? (
                                                    <Check className={`h-4 w-4 shrink-0 ${isFree ? "text-emerald-500" : "text-primary"}`} />
                                                ) : (
                                                    <X className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                                                )}
                                                <span
                                                    className={
                                                        feature.included
                                                            ? (isFree ? "text-foreground" : "text-foreground font-medium")
                                                            : "text-muted-foreground/60"
                                                    }
                                                >
                                                    {(() => {
                                                        const key = feature.textKey.replace("Pricing.", "");
                                                        try {
                                                            return t(key, feature.params ?? {});
                                                        } catch {
                                                            return t(key, { count: 0 });
                                                        }
                                                    })()}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="mt-auto">
                                        {isFree ? (
                                            isAuthenticated ? (
                                                <Link href={`/${locale}/dashboard`}>
                                                    <Button
                                                        variant="outline"
                                                        className="w-full h-12 text-base"
                                                    >
                                                        {t("go_dashboard")}
                                                        <ArrowRight className="ml-2 h-4 w-4" />
                                                    </Button>
                                                </Link>
                                            ) : (
                                                <Link href={`/${locale}/auth/register`}>
                                                    <Button
                                                        variant="outline"
                                                        className="w-full h-12 text-base"
                                                    >
                                                        {t("get_started")}
                                                        <ArrowRight className="ml-2 h-4 w-4" />
                                                    </Button>
                                                </Link>
                                            )
                                        ) : (
                                            isPremium ? (
                                                <Button disabled className="w-full h-12 text-base">
                                                    <Shield className="mr-2 h-5 w-5" />
                                                    {t("already_premium")}
                                                </Button>
                                            ) : (
                                                <Button
                                                    onClick={() => handleUpgrade(plan, isPremiumPlan ? durationMonths : 1)}
                                                    disabled={isProcessing}
                                                    className="w-full h-12 text-base bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
                                                >
                                                    {isProcessing ? (
                                                        <>
                                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                            {t("processing")}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Crown className="mr-2 h-5 w-5" />
                                                            {t("upgrade")}
                                                        </>
                                                    )}
                                                </Button>
                                            )
                                        )}
                                    </div>

                                    {!isFree && !isPremium && (
                                        <div className="mt-8 pt-6 border-t border-border">
                                            <p className="text-sm font-medium text-foreground mb-4 text-left">
                                                {t("select_method")}
                                            </p>
                                            <div className="grid grid-cols-1 gap-3 mb-6">
                                                <button
                                                    onClick={() => setSelectedProvider(1)}
                                                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${selectedProvider === 1
                                                            ? "border-primary bg-primary/5"
                                                            : "border-border hover:border-primary/50"
                                                        }`}
                                                >
                                                    <div className="h-4 w-4 rounded-full border-2 border-primary flex items-center justify-center">
                                                        {selectedProvider === 1 && <div className="h-2 w-2 rounded-full bg-primary" />}
                                                    </div>
                                                    <span className="text-sm font-medium">{t("method_paypal")}</span>
                                                </button>
                                                <button
                                                    onClick={() => setSelectedProvider(3)}
                                                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${selectedProvider === 3
                                                            ? "border-primary bg-primary/5"
                                                            : "border-border hover:border-primary/50"
                                                        }`}
                                                >
                                                    <div className="h-4 w-4 rounded-full border-2 border-primary flex items-center justify-center">
                                                        {selectedProvider === 3 && <div className="h-2 w-2 rounded-full bg-primary" />}
                                                    </div>
                                                    <span className="text-sm font-medium">{t("method_sepay")}</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {!isFree && (
                                        <p className="text-xs text-center text-muted-foreground mt-4">
                                            {t("secure_payment")}
                                        </p>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* Comparison Table */}
                {!isLoadingPlans && (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                        className="mt-24"
                    >
                        <h2 className="text-3xl font-bold text-center mb-12">{t("comparison.title")}</h2>
                        <div className="overflow-x-auto rounded-3xl border border-border bg-card shadow-xl">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b bg-muted/30">
                                        <th className="py-6 px-8 font-semibold text-lg">{t("comparison.feature")}</th>
                                        <th className="py-6 px-8 font-semibold text-lg text-center">{t("comparison.free")}</th>
                                        <th className="py-6 px-8 font-semibold text-lg text-center text-primary">
                                            <div className="flex items-center justify-center gap-2">
                                                <Crown className="h-5 w-5" />
                                                {t("comparison.premium")}
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {comparisonRows.map((row, i) => (
                                        <tr key={i} className="border-b border-border/50 hover:bg-muted/10 transition-colors">
                                            <td className="py-5 px-8 font-medium">{t(`comparison.${row.key}`)}</td>
                                            <td className="py-5 px-8 text-center text-muted-foreground">
                                                {typeof row.free === "boolean" ? (
                                                    row.free ? <Check className="h-5 w-5 text-emerald-500 mx-auto" /> : <X className="h-5 w-5 text-muted-foreground/30 mx-auto" />
                                                ) : row.free}
                                            </td>
                                            <td className="py-5 px-8 text-center font-semibold text-foreground bg-primary/5">
                                                {typeof row.premium === "boolean" ? (
                                                    row.premium ? <Check className="h-5 w-5 text-primary mx-auto" /> : <X className="h-5 w-5 text-muted-foreground/30 mx-auto" />
                                                ) : row.premium}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}

                {/* FAQ / Trust Section */}
                {!isLoadingPlans && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.4 }}
                        className="mt-20 text-center"
                    >
                        <div className="flex flex-wrap items-center justify-center gap-12 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2 group transition-colors hover:text-foreground">
                                <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-500">
                                    <Shield className="h-5 w-5" />
                                </div>
                                <span className="font-medium text-base">{t("trust.secure")}</span>
                            </div>
                            <div className="flex items-center gap-2 group transition-colors hover:text-foreground">
                                <div className="p-2 rounded-full bg-primary/10 text-primary">
                                    <Crown className="h-5 w-5" />
                                </div>
                                <span className="font-medium text-base">{t("trust.lifetime")}</span>
                            </div>
                            <div className="flex items-center gap-2 group transition-colors hover:text-foreground">
                                <div className="p-2 rounded-full bg-blue-500/10 text-blue-500">
                                    <Check className="h-5 w-5" />
                                </div>
                                <span className="font-medium text-base">{t("trust.no_fees")}</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Sepay QR Modal */}
            <SepayQRDialog 
                qrData={qrData} 
                onOpenChange={(open) => !open && setQrData(null)} 
                onCreateNew={handleCreateNewSepay}
                onRefresh={() => window.location.reload()}
            />
        </div>
    );
}
