"use client";

import { useState } from "react";
import type { AdminCouponDto } from "@/lib/api/types";
import { PageHeader } from "./_components/page-header";
import { CouponStats } from "./_components/coupon-stats";
import { CouponTable } from "./_components/coupon-table";
import { CouponDialog } from "./_components/coupon-dialog";
import { useCouponsData } from "./_hooks/use-coupons-data";
import { useCouponForm } from "./_hooks/use-coupon-form";
import { useCouponActions } from "./_hooks/use-coupon-actions";

export default function AdminCouponsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { coupons, loading, refetch } = useCouponsData();
  const { editingId, formData, resetForm, loadCoupon, updateField } = useCouponForm();
  const { handleSave, handleDelete } = useCouponActions(refetch);

  const handleOpenDialog = (coupon?: AdminCouponDto) => {
    if (coupon) {
      loadCoupon(coupon);
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSaveClick = async () => {
    const success = await handleSave(editingId, formData);
    if (success) {
      setIsDialogOpen(false);
      resetForm();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader onCreateClick={() => handleOpenDialog()} />

      <CouponStats coupons={coupons} />

      <CouponTable
        coupons={coupons}
        loading={loading}
        onEdit={handleOpenDialog}
        onDelete={handleDelete}
      />

      <CouponDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingId={editingId}
        formData={formData}
        onFieldChange={updateField}
        onSave={handleSaveClick}
      />
    </div>
  );
}
