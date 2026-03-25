"use client";

import { useEffect, useRef } from "react";
import { revealUp } from "@/lib/animations/reveal";

export default function CTA() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sectionRef.current) revealUp(sectionRef.current);
  }, []);

  return (
    <section className="relative py-32 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Subtle depth */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px]" />
      </div>

      <div ref={sectionRef} className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
          Start using <span className="gradient-text">SUFI</span>
        </h2>
        <p className="text-base text-white/30 mb-10 max-w-md mx-auto">
          See how decisions change.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/explore" className="btn-primary text-sm">
            Start exploring
          </a>
          <a href="/assistant" className="btn-secondary text-sm">
            Talk to AI
          </a>
        </div>

        <p className="mt-8 text-xs text-white/15">
          No sign-up required. Intelligence is available now.
        </p>
      </div>
    </section>
  );
}
