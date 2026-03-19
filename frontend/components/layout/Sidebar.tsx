"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV = [
  { icon: "⚡", label: "Dashboard",    href: "/dashboard" },
  { icon: "🧠", label: "Intelligence", href: "/owner/intelligence" },
  { icon: "⚙️", label: "Automation",   href: "/owner/automation" },
  { icon: "🤖", label: "AI Concierge", href: "/ai-concierge" },
  { icon: "📅", label: "Reservations", href: "/reservations" },
  { icon: "📋", label: "Waitlist",     href: "/waitlist" },
  { icon: "📊", label: "Analytics",    href: "/analytics" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[200px] flex-shrink-0 bg-[#0F0D18] border-r border-[#23203A] flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-[10px] px-4 h-[52px] border-b border-[#23203A]">
        <div className="w-7 h-7 rounded-[8px] bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white text-[13px] font-bold shadow-[0_0_12px_rgba(124,58,237,0.35)]">
          S
        </div>
        <span className="font-serif text-[18px] tracking-[0.02em]">SUFI</span>
      </Link>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {NAV.map(({ icon, label, href }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link key={href} href={href}
              className={cn(
                "flex items-center gap-[10px] mx-2 px-3 py-[9px] rounded-[8px] text-[12px] transition-all duration-150",
                active
                  ? "bg-purple-500/12 text-[#ede9ff] border border-purple-500/20"
                  : "text-[#5a5480] hover:bg-[#161422] hover:text-[#9b94c4]",
              )}>
              <span className="text-[14px] w-5 text-center">{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-[#23203A]">
        <div className="text-[9px] text-[#5a5480] font-mono uppercase tracking-[.08em] mb-1">Restaurant</div>
        <div className="text-[11px] text-[#9b94c4]">Rangoli · Mumbai</div>
      </div>
    </aside>
  );
}
