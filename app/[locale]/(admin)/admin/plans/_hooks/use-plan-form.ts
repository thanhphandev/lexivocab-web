import { useState } from "react";
import type { PlanDefinitionDto, PlanPricingDto, FeatureDefinitionDto } from "@/lib/api/types";

export interface PlanFormData {
  name: string;
  isActive: boolean;
  pricings: PlanPricingDto[];
  selectedFeatures: Record<string, string>;
}

export function usePlanForm(allFeatures: FeatureDefinitionDto[]) {
  const [editingPlan, setEditingPlan] = useState<PlanDefinitionDto | null>(null);
  const [formData, setFormData] = useState<PlanFormData>({
    name: "",
    isActive: true,
    pricings: [],
    selectedFeatures: {},
  });

  const resetForm = () => {
    setEditingPlan(null);
    
    // Build default features map
    const defaultFeats: Record<string, string> = {};
    allFeatures.forEach((f) => {
      defaultFeats[f.code] = f.defaultValue;
    });

    setFormData({
      name: "",
      isActive: true,
      pricings: [
        {
          id: crypto.randomUUID(),
          billingCycle: "Monthly",
          price: "0",
          currency: "VND",
          durationDays: 30,
          labelKey: "duration_1m",
        },
      ],
      selectedFeatures: defaultFeats,
    });
  };

  const loadPlan = (plan: PlanDefinitionDto) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      isActive: plan.isActive,
      pricings: plan.pricings ? [...plan.pricings] : [],
      selectedFeatures: { ...(plan.features || {}) },
    });
  };

  const updateField = <K extends keyof PlanFormData>(field: K, value: PlanFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addPricing = () => {
    setFormData((prev) => ({
      ...prev,
      pricings: [
        ...prev.pricings,
        {
          id: crypto.randomUUID(),
          billingCycle: "Yearly",
          price: "0",
          currency: "VND",
          durationDays: 365,
          labelKey: "duration_1y",
        },
      ],
    }));
  };

  const removePricing = (index: number) => {
    setFormData((prev) => {
      const updated = [...prev.pricings];
      updated.splice(index, 1);
      return { ...prev, pricings: updated };
    });
  };

  const updatePricing = (index: number, key: keyof PlanPricingDto, value: any) => {
    setFormData((prev) => {
      const updated = [...prev.pricings];
      updated[index] = { ...updated[index], [key]: value };
      return { ...prev, pricings: updated };
    });
  };

  const updateFeature = (code: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedFeatures: {
        ...prev.selectedFeatures,
        [code]: value,
      },
    }));
  };

  return {
    editingPlan,
    formData,
    resetForm,
    loadPlan,
    updateField,
    addPricing,
    removePricing,
    updatePricing,
    updateFeature,
  };
}
