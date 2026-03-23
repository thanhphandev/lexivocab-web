import { useState, useEffect } from "react";
import { toast } from "sonner";
import { adminApi } from "@/lib/api/api-client";
import type { AdminCouponDto } from "@/lib/api/types";

export function useCouponsData() {
  const [coupons, setCoupons] = useState<AdminCouponDto[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCoupons = async () => {
    setLoading(true);
    const res = await adminApi.coupons.getList(1, 100);
    if (res.success) {
      setCoupons(res.data.items);
    } else {
      toast.error(res.error || "Failed to fetch coupons");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  return { coupons, loading, refetch: fetchCoupons };
}
