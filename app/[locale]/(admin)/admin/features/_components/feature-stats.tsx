import { Card, CardContent } from "@/components/ui/card";
import { Key, ToggleLeft, Hash, FileText } from "lucide-react";
import type { FeatureDefinitionDto } from "@/lib/api/types";

interface FeatureStatsProps {
  features: FeatureDefinitionDto[];
}

export function FeatureStats({ features }: FeatureStatsProps) {
  const totalFeatures = features.length;
  const booleanFeatures = features.filter((f) => f.valueType === "boolean").length;
  const integerFeatures = features.filter((f) => f.valueType === "integer").length;
  const stringFeatures = features.filter((f) => f.valueType === "string").length;

  const stats = [
    {
      label: "Total Features",
      value: totalFeatures,
      icon: Key,
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Boolean Toggles",
      value: booleanFeatures,
      icon: ToggleLeft,
      color: "text-green-600",
      bgColor: "bg-green-500/10",
    },
    {
      label: "Integer Quotas",
      value: integerFeatures,
      icon: Hash,
      color: "text-purple-600",
      bgColor: "bg-purple-500/10",
    },
    {
      label: "String Values",
      value: stringFeatures,
      icon: FileText,
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
