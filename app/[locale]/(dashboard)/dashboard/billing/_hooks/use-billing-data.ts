import { useState, useEffect } from "react";
import { paymentApi } from "@/lib/api/api-client";
import type { BillingOverviewDto, PaymentHistoryDto } from "@/lib/api/types";

export function useBillingData() {
  const [billing, setBilling] = useState<BillingOverviewDto | null>(null);
  const [history, setHistory] = useState<PaymentHistoryDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingTransaction, setPendingTransaction] = useState<PaymentHistoryDto | null>(null);

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
          const items = (historyRes.data as any)?.items || historyRes.data || [];
          setHistory(items);

          const pending = items.find(
            (tx: any) => tx.status === "Pending" && tx.provider === "Sepay"
          );
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

  return {
    billing,
    setBilling,
    history,
    isLoading,
    pendingTransaction,
    setPendingTransaction,
  };
}
