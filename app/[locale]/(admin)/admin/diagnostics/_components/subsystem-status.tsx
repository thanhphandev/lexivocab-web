import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { SystemDiagnosticsDto } from "@/lib/api/types";

interface SubsystemStatusProps {
  data: SystemDiagnosticsDto | null;
}

export function SubsystemStatus({ data }: SubsystemStatusProps) {
  return (
    <div className="space-y-4">
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Storage & DB Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <SubsystemItem
            label="PostgreSQL"
            version={data?.database.version || "Unknown"}
            status={data?.database.canConnect ? "online" : "offline"}
          />
          <SubsystemItem label="Redis Cache" version="7.2 (Docker)" status="online" />
          <SubsystemItem
            label="EF Core Provider"
            version={data?.database.provider?.split(".").pop() || "Npgsql"}
            status="online"
          />
        </CardContent>
      </Card>

      <Card className="shadow-sm bg-indigo-500/5 border-indigo-500/10">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-semibold text-indigo-600 dark:text-indigo-400">
                Security Engine
              </h4>
              <p className="text-[10px] text-muted-foreground">
                Encryption: TLS 1.3 / AES-256
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs items-center">
              <span className="text-muted-foreground">JWT Token Validation</span>
              <Badge className="bg-emerald-500/10 text-emerald-600 border-0 text-[9px] h-4">
                STRICT
              </Badge>
            </div>
            <div className="flex justify-between text-xs items-center">
              <span className="text-muted-foreground">Bcrypt Work Factor</span>
              <span className="font-mono text-[9px]">12</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SubsystemItem({
  label,
  version,
  status,
}: {
  label: string;
  version: string;
  status: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5 border-b last:border-0 border-border/40">
      <div>
        <p className="text-xs font-semibold">{label}</p>
        <p
          className="text-[10px] text-muted-foreground truncate max-w-[150px]"
          title={version}
        >
          {version}
        </p>
      </div>
      <Badge
        className={cn(
          "h-5 text-[9px] border-0",
          status === "online"
            ? "bg-emerald-500/10 text-emerald-600"
            : "bg-rose-500/10 text-rose-600"
        )}
      >
        {status.toUpperCase()}
      </Badge>
    </div>
  );
}

function ShieldAlert(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  );
}
