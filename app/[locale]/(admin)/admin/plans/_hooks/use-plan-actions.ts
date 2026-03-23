import { toast } from "sonner";
import { adminApi } from "@/lib/api/api-client";
import type { PlanFormData } from "./use-plan-form";
import type { PlanDefinitionDto } from "@/lib/api/types";

export function usePlanActions(onSuccess: () => void) {
  const handleSave = async (editingPlan: PlanDefinitionDto | null, formData: PlanFormData) => {
    if (!formData.name) {
      toast.error("Plan name is required");
      return false;
    }
    if (formData.pricings.length === 0) {
      toast.error("You must add at least one pricing tier");
      return false;
    }

    // Ensure all prices are strings
    const formattedPricings = formData.pricings.map((p) => ({
      ...p,
      price: p.price.toString(),
    }));

    try {
      if (editingPlan) {
        const res = await adminApi.updatePlan(editingPlan.id, {
          name: formData.name,
          isActive: formData.isActive,
          features: formData.selectedFeatures,
          pricings: formattedPricings,
        });
        if (res.success) {
          toast.success(`Plan '${formData.name}' updated`);
          onSuccess();
          return true;
        } else {
          toast.error(res.error || "Failed to update plan");
        }
      } else {
        const res = await adminApi.createPlan({
          name: formData.name,
          isActive: formData.isActive,
          features: formData.selectedFeatures,
          pricings: formattedPricings,
        });
        if (res.success) {
          toast.success(`New plan '${formData.name}' created`);
          onSuccess();
          return true;
        } else {
          toast.error(res.error || "Failed to create plan");
        }
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    }
    return false;
  };

  const handleDelete = async (id: string, name: string) => {
    const res = await adminApi.deletePlan(id);
    if (res.success) {
      toast.success(`Plan '${name}' deleted`);
      onSuccess();
    } else {
      toast.error(res.error || "Failed to delete plan");
    }
  };

  return { handleSave, handleDelete };
}
