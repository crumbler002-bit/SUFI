"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  accent?: string;
}

export function Card({ children, className, hover = true, glow = false, accent }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      whileHover={hover ? { y: -2 } : undefined}
      className={cn(
        "relative rounded-[13px] p-[18px] overflow-hidden",
        "bg-[#0F0D18] border border-[#23203A]",
        "transition-colors duration-200",
        hover && "hover:border-[#332F52]",
        accent,
        className,
      )}
    >
      {glow && (
        <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-500 blur-3xl opacity-20 rounded-full" />
        </div>
      )}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
