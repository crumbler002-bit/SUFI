"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useSufiStore } from "@/lib/state/sufiStore";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import LoadingState from "@/components/ui/LoadingState";
import ErrorState from "@/components/ui/ErrorState";
import type { CardState } from "@/lib/types";

export default function ResultsGrid() {
  const { results, bestMatchId, explanations, loading, error, intent, search, systemStatus, setSelected, track } =
    useSufiStore();
  const gridRef = useRef<HTMLDivElement>(null);
  const prevRef = useRef("");

  useEffect(() => {
    const ids = results.map((r) => r.id).join(",");
    if (ids === prevRef.current || !gridRef.current) return;
    prevRef.current = ids;

    gsap.fromTo(
      gridRef.current.querySelectorAll(".result-card"),
      { opacity: 0, y: 15, scale: 0.97 },
      { opacity: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.05, ease: "power2.out" }
    );
  }, [results]);

  const getState = (id: string, i: number): CardState => {
    if (id === bestMatchId) return "bestMatch";
    const r = results.find((x) => x.id === id);
    if (r?.trend_score && r.trend_score > 80) return "trending";
    if (i > 6) return "lowRelevance";
    return "normal";
  };

  const handleClick = (r: typeof results[0]) => {
    setSelected(r);
    track("CLICK", r.id);
  };

  return (
    <main className="flex-1 p-6 overflow-y-auto">
      {/* Results count */}
      {results.length > 0 && (
        <p className="text-xs text-white/30 mb-4">
          {results.length} results for &ldquo;{intent}&rdquo;
        </p>
      )}

      {systemStatus === "error" && <ErrorState message={error || undefined} onRetry={() => intent && search(intent)} />}
      {loading && results.length === 0 && <LoadingState count={6} />}
      {!loading && results.length === 0 && systemStatus !== "error" && <EmptyState />}

      {results.length > 0 && (
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {results.map((r, i) => (
            <div key={r.id} className="result-card">
              <Card
                data={r}
                state={getState(r.id, i)}
                explanation={explanations[r.id]}
                onClick={() => handleClick(r)}
              />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
