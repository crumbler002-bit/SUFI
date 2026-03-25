"use client";

import { useSufiStore } from "@/lib/state/sufiStore";

export default function CompareBar() {
  const { selectedList, setShowComparison } = useSufiStore();

  if (selectedList.length < 2) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 glass-panel px-6 py-3 flex items-center gap-4">
      <span className="text-sm text-white/60">
        {selectedList.length} selected
      </span>
      <div className="flex gap-2">
        {selectedList.map((item) => (
          <span key={item.id} className="px-2 py-0.5 bg-primary/20 text-primary text-xs rounded-full">
            {item.name}
          </span>
        ))}
      </div>
      <button
        onClick={() => setShowComparison(true)}
        className="px-4 py-2 bg-primary text-black rounded-lg text-sm font-medium hover:bg-primary/90 transition-all"
      >
        Compare
      </button>
    </div>
  );
}
