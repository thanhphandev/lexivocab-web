import { useState, useEffect } from "react";
import { paymentApi } from "@/lib/api/api-client";
import type { SubscriptionPlanDto, PaymentHistoryDto } from "@/lib/api/types";

export function usePricingData(isAuthenticated: boolean) {
  const [plans, setPlans] = useState<SubscriptionPlanDto[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [pendingTransaction, setPendingTransaction] = useState<PaymentHistoryDto | null>(
    null
  );

  useEffect(() => {
    const fetchPlansAndHistory = async () => {
      try {
        const [plansRes, historyRes] = await Promise.all([
          paymentApi.getPlans(),
          isAuthenticated
            ? paymentApi.getPaymentHistory(1, 10)
            : Promise.resolve({ success: true, data: { items: [] } }),
        ]);

        if (plansRes.success) {
          setPlans(plansRes.data);
        }

        if (historyRes.success) {
          const items = (historyRes.data as any)?.items || historyRes.data || [];
          const pending = items.find(
            (tx: any) => tx.status === "Pending" && tx.provider === "Sepay"
          );
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

  return { plans, isLoadingPlans, pendingTransaction, setPendingTransaction };
}
