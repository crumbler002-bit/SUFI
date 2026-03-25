"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import SystemStatusIndicator from "@/components/core/SystemStatus";

const links = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Explore" },
  { href: "/assistant", label: "Assistant" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 border-b border-white/5">
      <div className="glass-panel rounded-none border-x-0 border-t-0">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-lg font-bold tracking-tight">
            <span className="gradient-text">SUFI</span>
            <span className="text-white/30 text-xs ml-1.5 font-normal">OS</span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                  pathname === link.href
                    ? "bg-white/10 text-white font-medium"
                    : "text-white/40 hover:text-white/70 hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Status */}
          <div className="relative">
            <SystemStatusIndicator />
          </div>
        </div>
      </div>
    </nav>
  );
}
