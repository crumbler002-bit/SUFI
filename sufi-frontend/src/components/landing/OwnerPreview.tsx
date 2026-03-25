"use client";

import { useEffect, useRef } from "react";
import { revealUp } from "@/lib/animations/reveal";
import GlassPanel from "@/components/ui/GlassPanel";

export default function OwnerPreview() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sectionRef.current) revealUp(sectionRef.current);
  }, []);

  return (
    <section className="relative py-28 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

      <div ref={sectionRef} className="relative z-10 max-w-5xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left — copy */}
          <div>
            <div className="mb-4">
              <span className="px-3 py-1 bg-secondary/10 text-secondary/80 text-xs rounded-full font-medium tracking-wide">
                OWNER SYSTEM
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Same intelligence.<br />
              <span className="gradient-text">Different perspective.</span>
            </h2>
            <p className="text-base text-white/40 mb-6 leading-relaxed">
              Owners see what diners don&apos;t — demand forecasts, pricing intelligence,
              and automated decisions that maximize revenue.
            </p>

            <div className="space-y-2 mb-8">
              {["Real-time booking analytics", "AI demand forecasting", "Automated pricing rules", "Trend-based menu optimization"].map((p) => (
                <div key={p} className="flex items-start gap-2">
                  <span className="text-secondary/50 text-xs mt-0.5">◆</span>
                  <p className="text-sm text-white/30">{p}</p>
                </div>
              ))}
            </div>

            <a href="/dashboard" className="inline-block text-sm text-secondary/80 hover:text-secondary transition-all font-medium">
              View dashboard →
            </a>
          </div>

          {/* Right — mini dashboard preview */}
          <GlassPanel className="p-6">
            {/* Mini metrics */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                { label: "Tonight", value: "128", sub: "bookings" },
                { label: "Revenue", value: "₹45.2K", sub: "today" },
                { label: "Demand", value: "High", sub: "7-9 PM" },
                { label: "Score", value: "92", sub: "trending" },
              ].map((m) => (
                <div key={m.label} className="bg-white/[0.03] rounded-xl p-3">
                  <p className="text-lg font-bold font-mono">{m.value}</p>
                  <p className="text-[10px] text-white/30 uppercase tracking-wider">{m.label}</p>
                  <p className="text-[10px] text-white/15">{m.sub}</p>
                </div>
              ))}
            </div>

            {/* Mini chart */}
            <div className="bg-white/[0.02] rounded-xl p-4 mb-4">
              <p className="text-[10px] text-white/30 uppercase tracking-wider mb-3">Revenue (7 days)</p>
              <div className="h-16 flex items-end gap-1">
                {[45, 62, 55, 78, 70, 85, 92].map((h, i) => (
                  <div key={i} className="flex-1">
                    <div
                      className="bg-secondary/30 rounded-t hover:bg-secondary/50 transition-all"
                      style={{ height: `${h}%` }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Mini AI insight */}
            <div className="flex gap-2 p-3 bg-white/[0.02] rounded-xl">
              <span className="text-sm">📈</span>
              <p className="text-xs text-white/30 leading-relaxed">
                Demand spike expected Friday 7-9 PM. Consider adding staff.
              </p>
            </div>
          </GlassPanel>
        </div>
      </div>
    </section>
  );
}
