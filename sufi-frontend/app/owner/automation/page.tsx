"use client";
import { useState } from "react";
import SufiCard from "@/components/ui/SufiCard";
import SufiButton from "@/components/ui/SufiButton";

interface Suggestion {
  id: number;
  title: string;
  description: string;
  confidence: number;
  type: "overbook" | "promote" | "cancel";
  applied: boolean;
}

const initial: Suggestion[] = [
  {
    id: 1,
    title: "No-show risk at 8 PM",
    description: "3 reservations have high no-show probability. Overbook by 10% to protect revenue.",
    confidence: 86,
    type: "overbook",
    applied: false,
  },
  {
    id: 2,
    title: "Waitlist promotion opportunity",
    description: "2 tables become free at 7:30 PM — promote next 2 waitlist guests automatically.",
    confidence: 92,
    type: "promote",
    applied: false,
  },
  {
    id: 3,
    title: "Low-priority reservation at 9 PM",
    description: "1 reservation has low priority score and high cancellation risk. Consider rescheduling.",
    confidence: 74,
    type: "cancel",
    applied: false,
  },
];

const typeColor: Record<string, string> = {
  overbook: "text-yellow-400",
  promote: "text-green-400",
  cancel: "text-red-400",
};

export default function AutomationPage() {
  const [suggestions, setSuggestions] = useState(initial);

  const apply = (id: number) => {
    setSuggestions((s) => s.map((item) => item.id === id ? { ...item, applied: true } : item));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Automation</h2>
        <p className="text-sm text-gray-500 mt-1">AI-generated actions based on demand signals and no-show predictions.</p>
      </div>

      <div className="flex flex-col gap-4">
        {suggestions.map((s) => (
          <SufiCard key={s.id} className={s.applied ? "opacity-50" : ""}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-sm">{s.title}</h3>
                  <span className={`text-xs capitalize ${typeColor[s.type]}`}>{s.type}</span>
                </div>
                <p className="text-sm text-gray-400">{s.description}</p>
                <p className="text-xs text-accent mt-2">Confidence: {s.confidence}%</p>
              </div>
              {s.applied ? (
                <span className="text-xs text-green-400 shrink-0">Applied ✓</span>
              ) : (
                <SufiButton onClick={() => apply(s.id)} className="shrink-0">Apply</SufiButton>
              )}
            </div>
          </SufiCard>
        ))}
      </div>
    </div>
  );
}
