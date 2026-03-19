"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { IntelligenceData } from "@/types/intelligence";

interface Props {
  data: IntelligenceData;
  captureAnim: boolean;
  onCapture: () => void;
}

export function RevenuePanel({ data, captureAnim, onCapture }: Props) {
  const uplift = data.predicted_revenue - data.revenue;

  return (
    <Card>
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-[12px] font-medium text-[#ede9ff]">Revenue Impact</div>
          <div className="text-[10px] text-[#5a5480] font-mono mt-[2px]">Current vs AI-optimized</div>
        </div>
        <Badge variant="ok">+17% uplift</Badge>
      </div>
      <div className="text-[11px] text-[#5a5480] font-mono mb-1">Current trajectory</div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[22px] font-semibold text-[#ede9ff]">₹{data.revenue.toLocaleString("en-IN")}</span>
        <span className="text-[#9b94c4]">→</span>
        <span className="text-[22px] font-semibold text-emerald-400">₹{data.predicted_revenue.toLocaleString("en-IN")}</span>
      </div>
      <div className="text-[13px] text-emerald-400 font-medium mb-4">
        + ₹{uplift.toLocaleString("en-IN")} potential uplift tonight
      </div>
      <div className="h-[6px] bg-[#1E1B2E] rounded-full overflow-hidden mb-1">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: captureAnim ? "100%" : "75%" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-emerald-700 to-emerald-400"
        />
      </div>
      <div className="flex justify-between text-[10px] text-[#5a5480] font-mono mb-4">
        <span>Current ₹48K</span><span>75% to goal</span><span>Target ₹56K</span>
      </div>
      <Button variant="green" className="w-full" onClick={onCapture}>Capture Opportunity</Button>
    </Card>
  );
}
