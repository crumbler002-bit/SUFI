import { motion } from "motion/react";
import { ReactNode } from "react";
import { hoverLift } from "../lib/motion";

interface BentoCardProps {
  children: ReactNode;
  className?: string;
  size?: "small" | "medium" | "large" | "wide";
  interactive?: boolean;
}

export function BentoCard({ children, className = "", size = "medium", interactive = true }: BentoCardProps) {
  return (
    <motion.div
      whileHover={interactive ? hoverLift : undefined}
      className={`bg-card rounded-3xl p-8 shadow-md border border-border ${className}`}
    >
      {children}
    </motion.div>
  );
}
