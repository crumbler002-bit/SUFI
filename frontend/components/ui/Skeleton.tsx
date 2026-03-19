"use client";

import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("bg-[#161422] rounded-[6px] animate-pulse", className)} />;
}

export function MetricCardSkeleton() {
  return (
    <div className="bg-[#0F0D18] border border-[#23203A] rounded-[11px] p-[14px]">
      <Skeleton className="h-[9px] w-20 mb-3" />
      <Skeleton className="h-7 w-28 mb-2" />
      <Skeleton className="h-[9px] w-16" />
      <Skeleton className="h-[2px] w-full mt-3" />
    </div>
  );
}

export function CardSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="bg-[#0F0D18] border border-[#23203A] rounded-[13px] p-[18px] space-y-3">
      <Skeleton className="h-4 w-32" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-[11px]" style={{ width: `${85 - i * 12}%` } as React.CSSProperties} />
      ))}
    </div>
  );
}
