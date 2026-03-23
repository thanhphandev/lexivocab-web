import { Card, CardContent } from "@/components/ui/card";
import { Ticket, TrendingUp, Users, Percent } from "lucide-react";
import type { AdminCouponDto } from "@/lib/api/types";

interface CouponStatsProps {
  coupons: AdminCouponDto[];
}

export function CouponStats({ coupons }: CouponStatsProps) {
  const activeCoupons = coupons.filter((c) => c.isActive).length;
  const totalUses = coupons.reduce((sum, c) => sum + c.currentUses, 0);
  const avgDiscount = coupons.length
    ? Math.round(
        coupons.reduce((sum, c) => sum + (c.discountType === 0 ? c.discountValue : 0), 0) /
          coupons.filter((c) => c.discountType === 0).length || 1
      )
    : 0;

  const stats = [
    {
      label: "Total Coupons",
      value: coupons.length,
      icon: Ticket,
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Active Campaigns",
      value: activeCoupons,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-500/10",
    },
    {
      label: "Total Redemptions",
      value: totalUses,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-500/10",
    },
    {
      label: "Avg Discount",
      value: `${avgDiscount}%`,
      icon: Percent,
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
