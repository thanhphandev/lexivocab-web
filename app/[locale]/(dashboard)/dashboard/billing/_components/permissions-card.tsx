"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, CheckCircle2, XCircle } from "lucide-react";

interface PermissionsCardProps {
  t: (key: string) => string;
  canExport: boolean;
  canUseAi: boolean;
  canBatchImport: boolean;
}

interface PermissionItemProps {
  label: string;
  enabled: boolean;
}

function PermissionItem({ label, enabled }: PermissionItemProps) {
  return (
    <li className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      {enabled ? (
        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
      ) : (
        <XCircle className="h-5 w-5 text-muted-foreground/30" />
      )}
    </li>
  );
}

export function PermissionsCard({
  t,
  canExport,
  canUseAi,
  canBatchImport,
}: PermissionsCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          {t("permissions.title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          <PermissionItem label={t("permissions.export")} enabled={canExport} />
          <PermissionItem label={t("permissions.ai")} enabled={canUseAi} />
          <PermissionItem label={t("permissions.import")} enabled={canBatchImport} />
        </ul>
      </CardContent>
    </Card>
  );
}
