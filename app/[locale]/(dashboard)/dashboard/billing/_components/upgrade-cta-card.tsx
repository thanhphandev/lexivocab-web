"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface UpgradeCTACardProps {
  locale: string;
  tPricing: (key: string) => string;
  isPremium: boolean;
  displayOrder: number;
}

export function UpgradeCTACard({
  locale,
  tPricing,
  isPremium,
  displayOrder,
}: UpgradeCTACardProps) {
  if (isPremium && displayOrder >= 3) return null;

  const isUltimateUpgrade = isPremium && displayOrder < 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card
        className={
          isUltimateUpgrade
            ? "border-dashed border-2 border-amber-400/50 bg-amber-50/5"
            : "border-dashed border-2 border-primary/30"
        }
      >
        <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6">
          <div className="flex items-center gap-4">
            <div
              className={`h-14 w-14 rounded-2xl flex items-center justify-center ${
                isUltimateUpgrade
                  ? "bg-gradient-to-br from-amber-400 to-orange-500"
                  : "bg-gradient-to-br from-primary to-orange-500"
              }`}
            >
              <Crown className="h-7 w-7 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-lg">
                {isUltimateUpgrade ? tPricing("ultimate_plan") : tPricing("premium_plan")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isUltimateUpgrade ? tPricing("ultimate_desc") : tPricing("premium_desc")}
              </p>
            </div>
          </div>
          <Link href={`/${locale}/pricing`}>
            <Button
              className={
                isUltimateUpgrade
                  ? "shrink-0 bg-amber-500 hover:bg-amber-600 text-white"
                  : "shrink-0"
              }
            >
              {isUltimateUpgrade ? tPricing("upgrade_to_ultimate") : tPricing("upgrade")}
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}
