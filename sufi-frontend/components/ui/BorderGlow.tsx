"use client";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  color?: string; // tailwind color e.g. "blue" | "accent" | "purple"
}

export default function BorderGlow({ children, className = "", color = "blue" }: Props) {
  return (
    <div className={`relative rounded-2xl p-[1px] ${className}`}>
      {/* Animated gradient border */}
      <div
        className="absolute inset-0 rounded-2xl opacity-60"
        style={{
          background: `linear-gradient(135deg, rgba(79,140,255,0.6) 0%, rgba(139,92,246,0.4) 50%, rgba(79,140,255,0.2) 100%)`,
          filter: "blur(1px)",
        }}
      />
      {/* Content sits on top */}
      <div className="relative rounded-2xl">{children}</div>
    </div>
  );
}
