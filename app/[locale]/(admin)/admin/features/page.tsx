"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { PageHeader } from "./_components/page-header";
import { FeatureStats } from "./_components/feature-stats";
import { FeatureTable } from "./_components/feature-table";
import { FeatureDialog } from "./_components/feature-dialog";
import { useFeaturesData } from "./_hooks/use-features-data";
import { useFeatureForm } from "./_hooks/use-feature-form";
import { useFeatureActions } from "./_hooks/use-feature-actions";
import type { FeatureDefinitionDto } from "@/lib/api/types";

export default function AdminFeaturesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfig, setDeleteConfig] = useState<{ id: string; code: string } | null>(null);

  const { features, loading, refetch } = useFeaturesData();
  const { editingFeature, formData, resetForm, loadFeature, updateField } = useFeatureForm();
  const { handleSave, handleDelete } = useFeatureActions(refetch);

  const handleOpenDialog = (feature?: FeatureDefinitionDto) => {
    if (feature) {
      loadFeature(feature);
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSaveClick = async () => {
    setIsSaving(true);
    const success = await handleSave(editingFeature, formData);
    setIsSaving(false);
    if (success) {
      setIsDialogOpen(false);
      resetForm();
    }
  };

  const handleDeleteClick = async () => {
    if (!deleteConfig) return;
    await handleDelete(deleteConfig.id, deleteConfig.code);
    setDeleteConfig(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader onCreateClick={() => handleOpenDialog()} />

      <FeatureStats features={features} />

      <FeatureTable
        features={features}
        loading={loading}
        onEdit={handleOpenDialog}
        onDelete={(id, code) => setDeleteConfig({ id, code })}
      />

      <FeatureDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        isEditing={!!editingFeature}
        formData={formData}
        onFieldChange={updateField}
        onSave={handleSaveClick}
        isSaving={isSaving}
      />

      <ConfirmDialog
        open={!!deleteConfig}
        onOpenChange={(open) => !open && setDeleteConfig(null)}
        title="Delete Feature Definition"
        description={`Are you sure you want to delete the feature '${deleteConfig?.code}'? This may break active plans or historical records referencing this capability.`}
        onConfirm={handleDeleteClick}
        confirmText="Delete Feature"
        variant="destructive"
      />
    </div>
  );
}
