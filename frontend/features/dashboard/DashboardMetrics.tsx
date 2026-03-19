"use client";

import { MetricCard } from "@/components/ui/MetricCard";
import { Badge } from "@/components/ui/Badge";
import type { AutomationStatus } from "@/types/automation";

interface Props {
  autoStatus: AutomationStatus;
  aiCount: number;
}

export function DashboardMetrics({ autoStatus, aiCount }: Props) {
  const activeCount = [autoStatus.auto_overbooking, autoStatus.auto_reschedule, autoStatus.auto_cancel].filter(Boolean).length;

  return (
    <div className="grid grid-cols-4 gap-[10px] mb-[18px]">
      <MetricCard label="Revenue Today"    value="₹48,200" sub="↑ +14% vs yesterday" subColor="green" barWidth={72} barColor="bg-gradient-to-r from-emerald-700 to-emerald-400" badge={<Badge variant="live">LIVE</Badge>} />
      <MetricCard label="Covers Tonight"   value="42"      sub="Peak 8PM"            subColor="amber" barWidth={84} barColor="bg-gradient-to-r from-amber-700 to-amber-400"   badge={<Badge variant="warn">HIGH</Badge>} />
      <MetricCard label="AI Actions"       value={`${aiCount}`} sub="Today"          subColor="blue"  barWidth={60} barColor="bg-gradient-to-r from-violet-700 to-violet-400" badge={<Badge variant="purple">AI</Badge>} />
      <MetricCard label="Rules Active"     value={`${activeCount}`} sub="of 3 total" subColor="blue"  barWidth={activeCount * 33} barColor="bg-gradient-to-r from-blue-700 to-blue-500" badge={<Badge variant="info">AUTO</Badge>} />
    </div>
  );
}
