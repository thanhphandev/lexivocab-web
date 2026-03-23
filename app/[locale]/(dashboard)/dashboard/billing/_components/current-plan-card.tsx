"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Shield, CheckCircle2, CreditCard, Ban } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { StatusBadge } from "./status-badge";
import type { BillingOverviewDto } from "@/lib/api/types";

interface CurrentPlanCardProps {
  t: (key: string, params?: any) => string;
  tPricing: (key: string) => string;
  locale: string;
  billing: BillingOverviewDto | null;
  isPremium: boolean;
  quotaMax: number;
  onCancelSubscription: () => void;
  isCancelling: boolean;
}

export function CurrentPlanCard({
  t,
  tPricing,
  locale,
  billing,
  isPremium,
  quotaMax,
  onCancelSubscription,
  isCancelling,
}: CurrentPlanCardProps) {
  const getPlanTitle = () => {
    if (!billing?.activeSubscription) return t("current_plan.title_free");

    const planNameLocal = tPricing("plan_" + (billing.plan || "Premium").toLowerCase());
    if (!billing.activeSubscription.endDate)
      return t("current_plan.title_lifetime", { plan: planNameLocal });

    const start = new Date(billing.activeSubscription.startDate);
    const end = new Date(billing.activeSubscription.endDate);
    const msPerMonth = 1000 * 60 * 60 * 24 * 30.436875;
    const months = Math.max(1, Math.round((end.getTime() - start.getTime()) / msPerMonth));

    return t("current_plan.title_premium", {
      plan: planNameLocal,
      months: months,
      month_label: tPricing(months > 1 ? "comparison.months" : "comparison.month"),
    });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card
        className={
          isPremium
            ? "border-primary/30 bg-gradient-to-br from-primary/5 to-transparent"
            : ""
        }
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                  isPremium ? "bg-primary/10" : "bg-secondary"
                }`}
              >
                {isPremium ? (
                  <Crown className="h-6 w-6 text-primary" />
                ) : (
                  <Shield className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div>
                <CardTitle className="text-xl">{getPlanTitle()}</CardTitle>
                <CardDescription>
                  {isPremium
                    ? billing?.planExpiresAt
                      ? t("current_plan.expires", {
                          date: new Date(billing.planExpiresAt).toLocaleDateString(),
                        })
                      : t("current_plan.lifetime")
                    : t("current_plan.quota_limit", { count: quotaMax })}
                </CardDescription>
              </div>
            </div>
            {isPremium ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                <CheckCircle2 className="h-4 w-4" />
                {t("current_plan.active")}
              </span>
            ) : (
              <Link href={`/${locale}/pricing`}>
                <Button size="sm">
                  <Crown className="mr-2 h-4 w-4" />
                  {tPricing("upgrade")}
                </Button>
              </Link>
            )}
          </div>
        </CardHeader>

        {billing?.activeSubscription && (
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm mt-4">
              <div className="p-3 rounded-lg bg-background border shadow-sm">
                <span className="block text-muted-foreground mb-1">
                  {t("subscription_details.provider")}
                </span>
                <span className="font-medium flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary" />
                  {billing.activeSubscription.provider}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-background border shadow-sm">
                <span className="block text-muted-foreground mb-1">
                  {t("subscription_details.start_date")}
                </span>
                <span className="font-medium font-mono text-xs">
                  {new Date(billing.activeSubscription.startDate).toLocaleDateString()}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-background border shadow-sm">
                <span className="block text-muted-foreground mb-1">
                  {t("subscription_details.renewal_date")}
                </span>
                <span className="font-medium font-mono text-xs">
                  {billing.planExpiresAt
                    ? new Date(billing.planExpiresAt).toLocaleDateString()
                    : t("current_plan.lifetime")}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-background border shadow-sm">
                <span className="block text-muted-foreground mb-1">
                  {t("subscription_details.status")}
                </span>
                <StatusBadge status={billing.activeSubscription.status} />
              </div>
            </div>
            {billing.activeSubscription.status === "Active" && (
              <div className="mt-4 pt-4 border-t flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10 border-destructive/30"
                  onClick={onCancelSubscription}
                  disabled={isCancelling}
                >
                  <Ban className="mr-2 h-4 w-4" />
                  {t("subscription_details.cancel")}
                </Button>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </motion.div>
  );
}
