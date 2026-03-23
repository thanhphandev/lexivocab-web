import { useState } from "react";
import { paymentApi } from "@/lib/api/api-client";
import { getLocalizedApiError } from "@/lib/error-handler";

interface CouponData {
  code: string;
  type: number;
  value: number;
  currency?: string | null;
}

export function useCoupon(t: any, tErrors: any, locale: string) {
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<CouponData | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState("");

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsValidatingCoupon(true);
    setCouponError("");
    try {
      const res = await paymentApi.validateCoupon(couponCode.trim());
      if (res.success) {
        const couponCurrency = res.data.currency?.toUpperCase() ?? null;
        const pageCurrency = locale === "vi" ? "VND" : "USD";

        if (couponCurrency && couponCurrency !== pageCurrency) {
          setCouponError(
            t("pricing_errors.coupon_currency_mismatch", { currency: couponCurrency })
          );
          setAppliedCoupon(null);
          return;
        }

        setAppliedCoupon({
          code: res.data.code,
          type: res.data.discountType,
          value: res.data.discountValue,
          currency: res.data.currency ?? null,
        });
        setCouponError("");
      } else {
        setCouponError(
          getLocalizedApiError(res, tErrors, tErrors("PAYMENT_INVALID_COUPON"))
        );
        setAppliedCoupon(null);
      }
    } catch {
      setCouponError(tErrors("PAYMENT_INVALID_COUPON"));
      setAppliedCoupon(null);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  return {
    couponCode,
    setCouponCode,
    appliedCoupon,
    isValidatingCoupon,
    couponError,
    handleApplyCoupon,
    handleRemoveCoupon,
  };
}
