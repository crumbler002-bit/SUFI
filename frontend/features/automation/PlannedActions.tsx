"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Panel } from "@/components/ui/Panel";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { PlannedAction } from "@/types/automation";

interface Props {
  planned: PlannedAction[];
  approvingAll: boolean;
  onApprove: (id: string) => void;
  onSkip: (id: string) => void;
  onApproveAll: () => void;
}

export function PlannedActions({ planned, approvingAll, onApprove, onSkip, onApproveAll }: Props) {
  return (
    <Panel
      title="AI Planned Actions"
      subtitle="GET /automation/planned"
      actions={
        <Badge variant={planned.length > 0 ? "warn" : "ok"}>
          {planned.length > 0 ? `${planned.length} PENDING` : "ALL APPROVED"}
        </Badge>
      }
    >
      <AnimatePresence>
        {planned.length === 0 ? (
          <div className="text-center py-5 text-[12px] text-[#5a5480]">All actions approved ✓</div>
        ) : (
          planned.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6, height: 0, marginBottom: 0, paddingBottom: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-start gap-[10px] pb-[10px] mb-[10px] border-b border-[#23203A] last:border-0 last:mb-0 last:pb-0"
            >
              <div className="w-[8px] h-[8px] rounded-full mt-[4px] flex-shrink-0" style={{ background: p.dot_color }} />
              <div className="flex-1">
                <div className="text-[12px] text-[#ede9ff] mb-[2px]">{p.action}</div>
                <div className="text-[10px] text-[#5a5480] font-mono mb-[6px]">{p.scheduled_time}</div>
                <div className="flex gap-[6px]">
                  <button onClick={() => onApprove(p.id)}
                    className="px-[10px] py-[4px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 rounded-[5px] text-[10px] hover:bg-emerald-500/20 transition font-sans">
                    ✓ Approve
                  </button>
                  <button onClick={() => onSkip(p.id)}
                    className="px-[10px] py-[4px] bg-transparent text-[#5a5480] border border-[#23203A] rounded-[5px] text-[10px] hover:bg-[#161422] hover:text-[#9b94c4] transition font-sans">
                    Skip
                  </button>
                </div>
              </div>
              <div className="text-[10px] text-emerald-400 font-mono whitespace-nowrap">{p.revenue_impact}</div>
            </motion.div>
          ))
        )}
      </AnimatePresence>
      <Button variant="green" className="w-full mt-3" loading={approvingAll} onClick={onApproveAll}>
        ✓ Approve All · POST /automation/approve
      </Button>
    </Panel>
  );
}
