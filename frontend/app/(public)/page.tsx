"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";

function useCounter(target: number, duration = 1400) {
  const [count, setCount] = useState(0);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    ref.current = setInterval(() => {
      start = Math.min(start + step, target);
      setCount(Math.floor(start));
      if (start >= target && ref.current) clearInterval(ref.current);
    }, 16);
    return () => { if (ref.current) clearInterval(ref.current); };
  }, []);
  return count;
}

function FadeInSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 28 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay, ease: "easeOut" }}>
      {children}
    </motion.div>
  );
}

function FeatureCard({ icon, name, desc, href, iconBg }: { icon: string; name: string; desc: string; href: string; iconBg: string }) {
  return (
    <Link href={href}>
      <motion.div whileHover={{ y: -4, borderColor: "rgba(124,58,237,0.5)" }} transition={{ duration: 0.2 }}
        className="relative group bg-[#0F0D18] border border-[#23203A] rounded-[14px] p-7 cursor-pointer overflow-hidden h-full">
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute -top-16 -left-16 w-40 h-40 bg-purple-600 blur-3xl opacity-20 rounded-full" />
        </div>
        <div className="relative z-10">
          <div className={`w-11 h-11 rounded-[11px] flex items-center justify-center text-xl mb-[18px] border ${iconBg}`}>{icon}</div>
          <div className="text-[16px] font-semibold text-[#ede9ff] mb-[10px]">{name}</div>
          <p className="text-[13px] text-[#9b94c4] leading-relaxed mb-4">{desc}</p>
          <span className="text-[12px] text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">Open page →</span>
        </div>
      </motion.div>
    </Link>
  );
}

function PriceCard({ plan, price, desc, features, featured, ctaLabel, onCta }: {
  plan: string; price: string; desc: string; features: string[];
  featured?: boolean; ctaLabel: string; onCta?: () => void;
}) {
  return (
    <div className={`relative rounded-[16px] p-8 transition-transform hover:-translate-y-[2px] ${featured ? "bg-gradient-to-br from-purple-900/20 to-blue-900/10 border border-purple-500/40" : "bg-[#0F0D18] border border-[#23203A]"}`}>
      {featured && <span className="absolute top-4 right-4 text-[9px] font-mono text-violet-300 bg-purple-500/15 border border-purple-500/25 rounded-full px-2 py-[3px] uppercase tracking-widest">Most Popular</span>}
      <div className="text-[11px] text-[#5a5480] font-mono uppercase tracking-[.1em] mb-3">{plan}</div>
      <div className="font-serif text-[42px] text-[#ede9ff] mb-1">{price}<span className="text-[18px] font-sans text-[#5a5480]">/mo</span></div>
      <p className="text-[12px] text-[#5a5480] mb-6">{desc}</p>
      <ul className="space-y-[10px] mb-7">
        {features.map((f) => <li key={f} className="flex items-center gap-2 text-[13px] text-[#9b94c4]"><span className="text-emerald-400 text-[12px]">✓</span> {f}</li>)}
      </ul>
      <Button variant={featured ? "primary" : "secondary"} size="lg" className="w-full" onClick={onCta}>{ctaLabel}</Button>
    </div>
  );
}

