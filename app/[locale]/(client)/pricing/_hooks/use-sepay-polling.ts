import { useEffect } from "react";
import { paymentApi } from "@/lib/api/api-client";

interface SepayPollingProps {
  isPolling: boolean;
  qrData: { url: string; ref: string; expiresAt?: string | null } | null;
  locale: string;
  setIsPolling: (polling: boolean) => void;
  setQrData: (data: { url: string; ref: string; expiresAt?: string | null } | null) => void;
  setPendingTransaction: (tx: any) => void;
}

export function useSepayPolling({
  isPolling,
  qrData,
  locale,
  setIsPolling,
  setQrData,
  setPendingTransaction,
}: SepayPollingProps) {
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPolling && qrData?.ref) {
      interval = setInterval(async () => {
        try {
          const res = await paymentApi.checkStatus(qrData.ref);
          if (!res.success) return;

          if (res.data.status === "Completed") {
            setIsPolling(false);
            window.location.href = `/${locale}/checkout/success?token=${qrData.ref}&provider=sepay`;
            return;
          }

          if (
            res.data.status === "Expired" ||
            res.data.status === "Cancelled" ||
            res.data.status === "Failed"
          ) {
            setIsPolling(false);
            setQrData(null);
            setPendingTransaction(null);
          }
        } catch (err) {
          console.error("Polling error", err);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isPolling, qrData, locale, setIsPolling, setQrData, setPendingTransaction]);
}
