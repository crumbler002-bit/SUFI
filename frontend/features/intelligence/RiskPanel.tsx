"use client";

import { toast } from "sonner";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";

interface Props {
  risks: string[];
}

export function RiskPanel({ risks }: Props) {
  return (
    <Panel
      title="⚠ Risk Analysis"
      subtitle={`${risks.length} active risks`}
      actions={
        <Button variant="secondary" size="sm" onClick={() => toast.success("SMS alerts sent to 3 at-risk guests!")}>
          Send Alerts
        </Button>
      }
    >
      {risks.map((r, i) => (
        <div key={i} className="flex items-start gap-[9px] py-[9px] border-b border-[#23203A] last:border-0">
          <div className={`w-[6px] h-[6px] rounded-full mt-[4px] flex-shrink-0 ${i === 0 ? "bg-red-500" : "bg-amber-500"}`} />
          <div className="flex-1">
            <div className="text-[12px] text-[#ede9ff]">{r}</div>
            <div className="text-[10px] text-[#5a5480] font-mono mt-[2px]">
              {["7:30 PM · 78% probability", "8:00 PM · 52% probability", "Only 2 of 8 needed"][i]}
            </div>
          </div>
          <span className={`text-[10px] font-mono px-[6px] py-[2px] rounded-[4px] ${i === 0 ? "bg-red-500/10 text-red-400" : "bg-amber-500/10 text-amber-400"}`}>
            {["78%", "52%", "41%"][i]}
          </span>
        </div>
      ))}
    </Panel>
  );
}
