"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

interface QuotaCardProps {
  t: (key: string) => string;
  quotaUsed: number;
  quotaMax: number;
  aiUsed: number;
  aiMax: number;
  transUsed: number;
  transMax: number;
}

interface QuotaBarProps {
  label: string;
  used: number;
  max: number;
  unlimited: string;
}

function QuotaBar({ label, used, max, unlimited }: QuotaBarProps) {
  const isUnlimited = max === -1;
  const percentage = isUnlimited ? 100 : max > 0 ? Math.min((used / max) * 100, 100) : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm font-bold">
          {isUnlimited ? `${used} / ${unlimited}` : `${used} / ${max}`}
        </span>
      </div>
      <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 bg-primary"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export function QuotaCard({
  t,
  quotaUsed,
  quotaMax,
  aiUsed,
  aiMax,
  transUsed,
  transMax,
}: QuotaCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          {t("quota.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <QuotaBar
          label={t("quota.used")}
          used={quotaUsed}
          max={quotaMax}
          unlimited={t("quota.unlimited")}
        />
        <QuotaBar
          label="AI Explanations"
          used={aiUsed}
          max={aiMax}
          unlimited={t("quota.unlimited")}
        />
        <QuotaBar
          label="AI Translations"
          used={transUsed}
          max={transMax}
          unlimited={t("quota.unlimited")}
        />
      </CardContent>
    </Card>
  );
}
