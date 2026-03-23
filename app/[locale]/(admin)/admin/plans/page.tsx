"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { PageHeader } from "./_components/page-header";
import { PlanStats } from "./_components/plan-stats";
import { PlanTable } from "./_components/plan-table";
import { PlanDialog } from "./_components/plan-dialog";
import { usePlansData } from "./_hooks/use-plans-data";
import { usePlanForm } from "./_hooks/use-plan-form";
import { usePlanActions } from "./_hooks/use-plan-actions";
import type { PlanDefinitionDto } from "@/lib/api/types";

export default function AdminPlansPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfig, setDeleteConfig] = useState<{ id: string; name: string } | null>(null);

  const { plans, allFeatures, loading, refetch } = usePlansData();
  const planForm = usePlanForm(allFeatures);
  const { handleSave, handleDelete } = usePlanActions(refetch);

  const handleOpenDialog = (plan?: PlanDefinitionDto) => {
    if (plan) {
      planForm.loadPlan(plan);
    } else {
      planForm.resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSaveClick = async () => {
    setIsSaving(true);
    const success = await handleSave(planForm.editingPlan, planForm.formData);
    setIsSaving(false);
    if (success) {
      setIsDialogOpen(false);
      planForm.resetForm();
    }
  };

  const handleDeleteClick = async () => {
    if (!deleteConfig) return;
    await handleDelete(deleteConfig.id, deleteConfig.name);
    setDeleteConfig(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader onCreateClick={() => handleOpenDialog()} />

      <PlanStats plans={plans} />

      <PlanTable
        plans={plans}
        loading={loading}
        onEdit={handleOpenDialog}
        onDelete={(id: string, name: string) => setDeleteConfig({ id, name })}
      />

      {isDialogOpen && (
        <PlanDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          isEditing={!!planForm.editingPlan}
          formData={planForm.formData}
          allFeatures={allFeatures}
          onFieldChange={planForm.updateField}
          onAddPricing={planForm.addPricing}
          onRemovePricing={planForm.removePricing}
          onUpdatePricing={planForm.updatePricing}
          onUpdateFeature={planForm.updateFeature}
          onSave={handleSaveClick}
          isSaving={isSaving}
        />
      )}

      <ConfirmDialog
        open={!!deleteConfig}
        onOpenChange={(open) => !open && setDeleteConfig(null)}
        title="Delete Plan Definition"
        description={`Are you sure you want to delete the plan '${deleteConfig?.name}'? This may affect active subscriptions.`}
        onConfirm={handleDeleteClick}
        confirmText="Delete Plan"
        variant="destructive"
      />
    </div>
  );
}
