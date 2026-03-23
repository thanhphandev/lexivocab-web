import { useState } from "react";
import { paymentApi } from "@/lib/api/api-client";
import { showErrorToast } from "@/lib/error-handler";
import { toast } from "sonner";
import type { SubscriptionPlanDto } from "@/lib/api/types";

interface QrData {
  url: string;
  ref: string;
  expiresAt?: string | null;
}

interface PaymentActionsProps {
  locale: string;
  tErrors: any;
  selectedProvider: number;
  appliedCoupon: { code: string } | null;
  setQrData: React.Dispatch<React.SetStateAction<QrData | null>>;
  setIsPolling: (polling: boolean) => void;
  setLastSepayRequest: (data: { pricingId: string } | null) => void;
  setPendingTransaction: (tx: any) => void;
}

export function usePaymentActions({
  locale,
  tErrors,
  selectedProvider,
  appliedCoupon,
  setQrData,
  setIsPolling,
  setLastSepayRequest,
  setPendingTransaction,
}: PaymentActionsProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpgrade = async (plan: SubscriptionPlanDto, pricingId: string, isAuthenticated: boolean) => {
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
        couponCode: appliedCoupon?.code,
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
            setQrData((prev) =>
              prev && prev.ref === ref ? { ...prev, expiresAt: statusRes.data.expiresAt } : prev
            );
          }
        } else {
          // PayPal: Redirect
          window.location.href = res.data.approvalUrl;
        }
      } else {
        showErrorToast(res, tErrors("GENERIC_ERROR"), tErrors);
      }
    } catch {
      toast.error(tErrors("GENERIC_ERROR"));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateNewSepay = async (lastSepayRequest: { pricingId: string } | null) => {
    if (!lastSepayRequest) {
      window.location.reload();
      return;
    }

    setIsProcessing(true);
    try {
      const res = await paymentApi.createOrder({
        pricingId: lastSepayRequest.pricingId,
        provider: 3,
      });
      if (res.success && res.data.approvalUrl) {
        const url = new URL(res.data.approvalUrl);
        const ref = url.searchParams.get("des") || "";
        setQrData({ url: res.data.approvalUrl, ref });
        setIsPolling(true);
        setPendingTransaction(null);

        const statusRes = await paymentApi.checkStatus(ref);
        if (statusRes.success && statusRes.data.expiresAt) {
          setQrData((prev) =>
            prev && prev.ref === ref ? { ...prev, expiresAt: statusRes.data.expiresAt } : prev
          );
        }
      } else if (!res.success) {
        showErrorToast(res, tErrors("GENERIC_ERROR"), tErrors);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return { isProcessing, handleUpgrade, handleCreateNewSepay };
}
