"use client";

import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { useSufiStore } from "@/lib/state/sufiStore";
import Card from "@/components/ui/Card";

export default function ComparisonPanel() {
  const { selectedList, showComparison, setShowComparison, intent, explanations } = useSufiStore();
  const [aiCompare, setAiCompare] = useState("");
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showComparison && panelRef.current) {
      gsap.fromTo(
        panelRef.current,
        { scale: 0.95, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.3, ease: "power2.out" }
      );
    }
  }, [showComparison]);

  const compareWithAI = async () => {
    setLoading(true);
    try {
      const names = selectedList.map((i) => i.name).join(", ");
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `Compare these restaurants for "${intent}": ${names}. Be concise, highlight key differences.`,
        }),
      });
      const data = await res.json();
      setAiCompare(data.text || "These are all great options for your search.");
    } catch {
      setAiCompare("Unable to compare at this time.");
    }
    setLoading(false);
  };

  if (!showComparison || selectedList.length < 2) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
      <div ref={panelRef} className="glass-panel p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Compare Options</h2>
          <button
            onClick={() => { setShowComparison(false); setAiCompare(""); }}
            className="text-white/40 hover:text-white text-sm transition-all"
          >
            ✕ Close
          </button>
        </div>

        {/* Cards side by side */}
        <div className={`grid grid-cols-${selectedList.length} gap-4 mb-6`}>
          {selectedList.map((item) => (
            <Card
              key={item.id}
              data={item}
              state="normal"
              explanation={explanations[item.id]}
            />
          ))}
        </div>

        {/* AI comparison */}
        <div className="border-t border-white/10 pt-4">
          {!aiCompare ? (
            <button
              onClick={compareWithAI}
              disabled={loading}
              className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-sm
                       text-white/60 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50"
            >
              {loading ? "AI is analyzing…" : "🤖 Compare with AI"}
            </button>
          ) : (
            <div className="glass-panel p-4">
              <p className="text-xs text-white/30 uppercase tracking-wider mb-2">AI Analysis</p>
              <p className="text-sm text-white/70 leading-relaxed">{aiCompare}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
