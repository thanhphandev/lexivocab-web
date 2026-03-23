import { useState } from "react";
import type { FeatureDefinitionDto } from "@/lib/api/types";

export interface FeatureFormData {
  code: string;
  description: string;
  valueType: string;
  defaultValue: string;
}

export function useFeatureForm() {
  const [editingFeature, setEditingFeature] = useState<FeatureDefinitionDto | null>(null);
  const [formData, setFormData] = useState<FeatureFormData>({
    code: "",
    description: "",
    valueType: "boolean",
    defaultValue: "false",
  });

  const resetForm = () => {
    setEditingFeature(null);
    setFormData({
      code: "",
      description: "",
      valueType: "boolean",
      defaultValue: "false",
    });
  };

  const loadFeature = (feature: FeatureDefinitionDto) => {
    setEditingFeature(feature);
    setFormData({
      code: feature.code,
      description: feature.description,
      valueType: feature.valueType,
      defaultValue: feature.defaultValue,
    });
  };

  const updateField = <K extends keyof FeatureFormData>(
    field: K,
    value: FeatureFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return {
    editingFeature,
    formData,
    resetForm,
    loadFeature,
    updateField,
  };
}
