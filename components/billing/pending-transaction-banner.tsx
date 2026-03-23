"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations, useLocale } from "next-intl";
import { PaymentHistoryDto } from "@/lib/api/types";
import { useEffect, useMemo, useState } from "react";

function formatSeconds(totalSeconds: number) {
    const s = Math.max(0, Math.floor(totalSeconds));
    const mm = Math.floor(s / 60);
    const ss = s % 60;
    return `${mm.toString().padStart(2, "0")}:${ss.toString().padStart(2, "0")}`;
}

interface PendingTransactionBannerProps {
    transaction: PaymentHistoryDto;
    onResume: () => void;
    onCancel: () => void;
    className?: string;
}

export function PendingTransactionBanner({ 
    transaction, 
    onResume, 
    onCancel, 
    className = "" 
}: PendingTransactionBannerProps) {
    const tResource = useTranslations("Pricing");
    const locale = useLocale();
    const [now, setNow] = useState(Date.now());

    const expiresAtMs = useMemo(
        () => (transaction.expiresAt ? new Date(transaction.expiresAt).getTime() : null),
        [transaction.expiresAt]
    );
    const isExpired = expiresAtMs ? expiresAtMs <= now : false;
    const secondsLeft = expiresAtMs ? Math.ceil((expiresAtMs - now) / 1000) : null;

    useEffect(() => {
        if (!transaction.expiresAt) return;
        const id = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, [transaction.expiresAt]);

    const handleRefresh = () => window.location.reload();

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`bg-warning/10 border-2 border-warning/30 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-warning/5 ${className}`}
        >
            <div className="flex items-center gap-5 text-left">
                <div className="h-14 w-14 rounded-2xl bg-warning/20 flex items-center justify-center shrink-0">
                    <Zap className="h-7 w-7 text-warning animate-pulse" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-warning-foreground">
                        {tResource("pending_transaction.title")}
                    </h3>
                    <div className="text-warning-foreground/80 text-sm md:text-base max-w-xl">
                        {tResource("pending_transaction.desc", {
                            provider: transaction.provider,
                            amount: transaction.amount.toLocaleString(locale),
                            currency: transaction.currency,
                            date: new Date(transaction.createdAt).toLocaleDateString(locale)
                        })}
                        <span className="block mt-1 font-mono text-xs opacity-70">
                            {tResource("pending_transaction.reference", { ref: transaction.externalOrderId })}
                        </span>
                        {transaction.expiresAt && (
                            <span className="block mt-1 text-xs opacity-80">
                                {tResource("pending_transaction.expires_label")}{" "}
                                <span className="font-mono">
                                    {new Date(transaction.expiresAt).toLocaleString(locale)}{" "}
                                    {secondsLeft !== null && !isExpired ? `(${tResource("pending_transaction.time_left")} ${formatSeconds(secondsLeft)})` : ""}
                                </span>
                            </span>
                        )}
                        {isExpired && (
                            <span className="block mt-1 text-xs font-medium text-destructive">
                                {tResource("pending_transaction.expired")}
                            </span>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <Button 
                    onClick={onResume}
                    disabled={isExpired}
                    className="bg-warning hover:bg-warning/90 text-primary-foreground border-none shadow-lg shadow-warning/20 px-8 h-12"
                >
                    <Zap className="mr-2 h-4 w-4 fill-current" />
                    {tResource("pending_transaction.resume")}
                </Button>
                <Button 
                    variant="outline" 
                    onClick={onCancel}
                    className="border-warning/30 text-warning-foreground hover:bg-warning/20 h-12 bg-transparent"
                >
                    {tResource("pending_transaction.cancel")}
                </Button>
                <Button
                    variant="outline"
                    onClick={handleRefresh}
                    className="border-warning/30 text-warning-foreground hover:bg-warning/20 h-12 bg-transparent"
                >
                    {tResource("pending_transaction.refresh")}
                </Button>
            </div>
        </motion.div>
    );
}
