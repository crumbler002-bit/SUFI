"use client";

import { cn } from "@/lib/utils";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
}

const sizes = {
  sm: { track: "w-[30px] h-[17px]", thumb: "w-[13px] h-[13px]", translate: "translate-x-[13px]" },
  md: { track: "w-[34px] h-[19px]", thumb: "w-[15px] h-[15px]", translate: "translate-x-[15px]" },
  lg: { track: "w-[52px] h-[28px]", thumb: "w-[22px] h-[22px]", translate: "translate-x-[24px]" },
};

export function Toggle({ checked, onChange, size = "md", disabled }: ToggleProps) {
  const s = sizes[size];
  return (
    <label className={cn("relative inline-block flex-shrink-0", s.track, disabled && "opacity-50 cursor-not-allowed")}>
      <input type="checkbox" checked={checked} onChange={(e) => !disabled && onChange(e.target.checked)} className="absolute opacity-0 w-0 h-0 peer" />
      <div className={cn(
        "absolute inset-0 rounded-full border transition-all duration-200 cursor-pointer",
        "bg-[#1E1B2E] border-[#332F52]",
        "peer-checked:bg-[#7C3AED] peer-checked:border-[#6D28D9]",
        size === "lg" && "peer-checked:shadow-[0_0_12px_rgba(124,58,237,0.4)]",
      )} />
      <div className={cn(
        "absolute top-[2px] left-[2px] bg-white rounded-full shadow transition-transform duration-200 pointer-events-none",
        s.thumb, checked && s.translate,
      )} />
    </label>
  );
}
