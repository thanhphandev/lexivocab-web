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
        <Card className={cn("overflow-hidden", className)}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <div className="h-4 w-4 text-muted-foreground">{icon}</div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {(description || trend) && (
                    <p className="mt-1 flex items-center text-xs text-muted-foreground">
                        {trend && (
                            <span
                                className={cn(
                                    "mr-1 flex items-center font-medium",
                                    trend.isPositive
                                        ? "text-emerald-500"
                                        : "text-red-500"
                                )}
                            >
                                {trend.isPositive ? "+" : ""}
                                {trend.value}%
                            </span>
                        )}
                        {trend?.label || description}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
