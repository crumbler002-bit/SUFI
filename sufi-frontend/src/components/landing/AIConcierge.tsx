"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useSufiStore } from "@/lib/state/sufiStore";
import GlassPanel from "@/components/ui/GlassPanel";
import Card from "@/components/ui/Card";
import { revealUp } from "@/lib/animations/reveal";

const demoConversation = [
  {
    role: "user" as const,
    content: "Find me a quiet place for a date night",
    delay: 0,
  },
  {
    role: "assistant" as const,
    content:
      "Based on your preference for quiet ambiance and past visits to rooftop spots, I recommend Sky Lounge.",
    delay: 1200,
  },
  {
    role: "assistant-decision" as const,
    content: "",
    delay: 2200,
  },
];

export default function AIConciergePreview() {
  const [visibleMessages, setVisibleMessages] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const { results } = useSufiStore();

  useEffect(() => {
    if (sectionRef.current) revealUp(sectionRef.current);
  }, []);

  // Auto-play demo conversation on scroll
  useEffect(() => {
    if (hasAnimated) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAnimated(true);
          demoConversation.forEach((msg, i) => {
            setTimeout(() => setVisibleMessages(i + 1), msg.delay + 400);
          });
        }
      },
      { threshold: 0.3 }
    );

    if (chatRef.current) observer.observe(chatRef.current);
    return () => observer.disconnect();
  }, [hasAnimated]);

  // Animate each message in
  useEffect(() => {
    if (chatRef.current && visibleMessages > 0) {
      const msgs = chatRef.current.querySelectorAll(".ai-msg");
      const last = msgs[visibleMessages - 1];
      if (last) {
        gsap.fromTo(last, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "power3.out" });
      }
    }
  }, [visibleMessages]);

  const bestResult = results[0];

  return (
    <section className="relative py-28 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-tertiary/20 to-transparent" />

      <div ref={sectionRef} className="relative z-10 max-w-5xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Left — copy */}
          <div>
            <div className="mb-4">
              <span className="px-3 py-1 bg-tertiary/10 text-tertiary/80 text-xs rounded-full font-medium tracking-wide">
                AI CONCIERGE
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Not a chatbot.<br />
              A <span className="gradient-text">decision authority</span>.
            </h2>
            <p className="text-base text-white/40 mb-6 leading-relaxed">
              Grounded in real data, not hallucinations. Every recommendation is
              backed by availability, ratings, and your personal preferences.
            </p>

            {/* Decision clarity points */}
            <div className="space-y-2.5">
              {[
                { icon: "🎯", text: "Makes decisions, not suggestions" },
                { icon: "📊", text: "References real-time availability" },
                { icon: "🧠", text: "Learns from your past choices" },
                { icon: "💎", text: "Explains confidence level for every pick" },
              ].map((point) => (
                <div key={point.text} className="flex items-start gap-2.5">
                  <span className="text-xs mt-0.5">{point.icon}</span>
                  <p className="text-sm text-white/35">{point.text}</p>
                </div>
              ))}
            </div>

            <a href="/assistant" className="inline-block mt-8 text-sm text-primary/80 hover:text-primary transition-all font-medium">
              Try the full assistant →
            </a>
          </div>

          {/* Right — simulated chat */}
          <div ref={chatRef}>
            <GlassPanel className="p-5">
              <div className="min-h-[300px] space-y-4 mb-4">
                {/* User message */}
                {visibleMessages >= 1 && (
                  <div className="ai-msg flex justify-end">
                    <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-primary/15 text-white">
                      <p className="text-sm leading-relaxed">{demoConversation[0].content}</p>
                    </div>
                  </div>
                )}

                {/* AI response */}
                {visibleMessages >= 2 && (
                  <div className="ai-msg flex justify-start">
                    <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-white/5 text-white/70">
                      <p className="text-sm leading-relaxed">{demoConversation[1].content}</p>
                    </div>
                  </div>
                )}

                {/* 🔥 DECISION AUTHORITY — not a suggestion, a decision */}
                {visibleMessages >= 3 && bestResult && (
                  <div className="ai-msg">
                    {/* Decision card */}
                    <div className="bg-primary/[0.06] border border-primary/15 rounded-xl p-4 mb-2">
                      <p className="text-[10px] text-primary/50 uppercase tracking-wider font-medium mb-2">
                        ✨ BEST CHOICE
                      </p>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold">{bestResult.name}</p>
                        {bestResult.score && (
                          <span className="text-xs text-primary font-bold">
                            {Math.round(bestResult.score * 100)}% match
                          </span>
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-[11px] text-white/30">
                          ◆ Matches your past preferences
                        </p>
                        <p className="text-[11px] text-white/30">
                          ◆ High availability tonight
                        </p>
                        <p className="text-[11px] text-white/30">
                          ◆ Currently trending in your area
                        </p>
                      </div>
                    </div>

                    {/* Inline card */}
                    <div className="scale-[0.88] origin-left">
                      <Card data={bestResult} state="bestMatch" />
                    </div>
                  </div>
                )}

                {visibleMessages === 0 && (
                  <div className="flex items-center justify-center h-full opacity-30">
                    <p className="text-sm text-white/30">Scroll to see demo…</p>
                  </div>
                )}
              </div>

              {/* Fake input */}
              <div className="bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3 flex justify-between items-center">
                <span className="text-sm text-white/20">Ask anything about dining…</span>
                <span className="text-xs text-primary/40 font-medium">Send</span>
              </div>
            </GlassPanel>
          </div>
        </div>
      </div>
    </section>
  );
}
