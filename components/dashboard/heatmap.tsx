import { HeatmapDataDto } from "@/lib/api/types";
import { useTranslations } from "next-intl";

interface HeatmapProps {
    data: HeatmapDataDto;
}

export function Heatmap({ data }: HeatmapProps) {
    const t = useTranslations("Dashboard.home.heatmap");
    const { entries, year } = data;

    // Create a map of date -> count for O(1) lookups
    const entryMap = new Map(entries.map((e) => [e.date.split("T")[0], e.count]));

    // Generate dates for the whole year
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    // Adjust start to the nearest Sunday before Jan 1st
    const startOffset = startDate.getDay();
    startDate.setDate(startDate.getDate() - startOffset);

    // Ensure we render exactly 52 or 53 full weeks
    const allDates: Date[] = [];
    let current = new Date(startDate);
    while (current <= endDate || current.getDay() !== 0) {
        allDates.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }

    // Split into weeks (columns)
    const weeks: Date[][] = [];
    for (let i = 0; i < allDates.length; i += 7) {
        weeks.push(allDates.slice(i, i + 7));
    }

    // Month labels
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const getColorClass = (count: number) => {
        if (count === 0) return "bg-gray-100 dark:bg-gray-800/80";
        if (count < 5) return "bg-emerald-200 dark:bg-emerald-900/60";
        if (count < 15) return "bg-emerald-400 dark:bg-emerald-700/80";
        if (count < 30) return "bg-emerald-500 dark:bg-emerald-600";
        return "bg-emerald-600 dark:bg-emerald-500 text-white";
    };

    return (
        <div className="w-full overflow-x-auto pb-4 custom-scrollbar">
            <div className="min-w-[800px]">
                {/* Months Row */}
                <div className="flex text-xs text-muted-foreground mb-2 ml-[30px]">
                    {months.map((m, i) => (
                        <div key={m} className="flex-1 min-w-[60px]">
                            {/* Simple approximation of month positions */}
                            {i % 2 === 0 ? m : ""}
                        </div>
                    ))}
                </div>

                <div className="flex gap-2">
                    {/* Day Labels Column */}
                    <div className="flex flex-col gap-[3px] text-[10px] text-muted-foreground w-6 pt-1">
                        <span className="h-[12px]"></span>
                        <span className="h-[12px] leading-[12px]">Mon</span>
                        <span className="h-[12px]"></span>
                        <span className="h-[12px] leading-[12px]">Wed</span>
                        <span className="h-[12px]"></span>
                        <span className="h-[12px] leading-[12px]">Fri</span>
                        <span className="h-[12px]"></span>
                    </div>

                    {/* Grid */}
                    <div className="flex gap-[3px] flex-1">
                        {weeks.map((week, weekIdx) => (
                            <div key={weekIdx} className="flex flex-col gap-[3px]">
                                {week.map((date, dayIdx) => {
                                    // YYYY-MM-DD
                                    const y = date.getFullYear();
                                    const m = String(date.getMonth() + 1).padStart(2, "0");
                                    const d = String(date.getDate()).padStart(2, "0");
                                    const dateStr = `${y}-${m}-${d}`;

                                    const count = entryMap.get(dateStr) || 0;

                                    // If date is outside the current year, don't show tooltip and force count=0 (grey)
                                    const isOutsideYear = date.getFullYear() !== year;
                                    const finalCount = isOutsideYear ? 0 : count;

                                    return (
                                        <div
                                            key={dayIdx}
                                            className={`w-3 h-3 rounded-[2px] ${getColorClass(finalCount)} transition-colors hover:ring-1 hover:ring-ring hover:ring-offset-1`}
                                            title={isOutsideYear ? undefined : `${finalCount} reviews on ${dateStr}`}
                                        />
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground justify-end pr-2">
                    <span>{t("less")}</span>
                    <div className="flex gap-1">
                        <div className="w-3 h-3 rounded-[2px] bg-gray-100 dark:bg-gray-800/80" />
                        <div className="w-3 h-3 rounded-[2px] bg-emerald-200 dark:bg-emerald-900/60" />
                        <div className="w-3 h-3 rounded-[2px] bg-emerald-400 dark:bg-emerald-700/80" />
                        <div className="w-3 h-3 rounded-[2px] bg-emerald-500 dark:bg-emerald-600" />
                        <div className="w-3 h-3 rounded-[2px] bg-emerald-600 dark:bg-emerald-500" />
                    </div>
                    <span>{t("more")}</span>
                </div>
            </div>
        </div>
    );
}

// Add these custom utilities to globals.css
// .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
// .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
// .custom-scrollbar::-webkit-scrollbar-thumb { background: hsl(var(--muted-foreground)/0.2); border-radius: 10px; }
