import { useState, useEffect } from "react";
import { toast } from "sonner";
import { adminApi } from "@/lib/api/api-client";
import type { FeatureDefinitionDto } from "@/lib/api/types";

export function useFeaturesData() {
  const [features, setFeatures] = useState<FeatureDefinitionDto[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeatures = async () => {
    setLoading(true);
    const res = await adminApi.getFeatures();
    if (res.success && res.data) {
      setFeatures(res.data);
    } else {
      toast.error("Failed to load features");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFeatures();
  }, []);

  return { features, loading, refetch: fetchFeatures };
}
