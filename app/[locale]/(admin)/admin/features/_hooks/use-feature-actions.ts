import { toast } from "sonner";
import { adminApi } from "@/lib/api/api-client";
import type { FeatureFormData } from "./use-feature-form";
import type { FeatureDefinitionDto } from "@/lib/api/types";

export function useFeatureActions(onSuccess: () => void) {
  const handleSave = async (
    editingFeature: FeatureDefinitionDto | null,
    formData: FeatureFormData
  ) => {
    if (!formData.code) {
      toast.error("Feature code is required");
      return false;
    }

    try {
      if (editingFeature) {
        const res = await adminApi.updateFeature(editingFeature.id, {
          description: formData.description,
          valueType: formData.valueType,
          defaultValue: formData.defaultValue,
        });
        if (res.success) {
          toast.success(`Feature '${formData.code}' updated`);
          onSuccess();
          return true;
        } else {
          toast.error(res.error || "Failed to update feature");
        }
      } else {
        const res = await adminApi.createFeature({
          code: formData.code,
          description: formData.description,
          valueType: formData.valueType,
          defaultValue: formData.defaultValue,
        });
        if (res.success) {
          toast.success(`New feature '${formData.code}' created`);
          onSuccess();
          return true;
        } else {
          toast.error(res.error || "Failed to create feature");
        }
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    }
    return false;
  };

  const handleDelete = async (id: string, code: string) => {
    const res = await adminApi.deleteFeature(id);
    if (res.success) {
      toast.success(`Feature '${code}' deleted`);
      onSuccess();
    } else {
      toast.error(res.error || "Failed to delete feature");
    }
  };

  return { handleSave, handleDelete };
}
