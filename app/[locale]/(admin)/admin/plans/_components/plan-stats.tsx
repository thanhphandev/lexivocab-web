import { Card, CardContent } from "@/components/ui/card";
import { Box, CheckCircle, DollarSign, Layers } from "lucide-react";
import type { PlanDefinitionDto } from "@/lib/api/types";

interface PlanStatsProps {
  plans: PlanDefinitionDto[];
}

export function PlanStats({ plans }: PlanStatsProps) {
  const totalPlans = plans.length;
  const activePlans = plans.filter((p) => p.isActive).length;
  const totalPricingTiers = plans.reduce((sum, p) => sum + (p.pricings?.length || 0), 0);
  const avgFeaturesPerPlan = plans.length
    ? Math.round(
        plans.reduce((sum, p) => sum + Object.keys(p.features || {}).length, 0) / plans.length
      )
    : 0;

  const stats = [
    {
      label: "Total Plans",
      value: totalPlans,
      icon: Box,
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Active Plans",
      value: activePlans,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-500/10",
    },
    {
      label: "Pricing Tiers",
      value: totalPricingTiers,
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-500/10",
    },
    {
      label: "Avg Features/Plan",
      value: avgFeaturesPerPlan,
      icon: Layers,
      color: "text-orange-600",
      bgColor: "bg-orange-500/10",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
