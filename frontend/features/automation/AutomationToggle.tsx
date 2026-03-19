"use client";

import { Toggle } from "@/components/ui/Toggle";
import { Button } from "@/components/ui/Button";

interface Props {
  masterOn: boolean;
  aiCount: number;
  activeRulesCount: number;
  approvingAll: boolean;
  onToggle: (on: boolean) => void;
  onApproveAll: () => void;
}

export function AutomationToggle({ masterOn, aiCount, activeRulesCount, approvingAll, onToggle, onApproveAll }: Props) {
  return (
    <div className="relative bg-gradient-to-br from-purple-900/10 to-blue-900/5 border border-purple-500/30 rounded-[14px] px-6 py-[18px] mb-[18px] flex items-center justify-between overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
      <div className="flex items-center gap-4">
        <div className="w-[42px] h-[42px] rounded-[11px] bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-[18px]">⚡</div>
        <div>
          <div className="text-[15px] font-semibold text-[#ede9ff]">SUFI Automation Engine</div>
          <div className="text-[11px] text-[#5a5480] font-mono mt-[2px]">
            {masterOn ? "AUTONOMOUS — All rules running" : "PAUSED — Manual mode only"} · {aiCount} actions today
          </div>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex gap-6">
          {[
            { v: aiCount,           l: "Actions Today", c: "text-emerald-400" },
            { v: "₹14.2K",         l: "Revenue Saved", c: "text-violet-400"  },
            { v: activeRulesCount,  l: "Rules Active",  c: "text-[#ede9ff]"  },
          ].map(({ v, l, c }) => (
            <div key={l} className="text-center">
              <div className={`text-[18px] font-semibold ${c}`}>{v}</div>
              <div className="text-[9px] text-[#5a5480] font-mono">{l}</div>
            </div>
          ))}
        </div>
        <Toggle checked={masterOn} onChange={onToggle} size="lg" />
      </div>
    </div>
  );
}
