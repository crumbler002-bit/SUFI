"use client";

import { Toggle } from "@/components/ui/Toggle";
import type { AutomationStatus } from "@/types/automation";

interface Props {
  status: AutomationStatus;
  onToggle: (key: keyof AutomationStatus, value: boolean) => void;
}

const RULES: { key: keyof AutomationStatus; label: string; desc: string }[] = [
  { key: "auto_overbooking", label: "Auto Overbooking",  desc: "+3 tables when demand > 80%" },
  { key: "auto_reschedule",  label: "Auto Reschedule",   desc: "Fill gaps with rescheduled bookings" },
  { key: "auto_cancel",      label: "Auto Cancel",       desc: "Cancel unconfirmed no-shows at T-30m" },
];

export function AutomationPanel({ status, onToggle }: Props) {
  return (
    <div className="space-y-2">
      {RULES.map(({ key, label, desc }) => (
        <div key={key} className="flex items-center justify-between py-[10px] border-b border-[#23203A] last:border-0">
          <div>
            <div className="text-[12px] font-medium text-[#ede9ff]">{label}</div>
            <div className="text-[10px] text-[#5a5480] font-mono mt-[2px]">{desc}</div>
          </div>
          <Toggle checked={status[key]} onChange={(v) => onToggle(key, v)} />
        </div>
      ))}
    </div>
  );
}
