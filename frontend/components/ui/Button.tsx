"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "danger" | "green" | "ghost" | "outline-purple";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: React.ReactNode;
}

const variants: Record<Variant, string> = {
  primary:        "bg-[#7C3AED] text-white hover:bg-[#6D28D9] shadow-[0_0_20px_rgba(124,58,237,0.25)]",
  secondary:      "bg-transparent text-[#9b94c4] border border-[#332F52] hover:bg-[#161422] hover:text-[#ede9ff] hover:border-[#463F6E]",
  danger:         "bg-[#ef4444] text-white hover:bg-red-600",
  green:          "bg-[#059669] text-white hover:bg-emerald-500",
  ghost:          "bg-transparent text-[#5a5480] border border-[#23203A] hover:text-[#9b94c4] hover:border-[#332F52]",
  "outline-purple":"bg-transparent text-[#a78bfa] border border-[rgba(124,58,237,0.35)] hover:bg-[rgba(124,58,237,0.1)] hover:border-[#7C3AED]",
};

const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "px-3 py-[5px] text-[11px] rounded-[6px]",
  md: "px-4 py-2    text-[12px] rounded-[8px]",
  lg: "px-5 py-[11px] text-[14px] rounded-[10px]",
};

export function Button({ variant = "primary", size = "md", loading = false, children, className, disabled, ...props }: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      transition={{ duration: 0.15 }}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium font-sans",
        "transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant], sizes[size], className,
      )}
      {...(props as React.ComponentPropsWithoutRef<"button">)}
    >
      {loading ? (
        <><span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" /><span>Loading…</span></>
      ) : children}
    </motion.button>
  );
}
