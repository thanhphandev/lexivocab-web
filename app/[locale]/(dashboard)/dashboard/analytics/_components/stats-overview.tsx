import { motion } from "framer-motion";
import { Flame, Target, Trophy } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";

interface StatsOverviewProps {
  currentStreak: number;
  totalStudyDays: number;
  masteryRate: number;
  t: (key: string) => string;
}

export function StatsOverview({
  currentStreak,
  totalStudyDays,
  masteryRate,
  t,
}: StatsOverviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid gap-4 md:grid-cols-3"
    >
      <StatCard
        title={t("currentStreak")}
        value={`${currentStreak} Days`}
        icon={<Flame className="text-orange-500" />}
      />
      <StatCard
        title={t("activeDays")}
        value={totalStudyDays}
        icon={<Target className="text-primary" />}
      />
      <StatCard
        title={t("masteryRate")}
        value={`${masteryRate}%`}
        icon={<Trophy className="text-yellow-500" />}
      />
    </motion.div>
  );
}
