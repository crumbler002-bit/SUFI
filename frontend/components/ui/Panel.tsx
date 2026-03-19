"use client";

import { Card } from "./Card";
import { cn } from "@/lib/utils";

interface PanelProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  accent?: string;
}

export function Panel({ title, subtitle, actions, children, className, accent }: PanelProps) {
  return (
    <Card className={cn("space-y-3", className)} accent={accent}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[12px] font-medium text-[#ede9ff]">{title}</div>
          {subtitle && <div className="text-[10px] text-[#5a5480] font-mono mt-[2px]">{subtitle}</div>}
        </div>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
      {children}
    </Card>
  );
}
