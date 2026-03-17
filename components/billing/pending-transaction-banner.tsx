"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations, useLocale } from "next-intl";
import { PaymentHistoryDto } from "@/lib/api/types";

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

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-900/40 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-yellow-500/5 ${className}`}
        >
            <div className="flex items-center gap-5 text-left">
                <div className="h-14 w-14 rounded-2xl bg-yellow-100 dark:bg-yellow-900/40 flex items-center justify-center shrink-0">
                    <Zap className="h-7 w-7 text-yellow-600 dark:text-yellow-400 animate-pulse" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-yellow-800 dark:text-yellow-200">
                        {tResource("pending_transaction.title")}
                    </h3>
                    <div className="text-yellow-700/80 dark:text-yellow-300/70 text-sm md:text-base max-w-xl">
                        {tResource("pending_transaction.desc", {
                            provider: transaction.provider,
                            amount: transaction.amount.toLocaleString(locale),
                            currency: transaction.currency,
                            date: new Date(transaction.createdAt).toLocaleDateString(locale)
                        })}
                        <span className="block mt-1 font-mono text-xs opacity-70">
                            {tResource("pending_transaction.reference", { ref: transaction.externalOrderId })}
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <Button 
                    onClick={onResume}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white border-none shadow-lg shadow-yellow-600/20 px-8 h-12"
                >
                    <Zap className="mr-2 h-4 w-4 fill-current" />
                    {tResource("pending_transaction.resume")}
                </Button>
                <Button 
                    variant="outline" 
                    onClick={onCancel}
                    className="border-yellow-200 dark:border-yellow-900/40 text-yellow-800 dark:text-yellow-200 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 h-12"
                >
                    {tResource("pending_transaction.cancel")}
                </Button>
            </div>
        </motion.div>
    );
}
