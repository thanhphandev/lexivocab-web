"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Sparkles, Languages, HelpCircle } from "lucide-react";

interface QuotaCardProps {
  t: (key: string) => string;
  quotaUsed: number;
  quotaMax: number;
  aiUsed: number;
  aiMax: number;
  transUsed: number;
  transMax: number;
  quizUsed: number;
  quizMax: number;
}

interface QuotaBarProps {
  label: string;
  used: number;
  max: number;
  unlimited: string;
  icon?: React.ReactNode;
}

function QuotaBar({ label, used, max, unlimited, icon }: QuotaBarProps) {
  const isUnlimited = max === -1;
  const percentage = isUnlimited ? 100 : max > 0 ? Math.min((used / max) * 100, 100) : 0;
  
  // Dynamic color based on usage
  const getBarColor = () => {
    if (isUnlimited) return "bg-primary";
    const ratio = used / max;
    if (ratio >= 0.9) return "bg-destructive";
    if (ratio >= 0.7) return "bg-orange-500";
    return "bg-primary";
  };

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon && <div className="text-muted-foreground group-hover:text-primary transition-colors">{icon}</div>}
          <span className="text-sm font-medium text-foreground/80">{label}</span>
        </div>
        <span className="text-sm font-bold tabular-nums">
          {isUnlimited ? `${used} / ${unlimited}` : `${used} / ${max}`}
        </span>
      </div>
      <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden shadow-inner">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${getBarColor()}`}
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
  quizUsed,
  quizMax,
}: QuotaCardProps) {
  return (
    <Card className="overflow-hidden border-primary/20 shadow-xl bg-gradient-to-br from-background via-background to-primary/5">
      <CardHeader className="pb-4 bg-primary/5 border-b backdrop-blur-sm">
        <CardTitle className="text-lg flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          {t("quota.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8 pt-8">
        <QuotaBar
          label={t("quota.used")}
          used={quotaUsed}
          max={quotaMax}
          unlimited={t("quota.unlimited")}
          icon={<BookOpen className="h-4 w-4" />}
        />
        
        <div className="relative pt-2">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-muted/30"></div>
          </div>
          <div className="relative flex justify-start">
            <span className="bg-background pr-3 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              AI Powered Services
            </span>
          </div>
        </div>

        <div className="space-y-6">
          <QuotaBar
            label="AI Explanations"
            used={aiUsed}
            max={aiMax}
            unlimited={t("quota.unlimited")}
            icon={<Sparkles className="h-4 w-4" />}
          />
          <QuotaBar
            label="AI Translations"
            used={transUsed}
            max={transMax}
            unlimited={t("quota.unlimited")}
            icon={<Languages className="h-4 w-4" />}
          />
          <QuotaBar
            label="Quiz Generation"
            used={quizUsed}
            max={quizMax}
            unlimited={t("quota.unlimited")}
            icon={<HelpCircle className="h-4 w-4" />}
          />
        </div>
      </CardContent>
    </Card>
  );
}
