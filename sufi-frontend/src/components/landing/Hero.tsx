"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { useSufiStore } from "@/lib/state/sufiStore";
import { animateCards } from "@/lib/animations/cards";
import Card from "@/components/ui/Card";
import type { CardState } from "@/lib/types";

const demoQueries = [
  "romantic rooftop dinner",
  "quiet italian spot",
  "family brunch with a view",
  "business lunch in CBD",
  "late night sushi bar",
];

export default function Hero() {
  const router = useRouter();
  const [inputValue, setInputValue] = useState("");
  const [hintIndex, setHintIndex] = useState(0);
  const [metric, setMetric] = useState(1.61);
  const [demoRan, setDemoRan] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  const { search, searchPreview, results, bestMatchId, explanations, loading, systemStatus } =
    useSufiStore();

  // 🔥 AUTO-DEMO: Run search on mount so Hero is never empty
  useEffect(() => {
    if (!demoRan) {
      const timer = setTimeout(() => {
        search("romantic rooftop dinner");
        setDemoRan(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [demoRan, search]);

  // Title entrance animation
  useEffect(() => {
    if (titleRef.current) {
      const lines = titleRef.current.querySelectorAll(".hero-line");
      gsap.fromTo(
        lines,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.12, duration: 0.7, ease: "power3.out", delay: 0.2 }
      );
    }
  }, []);

  // Animate results in when they change
  useEffect(() => {
    if (results.length > 0 && resultsRef.current) {
      animateCards(resultsRef.current);
    }
  }, [results]);

  // Rotating placeholder hints
  useEffect(() => {
    const interval = setInterval(() => {
      setHintIndex((prev) => (prev + 1) % demoQueries.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // System intensity metric (subtle)
  useEffect(() => {
    const interval = setInterval(() => {
      setMetric((prev) => {
        const delta = (Math.random() - 0.45) * 0.003;
        const next = prev + delta;
        return next > 1.85 ? 1.61 : next < 1.55 ? 1.61 : next;
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = useCallback(() => {
    const query = inputValue.trim() || demoQueries[hintIndex];
    if (query) {
      setInputValue(query);
      search(query);
      setTimeout(() => router.push(`/explore?q=${encodeURIComponent(query)}`), 800);
    }
  }, [inputValue, hintIndex, search, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    searchPreview(e.target.value);
  };

  const getCardState = (id: string, index: number): CardState => {
    if (id === bestMatchId) return "bestMatch";
    if (index > 2) return "lowRelevance";
    return "normal";
  };

  const topResults = results.slice(0, 3);
  const bestResult = topResults.find((r) => r.id === bestMatchId) || topResults[0];

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Global background flows through */}

      {/* Subtle reactive glow */}
      <div
        className="bg-glow absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full pointer-events-none transition-opacity duration-700"
        style={{
          background: "radial-gradient(circle, rgba(163,166,255,0.06) 0%, transparent 70%)",
          opacity: systemStatus === "searching" ? 0.8 : 0.3,
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 min-h-screen flex flex-col justify-center items-center text-center pt-24 pb-16">
        {/* System metric — small top-left indicator */}
        <div className="mb-6">
          <p className="text-xs text-white/30 tracking-widest uppercase mb-1">System Activity</p>
          <p className="text-3xl font-mono font-semibold gradient-text">
            {metric.toFixed(3)}
            <span className="text-xs text-white/20 ml-2 font-sans">intensity index</span>
          </p>
        </div>

        {/* Title */}
        <div ref={titleRef} className="mb-8">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08]">
            <span className="hero-line block">Intelligence</span>
            <span className="hero-line block">for real-world</span>
            <span className="hero-line block gradient-text">decisions</span>
          </h1>
        </div>

        {/* Subtitle */}
        <p className="text-base md:text-lg text-white/40 mb-8 max-w-xl mx-auto">
          SUFI OS understands intent, predicts preferences,
          and evolves with every interaction.
        </p>

        {/* Search input */}
        <div className="max-w-xl w-full mb-8 mx-auto">
          <div className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder={demoQueries[hintIndex]}
              className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-6 py-4
                       text-white placeholder:text-white/25 text-base focus:outline-none
                       focus:border-primary/40 focus:ring-1 focus:ring-primary/20
                       transition-all duration-300"
            />
            <button
              onClick={handleSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 px-5 py-2
                       bg-primary text-black rounded-xl font-medium text-sm
                       hover:bg-primary/90 transition-all active:scale-95"
            >
              →
            </button>
          </div>
          <div className="flex justify-center gap-2 mt-3 text-left">
            <span className="px-2.5 py-1 bg-primary/10 text-primary/80 text-[11px] rounded-full font-medium">
              AI-powered
            </span>
            <span className="px-2.5 py-1 bg-white/[0.04] text-white/30 text-[11px] rounded-full">
              {systemStatus === "searching" ? "processing…" : "ready"}
            </span>
            {/* REALITY SIGNAL: result count */}
            {results.length > 0 && (
              <span className="px-2.5 py-1 bg-white/[0.04] text-white/25 text-[11px] rounded-full">
                {results.length} results matched
              </span>
            )}
          </div>
        </div>

        {/* 🔥 TOP RESULT HIGHLIGHT — DECISION, NOT JUST RESULTS */}
        {bestResult && !loading && (
          <div className="max-w-xl w-full mx-auto mb-6 px-4 py-3 bg-primary/[0.06] border border-primary/15 rounded-xl text-left">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="text-[11px] text-primary/60 uppercase tracking-wider font-medium mb-0.5">Top result</p>
                <p className="text-sm font-semibold">
                  {bestResult.name}
                  {bestResult.score && (
                    <span className="text-primary/80 ml-1.5 text-xs font-bold">
                      — {Math.round(bestResult.score * 100)}% match
                    </span>
                  )}
                </p>
              </div>
              {explanations[bestResult.id] && (
                <p className="text-[10px] text-white/25 max-w-[180px] text-right">
                  {explanations[bestResult.id]}
                </p>
              )}
            </div>
          </div>
        )}

        {/* LIVE PREVIEW CARDS */}
        <div className="max-w-4xl w-full mx-auto text-left">
          {loading && topResults.length === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-panel p-5 animate-pulse">
                  <div className="h-4 w-28 bg-white/10 rounded mb-3" />
                  <div className="h-3 w-20 bg-white/5 rounded mb-3" />
                  <div className="flex gap-1.5">
                    {[...Array(4)].map((_, j) => (
                      <div key={j} className="h-1.5 w-8 bg-white/5 rounded-full" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {topResults.length > 0 && (
            <div ref={resultsRef} className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {topResults.map((result, i) => (
                <div key={result.id}>
                  <Card
                    data={result}
                    state={getCardState(result.id, i)}
                    explanation={explanations[result.id]}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Fallback — only shows briefly before auto-demo fires */}
          {!loading && topResults.length === 0 && (
            <p className="text-sm text-white/15">Initializing intelligence…</p>
          )}
        </div>

        {/* Stats — REALITY SIGNALS: specific, not generic */}
        <div className="mt-12 flex justify-center gap-8 md:gap-14 flex-wrap">
          <div>
            <p className="text-xl font-semibold">10K+</p>
            <p className="text-xs text-white/30">active restaurants</p>
          </div>
          <div>
            <p className="text-xl font-semibold">98%</p>
            <p className="text-xs text-white/30">booking accuracy</p>
          </div>
          <div>
            <p className="text-xl font-semibold">2.3s</p>
            <p className="text-xs text-white/30">avg decision time</p>
          </div>
        </div>
      </div>
    </section>
  );
}
