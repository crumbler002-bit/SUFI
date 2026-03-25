"use client";

import { useSufiStore } from "@/lib/state/sufiStore";

const statusConfig = {
  idle: { label: "Live", color: "bg-green-400", pulse: false },
  searching: { label: "Processing", color: "bg-primary", pulse: true },
  updating: { label: "Updating", color: "bg-yellow-400", pulse: true },
  error: { label: "Error", color: "bg-red-400", pulse: false },
};

export default function SystemStatusIndicator() {
  const systemStatus = useSufiStore((s) => s.systemStatus);
  const config = statusConfig[systemStatus];

  return (
    <div className="flex items-center gap-2 glass-panel px-3 py-1.5">
      <div className="relative flex items-center">
        <div className={`w-2 h-2 rounded-full ${config.color}`} />
        {config.pulse && (
          <div className={`absolute w-2 h-2 rounded-full ${config.color} animate-ping`} />
        )}
      </div>
      <span className="text-xs text-white/60 font-medium">{config.label}</span>
    </div>
  );
}
