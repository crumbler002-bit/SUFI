"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "Dashboard", href: "/owner", icon: "⬡" },
  { name: "Reservations", href: "/owner/reservations", icon: "◈" },
  { name: "Tables", href: "/owner/tables", icon: "◇" },
  { name: "Waitlist", href: "/owner/waitlist", icon: "⏳" },
  { name: "Automation", href: "/owner/automation", icon: "⚙" },
  { name: "Analytics", href: "/owner/analytics", icon: "△" },
  { name: "Billing", href: "/owner/billing", icon: "◎" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 border-r border-white/[0.06] flex flex-col gap-6 p-5 shrink-0">
      <div>
        <Link href="/" className="text-base font-bold tracking-tight text-white">SUFI</Link>
        <p className="text-xs text-gray-600 mt-0.5">Owner OS</p>
      </div>

      <nav className="flex flex-col gap-0.5">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all ${
                active
                  ? "bg-accent/15 text-accent"
                  : "text-gray-500 hover:bg-white/[0.04] hover:text-gray-200"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto">
        <Link
          href="/app"
          className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
        >
          ← Back to explore
        </Link>
      </div>
    </aside>
  );
}