export default function LandingPage() {
  const rev = useCounter(48); const noshow = useCounter(67); const actions = useCounter(24); const rests = useCounter(500);

  return (
    <div className="relative min-h-screen bg-[#07060C] text-[#ede9ff] overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute w-[700px] h-[700px] -top-32 -left-48 rounded-full bg-purple-600 blur-[160px] opacity-[0.13]" />
        <div className="absolute w-[500px] h-[500px] -top-16 -right-32 rounded-full bg-blue-500 blur-[140px] opacity-[0.09]" />
      </div>

      <nav className="fixed top-0 left-0 right-0 z-50 h-[58px] flex items-center justify-between px-10 bg-[#07060C]/80 backdrop-blur-[24px] border-b border-white/[0.06]">
        <Link href="/" className="flex items-center gap-[10px]">
          <div className="w-8 h-8 rounded-[9px] bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white text-[15px] font-bold shadow-[0_0_14px_rgba(124,58,237,0.4)]">S</div>
          <span className="font-serif text-[20px] tracking-[0.02em]">SUFI</span>
        </Link>
        <div className="flex items-center gap-1">
          {["Features","How it works","Pricing","Reviews"].map((l) => (
            <button key={l} onClick={() => document.getElementById(l.toLowerCase().replace(/ /g,"-"))?.scrollIntoView({ behavior:"smooth" })}
              className="px-3 py-[6px] text-[13px] text-[#9b94c4] hover:text-[#ede9ff] hover:bg-white/[0.05] rounded-[7px] transition-all">{l}</button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Link href="/login"><Button variant="secondary" size="sm">Sign in</Button></Link>
          <Link href="/login?mode=signup"><Button size="sm">Start free trial</Button></Link>
        </div>
      </nav>

      <section className="min-h-screen flex flex-col items-center justify-center text-center px-10 pt-[100px] pb-20">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-[6px] bg-purple-500/10 border border-purple-500/30 rounded-full text-[11px] text-violet-300 font-mono uppercase tracking-[.08em] mb-7">
          <span className="w-[5px] h-[5px] rounded-full bg-violet-400 dot-green" />
          AI-Powered Restaurant OS · v2.4
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.08 }}
          className="font-serif text-[72px] leading-[1.05] tracking-[-0.02em] mb-3">
          Your restaurant,<br /><em className="text-violet-300">intelligently</em>
        </motion.h1>
        <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.13 }}
          className="font-serif text-[72px] leading-[1.05] tracking-[-0.02em] mb-6">
          <span className="bg-gradient-to-r from-violet-300 via-blue-400 to-teal-400 bg-clip-text text-transparent">operated.</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
          className="text-[18px] text-[#9b94c4] max-w-[580px] leading-[1.65] font-light mb-10">
          SUFI is the autonomous operating system for modern restaurants — combining real-time AI, predictive intelligence, and automated execution in one seamless platform.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }} className="flex gap-3 mb-16">
          <Link href="/login?mode=signup"><Button size="lg" className="gap-2 shadow-[0_0_30px_rgba(124,58,237,0.35)]">⚡ Start free trial</Button></Link>
          <Link href="/dashboard"><Button variant="secondary" size="lg">View live demo →</Button></Link>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.35 }}
          className="flex gap-12 border-t border-[#23203A] pt-10">
          {[{ val:`₹${rev}K`, lbl:"Avg Revenue Uplift" },{ val:`${noshow}%`, lbl:"No-show Reduction" },{ val:`${actions}+`, lbl:"Automations Daily" },{ val:`${rests}+`, lbl:"Restaurants Active" }].map(({ val, lbl }) => (
            <div key={lbl} className="text-center">
              <div className="font-serif text-[36px] text-[#ede9ff] mb-1">{val}</div>
              <div className="text-[12px] text-[#5a5480] font-mono">{lbl}</div>
            </div>
          ))}
        </motion.div>
      </section>

      <section id="features" className="px-10 py-24">
        <FadeInSection>
          <p className="text-center text-[11px] text-[#5a5480] font-mono uppercase tracking-[.1em] mb-4">What SUFI does</p>
          <h2 className="font-serif text-[48px] text-center leading-[1.1] mb-4">Intelligence at every level</h2>
          <p className="text-[16px] text-[#9b94c4] text-center max-w-[500px] mx-auto font-light mb-14 leading-[1.65]">From demand forecasting to autonomous execution — SUFI thinks, decides, and acts so you don&apos;t have to.</p>
        </FadeInSection>
        <div className="grid grid-cols-3 gap-4 max-w-[1100px] mx-auto">
          {[
            { icon:"🧠", name:"AI Intelligence Center",    href:"/owner/intelligence", iconBg:"bg-purple-500/12 border-purple-500/25", desc:"Real-time demand forecasting, no-show prediction, and revenue optimization." },
            { icon:"⚡", name:"Live Operations Dashboard", href:"/dashboard",           iconBg:"bg-blue-500/12 border-blue-500/25",   desc:"Your floor, reservations, and revenue in real-time. WebSocket-driven activity feed." },
            { icon:"🤖", name:"AI Concierge",             href:"/ai-concierge",        iconBg:"bg-teal-500/12 border-teal-500/25",   desc:"A structured command interface — not a chatbot. Every response is a card with actions." },
            { icon:"⚙️", name:"Autonomous Automation",    href:"/owner/automation",    iconBg:"bg-amber-500/12 border-amber-500/25", desc:"Rules-based automation that executes overbooking, reschedules, and pricing changes." },
            { icon:"📈", name:"Revenue Optimization",      href:"/owner/intelligence",  iconBg:"bg-red-500/12 border-red-500/25",     desc:"Dynamic pricing, demand-based overbooking, and gap-filling campaigns." },
            { icon:"📱", name:"Guest Intelligence",        href:"/ai-concierge",        iconBg:"bg-teal-500/12 border-teal-500/25",   desc:"AI profiles, preference tracking, and predictive no-show scoring." },
          ].map((f) => <FadeInSection key={f.name}><FeatureCard {...f} /></FadeInSection>)}
        </div>
      </section>

      <section id="how-it-works" className="px-10 py-24 border-t border-[#23203A]">
        <FadeInSection>
          <p className="text-center text-[11px] text-[#5a5480] font-mono uppercase tracking-[.1em] mb-4">How it works</p>
          <h2 className="font-serif text-[48px] text-center leading-[1.1] mb-4">Up and running in minutes</h2>
          <p className="text-[16px] text-[#9b94c4] text-center max-w-[500px] mx-auto font-light mb-16 leading-[1.65]">SUFI learns your restaurant, then runs it — no manual setup, no guesswork.</p>
        </FadeInSection>
        <div className="max-w-[900px] mx-auto relative">
          <div className="absolute top-[28px] left-[calc(12.5%+28px)] right-[calc(12.5%+28px)] h-px bg-gradient-to-r from-purple-500/30 via-blue-500/30 to-teal-500/30 hidden md:block" />
          <div className="grid grid-cols-4 gap-6">
            {[
              { step:"01", icon:"🔌", title:"Connect", desc:"Link your reservation system, POS, and floor plan in one click." },
              { step:"02", icon:"🧠", title:"AI Learns", desc:"SUFI analyzes your patterns — demand, no-shows, peak hours, guest behavior." },
              { step:"03", icon:"⚡", title:"Automates", desc:"Rules fire automatically — overbooking, reschedules, pricing, waitlist fills." },
              { step:"04", icon:"📈", title:"Revenue Grows", desc:"Average 14–22% uplift within 30 days. No manual work required." },
            ].map(({ step, icon, title, desc }, i) => (
              <FadeInSection key={step} delay={i * 0.1}>
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-5">
                    <div className="w-14 h-14 rounded-full bg-[#0F0D18] border border-[#332F52] flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(124,58,237,0.15)]">{icon}</div>
                    <span className="absolute -top-1 -right-1 text-[9px] font-mono text-violet-400 bg-purple-500/15 border border-purple-500/25 rounded-full w-5 h-5 flex items-center justify-center">{step}</span>
                  </div>
                  <div className="text-[15px] font-semibold text-[#ede9ff] mb-2">{title}</div>
                  <p className="text-[12px] text-[#9b94c4] leading-relaxed">{desc}</p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="px-10 py-24">
        <FadeInSection>
          <p className="text-center text-[11px] text-[#5a5480] font-mono uppercase tracking-[.1em] mb-4">Pricing</p>
          <h2 className="font-serif text-[48px] text-center leading-[1.1] mb-14">Grow with confidence</h2>
        </FadeInSection>
        <div className="grid grid-cols-3 gap-4 max-w-[900px] mx-auto">
          <PriceCard plan="Starter" price="₹4,999" desc="For single-location restaurants." features={["Intelligence dashboard","Basic automation (3 rules)","AI concierge","Email support"]} ctaLabel="Get started" onCta={() => window.location.href="/login"} />
          <PriceCard plan="Growth" price="₹12,999" featured desc="For restaurants serious about AI-driven revenue growth." features={["Everything in Starter","Unlimited automation rules","Dynamic pricing engine","WebSocket real-time ops","Guest intelligence profiles","Priority support"]} ctaLabel="Start free trial" onCta={() => window.location.href="/login"} />
          <PriceCard plan="Enterprise" price="Custom" desc="Multi-location groups and chains." features={["Everything in Growth","Multi-location dashboard","Custom AI model training","Dedicated success manager","SLA + 24/7 support"]} ctaLabel="Contact sales" />
        </div>
      </section>

      <section id="reviews" className="px-10 py-24 border-t border-[#23203A]">
        <FadeInSection>
          <p className="text-center text-[11px] text-[#5a5480] font-mono uppercase tracking-[.1em] mb-4">Reviews</p>
          <h2 className="font-serif text-[48px] text-center leading-[1.1] mb-4">Owners love it</h2>
          <p className="text-[16px] text-[#9b94c4] text-center max-w-[500px] mx-auto font-light mb-14 leading-[1.65]">Real results from real restaurant operators across India.</p>
        </FadeInSection>
        <div className="grid grid-cols-3 gap-4 max-w-[1100px] mx-auto">
          {[
            { name:"Arjun Mehta", role:"Owner, Spice Route · Mumbai", avatar:"AM", quote:"Revenue went up 19% in the first month. The automation handles overbooking better than my entire front-of-house team.", stars:5 },
            { name:"Priya Nair", role:"GM, The Coastal Table · Bangalore", avatar:"PN", quote:"The no-show prediction is scary accurate. We stopped losing ₹40K a week to empty tables. SUFI just handles it.", stars:5 },
            { name:"Rahul Sharma", role:"Owner, Dhaba 1947 · Delhi", avatar:"RS", quote:"I was skeptical about AI for a traditional restaurant. Three months in — I can't imagine running without it.", stars:5 },
            { name:"Sneha Kapoor", role:"Ops Director, Chai & Co · Pune", avatar:"SK", quote:"The concierge alone is worth it. Guests get instant answers, reservations get made, and I don't have to touch anything.", stars:5 },
            { name:"Vikram Iyer", role:"Owner, Tanjore Kitchen · Chennai", avatar:"VI", quote:"Dynamic pricing during peak hours added 12% to our weekend revenue. Set it once, forget it.", stars:5 },
            { name:"Meera Joshi", role:"F&B Manager, Rooftop 360 · Hyderabad", avatar:"MJ", quote:"The intelligence dashboard gives me a full picture before I even walk in. I know what the day looks like before it starts.", stars:5 },
          ].map(({ name, role, avatar, quote, stars }, i) => (
            <FadeInSection key={name} delay={(i % 3) * 0.1}>
              <motion.div whileHover={{ y: -3, borderColor: "rgba(124,58,237,0.35)" }} transition={{ duration: 0.2 }}
                className="bg-[#0F0D18] border border-[#23203A] rounded-[14px] p-6 h-full flex flex-col">
                <div className="flex gap-[3px] mb-4">
                  {Array.from({ length: stars }).map((_, j) => <span key={j} className="text-amber-400 text-[13px]">★</span>)}
                </div>
                <p className="text-[13px] text-[#9b94c4] leading-relaxed flex-1 mb-5">&ldquo;{quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600/40 to-blue-600/40 border border-purple-500/25 flex items-center justify-center text-[11px] font-mono text-violet-300">{avatar}</div>
                  <div>
                    <div className="text-[13px] font-semibold text-[#ede9ff]">{name}</div>
                    <div className="text-[11px] text-[#5a5480]">{role}</div>
                  </div>
                </div>
              </motion.div>
            </FadeInSection>
          ))}
        </div>
      </section>

      <section className="relative px-10 py-32 text-center overflow-hidden">
        <FadeInSection>
          <h2 className="font-serif text-[56px] leading-[1.1] mb-5">Ready to run smarter?</h2>
          <p className="text-[16px] text-[#9b94c4] mb-9">Join 500+ restaurants already using SUFI to automate operations and grow revenue.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/login"><Button size="lg" className="shadow-[0_0_30px_rgba(124,58,237,0.35)]">⚡ Start free trial</Button></Link>
            <Link href="/dashboard"><Button variant="secondary" size="lg">See live demo →</Button></Link>
          </div>
        </FadeInSection>
      </section>

      <footer className="border-t border-[#23203A] px-10 py-5 text-center text-[12px] text-[#38344f] font-mono">
        © 2026 SUFI Technologies Pvt. Ltd. · Built for the future of hospitality.
      </footer>
    </div>
  );
}
