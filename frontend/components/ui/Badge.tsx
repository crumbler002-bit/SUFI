"use client";

import { cn } from "@/lib/utils";

type Variant = "ok" | "warn" | "danger" | "info" | "purple" | "live";

interface BadgeProps {
  variant?: Variant;
  children: React.ReactNode;
  className?: string;
}

const variants: Record<Variant, string> = {
  ok:     "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  warn:   "bg-amber-500/10  text-amber-400   border border-amber-500/20",
  danger: "bg-red-500/10    text-red-400     border border-red-500/20",
  info:   "bg-blue-500/10   text-blue-300    border border-blue-500/20",
  purple: "bg-purple-500/10 text-violet-300  border border-purple-500/20",
  live:   "bg-emerald-500/8 text-emerald-400 border border-emerald-500/18",
};

export function Badge({ variant = "info", children, className }: BadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center text-[9px] font-mono uppercase tracking-[0.06em] px-[6px] py-[2px] rounded-[4px] whitespace-nowrap",
      variants[variant], className,
    )}>
      {children}
    </span>
  );
}
