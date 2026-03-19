"use client";

import { motion } from "framer-motion";
import { Card } from "./Card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: string;
  subColor?: "green" | "amber" | "red" | "blue" | "default";
  badge?: React.ReactNode;
  barWidth?: number;
  barColor?: string;
  delay?: number;
}

const subColors: Record<NonNullable<MetricCardProps["subColor"]>, string> = {
  green:   "text-emerald-400",
  amber:   "text-amber-400",
  red:     "text-red-400",
  blue:    "text-blue-400",
  default: "text-[#5a5480]",
};

export function MetricCard({ label, value, sub, subColor = "default", badge, barWidth, barColor = "bg-gradient-to-r from-purple-700 to-purple-500", delay = 0 }: MetricCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay }}>
      <Card hover className="group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[9px] uppercase tracking-[0.08em] text-[#5a5480] font-mono">{label}</span>
          {badge}
        </div>
        <motion.div
          key={String(value)}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="text-[24px] font-semibold leading-none text-[#ede9ff] mb-[5px]"
        >
          {value}
        </motion.div>
        {sub && <div className={cn("text-[11px]", subColors[subColor])}>{sub}</div>}
        {barWidth !== undefined && (
          <div className="mt-[9px] h-[2px] bg-[#1E1B2E] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${barWidth}%` }}
              transition={{ duration: 0.8, ease: "easeOut", delay: delay + 0.2 }}
              className={cn("h-full rounded-full", barColor)}
            />
          </div>
        )}
      </Card>
    </motion.div>
  );
}
