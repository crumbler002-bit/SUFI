import { motion } from "motion/react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { scaleIn } from "../lib/motion";

interface AnalyticsCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
}

export function AnalyticsCard({ title, value, change, icon }: AnalyticsCardProps) {
  const isPositive = change >= 0;
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={scaleIn}
      whileHover={{ scale: 1.02, y: -4 }}
      className="bg-card rounded-2xl p-6 shadow-md border border-border"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-[#F97316]/10 rounded-xl">
          <div className="text-[#F97316]">{icon}</div>
        </div>
        <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
          isPositive ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
        }`}>
          {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {Math.abs(change)}%
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-1">{title}</p>
      <motion.p
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
        className="text-3xl font-bold"
      >
        {value}
      </motion.p>
    </motion.div>
  );
}
