"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useSufiStore } from "@/lib/state/sufiStore";
import GlassPanel from "@/components/ui/GlassPanel";
import ExplanationTag from "@/components/ui/ExplanationTag";

export default function DetailPanel() {
  const { selected, explanations, intent, track } = useSufiStore();
  const panelRef = useRef<HTMLDivElement>(null);
  const [aiReason, setAiReason] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Animate panel on selection change
  useEffect(() => {
    if (selected && panelRef.current) {
      gsap.fromTo(
        panelRef.current,
        { x: 30, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.35, ease: "power2.out" }
      );
    }
    setAiReason("");
  }, [selected]);

  const askWhy = async () => {
    if (!selected) return;
    setAiLoading(true);
    track("ASK_WHY", selected.id);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `Why is "${selected.name}" a good match for "${intent}"? Be concise, 2 sentences max.`,
        }),
      });
      const data = await res.json();
      setAiReason(data.text || "This restaurant matches your search criteria well.");
    } catch {
      setAiReason("Unable to get AI reasoning right now.");
    }
    setAiLoading(false);
  };

  if (!selected) {
    return (
      <aside className="w-[320px] shrink-0 border-l border-white/5 p-6 hidden xl:flex items-center justify-center">
        <p className="text-sm text-white/20 text-center">
          Select a result to<br />see details
        </p>
      </aside>
    );
  }

  return (
    <aside ref={panelRef} className="w-[320px] shrink-0 border-l border-white/5 p-5 space-y-5 hidden xl:block overflow-y-auto">
      {/* Name + Rating */}
      <div>
        <h2 className="text-xl font-bold mb-1">{selected.name}</h2>
        <div className="flex items-center gap-2 text-sm text-white/50">
          {selected.cuisine && <span>{selected.cuisine}</span>}
          {selected.price_range && <span>• {selected.price_range}</span>}
          {selected.rating > 0 && (
            <span className="flex items-center gap-1">
              • <span className="text-yellow-400">★</span> {selected.rating}
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      {selected.description && (
        <p className="text-sm text-white/50 leading-relaxed">{selected.description}</p>
      )}

      {/* Tags */}
      {selected.tags && selected.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.tags.map((tag) => (
            <span key={tag} className="px-2 py-0.5 bg-white/5 text-white/40 text-xs rounded-full">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Explanation */}
      {explanations[selected.id] && (
        <GlassPanel className="p-3">
          <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Why recommended</p>
          <ExplanationTag text={explanations[selected.id]} />
        </GlassPanel>
      )}

      {/* AI Reasoning */}
      <div>
        <button
          onClick={askWhy}
          disabled={aiLoading}
          className="w-full text-sm text-left px-3 py-2 bg-white/5 border border-white/10
                   rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all
                   disabled:opacity-50"
        >
          {aiLoading ? "Thinking…" : "🤖 Ask AI: Why this?"}
        </button>
        {aiReason && (
          <p className="mt-2 text-sm text-white/60 leading-relaxed">{aiReason}</p>
        )}
      </div>

      {/* CTA */}
      <button
        onClick={() => track("BOOK_CLICK", selected.id)}
        className="w-full btn-primary text-sm py-3"
      >
        Book Now
      </button>

      {/* View full page */}
      <a
        href={`/restaurant/${selected.id}`}
        className="block text-center text-xs text-white/30 hover:text-white/60 transition-all"
      >
        View full details →
      </a>
    </aside>
  );
}
