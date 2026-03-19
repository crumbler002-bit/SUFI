"use client";

import { motion } from "framer-motion";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { cn } from "@/lib/utils";

interface InsightCardProps {
  message: string;
  priority?: "HIGH ROI" | "PRICING" | "FILL GAP" | "FORECAST";
  icon?: string;
  onAction?: () => void;
  actionLabel?: string;
  className?: string;
}

const priorityBadge: Record<string, "ok" | "warn" | "info" | "purple"> = {
  "HIGH ROI": "ok",
  PRICING:    "warn",
  "FILL GAP": "info",
  FORECAST:   "purple",
};

export function InsightCard({ message, priority = "HIGH ROI", icon = "💡", onAction, actionLabel = "Take Action →", className }: InsightCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <Card hover className={cn("cursor-pointer border-[#23203A] hover:border-[#332F52]", className)} accent="border-purple-500/10">
        <div className="flex items-start justify-between mb-2">
          <span className="text-base leading-none">{icon}</span>
          <Badge variant={priorityBadge[priority]}>{priority}</Badge>
        </div>
        <p className="text-[12px] text-[#9b94c4] leading-relaxed mb-3">{message}</p>
        {onAction && (
          <button onClick={onAction} className="text-[11px] text-violet-400 hover:text-blue-400 transition-colors flex items-center gap-1">
            {actionLabel}
          </button>
        )}
      </Card>
    </motion.div>
  );
}
