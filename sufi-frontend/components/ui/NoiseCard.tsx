"use client";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  noiseOpacity?: number; // 0–1, default 0.06
}

// SVG noise filter rendered inline — no external assets needed
export default function NoiseCard({ children, className = "", noiseOpacity = 0.06 }: Props) {
  const id = `noise-${Math.random().toString(36).slice(2, 7)}`;

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-[#111827] border border-white/8 ${className}`}>
      {/* Noise texture overlay */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: noiseOpacity }}>
        <filter id={id}>
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${id})`} />
      </svg>
      {/* Content */}
      <div className="relative">{children}</div>
    </div>
  );
}
