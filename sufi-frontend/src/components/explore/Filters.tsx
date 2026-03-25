"use client";

import { useSufiStore } from "@/lib/state/sufiStore";

const moods = ["Romantic", "Fast", "Luxury", "Quiet", "Family"];
const cuisines = ["Italian", "Japanese", "Indian", "French", "Seafood", "Steakhouse"];
const priceRanges = ["$", "$$", "$$$", "$$$$"];

export default function Filters() {
  const { search, intent } = useSufiStore();

  const applyFilter = (filter: string) => {
    const query = intent ? `${intent} ${filter.toLowerCase()}` : filter.toLowerCase();
    search(query);
  };

  return (
    <aside className="w-[220px] shrink-0 border-r border-white/5 p-5 space-y-6 hidden lg:block">
      {/* Mood */}
      <div>
        <h4 className="text-xs text-white/40 uppercase tracking-wider mb-3">Mood</h4>
        <div className="space-y-1">
          {moods.map((mood) => (
            <button
              key={mood}
              onClick={() => applyFilter(mood)}
              className="block w-full text-left text-sm text-white/60 hover:text-white hover:bg-white/5
                       px-3 py-1.5 rounded-lg transition-all"
            >
              {mood}
            </button>
          ))}
        </div>
      </div>

      {/* Cuisine */}
      <div>
        <h4 className="text-xs text-white/40 uppercase tracking-wider mb-3">Cuisine</h4>
        <div className="space-y-1">
          {cuisines.map((c) => (
            <button
              key={c}
              onClick={() => applyFilter(c)}
              className="block w-full text-left text-sm text-white/60 hover:text-white hover:bg-white/5
                       px-3 py-1.5 rounded-lg transition-all"
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <h4 className="text-xs text-white/40 uppercase tracking-wider mb-3">Price</h4>
        <div className="flex gap-1">
          {priceRanges.map((p) => (
            <button
              key={p}
              onClick={() => applyFilter(p)}
              className="px-3 py-1.5 text-sm text-white/60 hover:text-white bg-white/5
                       hover:bg-white/10 rounded-lg transition-all"
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
