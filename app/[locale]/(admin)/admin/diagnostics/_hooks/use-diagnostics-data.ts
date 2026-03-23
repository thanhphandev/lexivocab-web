import { useState, useEffect } from "react";
import { diagnosticsApi } from "@/lib/api/api-client";
import type { SystemDiagnosticsDto } from "@/lib/api/types";

export function useDiagnosticsData(isPolling: boolean) {
  const [data, setData] = useState<SystemDiagnosticsDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchDiagnostics = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const res = await diagnosticsApi.getSystemInfo();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch diagnostics", err);
    } finally {
      setIsLoading(false);
      setLastRefresh(new Date());
    }
  };

  useEffect(() => {
    fetchDiagnostics();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPolling) {
      interval = setInterval(() => fetchDiagnostics(true), 5000);
    }
    return () => clearInterval(interval);
  }, [isPolling]);

  return { data, isLoading, lastRefresh, refetch: fetchDiagnostics };
}
