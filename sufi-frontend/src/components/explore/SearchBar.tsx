"use client";

import { useState } from "react";
import { useSufiStore } from "@/lib/state/sufiStore";

export default function SearchBar() {
  const [input, setInput] = useState("");
  const { search, searchPreview, systemStatus, intent } = useSufiStore();

  // Initialize from current intent
  useState(() => {
    if (intent) setInput(intent);
  });

  const handleSearch = () => {
    if (input.trim()) search(input.trim());
  };

  return (
    <div className="sticky top-14 z-30 border-b border-white/5 bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="relative max-w-2xl mx-auto">
          <input
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              searchPreview(e.target.value);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search places, moods, experiences..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3
                     text-white placeholder:text-white/30 text-sm focus:outline-none
                     focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <span className="text-xs text-white/20">
              {systemStatus === "searching" ? "searching…" : ""}
            </span>
            <button
              onClick={handleSearch}
              className="px-3 py-1.5 bg-primary/80 text-black rounded-lg text-xs font-medium
                       hover:bg-primary transition-all"
            >
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
