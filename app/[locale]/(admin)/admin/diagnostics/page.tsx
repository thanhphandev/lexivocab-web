"use client";

import { useState } from "react";
import { PageHeader } from "./_components/page-header";
import { HealthCards } from "./_components/health-cards";
import { ProcessDetails } from "./_components/process-details";
import { SubsystemStatus } from "./_components/subsystem-status";
import { useDiagnosticsData } from "./_hooks/use-diagnostics-data";

export default function DiagnosticsPage() {
  const [isPolling, setIsPolling] = useState(true);
  const { data, isLoading, lastRefresh, refetch } = useDiagnosticsData(isPolling);

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        isPolling={isPolling}
        isLoading={isLoading}
        onTogglePolling={() => setIsPolling(!isPolling)}
        onRefresh={() => refetch()}
      />

      <HealthCards data={data} />

      <div className="grid gap-4 md:grid-cols-12">
        <div className="md:col-span-8">
          <ProcessDetails data={data} />
        </div>
        <div className="md:col-span-4">
          <SubsystemStatus data={data} />
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] text-muted-foreground px-1 italic">
        <span>Last full diagnostic sync: {lastRefresh.toLocaleTimeString()}</span>
        <span>LexiVocab Engine</span>
      </div>
    </div>
  );
}
