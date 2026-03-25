"use client";

import type { Result, CardState } from "@/lib/types";
import ExplanationTag from "@/components/ui/ExplanationTag";

interface CardProps {
  data: Result;
  state?: CardState;
  explanation?: string;
  onClick?: () => void;
}

export default function Card({ data, state = "normal", explanation, onClick }: CardProps) {
  const stateStyles: Record<CardState, string> = {
    normal: "border-white/[0.08]",
    bestMatch: "border-primary/40 ring-1 ring-primary/20 scale-[1.02]",
    trending: "border-tertiary/30",
    lowRelevance: "border-white/[0.05] opacity-60",
  };

  const scorePercent = data.score ? Math.round(data.score * 100) : null;

  return (
    <div
      onClick={onClick}
      className={`
        glass-panel-hover p-5 cursor-pointer relative overflow-hidden
        ${stateStyles[state]}
        ${state === "trending" ? "animate-pulse-slow" : ""}
      `}
    >
      {/* Glow effect for bestMatch */}
      {state === "bestMatch" && (
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
      )}

      {/* Header */}
      <div className="relative flex justify-between items-start mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold truncate">{data.name}</h3>
          <p className="text-xs text-white/40 mt-0.5">
            {data.cuisine}{data.price_range ? ` · ${data.price_range}` : ""}
          </p>
        </div>

        {/* Score badge — REALITY SIGNAL */}
        {scorePercent !== null && (
          <div className={`shrink-0 ml-2 px-2 py-0.5 rounded-md text-[11px] font-bold font-mono ${
            scorePercent >= 85
              ? "bg-primary/15 text-primary"
              : scorePercent >= 60
              ? "bg-white/5 text-white/60"
              : "bg-white/[0.03] text-white/30"
          }`}>
            {scorePercent}%
          </div>
        )}
      </div>

      {/* Rating + Trend indicator */}
      <div className="flex items-center gap-2 mb-3">
        {data.rating > 0 && (
          <div className="flex items-center gap-1">
            <span className="text-yellow-400 text-xs">★</span>
            <span className="text-xs font-medium">{data.rating}</span>
          </div>
        )}
        {/* Trend indicator — REALITY SIGNAL */}
        {data.trend_score && data.trend_score > 70 && (
          <span className="text-[10px] text-tertiary/80 font-medium flex items-center gap-0.5">
            📈 Trending
          </span>
        )}
        {/* Urgency signal */}
        {data.trend_score && data.trend_score > 85 && (
          <span className="text-[10px] text-red-400/70 font-medium">
            High demand
          </span>
        )}
      </div>

      {/* Tags */}
      {data.tags && data.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {data.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="px-1.5 py-0.5 bg-white/5 text-white/40 text-[10px] rounded-full">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Relevance signal bars */}
      <div className="flex gap-0.5 mb-3">
        {[...Array(5)].map((_, j) => (
          <div
            key={j}
            className="h-1 w-5 rounded-full transition-all"
            style={{
              backgroundColor: j < Math.ceil((data.score || 0) * 5)
                ? "#a3a6ff"
                : "rgba(255,255,255,0.06)",
            }}
          />
        ))}
      </div>

      {/* Explanation — WHY this result */}
      {explanation && <ExplanationTag text={explanation} />}

      {/* State badges */}
      {state === "bestMatch" && (
        <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between">
          <span className="text-[11px] text-primary font-medium">✨ Best match</span>
          {data.reason && (
            <span className="text-[10px] text-white/20 truncate ml-2 max-w-[120px]">{data.reason}</span>
          )}
        </div>
      )}
      {state === "trending" && data.trend_score && (
        <div className="mt-3 pt-2 border-t border-white/10">
          <span className="text-[11px] text-tertiary font-medium">📈 Trending · Score {data.trend_score}</span>
        </div>
      )}
    </div>
  );
}
