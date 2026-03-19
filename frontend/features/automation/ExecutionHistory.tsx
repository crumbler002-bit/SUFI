"use client";

import { Panel } from "@/components/ui/Panel";
import { Badge } from "@/components/ui/Badge";

const HISTORY = [
  { icon: "⚡", bg: "bg-purple-500/10",  text: "Overbooking rule fired · +3 tables added",    meta: "7:30 PM today", result: "SUCCESS", rc: "ok"   as const },
  { icon: "📩", bg: "bg-blue-500/10",    text: "No-show SMS batch sent to 3 guests",          meta: "5:30 PM today", result: "SUCCESS", rc: "ok"   as const },
  { icon: "⇄",  bg: "bg-emerald-500/10", text: "Auto-rescheduled booking to 3:30 PM",         meta: "4:15 PM today", result: "SUCCESS", rc: "ok"   as const },
  { icon: "📈", bg: "bg-amber-500/10",   text: "Dynamic pricing activated for peak window",   meta: "7:00 PM today", result: "SUCCESS", rc: "ok"   as const },
  { icon: "📩", bg: "bg-blue-500/10",    text: "Waitlist notify skipped — no cancellations",  meta: "3:45 PM today", result: "SKIPPED", rc: "info" as const },
  { icon: "⚡", bg: "bg-purple-500/10",  text: "Demand threshold reached · rule triggered",   meta: "2:00 PM today", result: "SUCCESS", rc: "ok"   as const },
];

export function ExecutionHistory() {
  return (
    <Panel title="Execution History" subtitle="Last 24 hours">
      {HISTORY.map((h, i) => (
        <div key={i} className="flex items-center gap-[10px] py-[9px] border-b border-[#23203A] last:border-0 text-[12px]">
          <div className={`w-[26px] h-[26px] rounded-[7px] flex items-center justify-center text-[12px] flex-shrink-0 ${h.bg}`}>{h.icon}</div>
          <div className="flex-1 min-w-0">
            <div className="text-[#ede9ff] truncate">{h.text}</div>
            <div className="text-[10px] text-[#5a5480] font-mono mt-[1px]">{h.meta}</div>
          </div>
          <Badge variant={h.rc}>{h.result}</Badge>
        </div>
      ))}
    </Panel>
  );
}
