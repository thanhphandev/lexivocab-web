import { useState, useEffect } from "react";
import { clientApi } from "@/lib/api/api-client";
import type { DashboardDto, HeatmapDataDto } from "@/lib/api/types";

export function useAnalyticsData() {
  const [dashboardData, setDashboardData] = useState<DashboardDto | null>(null);
  const [heatmapData, setHeatmapData] = useState<HeatmapDataDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const [dashRes, heatRes] = await Promise.all([
        clientApi.get<DashboardDto>("/api/proxy/analytics/dashboard"),
        clientApi.get<HeatmapDataDto>(
          `/api/proxy/analytics/heatmap?year=${new Date().getFullYear()}`
        ),
      ]);

      if (dashRes.success) setDashboardData(dashRes.data);
      if (heatRes.success) setHeatmapData(heatRes.data);
      setIsLoading(false);
    };

    fetchAnalytics();
  }, []);

  return { dashboardData, heatmapData, isLoading };
}
