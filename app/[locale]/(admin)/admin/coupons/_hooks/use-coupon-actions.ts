import { toast } from "sonner";
import { adminApi } from "@/lib/api/api-client";
import type { CouponFormData } from "./use-coupon-form";

export function useCouponActions(onSuccess: () => void) {
  const handleSave = async (editingId: string | null, formData: CouponFormData) => {
    if (!formData.code || !formData.discountValue) {
      toast.error("Please fill in the required fields");
      return false;
    }

    const data = {
      code: formData.code,
      discountType: parseInt(formData.discountType),
      discountValue: parseFloat(formData.discountValue),
      currency: formData.discountType === "1" ? formData.currency : null,
      maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
      startsAt: new Date().toISOString(),
      isActive: formData.isActive,
    };

    let res;
    if (editingId) {
      res = await adminApi.coupons.update(editingId, data);
    } else {
      res = await adminApi.coupons.create(data);
    }

    if (res.success) {
      toast.success(`Coupon ${editingId ? "updated" : "created"} successfully`);
      onSuccess();
      return true;
    } else {
      toast.error(res.error || "Failed to save coupon");
      return false;
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;

    const res = await adminApi.coupons.delete(id);
    if (res.success) {
      toast.success("Coupon deleted successfully");
      onSuccess();
    } else {
      toast.error(res.error || "Failed to delete coupon");
    }
  };

  return { handleSave, handleDelete };
}
