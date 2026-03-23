import { motion } from "framer-motion";
import { Heatmap } from "@/components/dashboard/heatmap";
import type { HeatmapDataDto } from "@/lib/api/types";

interface HeatmapSectionProps {
  data: HeatmapDataDto;
  t: (key: string) => string;
}

export function HeatmapSection({ data, t }: HeatmapSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-xl border bg-card p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">{t("heatmaps")}</h2>
        <span className="text-sm font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">
          {data.year}
        </span>
      </div>
      <Heatmap data={data} />
    </motion.div>
  );
}
