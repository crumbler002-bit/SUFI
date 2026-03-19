"use client";

import { motion } from "framer-motion";
import { toast } from "sonner";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CardSkeleton } from "@/components/ui/Skeleton";
import type { IntelligenceData } from "@/types/intelligence";

const REC_META = [
  { badge: "danger" as const, icon: "⚠️", label: "URGENT"   },
  { badge: "ok"     as const, icon: "➕", label: "+₹6,200"  },
  { badge: "info"   as const, icon: "⇄", label: "OPTIMIZE" },
  { badge: "warn"   as const, icon: "📉", label: "FORECAST" },
];

interface Props {
  data: IntelligenceData;
  isLoading: boolean;
  applying: boolean;
  onApplyAll: () => void;
}

export function DecisionPanel({ data, isLoading, applying, onApplyAll }: Props) {
  if (isLoading) return <CardSkeleton rows={4} />;

  return (
    <div className="relative bg-gradient-to-br from-purple-900/10 to-blue-900/5 border border-purple-500/35 rounded-[14px] p-5 mb-[18px] overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-[10px] text-violet-400 font-mono uppercase tracking-[.1em] mb-[5px]">● AI Decision Center</div>
          <div className="text-[16px] font-semibold text-[#ede9ff]">4 active recommendations — 1 critical action required</div>
          <div className="text-[11px] text-[#5a5480] mt-1">Updated 43s ago · Confidence 91% · Next scan 4m 17s</div>
        </div>
        <div className="flex gap-2 flex-shrink-0 ml-5">
          <Button loading={applying} onClick={onApplyAll}>⚡ Apply All</Button>
          <Button variant="secondary" onClick={() => toast.info("Opening review panel…")}>Review</Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-[10px] mb-4">
        {data.recommendations.map((rec, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-white/[0.025] border border-[#23203A] rounded-[10px] p-3 hover:border-purple-500/40 hover:bg-purple-500/5 transition-all cursor-pointer"
            onClick={() => toast.info(`Action: ${rec}`)}
          >
            <div className="text-[15px] mb-2">{REC_META[i].icon}</div>
            <p className="text-[12px] text-[#ede9ff] leading-[1.45] mb-2">{rec}</p>
            <Badge variant={REC_META[i].badge}>{REC_META[i].label}</Badge>
          </motion.div>
        ))}
      </div>

      <div className="border-t border-[#23203A] pt-4 flex gap-3 items-start">
        <div className="flex-1 bg-purple-500/[0.04] border border-purple-500/15 rounded-[8px] px-4 py-[10px]">
          <div className="text-[10px] text-[#5a5480] font-mono uppercase tracking-[.08em] mb-[5px]">Why this recommendation?</div>
          <p className="text-[12px] text-[#9b94c4] leading-[1.65]">{data.explanation}</p>
        </div>
        <div className="flex flex-col items-center min-w-[80px]">
          <div className="text-[10px] text-[#5a5480] font-mono mb-2">AI Confidence</div>
          <div className="relative w-[52px] h-[52px]">
            <svg className="-rotate-90" width="52" height="52" viewBox="0 0 52 52">
              <circle cx="26" cy="26" r="20" fill="none" stroke="rgba(167,139,250,0.15)" strokeWidth="3" />
              <circle cx="26" cy="26" r="20" fill="none" stroke="#a78bfa" strokeWidth="3"
                strokeLinecap="round" strokeDasharray="125.6" strokeDashoffset="11.3" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-[13px] font-semibold text-violet-400">91%</div>
          </div>
        </div>
      </div>
    </div>
  );
}
