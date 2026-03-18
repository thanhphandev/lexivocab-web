"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { paymentApi } from "@/lib/api/api-client";
import { useAuth } from "@/lib/auth/auth-context";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, XCircle, ArrowRight, Crown, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

export default function CheckoutSuccessPage() {
    const locale = useLocale();
    const t = useTranslations("Checkout");
    const searchParams = useSearchParams();
    const { refreshSession, permissions } = useAuth();
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const captureOrder = async () => {
            const orderId = searchParams.get("token");
            const payerId = searchParams.get("PayerID");
            const provider = searchParams.get("provider") || "paypal";

            if (!orderId) {
                setStatus("error");
                setMessage("Missing order information. Please contact support.");
                return;
            }

            try {
                if (provider === "sepay") {
                    // Sepay is already confirmed via polling/webhook before redirecting here
                    setStatus("success");
                    await refreshSession();
                    triggerConfetti();
                } else {
                    // PayPal needs capture
                    const res = await paymentApi.captureOrder({
                        orderId,
                        payerId: payerId || undefined
                    });

                    if (res.success) {
                        setStatus("success");
                        await refreshSession();
                        triggerConfetti();
                    } else {
                        setStatus("error");
                        setMessage("error" in res ? res.error : "Payment processing failed.");
                    }
                }
            } catch (err) {
                setStatus("error");
                setMessage("An unexpected error occurred.");
            }
        };

        const triggerConfetti = () => {
            const duration = 3000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

            const interval = setInterval(() => {
                const timeLeft = animationEnd - Date.now();
                if (timeLeft <= 0) return clearInterval(interval);
                const particleCount = 50 * (timeLeft / duration);
                confetti({ ...defaults, particleCount, origin: { x: Math.random() * 0.4 + 0.1, y: Math.random() - 0.2 } });
                confetti({ ...defaults, particleCount, origin: { x: Math.random() * 0.4 + 0.5, y: Math.random() - 0.2 } });
            }, 250);
        };

        captureOrder();
    }, [searchParams, refreshSession]);

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-background">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full text-center space-y-6 p-8 rounded-2xl border bg-card shadow-lg"
            >
                {status === "loading" && (
                    <>
                        <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground">
                            {t("processing_title")}
                        </h2>
                        <p className="text-muted-foreground">
                            {t("processing_subtitle")}
                        </p>
                    </>
                )}

                {status === "success" && (
                    <>
                        <div className="relative py-4">
                            <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", damping: 12, stiffness: 200 }}
                                className="mx-auto w-24 h-24 bg-emerald-100 dark:bg-emerald-950/30 rounded-full flex items-center justify-center relative z-10"
                            >
                                <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                            </motion.div>
                            
                            {/* Animated Rings */}
                            <motion.div 
                                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                                transition={{ duration: 4, repeat: Infinity }}
                                className="absolute inset-0 m-auto w-24 h-24 border-4 border-emerald-500/20 rounded-full"
                            />
                        </div>

                        <div className="space-y-2">
                             <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="inline-flex items-center gap-1.5 rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-bold text-yellow-600 dark:text-yellow-500 border border-yellow-500/20"
                            >
                                <Crown className="h-3.5 w-3.5" />
                                {t("premium_activated")}
                            </motion.div>
                            <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
                                {t("success_title")}
                            </h2>
                            <p className="text-muted-foreground px-4">
                                {t("success_subtitle")}
                            </p>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-muted/30 border rounded-2xl p-5 mx-2 text-left space-y-3"
                        >
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">{t("account_status")}</span>
                                <span className="font-bold text-primary flex items-center gap-1.5">
                                    <Sparkles className="h-4 w-4" />
                                    Premium
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">{t("validity")}</span>
                                <span className="font-semibold text-foreground">
                                    {permissions?.planExpiresAt 
                                        ? new Date(permissions.planExpiresAt).toLocaleDateString(locale, { dateStyle: 'long' })
                                        : t("validity_lifetime")}
                                </span>
                            </div>
                        </motion.div>

                        <div className="pt-2 flex flex-col gap-3 px-4">
                            <Link href={`/${locale}/dashboard`}>
                                <Button className="w-full h-12 shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-primary/80 font-bold">
                                    {t("go_dashboard")}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                            <Link href={`/${locale}/dashboard/billing`}>
                                <Button variant="ghost" size="sm" className="w-full text-muted-foreground hover:text-foreground">
                                    {t("view_billing")}
                                </Button>
                            </Link>
                            <p className="text-[10px] text-muted-foreground mt-2">
                                {t("receipt_notice")}
                            </p>
                        </div>
                    </>
                )}

                {status === "error" && (
                    <>
                        <div className="mx-auto w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
                            <XCircle className="h-10 w-10 text-destructive" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground">
                            {t("error_title")}
                        </h2>
                        <p className="text-muted-foreground">{message}</p>
                        <div className="pt-4 flex flex-col gap-3">
                            <Link href={`/${locale}/pricing`}>
                                <Button className="w-full">{t("try_again")}</Button>
                            </Link>
                            <Link href={`/${locale}/dashboard`}>
                                <Button variant="outline" className="w-full">
                                    {t("go_dashboard")}
                                </Button>
                            </Link>
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    );
}

