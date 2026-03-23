import { useEffect } from "react";
import { paymentApi } from "@/lib/api/api-client";

interface UseSepayPollingProps {
  isPolling: boolean;
  qrRef: string | null;
  locale: string;
  onComplete: () => void;
  onFailed: () => void;
}

export function useSepayPolling({
  isPolling,
  qrRef,
  locale,
  onComplete,
  onFailed,
}: UseSepayPollingProps) {
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPolling && qrRef) {
      interval = setInterval(async () => {
        try {
          const res = await paymentApi.checkStatus(qrRef);
          if (!res.success) return;

          if (res.data.status === "Completed") {
            onComplete();
            window.location.href = `/${locale}/checkout/success?token=${qrRef}&provider=sepay`;
            return;
          }

          if (
            res.data.status === "Expired" ||
            res.data.status === "Cancelled" ||
            res.data.status === "Failed"
          ) {
            onFailed();
          }
        } catch (err) {
          console.error("Polling error", err);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isPolling, qrRef, locale, onComplete, onFailed]);
}
