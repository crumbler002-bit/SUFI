"use client";

interface TopbarProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  alertStrip?: React.ReactNode;
}

export function Topbar({ title, subtitle, right, alertStrip }: TopbarProps) {
  return (
    <>
      {alertStrip}
      <div className="h-[52px] flex items-center justify-between px-6 border-b border-[#23203A] bg-[#07060C]/80 backdrop-blur-[12px] sticky top-0 z-40">
        <div>
          <span className="text-[13px] font-medium text-[#ede9ff]">{title}</span>
          {subtitle && <span className="text-[11px] text-[#5a5480] font-mono ml-3">{subtitle}</span>}
        </div>
        {right && <div className="flex items-center gap-2">{right}</div>}
      </div>
    </>
  );
}
