"use client";

import { Command } from "cmdk";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setOpen((o) => !o); }
    };
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, []);

  const go = (path: string) => { router.push(path); setOpen(false); };
  const triggerAI = (action: string) => {
    fetch("/automation/run", { method: "POST", body: JSON.stringify({ action }), headers: { "Content-Type": "application/json" } }).catch(console.warn);
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-start justify-center pt-24 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
      <Command className="w-full max-w-xl bg-[#0F0D18] border border-[#332F52] rounded-[16px] shadow-[0_40px_80px_rgba(0,0,0,0.7)] overflow-hidden" loop>
        <div className="flex items-center gap-3 px-4 border-b border-[#23203A]">
          <span className="text-[#5a5480] text-sm">⌕</span>
          <Command.Input autoFocus placeholder="Search or run command…"
            className="flex-1 py-3 bg-transparent outline-none text-[13px] text-[#ede9ff] placeholder:text-[#5a5480] font-sans" />
          <kbd className="text-[10px] text-[#5a5480] font-mono bg-[#1E1B2E] border border-[#23203A] rounded px-1">ESC</kbd>
        </div>
        <Command.List className="max-h-80 overflow-y-auto py-2">
          <Command.Empty className="py-8 text-center text-[12px] text-[#5a5480]">No results found.</Command.Empty>
          <CmdGroup heading="Navigate">
            <CmdItem onSelect={() => go("/dashboard")}          icon="⚡">Go to Dashboard</CmdItem>
            <CmdItem onSelect={() => go("/owner/intelligence")} icon="🧠">Open Intelligence</CmdItem>
            <CmdItem onSelect={() => go("/owner/automation")}   icon="⚙️">Open Automation</CmdItem>
            <CmdItem onSelect={() => go("/ai-concierge")}       icon="🤖">AI Concierge</CmdItem>
          </CmdGroup>
          <CmdGroup heading="Reservations">
            <CmdItem onSelect={() => go("/reservations/new")} icon="➕">New Reservation</CmdItem>
            <CmdItem onSelect={() => go("/reservations")}     icon="📅">View All Reservations</CmdItem>
            <CmdItem onSelect={() => go("/waitlist")}         icon="📋">Open Waitlist</CmdItem>
          </CmdGroup>
          <CmdGroup heading="AI Actions">
            <CmdItem onSelect={() => triggerAI("optimize")} icon="🚀">Optimize Tonight</CmdItem>
            <CmdItem onSelect={() => triggerAI("forecast")} icon="📈">Run Demand Forecast</CmdItem>
            <CmdItem onSelect={() => triggerAI("notify")}   icon="📩">Notify Waitlist</CmdItem>
            <CmdItem onSelect={() => triggerAI("pricing")}  icon="💰">Activate Dynamic Pricing</CmdItem>
          </CmdGroup>
        </Command.List>
        <div className="px-4 py-2 border-t border-[#23203A] flex items-center gap-3 text-[10px] text-[#5a5480] font-mono">
          <span>↑↓ navigate</span><span>↵ select</span><span>esc close</span>
        </div>
      </Command>
    </div>
  );
}

function CmdGroup({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <Command.Group heading={heading}
      className="[&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:text-[#5a5480] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:font-mono">
      {children}
    </Command.Group>
  );
}

function CmdItem({ onSelect, icon, children }: { onSelect: () => void; icon?: string; children: React.ReactNode }) {
  return (
    <Command.Item onSelect={onSelect}
      className="flex items-center gap-3 mx-2 px-3 py-[9px] rounded-[8px] text-[13px] text-[#9b94c4] cursor-pointer data-[selected=true]:bg-[#161422] data-[selected=true]:text-[#ede9ff] hover:bg-[#161422] hover:text-[#ede9ff] transition-colors duration-100">
      {icon && <span className="text-[14px] w-5 text-center">{icon}</span>}
      {children}
    </Command.Item>
  );
}
