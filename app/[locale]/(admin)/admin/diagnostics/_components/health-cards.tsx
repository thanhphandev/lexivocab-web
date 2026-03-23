import { Database, Cpu, Clock, Server } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { SystemDiagnosticsDto } from "@/lib/api/types";

interface HealthCardsProps {
  data: SystemDiagnosticsDto | null;
}

export function HealthCards({ data }: HealthCardsProps) {
  const getRamValue = (str?: string) => (str ? parseInt(str.split(" ")[0]) : 0);
  const memLoad = getRamValue(data?.runtime.memoryLoad);
  const memTotal = getRamValue(data?.runtime.totalAvailableMemory) || 2048;
  const memPercentage = Math.min(Math.round((memLoad / memTotal) * 100), 100);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="shadow-sm border-l-4 border-l-emerald-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
            Database Connection
          </CardTitle>
          <Database
            className={data?.database.canConnect ? "text-emerald-500" : "text-rose-500"}
          />
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-bold">
              {data?.database.canConnect ? "Healthy" : "Critical"}
            </div>
            <span
              className={`text-[10px] font-bold ${
                data?.database.canConnect ? "text-emerald-500" : "text-rose-500"
              }`}
            >
              {data?.database.canConnect ? "UP" : "DOWN"}
            </span>
          </div>
          <div className="mt-1 flex flex-col">
            <p className="text-xs text-muted-foreground truncate">
              {data?.database.provider || "Npgsql / PostgreSQL"}
            </p>
            <p className="text-[10px] font-mono text-muted-foreground/60">
              {data?.database.server || "localhost"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-l-4 border-l-blue-500 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-3 opacity-10">
          <Cpu className="h-12 w-12" />
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
            Memory Utilization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data?.process.privateMemory}</div>
          <div className="mt-3 space-y-1.5">
            <div className="flex justify-between text-[10px] items-end">
              <span className="text-muted-foreground">Load: {memPercentage}%</span>
              <span className="font-mono">
                {data?.runtime.memoryLoad} / {data?.runtime.totalAvailableMemory}
              </span>
            </div>
            <Progress value={memPercentage} className="h-1.5" />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-l-4 border-l-primary">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
            Server Uptime
          </CardTitle>
          <Clock className="text-primary" />
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-bold">{data?.process.upTime || "N/A"}</div>
          </div>
          <div className="mt-1">
            <p className="text-xs text-muted-foreground">
              Started:{" "}
              {data?.process.startTime
                ? new Date(data.process.startTime).toLocaleTimeString()
                : "..."}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-l-4 border-l-indigo-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
            OS Environment
          </CardTitle>
          <Server className="h-4 w-4 text-indigo-500" />
        </CardHeader>
        <CardContent>
          <div
            className="text-lg font-bold truncate leading-tight mb-1"
            title={data?.environment.os}
          >
            {data?.environment.os.split(" #")[0]}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px] font-mono py-0">
              {data?.environment.architecture}
            </Badge>
            <span className="text-[10px] text-muted-foreground">
              {data?.environment.runtime.split(" (")[0]}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
