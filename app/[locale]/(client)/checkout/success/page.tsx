"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { clientApi } from "@/lib/api/api-client";
import { useAuth } from "@/lib/auth/auth-context";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, XCircle, ArrowRight, Crown } from "lucide-react";
import confetti from "canvas-confetti";

export default function CheckoutSuccessPage() {
    const locale = useLocale();
    const searchParams = useSearchParams();
    const { refreshSession } = useAuth();

    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const captureOrder = async () => {
            // PayPal redirects back with token= query param which is the order ID
            const orderId = searchParams.get("token");

            if (!orderId) {
                setStatus("error");
                setMessage("Missing order information. Please contact support.");
                return;
            }

            try {
                const res = await clientApi.post<{ message: string }>(
                    "/api/proxy/payments/capture-order",
                    { orderId }
                );

                if (res.success) {
                    setStatus("success");
                    setMessage("Your account has been upgraded to Premium! 🎉");

                    // Refresh the user session to update role
                    await refreshSession();

                    // Celebration confetti
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
                } else {
                    setStatus("error");
                    setMessage("error" in res ? res.error : "Payment processing failed.");
                }
            } catch {
                setStatus("error");
                setMessage("An unexpected error occurred.");
            }
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
                            Processing Payment...
                        </h2>
                        <p className="text-muted-foreground">
                            Please wait while we confirm your payment.
                        </p>
                    </>
                )}

                {status === "success" && (
                    <>
                        <div className="mx-auto w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground">
                            Welcome to Premium!
                        </h2>
                        <p className="text-muted-foreground">{message}</p>
                        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                            <Crown className="h-4 w-4" />
                            Lifetime Access Activated
                        </div>
                        <div className="pt-4 flex flex-col gap-3">
                            <Link href={`/${locale}/dashboard`}>
                                <Button className="w-full h-12">
                                    Go to Dashboard
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                            <Link href={`/${locale}/dashboard/billing`}>
                                <Button variant="outline" className="w-full">
                                    View Billing Details
                                </Button>
                            </Link>
                        </div>
                    </>
                )}

                {status === "error" && (
                    <>
                        <div className="mx-auto w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
                            <XCircle className="h-10 w-10 text-destructive" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground">
                            Payment Issue
                        </h2>
                        <p className="text-muted-foreground">{message}</p>
                        <div className="pt-4 flex flex-col gap-3">
                            <Link href={`/${locale}/pricing`}>
                                <Button className="w-full">Try Again</Button>
                            </Link>
                            <Link href={`/${locale}/dashboard`}>
                                <Button variant="outline" className="w-full">
                                    Back to Dashboard
                                </Button>
                            </Link>
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    );
}
