"use client";
import Link from "next/link";
import { useState } from "react";
import AuthModal from "@/components/auth/AuthModal";
import { useAuth } from "@/store/appStore";

const features = [
  {
    icon: "◎",
    title: "AI Concierge",
    desc: "Describe what you're craving in plain language. SUFI finds the right restaurant, checks availability, and books your table — all in one conversation.",
  },
  {
    icon: "⬡",
    title: "Smart Discovery",
    desc: "A 6-signal ranking engine weighs quality, engagement, trending activity, location, personalization, and promotions to surface the best match for you.",
  },
  {
    icon: "◈",
    title: "Real-time Booking",
    desc: "Live seat availability with instant confirmation. No phone calls, no waiting. Your reservation is locked the moment you confirm.",
  },
  {
    icon: "⬟",
    title: "Trending Now",
    desc: "A live feed of restaurants gaining rapid popularity. Discover what the city is talking about before everyone else does.",
  },
  {
    icon: "◇",
    title: "Personalized for You",
    desc: "Every reservation and search teaches SUFI more about your taste. The more you use it, the smarter your recommendations get.",
  },
  {
    icon: "△",
    title: "Owner Intelligence",
    desc: "Restaurant operators get a full control panel — live reservations, demand forecasting, no-show prediction, waitlist automation, and analytics.",
  },
];

const stats = [
  { value: "6-signal", label: "Ranking engine" },
  { value: "AI-first", label: "Concierge booking" },
  { value: "Real-time", label: "Seat availability" },
  { value: "Zero", label: "Per-order commission" },
];

export default function LandingPage() {
  const { user, logout } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white">
      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-[700px] h-[700px] rounded-full bg-blue-500/10 blur-[140px] -top-40 -left-20" />
        <div className="absolute w-[500px] h-[500px] rounded-full bg-purple-500/8 blur-[120px] bottom-0 right-0" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-white/[0.06]">
        <div>
          <span className="text-lg font-bold tracking-tight">SUFI</span>
          <span className="text-xs text-gray-500 ml-2">Smart Unified Food Intelligence</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/app" className="text-sm text-gray-400 hover:text-white transition-colors">
            Explore
          </Link>
          {user ? (
            <div className="flex items-center gap-3">
              {(user.role === "owner" || user.role === "restaurant_owner") && (
                <Link href="/owner" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Owner OS
                </Link>
              )}
              <span className="text-sm text-gray-400">{user.name}</span>
              <button onClick={logout} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
                Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAuthOpen(true)}
              className="text-sm px-4 py-2 rounded-lg bg-accent/15 text-accent border border-accent/20 hover:bg-accent/25 transition-all"
            >
              Sign In
            </button>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-28 pb-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          Now live — AI-powered restaurant discovery
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight max-w-4xl leading-tight">
          Where to eat,
          <br />
          <span className="text-accent">solved instantly.</span>
        </h1>

        <p className="text-gray-400 text-lg mt-6 max-w-xl leading-relaxed">
          SUFI combines AI search, real-time availability, and intelligent
          recommendations to make every dining decision effortless.
        </p>

        <div className="flex items-center gap-4 mt-10">
          <Link
            href="/app"
            className="px-8 py-3.5 rounded-xl bg-accent text-white font-medium hover:bg-accent/90 transition-all text-sm"
          >
            Start Exploring
          </Link>
          {!user && (
            <button
              onClick={() => setAuthOpen(true)}
              className="px-8 py-3.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition-all text-sm"
            >
              Create Account
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-8 mt-20">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-6 pb-24 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold">Everything in one platform</h2>
          <p className="text-gray-400 mt-3 text-sm max-w-md mx-auto">
            Built for diners who want frictionless discovery and owners who want real operational control.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 hover:border-white/15 transition-all"
            >
              <span className="text-2xl text-accent">{f.icon}</span>
              <h3 className="font-semibold mt-3 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA strip */}
      <section className="relative z-10 border-t border-white/[0.06] px-6 py-16 text-center">
        <h2 className="text-2xl font-bold mb-3">Ready to find your next table?</h2>
        <p className="text-gray-400 text-sm mb-8">
          No account needed to explore. Sign up when you're ready to book.
        </p>
        <Link
          href="/app"
          className="inline-block px-10 py-3.5 rounded-xl bg-accent text-white font-medium hover:bg-accent/90 transition-all text-sm"
        >
          Open SUFI
        </Link>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.06] px-8 py-6 flex items-center justify-between text-xs text-gray-600">
        <span>SUFI · Smart Unified Food Intelligence · March 2026</span>
        <span>github.com/crumbler002-bit/SUFI</span>
      </footer>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
