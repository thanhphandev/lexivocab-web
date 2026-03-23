import { useState } from "react";
import type { AdminCouponDto } from "@/lib/api/types";

export interface CouponFormData {
  code: string;
  discountType: string;
  discountValue: string;
  currency: string;
  maxUses: string;
  isActive: boolean;
}

export function useCouponForm() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CouponFormData>({
    code: "",
    discountType: "0",
    discountValue: "",
    currency: "VND",
    maxUses: "",
    isActive: true,
  });

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      code: "",
      discountType: "0",
      discountValue: "",
      currency: "VND",
      maxUses: "",
      isActive: true,
    });
  };

  const loadCoupon = (coupon: AdminCouponDto) => {
    setEditingId(coupon.id);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType.toString(),
      discountValue: coupon.discountValue.toString(),
      currency: coupon.currency || "VND",
      maxUses: coupon.maxUses?.toString() || "",
      isActive: coupon.isActive,
    });
  };

  const updateField = <K extends keyof CouponFormData>(
    field: K,
    value: CouponFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return {
    editingId,
    formData,
    resetForm,
    loadCoupon,
    updateField,
  };
}
