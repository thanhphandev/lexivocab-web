"use client";

import { useTranslations, useLocale } from "next-intl";
import { useAuth } from "@/lib/auth/auth-context";
import { usePermissions } from "@/lib/hooks/use-permissions";
import { useState, useEffect } from "react";
import { paymentApi } from "@/lib/api/api-client";
import type { SubscriptionPlanDto, PaymentHistoryDto } from "@/lib/api/types";
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
import { toast } from "sonner";

export default function PricingPage() {
    const locale = useLocale();
    const t = useTranslations("Pricing");
    const { user, isAuthenticated } = useAuth();
    const { isPremium, plan: userPlan } = usePermissions();
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState<number>(1); // 1: PayPal, 3: Sepay
    const [qrData, setQrData] = useState<{ url: string; ref: string; expiresAt?: string | null } | null>(null);
    const [isPolling, setIsPolling] = useState(false);
    const [plans, setPlans] = useState<SubscriptionPlanDto[]>([]);
    const [isLoadingPlans, setIsLoadingPlans] = useState(true);
    const [selectedPricingIds, setSelectedPricingIds] = useState<Record<string, string>>({});
    const [pendingTransaction, setPendingTransaction] = useState<PaymentHistoryDto | null>(null);
    const [lastSepayRequest, setLastSepayRequest] = useState<{ pricingId: string } | null>(null);

    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; type: number; value: number } | null>(null);
    const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
    const [couponError, setCouponError] = useState("");

    // Force PayPal if not in Vietnamese locale
    useEffect(() => {
        if (locale !== "vi" && selectedProvider === 3) {
            setSelectedProvider(1);
        }
    }, [locale, selectedProvider]);

    // Default selection initializer when plans load
    useEffect(() => {
        if (plans.length > 0) {
            const initialSelection: Record<string, string> = {};
            const targetCurrency = locale === "vi" ? "VND" : "USD";
            plans.forEach((plan) => {
                const available = plan.pricings?.filter((p: any) => p.currency === targetCurrency);
                if (available && available.length > 0) {
                    initialSelection[plan.id] = available[0].id;
                }
            });
            setSelectedPricingIds(initialSelection);
        }
    }, [plans, locale]);

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

    const handleUpgrade = async (plan: SubscriptionPlanDto, pricingId: string) => {
        if (!isAuthenticated) {
            window.location.href = `/${locale}/auth/login?redirect=/${locale}/pricing`;
            return;
        }

        const isFree = plan.nameKey.toLowerCase().includes("free");
        if (isFree || !pricingId) return;

        setIsProcessing(true);
        try {
            const res = await paymentApi.createOrder({
                pricingId: pricingId,
                provider: selectedProvider,
                couponCode: appliedCoupon?.code
            });

            if (res.success && res.data.approvalUrl) {
                if (selectedProvider === 3) {
                    // Sepay: Show QR Modal
                    const url = new URL(res.data.approvalUrl);
                    const ref = url.searchParams.get("des") || "";
                    setLastSepayRequest({ pricingId });
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
                toast.error(t("pricing_errors.failed_to_create_order"))
            }
        } catch (err) {
            toast.error(t("pricing_errors.failed_to_create_order"))
        } finally {
            setIsProcessing(false);
        }
    };

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setIsValidatingCoupon(true);
        setCouponError("");
        try {
            const res = await paymentApi.validateCoupon(couponCode.trim());
            if (res.success) {
                setAppliedCoupon({
                    code: res.data.code,
                    type: res.data.discountType,
                    value: res.data.discountValue
                });
                setCouponError("");
            } else {
                // const errorMsg = 'error' in res ? (res as any).error : null;
                setCouponError(t("pricing_errors.invalid_coupon" as any));
                setAppliedCoupon(null);
            }
        } catch (err) {
            setCouponError(t("pricing_errors.invalid_coupon" as any));
            setAppliedCoupon(null);
        } finally {
            setIsValidatingCoupon(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode("");
        setCouponError("");
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
                pricingId: lastSepayRequest.pricingId,
                provider: 3
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
    const premiumPlan = plans.find(p => p.nameKey.toLowerCase().includes("premium"));
    const ultimatePlan = plans.find(p => p.nameKey.toLowerCase().includes("ultimate"));

    const comparisonRows = freePlan && premiumPlan && ultimatePlan
        ? freePlan.features.map((freeFeature: any) => {
            const premiumFeature = premiumPlan.features.find((f: any) => f.textKey === freeFeature.textKey);
            const ultimateFeature = ultimatePlan.features.find((f: any) => f.textKey === freeFeature.textKey);

            const renderValue = (feature: any) => {
                if (!feature) return false;
                if (feature.params?.count !== undefined) {
                    const count = Number(feature.params.count);
                    if (count === -1 || String(feature.params.count).toLowerCase() === "unlimited") {
                        return t("comparison.unlimited");
                    }
                    if (count === 0) return "-";
                    return count.toString(); // Generic number display instead of hardcoding 'words'
                }
                if (feature.params?.value !== undefined) {
                    const val = String(feature.params.value);
                    if (val === "-1" || val.toLowerCase() === "unlimited") return t("comparison.unlimited");
                    if (val === "0") return "-";
                    return val;
                }
                return feature.included;
            };

            return {
                key: freeFeature.textKey,
                free: renderValue(freeFeature),
                premium: renderValue(premiumFeature),
                ultimate: renderValue(ultimateFeature)
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

            {/* Coupon Section */}
            {!isLoadingPlans && (
                <div className="mx-auto max-w-xl px-4 mb-10 text-center">
                    <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
                        <input
                            type="text"
                            placeholder={t("coupon_placeholder" as any)}
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            disabled={appliedCoupon !== null || isValidatingCoupon}
                            className="flex-1 w-full max-w-sm rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        {appliedCoupon ? (
                            <Button variant="outline" onClick={handleRemoveCoupon}>
                                {t("remove_coupon" as any)}
                            </Button>
                        ) : (
                            <Button onClick={handleApplyCoupon} disabled={isValidatingCoupon || !couponCode.trim() || appliedCoupon !== null}>
                                {isValidatingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : t("apply_coupon" as any)}
                            </Button>
                        )}
                    </div>
                    {couponError && <p className="text-sm text-destructive mt-2">{couponError}</p>}
                    {appliedCoupon && <p className="text-sm text-emerald-500 mt-2">{t("coupon_applied" as any)}</p>}
                </div>
            )}

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

                            const targetCurrency = locale === "vi" ? "VND" : "USD";
                            const availablePricings = plan.pricings?.filter((p: any) => p.currency === targetCurrency) || [];

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
                                        ) : (
                                            <>
                                                {isPremiumPlan && availablePricings.length > 0 ? (
                                                    // Dropdown / Tabs for multiple duration options
                                                    <div className="mb-6">
                                                        <div className="flex flex-wrap gap-2">
                                                            {availablePricings.map((pricing: any) => {
                                                                const basePricing = availablePricings.find((p: any) => p.durationDays === 30 || p.durationDays === 31 || p.labelKey.includes("1_month"));
                                                                let savings = 0;
                                                                if (basePricing && pricing.durationDays && pricing.durationDays > 60) {
                                                                    const months = Math.round(pricing.durationDays / 30);
                                                                    const basePrice = parseFloat(basePricing.price);
                                                                    const thisPrice = parseFloat(pricing.price);
                                                                    savings = Math.round((1 - (thisPrice / (basePrice * months))) * 100);
                                                                }

                                                                return (
                                                                    <button
                                                                        key={pricing.id}
                                                                        onClick={() => setSelectedPricingIds(prev => ({ ...prev, [plan.id]: pricing.id }))}
                                                                        className={`relative flex-1 min-w-[80px] px-2 py-2.5 rounded-xl text-xs transition-all border-2 flex flex-col items-center justify-center ${selectedPricingIds[plan.id] === pricing.id
                                                                            ? "border-primary bg-primary/10 shadow-sm"
                                                                            : "border-border bg-muted/30 hover:border-primary/30"
                                                                            }`}
                                                                    >
                                                                        {savings > 0 && (
                                                                            <span className="absolute -top-2.5 bg-emerald-100 dark:bg-emerald-900 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold px-1.5 py-0.5 rounded-sm">
                                                                                -{savings}%
                                                                            </span>
                                                                        )}
                                                                        <span className={selectedPricingIds[plan.id] === pricing.id ? "font-bold text-primary" : "font-semibold text-muted-foreground"}>{t(pricing.labelKey)}</span>
                                                                    </button>
                                                                )
                                                            })}
                                                        </div>
                                                    </div>
                                                ) : null}
                                                {(() => {
                                                    const selectedPricingId = selectedPricingIds[plan.id];
                                                    const pricing = availablePricings.find((p: any) => p.id === selectedPricingId) || availablePricings[0];

                                                    if (!pricing) return null;

                                                    const priceVal = parseFloat(pricing.price);
                                                    let discountedPrice = priceVal;
                                                    if (appliedCoupon) {
                                                        if (appliedCoupon.type === 1) { // Percentage
                                                            discountedPrice = priceVal - (priceVal * (appliedCoupon.value / 100));
                                                        } else { // Fixed
                                                            discountedPrice = priceVal - appliedCoupon.value;
                                                        }
                                                        if (discountedPrice < 0) discountedPrice = 0;
                                                    }

                                                    return (
                                                        <>
                                                            {appliedCoupon && (
                                                                <span className="text-2xl font-bold text-muted-foreground line-through block mb-1">
                                                                    {locale === "vi"
                                                                        ? `${Math.round(priceVal).toLocaleString("vi-VN")}đ`
                                                                        : `$${priceVal.toFixed(2)}`}
                                                                </span>
                                                            )}
                                                            <span className="text-5xl font-bold text-foreground">
                                                                {locale === "vi"
                                                                    ? `${Math.round(discountedPrice).toLocaleString("vi-VN")}đ`
                                                                    : `$${discountedPrice.toFixed(2)}`}
                                                            </span>
                                                            <div className="text-sm text-muted-foreground mt-1">
                                                                <span className="ml-2 block mt-1">{t(pricing.labelKey)}</span>
                                                            </div>
                                                        </>
                                                    );
                                                })()}
                                            </>
                                        )}
                                    </div>

                                    <ul className="space-y-3 mb-8 flex-1">
                                        {plan.features.map((feature: any, fIndex: number) => (
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
                                                        let featureName = key;
                                                        try { featureName = t(key); } catch { }

                                                        const p = feature.params as Record<string, any> | null | undefined;

                                                        // count-based feature (integer from backend)
                                                        if (p != null && "count" in p) {
                                                            const c = Number(p.count);
                                                            let valStr = c.toString();
                                                            if (c === -1 || String(p.count).toLowerCase() === "unlimited") {
                                                                valStr = t("comparison.unlimited");
                                                            } else if (c === 0) valStr = "-";

                                                            return (
                                                                <span><span className="opacity-80 font-normal mr-1">{featureName}:</span>{valStr}</span>
                                                            );
                                                        }

                                                        // string value from backend
                                                        if (p != null && "value" in p) {
                                                            let v = String(p.value);
                                                            if (v === "-1" || v.toLowerCase() === "unlimited") v = t("comparison.unlimited");
                                                            else if (v === "0") v = "-";

                                                            return (
                                                                <span><span className="opacity-80 font-normal mr-1">{featureName}:</span>{v}</span>
                                                            );
                                                        }

                                                        // boolean / no params — use key without interpolation
                                                        return featureName;
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
                                            (() => {
                                                const planName = plan.nameKey.replace("Pricing.", "").toLowerCase();
                                                const isCurrent = userPlan?.toLowerCase() === planName || (userPlan?.toLowerCase() === "business" && planName === "ultimate");
                                                const isDowngrade = (userPlan?.toLowerCase() === "ultimate" || userPlan?.toLowerCase() === "business") && planName === "premium";
                                                const disabledUpgrade = isCurrent || isDowngrade;
                                                return disabledUpgrade ? (
                                                    <Button disabled className="w-full h-12 text-base">
                                                        <Shield className="mr-2 h-5 w-5" />
                                                        {isCurrent ? t("already_premium") : "Included in Ultimate"}
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        onClick={() => handleUpgrade(plan, selectedPricingIds[plan.id])}
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
                                                );
                                            })()
                                        )}
                                    </div>

                                    {!isFree && userPlan?.toLowerCase() !== plan.nameKey.replace("Pricing.", "").toLowerCase() && !(userPlan?.toLowerCase() === "ultimate" && plan.nameKey.replace("Pricing.", "").toLowerCase() === "premium") && !(userPlan?.toLowerCase() === "business" && plan.nameKey.replace("Pricing.", "").toLowerCase() === "premium") && (
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
                                                {locale === "vi" && (
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
                                                )}
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
                                                <Zap className="h-5 w-5" />
                                                {t("comparison.premium")}
                                            </div>
                                        </th>
                                        <th className="py-6 px-8 font-semibold text-lg text-center text-primary">
                                            <div className="flex items-center justify-center gap-2">
                                                <Crown className="h-5 w-5" />
                                                Ultimate
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {comparisonRows.map((row: any, i: number) => (
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
                                            <td className="py-5 px-8 text-center font-semibold text-foreground bg-primary/10">
                                                {typeof row.ultimate === "boolean" ? (
                                                    row.ultimate ? <Check className="h-5 w-5 text-primary mx-auto" /> : <X className="h-5 w-5 text-muted-foreground/30 mx-auto" />
                                                ) : row.ultimate}
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
