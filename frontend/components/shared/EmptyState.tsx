"use client";

interface Props {
  icon?: string;
  title: string;
  subtitle?: string;
}

export function EmptyState({ icon = "📭", title, subtitle }: Props) {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-2 text-center">
      <div className="text-[32px] mb-1">{icon}</div>
      <div className="text-[13px] font-medium text-[#ede9ff]">{title}</div>
      {subtitle && <div className="text-[11px] text-[#5a5480] font-mono">{subtitle}</div>}
    </div>
  );
}
