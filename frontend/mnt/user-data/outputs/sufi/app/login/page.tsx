"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("demo@sufi.ai");
  const [password, setPassword] = useState("demo1234");
  const [loading, setLoading]   = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    // Simulate auth — replace with real NextAuth / API call
    await new Promise((r) => setTimeout(r, 800));
    toast.success("Welcome back! Loading dashboard…");
    router.push("/owner/intelligence");
  };

  return (
    <div className="min-h-screen grid grid-cols-2">
      {/* ── LEFT: Brand panel ── */}
      <div className="relative bg-[#0F0D18] border-r border-[#23203A] flex flex-col items-center justify-center px-16 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-purple-600 blur-[160px] opacity-[0.15]" />
        <div className="absolute -bottom-20 -right-10 w-64 h-64 rounded-full bg-blue-500 blur-[140px] opacity-[0.10]" />
        <div className="relative text-center max-w-[360px]">
          <Link href="/" className="flex items-center justify-center gap-3 mb-10">
            <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white text-[16px] font-bold shadow-[0_0_20px_rgba(124,58,237,0.4)]">S</div>
            <span className="font-serif text-[22px]">SUFI</span>
          </Link>
          <h1 className="font-serif text-[52px] leading-[1.1] mb-5">
            The restaurant<br />that <em className="text-violet-300">thinks</em><br />for itself.
          </h1>
          <p className="text-[15px] text-[#9b94c4] leading-[1.65] font-light mb-10">
            Join 500+ restaurants using SUFI&apos;s AI to reduce no-shows, maximize revenue, and run autonomously.
          </p>
          <ul className="text-left space-y-4">
            {[
              "Real-time AI Decision Center",
              "Autonomous automation engine",
              "+14–22% average revenue uplift",
              "No credit card required",
            ].map((f) => (
              <li key={f} className="flex items-center gap-3 text-[13px] text-[#9b94c4]">
                <span className="text-emerald-400">✓</span> {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── RIGHT: Auth form ── */}
      <div className="flex flex-col items-center justify-center px-16 bg-[#07060C]">
        <div className="w-full max-w-[380px]">
          <h2 className="font-serif text-[30px] mb-2">Sign in to SUFI</h2>
          <p className="text-[13px] text-[#5a5480] mb-8">Enter your credentials to access your dashboard.</p>

          <div className="space-y-4 mb-5">
            <div>
              <label className="block text-[11px] text-[#5a5480] font-mono uppercase tracking-[.06em] mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@restaurant.com"
                className="w-full bg-[#161422] border border-[#332F52] rounded-[9px] px-4 py-[11px] text-[13px] text-[#ede9ff] font-sans outline-none focus:border-purple-500/50 transition-colors placeholder:text-[#5a5480]"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[#5a5480] font-mono uppercase tracking-[.06em] mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="w-full bg-[#161422] border border-[#332F52] rounded-[9px] px-4 py-[11px] text-[13px] text-[#ede9ff] font-sans outline-none focus:border-purple-500/50 transition-colors placeholder:text-[#5a5480]"
              />
            </div>
          </div>

          <Button
            size="lg"
            className="w-full mb-4 shadow-[0_0_24px_rgba(124,58,237,0.3)]"
            loading={loading}
            onClick={handleLogin}
          >
            Sign in to dashboard →
          </Button>

          <p className="text-center text-[12px] text-[#5a5480] mb-6">
            Demo credentials pre-filled — just click Sign in
          </p>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-[#23203A]" />
            <span className="text-[12px] text-[#5a5480]">or</span>
            <div className="flex-1 h-px bg-[#23203A]" />
          </div>

          <Link href="/">
            <Button variant="secondary" size="lg" className="w-full">← Back to landing page</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
