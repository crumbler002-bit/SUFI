"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { login, register, setToken } from "@/lib/api";

function AuthForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("demo@sufi.ai");
  const [password, setPassword] = useState("demo1234");
  const [role, setRole]         = useState<"owner" | "customer">("owner");
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    if (params.get("mode") === "signup") {
      setMode("signup");
      setEmail("");
      setPassword("");
    }
  }, [params]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (mode === "signin") {
        const res = await login(email, password);
        setToken(res.access_token);
        toast.success("Welcome back! Loading dashboard…");
      } else {
        if (!name.trim()) { toast.error("Name is required"); setLoading(false); return; }
        const res = await register(email, password, name);
        setToken(res.access_token);
        toast.success("Account created! Setting up your dashboard…");
      }
      router.push("/owner/intelligence");
    } catch {
      // Fallback for demo mode — store a placeholder so pages don't 401-loop
      setToken("demo_mode");
      toast.success("Demo mode — loading dashboard…");
      router.push("/owner/intelligence");
    } finally {
      setLoading(false);
    }
  };

  const isSignup = mode === "signup";

  return (
    <div className="min-h-screen grid grid-cols-2">
      {/* Left panel */}
      <div className="relative bg-[#0F0D18] border-r border-[#23203A] flex flex-col items-center justify-center px-16 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-purple-600 blur-[160px] opacity-[0.15]" />
        <div className="relative text-center max-w-[360px]">
          <Link href="/" className="flex items-center justify-center gap-3 mb-10">
            <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white text-[16px] font-bold shadow-[0_0_20px_rgba(124,58,237,0.4)]">S</div>
            <span className="font-serif text-[22px]">SUFI</span>
          </Link>
          <h1 className="font-serif text-[52px] leading-[1.1] mb-5">The restaurant<br />that <em className="text-violet-300">thinks</em><br />for itself.</h1>
          <ul className="text-left space-y-4">
            {["Real-time AI Decision Center","Autonomous automation engine","+14–22% average revenue uplift","No credit card required"].map((f) => (
              <li key={f} className="flex items-center gap-3 text-[13px] text-[#9b94c4]"><span className="text-emerald-400">✓</span> {f}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-col items-center justify-center px-16 bg-[#07060C]">
        <div className="w-full max-w-[380px]">
          {/* Tab toggle */}
          <div className="flex bg-[#0F0D18] border border-[#23203A] rounded-[10px] p-1 mb-8">
            {(["signin","signup"] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)}
                className={`flex-1 py-[8px] text-[13px] rounded-[7px] transition-all font-medium ${mode === m ? "bg-purple-600 text-white shadow-[0_0_12px_rgba(124,58,237,0.4)]" : "text-[#5a5480] hover:text-[#9b94c4]"}`}>
                {m === "signin" ? "Sign in" : "Sign up"}
              </button>
            ))}
          </div>

          <h2 className="font-serif text-[30px] mb-2">{isSignup ? "Create your account" : "Sign in to SUFI"}</h2>
          <p className="text-[13px] text-[#5a5480] mb-8">
            {isSignup ? "Start your free trial — no credit card required." : "Enter your credentials to access your dashboard."}
          </p>

          <div className="space-y-4 mb-5">
            {isSignup && (
              <div>
                <label className="block text-[11px] text-[#5a5480] font-mono uppercase tracking-[.06em] mb-2">Full Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name"
                  className="w-full bg-[#161422] border border-[#332F52] rounded-[9px] px-4 py-[11px] text-[13px] text-[#ede9ff] outline-none focus:border-purple-500/50 transition-colors placeholder:text-[#5a5480]" />
              </div>
            )}
            <div>
              <label className="block text-[11px] text-[#5a5480] font-mono uppercase tracking-[.06em] mb-2">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="owner@restaurant.com"
                className="w-full bg-[#161422] border border-[#332F52] rounded-[9px] px-4 py-[11px] text-[13px] text-[#ede9ff] outline-none focus:border-purple-500/50 transition-colors placeholder:text-[#5a5480]" />
            </div>
            <div>
              <label className="block text-[11px] text-[#5a5480] font-mono uppercase tracking-[.06em] mb-2">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className="w-full bg-[#161422] border border-[#332F52] rounded-[9px] px-4 py-[11px] text-[13px] text-[#ede9ff] outline-none focus:border-purple-500/50 transition-colors placeholder:text-[#5a5480]" />
            </div>
            {isSignup && (
              <div>
                <label className="block text-[11px] text-[#5a5480] font-mono uppercase tracking-[.06em] mb-2">I am a</label>
                <div className="flex gap-2">
                  {(["owner","customer"] as const).map((r) => (
                    <button key={r} onClick={() => setRole(r)}
                      className={`flex-1 py-[10px] text-[13px] rounded-[9px] border transition-all capitalize ${role === r ? "border-purple-500/50 bg-purple-500/10 text-violet-300" : "border-[#332F52] bg-[#161422] text-[#5a5480] hover:text-[#9b94c4]"}`}>
                      {r === "owner" ? "🍽 Restaurant Owner" : "👤 Guest / Customer"}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Button size="lg" className="w-full mb-4 shadow-[0_0_24px_rgba(124,58,237,0.3)]" loading={loading} onClick={handleSubmit}>
            {isSignup ? "Create account →" : "Sign in to dashboard →"}
          </Button>

          {!isSignup && (
            <p className="text-center text-[12px] text-[#5a5480] mb-4">Demo credentials pre-filled — just click Sign in</p>
          )}

          <p className="text-center text-[12px] text-[#5a5480] mb-6">
            {isSignup ? "Already have an account? " : "Don't have an account? "}
            <button onClick={() => setMode(isSignup ? "signin" : "signup")} className="text-violet-400 hover:text-violet-300 transition-colors">
              {isSignup ? "Sign in" : "Sign up free"}
            </button>
          </p>

          <Link href="/"><Button variant="secondary" size="lg" className="w-full">← Back to landing page</Button></Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#07060C]" />}>
      <AuthForm />
    </Suspense>
  );
}
