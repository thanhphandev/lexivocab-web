interface PerformanceStatsProps {
  reviewsToday: number;
  reviewsThisWeek: number;
  t: (key: string) => string;
}

export function PerformanceStats({
  reviewsToday,
  reviewsThisWeek,
  t,
}: PerformanceStatsProps) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <h3 className="font-semibold mb-4">{t("performance")}</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-secondary/50 rounded-lg text-center">
          <span className="block text-3xl font-bold text-primary mb-1">
            {reviewsToday}
          </span>
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            {t("today")}
          </span>
        </div>
        <div className="p-4 bg-secondary/50 rounded-lg text-center">
          <span className="block text-3xl font-bold text-primary mb-1">
            {reviewsThisWeek}
          </span>
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            {t("thisWeek")}
          </span>
        </div>
      </div>
    </div>
  );
}
