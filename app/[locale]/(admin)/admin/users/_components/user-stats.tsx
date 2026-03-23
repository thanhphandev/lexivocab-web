import { Card, CardContent } from "@/components/ui/card";
import { Users, UserCheck, UserX, Shield } from "lucide-react";
import type { UserOverviewDto } from "@/lib/api/types";

interface UserStatsProps {
  users: UserOverviewDto[];
}

export function UserStats({ users }: UserStatsProps) {
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.isActive).length;
  const bannedUsers = users.filter((u) => !u.isActive).length;
  const adminUsers = users.filter((u) => u.role === "Admin").length;

  const stats = [
    {
      label: "Total Users",
      value: totalUsers,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Active",
      value: activeUsers,
      icon: UserCheck,
      color: "text-green-600",
      bgColor: "bg-green-500/10",
    },
    {
      label: "Banned",
      value: bannedUsers,
      icon: UserX,
      color: "text-red-600",
      bgColor: "bg-red-500/10",
    },
    {
      label: "Admins",
      value: adminUsers,
      icon: Shield,
      color: "text-purple-600",
      bgColor: "bg-purple-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="border-none shadow-md">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
