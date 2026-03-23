import { Activity, Pause, Play, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  isPolling: boolean;
  isLoading: boolean;
  onTogglePolling: () => void;
  onRefresh: () => void;
}

export function PageHeader({
  isPolling,
  isLoading,
  onTogglePolling,
  onRefresh,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          System Health & Diagnostics
        </h1>
        <p className="text-muted-foreground flex items-center gap-2 mt-1">
          <Activity className="h-4 w-4 text-emerald-500 animate-pulse" />
          Live monitoring of server resources and connectivity
        </p>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/50 border text-[10px] font-medium">
          <span
            className={`h-2 w-2 rounded-full ${
              isPolling ? "bg-emerald-500 animate-pulse" : "bg-muted"
            }`}
          />
          {isPolling ? "LIVE UPDATING" : "PAUSED"}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onTogglePolling}
          className="h-8 w-8 p-0"
        >
          {isPolling ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
          className="gap-2 h-8"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Force Sync
        </Button>
      </div>
    </div>
  );
}
