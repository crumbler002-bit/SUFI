"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/core/Navbar";
import GlassPanel from "@/components/ui/GlassPanel";
import ExplanationTag from "@/components/ui/ExplanationTag";
import type { Result } from "@/lib/types";

export default function RestaurantDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [restaurant, setRestaurant] = useState<Result | null>(null);
  const [aiReason, setAiReason] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        // Try to find from a search
        const res = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: id, limit: 1 }),
        });
        const data = await res.json();
        if (data.results?.[0]) {
          setRestaurant(data.results[0]);
        }
      } catch {
        // Fallback mock
      }
      setLoading(false);
    };
    fetchRestaurant();
  }, [id]);

  const askAI = async () => {
    if (!restaurant) return;
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: `Tell me about ${restaurant.name} in 2-3 sentences.` }),
      });
      const data = await res.json();
      setAiReason(data.text || "A great dining experience awaits.");
    } catch {
      setAiReason("A great dining experience awaits.");
    }
  };

  const timeSlots = ["6:00 PM", "7:00 PM", "7:30 PM", "8:00 PM", "9:00 PM"];
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="pt-14 min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-white/30">Loading...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="pt-14 min-h-screen">
        {/* Hero */}
        <div className="relative h-[40vh] bg-gradient-to-b from-primary/10 to-background flex items-end">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          <div className="relative z-10 max-w-5xl mx-auto w-full px-6 pb-8">
            <Link href="/explore" className="text-xs text-white/30 hover:text-white/60 transition-all mb-4 block">
              ← Back to Explore
            </Link>
            <h1 className="text-4xl font-bold mb-2">{restaurant?.name || `Restaurant #${id}`}</h1>
            <div className="flex items-center gap-3 text-sm text-white/50">
              {restaurant?.cuisine && <span>{restaurant.cuisine}</span>}
              {restaurant?.price_range && <span>• {restaurant.price_range}</span>}
              {restaurant?.rating && restaurant.rating > 0 && (
                <span className="flex items-center gap-1">
                  • <span className="text-yellow-400">★</span> {restaurant.rating}
                </span>
              )}
              {restaurant?.city && <span>• {restaurant.city}</span>}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Main */}
            <div className="md:col-span-2 space-y-6">
              {/* Description */}
              {restaurant?.description && (
                <GlassPanel className="p-6">
                  <h2 className="text-sm text-white/40 uppercase tracking-wider mb-3">About</h2>
                  <p className="text-white/70 leading-relaxed">{restaurant.description}</p>
                </GlassPanel>
              )}

              {/* AI Explanation */}
              <GlassPanel className="p-6">
                <h2 className="text-sm text-white/40 uppercase tracking-wider mb-3">Why Recommended</h2>
                {restaurant?.reason && <ExplanationTag text={restaurant.reason} />}
                {!aiReason ? (
                  <button
                    onClick={askAI}
                    className="mt-3 text-sm text-white/40 hover:text-white/70 bg-white/5
                             hover:bg-white/10 px-4 py-2 rounded-lg transition-all"
                  >
                    🤖 Get AI analysis
                  </button>
                ) : (
                  <p className="mt-3 text-sm text-white/60 leading-relaxed">{aiReason}</p>
                )}
              </GlassPanel>

              {/* Tags */}
              {restaurant?.tags && restaurant.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {restaurant.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 bg-white/5 text-white/40 text-sm rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Booking sidebar */}
            <div>
              <GlassPanel className="p-6 sticky top-24">
                <h2 className="text-sm text-white/40 uppercase tracking-wider mb-4">Reserve</h2>

                <p className="text-xs text-white/30 mb-2">Select time</p>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-2 text-xs rounded-lg transition-all ${
                        selectedSlot === slot
                          ? "bg-primary text-black font-medium"
                          : "bg-white/5 text-white/50 hover:bg-white/10"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>

                <button
                  disabled={!selectedSlot}
                  className="w-full btn-primary text-sm py-3 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {selectedSlot ? `Book for ${selectedSlot}` : "Select a time"}
                </button>
              </GlassPanel>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
