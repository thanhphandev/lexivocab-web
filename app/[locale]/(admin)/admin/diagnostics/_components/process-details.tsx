import {
  Activity,
  Maximize2,
  TrendingUp,
  Shield,
  Layers,
  Hash,
  Workflow,
  Cpu,
  Server,
  Folder,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { SystemDiagnosticsDto } from "@/lib/api/types";

interface ProcessDetailsProps {
  data: SystemDiagnosticsDto | null;
}

export function ProcessDetails({ data }: ProcessDetailsProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between border-b pb-4 mb-4">
        <div>
          <CardTitle>Process & Runtime Details</CardTitle>
          <CardDescription>Internal metrics from the .NET Host Process</CardDescription>
        </div>
        <Activity className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-4">
            <Metric
              label="Managed Heap Size"
              value={data?.runtime.heapSize}
              icon={<Maximize2 className="h-3 w-3" />}
            />
            <Metric
              label="Peak Working Set"
              value={data?.process.peakWorkingSet}
              icon={<TrendingUp className="h-3 w-3" />}
            />
            <Metric
              label="Memory Limit"
              value={data?.runtime.highMemoryLoadThreshold}
              icon={<Shield className="h-3 w-3" />}
            />
          </div>
          <div className="space-y-4">
            <Metric
              label="Thread Count"
              value={data?.process.threads.toString()}
              icon={<Layers className="h-3 w-3" />}
            />
            <Metric
              label="Handle Count"
              value={data?.process.handleCount.toString()}
              icon={<Hash className="h-3 w-3" />}
            />
            <Metric
              label="Architecture"
              value={data?.process.is64Bit ? "64-bit Process" : "32-bit Process"}
              icon={<Workflow className="h-3 w-3" />}
            />
          </div>
          <div className="space-y-4">
            <Metric
              label="CPUs / Logicals"
              value={data?.environment.processorCount.toString()}
              icon={<Cpu className="h-3 w-3" />}
            />
            <Metric
              label="Machine Name"
              value={data?.environment.machineName}
              icon={<Server className="h-3 w-3" />}
            />
            <Metric
              label="Work Dir"
              value={data?.environment.workingDirectory.toString()}
              icon={<Folder className="h-3 w-3" />}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Metric({
  label,
  value,
  icon,
  isCode,
}: {
  label: string;
  value?: string;
  icon: React.ReactNode;
  isCode?: boolean;
}) {
  return (
    <div className="space-y-1">
      <span className="text-[10px] text-muted-foreground uppercase font-semibold flex items-center gap-1.5">
        {icon} {label}
      </span>
      <p
        className={cn(
          "text-sm font-medium",
          isCode && "font-mono text-[10px] break-all bg-muted p-1 px-2 rounded"
        )}
      >
        {value ?? "N/A"}
      </p>
    </div>
  );
}
