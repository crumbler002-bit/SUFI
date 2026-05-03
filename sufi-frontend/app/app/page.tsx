"use client";
import { useState, useCallback } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useConcierge } from "@/hooks/useConcierge";
import { restaurantApi, type Restaurant } from "@/lib/api";
import { useAuth } from "@/store/appStore";
import SufiCard from "@/components/ui/SufiCard";
import SufiButton from "@/components/ui/SufiButton";
import VideoText from "@/components/ui/VideoText";
import BorderGlow from "@/components/ui/BorderGlow";
import NoiseCard from "@/components/ui/NoiseCard";
import AuthModal from "@/components/auth/AuthModal";
import ReservationModal from "@/components/reservation/ReservationModal";

type Tab = "concierge" | "discover" | "trending";

export default function GuestApp() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<Tab>("concierge");
  const [authOpen, setAuthOpen] = useState(false);
  const [bookTarget, setBookTarget] = useState<{ id: number; name: string } | null>(null);

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white flex flex-col">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-[600px] h-[600px] rounded-full bg-blue-500/8 blur-[130px] -top-32 left-1/4" />
        <div className="absolute w-[400px] h-[400px] rounded-full bg-purple-500/6 blur-[100px] bottom-0 right-1/4" />
      </div>

      {/* Topbar */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-sm font-bold tracking-tight text-white">SUFI</Link>
          <div className="flex gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06]">
            {(["concierge", "discover", "trending"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                  tab === t
                    ? "bg-accent/20 text-accent"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {t === "concierge" ? "AI Concierge" : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link href="/app/dashboard" className="text-xs text-gray-400 hover:text-white transition-colors">
                My Reservations
              </Link>
              {(user.role === "owner" || user.role === "restaurant_owner") && (
                <Link href="/owner" className="text-xs text-gray-400 hover:text-white transition-colors">
                  Owner OS
                </Link>
              )}
              <span className="text-xs text-gray-500">{user.name}</span>
              <button onClick={logout} className="text-xs text-gray-600 hover:text-gray-400 transition-colors">Sign out</button>
            </>
          ) : (
            <button
              onClick={() => setAuthOpen(true)}
              className="text-xs px-3 py-1.5 rounded-lg bg-accent/15 text-accent border border-accent/20 hover:bg-accent/25 transition-all"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 flex-1">
        {tab === "concierge" && (
          <ConciergeTab onBook={setBookTarget} onAuthRequired={() => setAuthOpen(true)} />
        )}
        {tab === "discover" && <DiscoverTab onBook={setBookTarget} />}
        {tab === "trending" && <TrendingTab onBook={setBookTarget} />}
      </main>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
      {bookTarget && (
        <ReservationModal
          isOpen={!!bookTarget}
          onClose={() => setBookTarget(null)}
          restaurantId={bookTarget.id}
          restaurantName={bookTarget.name}
        />
      )}
    </div>
  );
}

const SUGGESTIONS = [
  "Romantic dinner tonight",
  "Best sushi in the city",
  "Outdoor seating for 4",
  "Quick lunch under ₹500",
];

// ── AI Concierge Tab ──────────────────────────────────────────────────────────
function ConciergeTab({
  onBook,
  onAuthRequired,
}: {
  onBook: (r: { id: number; name: string }) => void;
  onAuthRequired: () => void;
}) {
  const [query, setQuery] = useState("");
  const { mutate, isPending, data, reset } = useConcierge();

  const handleSend = useCallback((q?: string) => {
    const text = q ?? query;
    if (!text.trim()) return;
    mutate(text);
    setQuery("");
  }, [query, mutate]);

  return (
    <div className="flex flex-col items-center px-6 pt-14 pb-12">

      {/* Hero — VideoText (shows video through letters, falls back gracefully if no video) */}
      {!data && !isPending && (
        <div className="w-full max-w-4xl mb-10">
          <VideoText src="/hero.mp4" fontSize={7} className="h-[140px] rounded-2xl">
            SUFI
          </VideoText>
          <p className="text-gray-400 text-sm max-w-md text-center mx-auto mt-4">
            Describe a mood, cuisine, or occasion — SUFI finds the spot and books it.
          </p>
        </div>
      )}

      {/* Input — wrapped in BorderGlow */}
      <div className="w-full max-w-2xl">
        <BorderGlow>
          <div className="bg-[#111827] rounded-2xl flex items-center px-5 py-3.5 gap-3">
            <span className="text-accent text-sm animate-pulse">◎</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="e.g. romantic dinner with good wine, Italian near me..."
              className="flex-1 bg-transparent text-sm placeholder-gray-500 focus:outline-none"
            />
            <SufiButton onClick={() => handleSend()} disabled={isPending}>
              {isPending ? "Thinking..." : "Ask"}
            </SufiButton>
          </div>
        </BorderGlow>
      </div>

      {/* Suggestion chips — fire immediately on click */}
      {!data && !isPending && (
        <div className="flex flex-wrap gap-2 mt-5 justify-center">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => handleSend(s)}
              className="text-xs px-4 py-2 rounded-full bg-white/4 border border-white/8 text-gray-400 hover:text-white hover:border-white/20 transition-all"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Thinking */}
      {isPending && (
        <div className="mt-10 flex flex-col items-center gap-4">
          <div className="flex gap-2">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <p className="text-xs text-gray-500">Searching restaurants...</p>
        </div>
      )}

      {/* Response */}
      {data && (
        <div className="mt-8 w-full max-w-5xl flex flex-col gap-6">
          {/* AI reply bubble */}
          <div className="max-w-2xl mx-auto w-full p-4 rounded-xl bg-accent/[0.07] border border-accent/15 text-sm text-gray-200 leading-relaxed">
            {data.reply}
          </div>

          {/* Results grid — NoiseCard */}
          {data.restaurants && data.restaurants.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.restaurants.slice(0, 6).map((r) => (
                <NoiseCard key={r.id} className="flex flex-col p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-white/6 flex items-center justify-center text-lg">🍽️</div>
                    {r.rating && (
                      <span className="text-xs text-yellow-400">★ {r.rating.toFixed(1)}</span>
                    )}
                  </div>
                  <p className="font-semibold text-white">{r.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{r.cuisine} · {r.city}</p>
                  {r.reason && (
                    <p className="text-xs text-accent mt-2 italic flex-1">✨ {r.reason}</p>
                  )}
                  <SufiButton
                    className="mt-4 w-full"
                    onClick={() => onBook({ id: r.id, name: r.name })}
                  >
                    Book table
                  </SufiButton>
                </NoiseCard>
              ))}
            </div>
          )}

          <button
            onClick={() => reset()}
            className="text-xs text-gray-600 hover:text-gray-400 transition-colors self-start"
          >
            ← Ask something else
          </button>
        </div>
      )}
    </div>
  );
}

// ── Discover Tab ──────────────────────────────────────────────────────────────
function DiscoverTab({ onBook }: { onBook: (r: { id: number; name: string }) => void }) {
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["discover", city],
    queryFn: () => restaurantApi.discover(city || undefined, 1, 24).then((r) => r.restaurants),
  });

  const filtered = (data || []).filter((r) =>
    search
      ? r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.cuisine?.toLowerCase().includes(search.toLowerCase())
      : true
  );

  return (
    <div className="px-6 py-8 max-w-6xl mx-auto">
      <div className="flex gap-3 mb-8 max-w-2xl">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search restaurants or cuisine..."
          className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent/50 placeholder-gray-500"
        />
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="City"
          className="w-32 bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent/50 placeholder-gray-500"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-36 rounded-xl bg-white/[0.04] animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-16">No restaurants found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r, i) => (
            <RestaurantCard key={r.id} restaurant={r} index={i} onBook={onBook} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Trending Tab ──────────────────────────────────────────────────────────────
function TrendingTab({ onBook }: { onBook: (r: { id: number; name: string }) => void }) {
  const { data, isLoading } = useQuery({
    queryKey: ["trending"],
    queryFn: () => restaurantApi.trending(),
  });

  return (
    <div className="px-6 py-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold">Trending Now</h2>
        <p className="text-sm text-gray-400 mt-1">Restaurants gaining rapid popularity this week</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-36 rounded-xl bg-white/[0.04] animate-pulse" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-16">No trending restaurants right now.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(data as Restaurant[]).map((r, i) => (
            <RestaurantCard key={r.id} restaurant={r} index={i} onBook={onBook} badge="Trending" />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Shared Restaurant Card ────────────────────────────────────────────────────
function RestaurantCard({
  restaurant: r,
  index,
  onBook,
  badge,
}: {
  restaurant: Restaurant;
  index: number;
  onBook: (r: { id: number; name: string }) => void;
  badge?: string;
}) {
  return (
    <div
      className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 hover:border-white/15 transition-all"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center text-lg">🍽️</div>
        {(badge || r.is_featured) && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/20">
            {badge || "Featured"}
          </span>
        )}
      </div>
      <p className="font-semibold text-white">{r.name}</p>
      <p className="text-xs text-gray-400 mt-0.5">{r.cuisine} · {r.city}</p>
      {r.description && (
        <p className="text-xs text-gray-500 mt-2 line-clamp-2">{r.description}</p>
      )}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-3">
          {r.rating && <span className="text-xs text-yellow-400">★ {r.rating.toFixed(1)}</span>}
          {r.price_range && <span className="text-xs text-gray-500">{r.price_range}</span>}
        </div>
        <SufiButton onClick={() => onBook({ id: r.id, name: r.name })}>
          Book
        </SufiButton>
      </div>
    </div>
  );
}
