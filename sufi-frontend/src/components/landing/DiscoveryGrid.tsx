"use client";

import { useEffect, useRef, useState } from "react";
import { useSufiStore } from "@/lib/state/sufiStore";
import Card from "@/components/ui/Card";
import ExplanationTag from "@/components/ui/ExplanationTag";
import { revealUp, revealStagger } from "@/lib/animations/reveal";
import type { CardState } from "@/lib/types";

export default function DiscoveryPreview() {
  const { results, bestMatchId, explanations } = useSufiStore();
  const sectionRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [elapsed, setElapsed] = useState(2);

  // Reveal on scroll
  useEffect(() => {
    if (sectionRef.current) revealUp(sectionRef.current);
    if (gridRef.current) revealStagger(gridRef.current);
  }, []);

  // "Updated Xs ago" timer — REALITY SIGNAL
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((prev) => (prev >= 30 ? 2 : prev + 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const previewResults = results.slice(0, 4);

  const getState = (id: string, i: number): CardState => {
    if (id === bestMatchId) return "bestMatch";
    return i > 2 ? "lowRelevance" : "normal";
  };

  return (
    <section className="relative py-28 overflow-hidden">
      {/* Separator */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div ref={sectionRef} className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <span className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium tracking-wide">
            MULTI-SIGNAL RANKING
          </span>
          {/* REALITY SIGNAL: live update indicator */}
          <span className="text-[10px] text-white/20">
            Updated {elapsed}s ago
          </span>
        </div>

        <h2 className="text-3xl md:text-4xl font-bold mb-3">
          Discovery that <span className="gradient-text">understands</span>
        </h2>

        {/* REALITY SIGNAL: match count */}
        <p className="text-base text-white/40 max-w-lg mb-1">
          Not just keywords. Intent, context, and trends — ranked in real time.
        </p>
        {results.length > 0 && (
          <p className="text-xs text-white/20 mb-4">
            Matched <span className="text-white/40 font-medium">{results.length} restaurants</span> · Ranked by intent + availability
          </p>
        )}

        {/* Signal badges */}
        <div className="flex flex-wrap gap-3 mb-10">
          {["Intent matching", "Behavioral signals", "Real-time demand", "Personalization"].map((s) => (
            <span key={s} className="px-3 py-1.5 bg-white/[0.03] border border-white/5 text-white/30 text-xs rounded-lg">
              {s}
            </span>
          ))}
        </div>

        {/* Preview grid */}
        {previewResults.length > 0 ? (
          <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {previewResults.map((r, i) => (
              <div key={r.id} className="relative">
                <Card
                  data={r}
                  state={getState(r.id, i)}
                  explanation={explanations[r.id]}
                />
                {/* Inline explanation below bestMatch */}
                {r.id === bestMatchId && explanations[r.id] && (
                  <div className="mt-2 px-1">
                    <ExplanationTag text={explanations[r.id]} />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass-panel p-5 animate-pulse">
                <div className="h-4 w-24 bg-white/10 rounded mb-3" />
                <div className="h-3 w-16 bg-white/5 rounded mb-2" />
                <div className="h-2 w-full bg-white/[0.03] rounded" />
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-10 flex items-center gap-4">
          <a
            href="/explore"
            className="text-sm text-primary/80 hover:text-primary transition-all font-medium"
          >
            Explore full system →
          </a>
          <span className="text-xs text-white/15">|</span>
          <p className="text-xs text-white/20">
            Ranked using intent, behavior, and real-time demand
          </p>
        </div>
      </div>
    </section>
  );
}
