"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { paymentApi } from "@/lib/api/api-client";
import { useAuth } from "@/lib/auth/auth-context";
import { motion } from "framer-motion";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2, ArrowRight, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CheckoutPage() {
    const locale = useLocale();
    const t = useTranslations("Checkout");
    const searchParams = useSearchParams();
    const { refreshPermissions } = useAuth();

    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const token = searchParams.get("token");
        const payerId = searchParams.get("PayerID");
        const provider = searchParams.get("provider") || "paypal";

        if (!token) {
            setStatus("error");
            setErrorMessage("Missing payment token. Please try again from the pricing page.");
            return;
        }

        const captureOrder = async () => {
            try {
                // If sepay, just check status or we might already have token
                // For PayPal we need to capture
                const res = await paymentApi.captureOrder({
                    orderId: token,
                    payerId: payerId || undefined
                });

                if (res.success) {
                    setStatus("success");
                    // Refresh permissions to reflect new premium status
                    await refreshPermissions();
                } else {
                    setStatus("error");
                    setErrorMessage("error" in res ? res.error : "Payment capture failed. Please contact support.");
                }
            } catch (err) {
                setStatus("error");
                setErrorMessage("An unexpected error occurred. Please contact support.");
            }
        };

        captureOrder();
    }, [searchParams, refreshPermissions]);


    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="max-w-md w-full text-center space-y-6 p-8 rounded-2xl border bg-card shadow-lg"
            >
                {status === "loading" && (
                    <>
                        <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
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
                        <div className="relative">
                            <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", damping: 12, stiffness: 200 }}
                                className="mx-auto w-24 h-24 bg-emerald-100 dark:bg-emerald-950/30 rounded-full flex items-center justify-center relative z-10"
                            >
                                <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                            </motion.div>
                            {/* Decorative Sparkles */}
                            <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 -m-4 border-2 border-dashed border-emerald-500/20 rounded-full"
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
                            <p className="text-muted-foreground">
                                {t("success_subtitle")}
                            </p>
                        </div>

                        <div className="pt-4 space-y-3">
                            <Link href={`/${locale}/dashboard`}>
                                <Button size="lg" className="w-full font-bold shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-primary/80">
                                    {t("go_dashboard")}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                            <p className="text-[10px] text-muted-foreground">
                                {t("receipt_notice")}
                            </p>
                        </div>
                    </>
                )}

                {status === "error" && (
                    <>
                        <div className="mx-auto w-20 h-20 bg-red-100 dark:bg-red-950/30 rounded-full flex items-center justify-center">
                            <XCircle className="h-10 w-10 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground">
                            {t("error_title")}
                        </h2>
                        <p className="text-muted-foreground">
                            {errorMessage}
                        </p>
                        <div className="flex gap-3 pt-4">
                            <Link href={`/${locale}/pricing`} className="flex-1">
                                <Button variant="outline" className="w-full">
                                    {t("try_again")}
                                </Button>
                            </Link>
                            <Link href={`/${locale}/dashboard`} className="flex-1">
                                <Button className="w-full">
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
