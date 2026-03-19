"use client";

import { motion } from "framer-motion";
import { MetricCard } from "@/components/ui/MetricCard";
import { Badge } from "@/components/ui/Badge";
import { MetricCardSkeleton } from "@/components/ui/Skeleton";
import type { IntelligenceData } from "@/types/intelligence";

interface Props {
  data: IntelligenceData;
  isLoading: boolean;
}

export function IntelligenceMetrics({ data, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-4 gap-[10px] mb-[18px]">
        {Array.from({ length: 4 }).map((_, i) => <MetricCardSkeleton key={i} />)}
      </div>
    );
  }

  return (
    <motion.div
      className="grid grid-cols-4 gap-[10px] mb-[18px]"
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
    >
      <MetricCard label="Revenue Today"    value="₹48,200"                        sub="↑ +14% vs yesterday" subColor="green" barWidth={72} barColor="bg-gradient-to-r from-emerald-700 to-emerald-400" badge={<Badge variant="live">LIVE</Badge>} />
      <MetricCard label="Demand Index"     value="86%"                            sub="Peak 8PM"            subColor="amber" barWidth={86} barColor="bg-gradient-to-r from-amber-700 to-amber-400"   badge={<Badge variant="warn">HIGH</Badge>} />
      <MetricCard label="No-show Risk"     value={`${data.no_show_risk}%`}        sub="3 slots at 7:30PM"   subColor="amber" barWidth={data.no_show_risk} barColor="bg-gradient-to-r from-amber-700 to-amber-400" badge={<Badge variant="warn">MED</Badge>} />
      <MetricCard label="Table Efficiency" value={`${data.efficiency}%`}          sub="↑ Optimizable"       subColor="blue"  barWidth={data.efficiency}  barColor="bg-gradient-to-r from-blue-700 to-blue-500"   badge={<Badge variant="info">GOOD</Badge>} />
    </motion.div>
  );
}
