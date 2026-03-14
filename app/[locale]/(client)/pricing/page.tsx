"use client";

import { useTranslations, useLocale } from "next-intl";
import { useAuth } from "@/lib/auth/auth-context";
import { usePermissions } from "@/lib/hooks/use-permissions";
import { useState, useEffect } from "react";
import { clientApi } from "@/lib/api/api-client";
import type { CreatePaymentOrderResponse, SubscriptionPlanDto } from "@/lib/api/types";
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
    Plus,
    Minus,
    ArrowRight,
    ChevronRight,
    Search,
    Brain,
    Rocket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

export default function PricingPage() {
    const locale = useLocale();
    const t = useTranslations("Pricing");
    const { user, isAuthenticated } = useAuth();
    const { isPremium } = usePermissions();

    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState<number>(1); // 1: PayPal, 3: Seapay
    const [qrData, setQrData] = useState<{ url: string; ref: string } | null>(null);
    const [isPolling, setIsPolling] = useState(false);
    const [plans, setPlans] = useState<SubscriptionPlanDto[]>([]);
    const [isLoadingPlans, setIsLoadingPlans] = useState(true);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const res = await clientApi.get<SubscriptionPlanDto[]>("/api/proxy/payments/plans");
                if (res.success) {
                    setPlans(res.data);
                }
            } catch (error) {
                console.error("Failed to fetch plans", error);
            } finally {
                setIsLoadingPlans(false);
            }
        };

        fetchPlans();
    }, []);

    const handleUpgrade = async (plan: SubscriptionPlanDto) => {
        if (!isAuthenticated) {
            window.location.href = `/${locale}/auth/login?redirect=/${locale}/pricing`;
            return;
        }

        if (plan.id === "free") return;

        setIsProcessing(true);
        try {
            const res = await clientApi.post<CreatePaymentOrderResponse>(
                "/api/proxy/payments/create-order",
                { 
                    planId: plan.id,
                    provider: selectedProvider
                }
            );

            if (res.success && res.data.approvalUrl) {
                if (selectedProvider === 3) {
                    // SePay: Show QR Modal
                    const url = new URL(res.data.approvalUrl);
                    const ref = url.searchParams.get("des") || "";
                    setQrData({ url: res.data.approvalUrl, ref });
                    setIsPolling(true);
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

    // Polling for SePay payment completion
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPolling && qrData?.ref) {
            interval = setInterval(async () => {
                try {
                    const res = await clientApi.get<{ status: string }>(`/api/proxy/payments/status/${qrData.ref}`);
                    if (res.success && res.data.status === "Completed") {
                        setIsPolling(false);
                        window.location.href = `/${locale}/checkout/success?token=${qrData.ref}&provider=sepay`;
                    }
                } catch (err) {
                    console.error("Polling error", err);
                }
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [isPolling, qrData, locale]);

    return (
        <div className="min-h-screen bg-background">
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
            <div className="mx-auto max-w-5xl px-4 pb-20">
                {isLoadingPlans ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="grid md:grid-cols-3 gap-8">
                        {plans.map((plan, index) => {
                            const isFree = plan.id === "free";
                            const delay = 0.2 + index * 0.1;

                            return (
                                <motion.div
                                    key={plan.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay, duration: 0.4 }}
                                    className={`rounded-2xl bg-card p-8 relative ${isFree
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
                                            <h3 className="text-xl font-bold text-foreground">
                                                {t(plan.nameKey.replace("Pricing.", ""))}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                {t(plan.descriptionKey.replace("Pricing.", ""))}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mb-8">
                                        <span className="text-5xl font-bold text-foreground">
                                            {t(plan.price.replace("Pricing.", ""))}
                                        </span>
                                        <span className="text-muted-foreground ml-2">
                                            {t(plan.intervalKey.replace("Pricing.", ""))}
                                        </span>
                                    </div>

                                    <ul className="space-y-3 mb-8">
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
                                                    {t(feature.textKey.replace("Pricing.", ""))}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>

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
                                                onClick={() => handleUpgrade(plan)}
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

                                    {!isFree && !isPremium && (
                                        <div className="mt-8 pt-6 border-t border-border">
                                            <p className="text-sm font-medium text-foreground mb-4">
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
                                    {!isFree && selectedProvider === 3 && (
                                        <p className="text-[10px] text-center text-primary mt-2">
                                            {t("payment_notice")}
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
                                    {[
                                        { name: "Vocabulary Storage", free: "50 Words", premium: "Unlimited" },
                                        { name: "Spaced Repetition (SM-2)", free: true, premium: true },
                                        { name: "Chrome Extension Access", free: true, premium: true },
                                        { name: "Contextual AI Translation", free: false, premium: true },
                                        { name: "Batch Import (CSV/Text)", free: false, premium: true },
                                        { name: "CSV & JSON Data Export", free: false, premium: true },
                                        { name: "AI Practice Sessions", free: false, premium: true },
                                        { name: "Support Priority", free: "Standard", premium: "Priority" },
                                    ].map((row, i) => (
                                        <tr key={i} className="border-b border-border/50 hover:bg-muted/10 transition-colors">
                                            <td className="py-5 px-8 font-medium">{row.name}</td>
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

            {/* SePay QR Modal */}
            <Dialog open={!!qrData} onOpenChange={(open) => !open && setQrData(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-center">{t("method_sepay")}</DialogTitle>
                        <DialogDescription className="text-center">
                            {t("payment_notice")}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center justify-center p-4 space-y-6">
                        {qrData && (
                            <div className="bg-white p-4 rounded-2xl shadow-inner border">
                                <img 
                                    src={qrData.url} 
                                    alt="VietQR" 
                                    className="w-64 h-64 object-contain"
                                />
                            </div>
                        )}
                        <div className="text-center space-y-2">
                            <p className="text-sm text-muted-foreground">
                                Nội dung chuyển khoản (Reference):
                            </p>
                            <p className="text-xl font-mono font-bold tracking-wider text-primary">
                                {qrData?.ref}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-primary font-medium">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm">Đang đợi SePay xác nhận...</span>
                        </div>
                        <p className="text-xs text-muted-foreground text-center">
                            Vui lòng quét mã QR hoặc chuyển khoản chính xác số tiền và nội dung bên trên. SePay sẽ tự động thông báo và nâng cấp tài khoản sau 1-2 phút.
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
