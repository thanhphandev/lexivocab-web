import { useState, useEffect } from "react";
import { toast } from "sonner";
import { adminApi } from "@/lib/api/api-client";
import type { PlanDefinitionDto, FeatureDefinitionDto } from "@/lib/api/types";

export function usePlansData() {
  const [plans, setPlans] = useState<PlanDefinitionDto[]>([]);
  const [allFeatures, setAllFeatures] = useState<FeatureDefinitionDto[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [plansRes, featuresRes] = await Promise.all([
        adminApi.getPlans(),
        adminApi.getFeatures(),
      ]);

      if (plansRes.success && plansRes.data) {
        setPlans(plansRes.data);
      }
      if (featuresRes.success && featuresRes.data) {
        setAllFeatures(featuresRes.data);
      }
    } catch (error) {
      toast.error("Failed to load plans data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { plans, allFeatures, loading, refetch: fetchData };
}
