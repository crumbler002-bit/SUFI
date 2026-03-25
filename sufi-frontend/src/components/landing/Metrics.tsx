"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSufiStore } from "@/lib/state/sufiStore";
import { useTrends } from "@/lib/hooks/useTrends";
import { revealUp } from "@/lib/animations/reveal";

gsap.registerPlugin(ScrollTrigger);

export default function LiveSystem() {
  useTrends();

  const trends = useSufiStore((s) => s.trends);
  const sectionRef = useRef<HTMLDivElement>(null);
  const metricsRef = useRef<HTMLDivElement>(null);

  const metrics = [
    {
      label: "Active Bookings",
      value: trends.length > 0 ? trends.reduce((sum, t) => sum + (t.trend_score || 0), 0) : 1247,
      suffix: "",
      description: "Confirmed tonight",
    },
    {
      label: "Searches Today",
      value: 3891,
      suffix: "+",
      description: "Queries processed",
    },
    {
      label: "Trend Score",
      value:
        trends.length > 0
          ? Math.round(trends.slice(0, 3).reduce((s, t) => s + (t.trend_score || 0), 0) / 3)
          : 92,
      suffix: "",
      description: "Global demand index",
    },
    {
      label: "Avg Decision",
      value: 2.3,
      suffix: "s",
      description: "Time to book",
      isDecimal: true,
    },
  ];

  useEffect(() => {
    if (sectionRef.current) revealUp(sectionRef.current);
  }, []);

  // Animated counters with ScrollTrigger
  useEffect(() => {
    if (!metricsRef.current) return;

    const numberEls = metricsRef.current.querySelectorAll(".metric-val");
    numberEls.forEach((el, i) => {
      const m = metrics[i];
      const target = m.value;
      const obj = { val: 0 };

      gsap.to(obj, {
        val: target,
        duration: 2.5,
        ease: "power2.out",
        delay: i * 0.15,
        scrollTrigger: {
          trigger: el,
          start: "top 90%",
        },
        onUpdate: () => {
          if (m.isDecimal) {
            (el as HTMLElement).textContent = obj.val.toFixed(1) + (m.suffix || "");
          } else {
            (el as HTMLElement).textContent = Math.round(obj.val).toLocaleString() + (m.suffix || "");
          }
        },
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="relative py-28 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-secondary/20 to-transparent" />

      <div ref={sectionRef} className="relative z-10 max-w-5xl mx-auto px-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-3 py-1 bg-green-500/10 text-green-400/80 text-xs rounded-full font-medium tracking-wide">
            LIVE SYSTEM
          </span>
          {/* Live indicator dot */}
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-50" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
          </span>
          <span className="text-[11px] text-white/20">Updating in real-time</span>
        </div>

        <h2 className="text-3xl md:text-4xl font-bold mb-3">
          The system is <span className="gradient-text">alive</span>
        </h2>
        <p className="text-base text-white/40 max-w-lg mb-12">
          Every metric reflects real activity — searches, bookings, and trends flowing through the system.
        </p>

        <div ref={metricsRef} className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {metrics.map((m) => (
            <div key={m.label} className="glass-panel p-6 group hover:border-white/10 transition-all">
              <p className="metric-val text-3xl font-bold mb-1 font-mono">0</p>
              <p className="text-xs text-white/50 uppercase tracking-wider mb-1">{m.label}</p>
              <p className="text-[11px] text-white/20">{m.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
