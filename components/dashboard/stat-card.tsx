import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
    title: string;
    value: string | number;
    icon: ReactNode;
    description?: string;
    trend?: {
        value: number;
        label: string;
        isPositive: boolean;
    };
    className?: string;
}

export function StatCard({
    title,
    value,
    icon,
    description,
    trend,
    className,
}: StatCardProps) {
    return (
        <Card className={cn("overflow-hidden group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-none", className)}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors duration-300">
                    {title}
                </CardTitle>
                <div className="h-5 w-5 text-muted-foreground group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                    {icon}
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold font-mono tracking-tight group-hover:translate-x-1 transition-transform duration-300">{value}</div>
                {(description || trend) && (
                    <p className="mt-1 flex items-center text-xs text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
                        {trend && (
                            <span
                                className={cn(
                                    "mr-1 flex items-center font-bold px-1.5 py-0.5 rounded-md transition-colors",
                                    trend.isPositive
                                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                        : "bg-red-500/10 text-red-600 dark:text-red-400"
                                )}
                            >
                                {trend.isPositive ? "+" : ""}
                                {trend.value}%
                            </span>
                        )}
                        <span className="opacity-80">{trend?.label || description}</span>
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
