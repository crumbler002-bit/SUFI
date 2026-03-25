"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import { useSufiStore } from "@/lib/state/sufiStore";
import { playSound } from "@/lib/sound/sound";

const links = [
  { href: "/explore", label: "Explore" },
  { href: "/assistant", label: "Assistant" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function Navbar() {
  const pathname = usePathname();
  const systemStatus = useSufiStore((s) => s.systemStatus);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // GSAP entrance
  useEffect(() => {
    if (navRef.current) {
      gsap.fromTo(
        navRef.current,
        { y: -40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power3.out", delay: 0.3 }
      );
    }
  }, []);

  return (
    <div ref={navRef} className="fixed top-5 left-1/2 -translate-x-1/2 z-50">
      <div
        className={`flex items-center gap-5 px-5 py-2.5 rounded-full border transition-all duration-500 ${
          scrolled
            ? "bg-black/70 backdrop-blur-2xl border-white/10 shadow-2xl shadow-black/40"
            : "bg-white/[0.03] backdrop-blur-xl border-white/[0.06]"
        }`}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5 shrink-0">
          <span className="text-sm font-bold tracking-wide gradient-text">SUFI</span>
          <span className="text-[10px] text-white/20 font-medium">OS</span>
        </Link>

        {/* Separator */}
        <div className="w-px h-4 bg-white/[0.06]" />

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => playSound("click")}
              className={`px-3 py-1.5 rounded-full text-xs transition-all duration-300 ${
                pathname === link.href
                  ? "bg-white/10 text-white font-medium"
                  : "text-white/35 hover:text-white/70 hover:bg-white/[0.04]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Separator */}
        <div className="w-px h-4 bg-white/[0.06]" />

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Live status */}
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span
                className={`absolute inline-flex h-full w-full rounded-full opacity-60 ${
                  systemStatus === "searching"
                    ? "bg-yellow-400 animate-ping"
                    : systemStatus === "error"
                    ? "bg-red-400"
                    : "bg-green-400 animate-pulse"
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
                  systemStatus === "searching"
                    ? "bg-yellow-400"
                    : systemStatus === "error"
                    ? "bg-red-400"
                    : "bg-green-400"
                }`}
              />
            </span>
            <span className="text-[10px] text-white/25 font-medium">
              {systemStatus === "searching" ? "Processing" : systemStatus === "error" ? "Error" : "Live"}
            </span>
          </div>

          {/* Enter CTA */}
          <Link
            href="/explore"
            onClick={() => playSound("click")}
            className="px-3.5 py-1.5 bg-primary/90 text-black text-[11px] rounded-full font-semibold
                     hover:bg-primary transition-all duration-300 active:scale-95"
          >
            Enter →
          </Link>
        </div>
      </div>
    </div>
  );
}
