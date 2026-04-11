"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Calendar, Download, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { StatusBadge } from "./status-badge";
import type { PaymentHistoryDto } from "@/lib/api/types";

interface PaymentHistoryCardProps {
  t: (key: string, params?: any) => string;
  history: PaymentHistoryDto[];
  totalTransactions?: number;
  downloadingId: string | null;
  onDownloadInvoice: (tx: PaymentHistoryDto) => void;
}

export function PaymentHistoryCard({
  t,
  history,
  totalTransactions,
  downloadingId,
  onDownloadInvoice,
}: PaymentHistoryCardProps) {
  return (
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
            {totalTransactions
              ? t("history.count", { count: totalTransactions })
              : t("history.no_transactions")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(history?.length ?? 0) === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Image
                src="/illustrations/empty-billing.png"
                alt="No transactions"
                width={160}
                height={160}
                className="mx-auto mb-4 opacity-80 dark:opacity-70"
              />
              <p className="text-lg font-medium">{t("history.no_transactions")}</p>
              <p className="text-sm mt-1">{t("history.empty_desc")}</p>
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
                    <span className="text-xs text-muted-foreground ml-1">{tx.currency}</span>
                    {tx.status === "Completed" && (
                      <div className="mt-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-muted-foreground hover:text-primary"
                          onClick={() => onDownloadInvoice(tx)}
                          disabled={downloadingId === tx.id}
                        >
                          {downloadingId === tx.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Download className="h-3 w-3 mr-1" />
                          )}
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
  );
}
