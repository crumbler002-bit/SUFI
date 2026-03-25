"use client";

import { useEffect, useRef } from "react";
import { revealUp, revealStagger } from "@/lib/animations/reveal";

const steps = [
  {
    num: "01",
    title: "Intent",
    description: "Natural language and behavioral signals decoded into structured understanding.",
    detail: "Semantic embeddings + context analysis",
  },
  {
    num: "02",
    title: "Ranking",
    description: "Multi-signal scoring: quality, trends, personalization, and availability.",
    detail: "Vector similarity + collaborative filtering",
  },
  {
    num: "03",
    title: "Reasoning",
    description: "AI explains why each result matches — transparent, not a black box.",
    detail: "LLM-grounded explanations",
  },
  {
    num: "04",
    title: "Decision",
    description: "Compare, book, and provide feedback that improves future results.",
    detail: "Closed-loop learning",
  },
];

export default function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sectionRef.current) revealUp(sectionRef.current);
    if (stepsRef.current) revealStagger(stepsRef.current);
  }, []);

  return (
    <section className="relative py-28 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

      <div ref={sectionRef} className="relative z-10 max-w-5xl mx-auto px-6">
        <div className="mb-4">
          <span className="px-3 py-1 bg-white/5 text-white/40 text-xs rounded-full font-medium tracking-wide">
            HOW IT WORKS
          </span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-3">
          From intent to <span className="gradient-text">decision</span>
        </h2>
        <p className="text-base text-white/40 max-w-lg mb-14">
          SUFI combines semantic search, user behavior, and global trends to rank results instantly.
        </p>

        {/* Steps — horizontal flow */}
        <div ref={stepsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div key={step.num} className="relative group">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-6 right-0 w-6 h-px bg-white/10 translate-x-full" />
              )}

              <div className="glass-panel p-6 h-full hover:border-white/10 transition-all duration-300">
                <span className="text-xs text-primary/60 font-mono mb-3 block">{step.num}</span>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed mb-3">{step.description}</p>
                <p className="text-[11px] text-white/15 font-mono">{step.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
