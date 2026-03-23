import { useState } from "react";
import { toast } from "sonner";
import { paymentApi } from "@/lib/api/api-client";
import { showErrorToast } from "@/lib/error-handler";
import { downloadInvoicePdf } from "@/lib/pdf/generate-invoice";
import type { PaymentHistoryDto } from "@/lib/api/types";

interface UsePaymentActionsProps {
  t: (key: string) => string;
  tPricing: (key: string) => string;
  tErrors: (key: string) => string;
}

export function usePaymentActions({ t, tPricing, tErrors }: UsePaymentActionsProps) {
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [confirmCancelPendingOpen, setConfirmCancelPendingOpen] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleCancelSubscription = async (onSuccess: (status: string) => void) => {
    setIsCancelling(true);
    try {
      const res = await paymentApi.cancelSubscription();
      if (res.success) {
        toast.success(t("subscription_details.cancel_success"));
        onSuccess("Cancelled");
      } else {
        showErrorToast(res, t("subscription_details.cancel_error"), tErrors);
      }
    } finally {
      setIsCancelling(false);
      setConfirmCancelOpen(false);
    }
  };

  const handleCancelPending = async (reference: string, onSuccess: () => void) => {
    setIsCancelling(true);
    try {
      const res = await paymentApi.cancelPayment(reference);
      if (res.success) {
        toast.success(tPricing("pending_transaction.cancel_success"));
        onSuccess();
      } else {
        showErrorToast(res, tPricing("pending_transaction.cancel_error"), tErrors);
      }
    } catch (err) {
      console.error("Cancel error", err);
      toast.error(t("subscription_details.cancel_pending_error"));
    } finally {
      setIsCancelling(false);
      setConfirmCancelPendingOpen(false);
    }
  };

  const handleDownloadInvoice = async (tx: PaymentHistoryDto) => {
    setDownloadingId(tx.id);
    try {
      await downloadInvoicePdf(tx);
      toast.success(t("invoice.download_success"));
    } catch {
      toast.error(t("invoice.download_error"));
    } finally {
      setDownloadingId(null);
    }
  };

  return {
    confirmCancelOpen,
    setConfirmCancelOpen,
    isCancelling,
    confirmCancelPendingOpen,
    setConfirmCancelPendingOpen,
    downloadingId,
    handleCancelSubscription,
    handleCancelPending,
    handleDownloadInvoice,
  };
}
