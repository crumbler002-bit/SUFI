"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

import { Layout }    from "@/components/Layout";
import { Card }      from "@/components/ui/Card";
import { Button }    from "@/components/ui/Button";
import { Badge }     from "@/components/ui/Badge";
import { useConciergeChat, useClearSession } from "@/hooks/useConcierge";

// ── Message types ─────────────────────────────────────────────────────────────
type Role = "user" | "assistant";

interface Message {
  id: number;
  role: Role;
  content: string;        // user plain text
  structured?: StructuredUI; // assistant structured UI
}

type StructuredUI =
  | { type: "welcome" }
  | { type: "table_availability" }
  | { type: "booking_form" }
  | { type: "restaurant_recommendation" }
  | { type: "metric_summary" }
  | { type: "risk_report" };

// ── Intent matching ───────────────────────────────────────────────────────────
function matchIntent(text: string): StructuredUI["type"] {
  const t = text.toLowerCase();
  if (t.includes("table") || t.includes("available") || t.includes("slot")) return "table_availability";
  if (t.includes("book") || t.includes("reserv") || t.includes("seat"))      return "booking_form";
  if (t.includes("recommend") || t.includes("restaurant") || t.includes("suggest")) return "restaurant_recommendation";
  if (t.includes("revenue") || t.includes("forecast") || t.includes("money")) return "metric_summary";
  if (t.includes("risk") || t.includes("no-show") || t.includes("cancel"))   return "risk_report";
  return "restaurant_recommendation";
}

// ── Structured UI renderers ───────────────────────────────────────────────────
function TableAvailabilityCard() {
  const [selected, setSelected] = useState<string | null>("8:00");
  const slots = ["7:00","7:15","7:30","7:45","8:00","8:15","8:30","8:45","9:00","9:15"];
  const partials = new Set(["7:30","8:45"]);
  const fulls    = new Set(["9:00","9:15"]);
  return (
    <Card accent="border-[#23203A]">
      <div className="flex items-start justify-between mb-4">
        <div className="text-[13px] font-medium text-[#ede9ff]">Available Tables · Tonight · 8:00 PM</div>
        <Badge variant="live">LIVE</Badge>
      </div>
      <div className="grid grid-cols-5 gap-[5px] mb-4">
        {slots.map((s) => {
          const isFull    = fulls.has(s);
          const isPartial = partials.has(s);
          const isSel     = selected === s;
          return (
            <button
              key={s}
              disabled={isFull}
              onClick={() => !isFull && setSelected(s)}
              className={`py-[6px] px-[3px] rounded-[7px] text-[10px] font-mono border transition-all text-center
                ${isFull    ? "bg-[#1E1B2E] border-[#23203A] text-[#5a5480] cursor-not-allowed opacity-50"
                : isPartial ? "bg-amber-500/8 border-amber-500/20 text-amber-300 hover:bg-amber-500/15"
                : isSel     ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-200"
                :              "bg-emerald-500/8 border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/15"}`}
            >{s}</button>
          );
        })}
      </div>
      <div className="flex gap-2">
        <Button variant="green" className="flex-1" size="sm" onClick={() => toast.success(`Booking slot ${selected} confirmed!`)}>
          Book {selected}
        </Button>
        <Button variant="secondary" size="sm" onClick={() => toast.info("Showing all available dates…")}>All Dates</Button>
      </div>
      <div className="mt-3 bg-purple-500/[0.04] border border-purple-500/15 rounded-[8px] px-3 py-[10px]">
        <div className="text-[10px] text-violet-400 font-mono mb-1">● AI Note</div>
        <p className="text-[12px] text-[#9b94c4] leading-[1.6]">
          8 PM is peak demand tonight. 3 tables at no-show risk.{" "}
          <strong className="text-[#ede9ff]">8:15 PM</strong> recommended for confirmed seating.
        </p>
      </div>
    </Card>
  );
}

function BookingFormCard() {
  const [confirmed, setConfirmed] = useState(false);
  return (
    <Card accent="border-emerald-500/25">
      <div className="flex items-start justify-between mb-4">
        <div className="text-[13px] font-medium text-[#ede9ff]">New Reservation · AI Pre-filled</div>
        <Badge variant={confirmed ? "ok" : "warn"}>{confirmed ? "CONFIRMED" : "DRAFT"}</Badge>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          { l: "Restaurant", v: "Rangoli" },
          { l: "Date",       v: "Tonight" },
          { l: "Time",       v: "7:30 PM" },
          { l: "Guests",     v: "4 people" },
          { l: "Table",      v: "T6 (window)" },
          { l: "Est. Value", v: "₹6,560", vc: "text-emerald-400" },
        ].map(({ l, v, vc }) => (
          <div key={l} className="bg-[#1E1B2E] rounded-[7px] px-[10px] py-[8px]">
            <div className="text-[9px] text-[#5a5480] font-mono uppercase tracking-[.06em] mb-1">{l}</div>
            <div className={`text-[13px] font-medium ${vc ?? "text-[#ede9ff]"}`}>{v}</div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Button variant="green" className="flex-1" size="sm"
          onClick={() => { setConfirmed(true); toast.success("Booking confirmed! SMS sent to guest."); }}>
          ✓ Confirm Booking
        </Button>
        <Button variant="secondary" size="sm" onClick={() => toast.info("Opening booking editor…")}>Edit</Button>
      </div>
      <div className="mt-3 bg-amber-500/[0.04] border border-amber-500/15 rounded-[8px] px-3 py-[10px]">
        <div className="text-[10px] text-amber-400 font-mono mb-1">● Risk Assessment</div>
        <p className="text-[12px] text-[#9b94c4] leading-[1.6]">
          7:30 PM has <strong className="text-amber-300">22% no-show risk</strong> tonight.
          SMS confirmation auto-sent 2h before.
        </p>
      </div>
    </Card>
  );
}

const RESTAURANTS = [
  { name: "Karavalli",  emoji: "🍛", cuisine: "Coastal Karnataka", rating: "4.8", price: "₹₹₹" },
  { name: "Toscano",    emoji: "🍝", cuisine: "Italian · Wood Fire",rating: "4.6", price: "₹₹₹₹" },
  { name: "Ebony",      emoji: "🏙", cuisine: "Rooftop · Multi",   rating: "4.5", price: "₹₹₹" },
  { name: "Fatty Bao",  emoji: "🥢", cuisine: "Pan-Asian · Tapas", rating: "4.4", price: "₹₹" },
];

function RestaurantRecommendationCard() {
  return (
    <Card>
      <div className="grid grid-cols-2 gap-2">
        {RESTAURANTS.map((r) => (
          <div key={r.name} className="bg-[#161422] border border-[#23203A] rounded-[10px] overflow-hidden hover:border-[#332F52] transition-colors">
            <div className="h-16 bg-[#1E1B2E] flex items-center justify-center text-[24px]">{r.emoji}</div>
            <div className="p-[9px]">
              <div className="text-[12px] font-medium text-[#ede9ff] mb-[2px]">{r.name}</div>
              <div className="text-[10px] text-[#5a5480] font-mono mb-2">{r.cuisine} · ⭐{r.rating} · {r.price}</div>
              <div className="flex gap-[5px]">
                <button onClick={() => toast.success(`Booking at ${r.name}…`)}
                  className="flex-1 py-[5px] bg-purple-600 text-white rounded-[6px] text-[10px] font-medium hover:bg-purple-700 transition">Book</button>
                <button onClick={() => toast.info(`Opening ${r.name}…`)}
                  className="flex-1 py-[5px] bg-transparent border border-[#332F52] text-[#9b94c4] rounded-[6px] text-[10px] hover:bg-[#1E1B2E] transition">View</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function MetricSummaryCard() {
  return (
    <Card accent="border-purple-500/25">
      <div className="flex items-start justify-between mb-4">
        <div className="text-[13px] font-medium text-[#ede9ff]">Revenue Forecast · Tonight</div>
        <Badge variant="purple">AI FORECAST</Badge>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          { l: "Current Revenue", v: "₹48,200" },
          { l: "AI Projected",    v: "₹56,400", vc: "text-emerald-400" },
          { l: "Uplift Potential", v: "+₹8,200", vc: "text-emerald-400" },
          { l: "Confidence",       v: "91%",     vc: "text-violet-400" },
        ].map(({ l, v, vc }) => (
          <div key={l} className="bg-[#1E1B2E] rounded-[7px] px-[10px] py-[8px]">
            <div className="text-[9px] text-[#5a5480] font-mono uppercase tracking-[.06em] mb-1">{l}</div>
            <div className={`text-[13px] font-medium ${vc ?? "text-[#ede9ff]"}`}>{v}</div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Button variant="primary" className="flex-1" size="sm" onClick={() => toast.success("AI optimization applied!")}>
          Apply AI Optimization
        </Button>
        <Link href="/owner/intelligence">
          <Button variant="secondary" size="sm">Full Analysis</Button>
        </Link>
      </div>
    </Card>
  );
}

function RiskReportCard() {
  return (
    <Card accent="border-red-500/25">
      <div className="flex items-start justify-between mb-4">
        <div className="text-[13px] font-medium text-[#ede9ff]">No-Show Risk · 7:30 PM</div>
        <Badge variant="danger">3 AT RISK</Badge>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          { l: "Table 5 · Sharma", v: "78% risk", vc: "text-red-400" },
          { l: "Table 8 · Mehta",  v: "62% risk", vc: "text-amber-400" },
          { l: "Table 12 · Patel", v: "55% risk", vc: "text-amber-400" },
          { l: "Revenue at risk",  v: "₹12,400",  vc: "text-red-400" },
        ].map(({ l, v, vc }) => (
          <div key={l} className="bg-[#1E1B2E] rounded-[7px] px-[10px] py-[8px]">
            <div className="text-[9px] text-[#5a5480] font-mono uppercase tracking-[.06em] mb-1">{l}</div>
            <div className={`text-[13px] font-medium ${vc}`}>{v}</div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Button variant="danger" className="flex-1" size="sm" onClick={() => toast.success("SMS alerts sent to 3 at-risk guests!")}>
          Send SMS Alerts
        </Button>
        <Button variant="secondary" size="sm" onClick={() => toast.info("Activating waitlist fill…")}>Fill Waitlist</Button>
      </div>
    </Card>
  );
}

function WelcomeCard({ onSuggest }: { onSuggest: (t: string) => void }) {
  return (
    <div>
      <div className="relative bg-gradient-to-br from-purple-900/10 to-blue-900/5 border border-purple-500/20 rounded-[11px] px-4 py-3 mb-3 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/35 to-transparent" />
        <div className="text-[10px] text-violet-400 font-mono mb-1">● SUFI AI CONCIERGE</div>
        <p className="text-[12px] text-[#9b94c4] leading-[1.65]">
          Welcome back. I respond with <strong className="text-[#ede9ff]">structured cards</strong> — not plain text.
          Every response includes data, context, and action buttons. Try a prompt below.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {[
          ["📅 Tables tonight", "Show available tables for tonight at 8 PM"],
          ["➕ Book table",     "Book a table for 4 people at 7:30 PM tonight"],
          ["🏪 Recommendations","Restaurant recommendations near MG Road Bangalore"],
          ["📈 Forecast",       "Revenue forecast for tonight"],
        ].map(([label, prompt]) => (
          <button key={label}
            onClick={() => onSuggest(prompt)}
            className="text-[11px] px-[10px] py-[5px] bg-[#161422] border border-[#23203A] rounded-full text-[#9b94c4] hover:bg-[#1E1B2E] hover:border-[#332F52] hover:text-[#ede9ff] transition-all">
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function StructuredResponse({ ui, onSuggest }: { ui: StructuredUI; onSuggest: (t: string) => void }) {
  switch (ui.type) {
    case "welcome":                  return <WelcomeCard onSuggest={onSuggest} />;
    case "table_availability":       return <TableAvailabilityCard />;
    case "booking_form":             return <BookingFormCard />;
    case "restaurant_recommendation":return <RestaurantRecommendationCard />;
    case "metric_summary":           return <MetricSummaryCard />;
    case "risk_report":              return <RiskReportCard />;
    default:                         return null;
  }
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
let msgId = 0;

export default function ConciergePage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: ++msgId, role: "assistant", content: "", structured: { type: "welcome" } },
  ]);
  const [input, setInput]     = useState("");
  const [typing, setTyping]   = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const bottomRef             = useRef<HTMLDivElement>(null);
  const chat                  = useConciergeChat();
  const clearSession          = useClearSession();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = useCallback((text: string) => {
    if (!text.trim()) return;
    setInput("");

    setMessages((prev) => [...prev, { id: ++msgId, role: "user", content: text }]);
    setTyping(true);

    // Try real API first, fall back to local intent matching
    chat.mutate({ query: text, sessionId }, {
      onSuccess: (res) => {
        setTyping(false);
        setSessionId(res.session_id); // persist session for multi-turn
        // Map backend intent to structured UI type
        const uiType = (res.intent === "booking" ? "booking_form"
          : res.intent === "availability" ? "table_availability"
          : res.intent === "recommendation" ? "restaurant_recommendation"
          : matchIntent(text)) as StructuredUI["type"];
        setMessages((prev) => [
          ...prev,
          { id: ++msgId, role: "assistant", content: res.reply || "", structured: { type: uiType } },
        ]);
      },
      onError: () => {
        // Graceful fallback — local intent matching
        setTimeout(() => {
          setTyping(false);
          const uiType = matchIntent(text);
          setMessages((prev) => [
            ...prev,
            { id: ++msgId, role: "assistant", content: "", structured: { type: uiType } },
          ]);
        }, 700 + Math.random() * 400);
      },
    });
  }, [chat, sessionId]);

  const handleSuggest = useCallback((t: string) => send(t), [send]);

  return (
    <Layout
      title="AI Concierge"
      subtitle="Structured AI · card-based responses only"
      topbarRight={
        <Badge variant="purple" className="text-[10px] px-2 py-1">STRUCTURED MODE</Badge>
      }
    >
      <div className="flex h-[calc(100vh-52px-48px)] gap-4 -m-6 overflow-hidden">
        {/* ── SIDEBAR ── */}
        <div className="w-[260px] flex-shrink-0 bg-[#0F0D18] border-r border-[#23203A] flex flex-col overflow-y-auto">
          <div className="px-4 pt-4 pb-3 border-b border-[#23203A]">
            <div className="text-[13px] font-medium text-[#ede9ff] mb-3">Conversations</div>
            <div className="flex items-center gap-2 bg-[#161422] border border-[#23203A] rounded-[8px] px-[10px] py-[7px]">
              <span className="text-[13px] text-[#5a5480]">⌕</span>
              <input type="text" placeholder="Search…" className="flex-1 bg-transparent border-0 outline-none text-[12px] text-[#ede9ff] placeholder:text-[#5a5480] font-sans" />
            </div>
          </div>
          <div className="px-4 pt-3 pb-1 text-[10px] text-[#5a5480] font-mono uppercase tracking-[.08em]">Quick Prompts</div>
          {[
            { icon: "📅", label: "Table availability",   prompt: "Show available tables for tonight at 8 PM" },
            { icon: "➕", label: "New booking",           prompt: "Book a table for 4 people at 7:30 PM tonight" },
            { icon: "🏪", label: "Recommendations",       prompt: "Restaurant recommendations near MG Road" },
            { icon: "📈", label: "Revenue forecast",      prompt: "Revenue forecast for tonight" },
            { icon: "⚠",  label: "Risk check",            prompt: "Check no-show risk for 7:30 PM" },
          ].map(({ icon, label, prompt }) => (
            <button key={label} onClick={() => send(prompt)}
              className="flex items-center gap-2 px-4 py-[8px] text-[12px] text-[#9b94c4] hover:bg-[#161422] hover:text-[#ede9ff] transition-colors text-left">
              <div className="w-[22px] h-[22px] rounded-[5px] bg-[#161422] flex items-center justify-center text-[12px] flex-shrink-0">{icon}</div>
              {label}
            </button>
          ))}
          <div className="flex-1" />
          <div className="px-4 py-3 border-t border-[#23203A] text-[10px] text-[#5a5480] font-mono">
            Structured AI v2.4 · No raw text
          </div>
        </div>

        {/* ── CHAT AREA ── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Chat topbar */}
          <div className="px-5 py-3 border-b border-[#23203A] flex items-center justify-between bg-[#07060C]/50">
            <div>
              <div className="text-[14px] font-medium text-[#ede9ff]">Restaurant AI Concierge</div>
              <div className="text-[10px] text-[#5a5480] font-mono">Structured responses · action-driven</div>
            </div>
            <button onClick={() => {
              setMessages([{ id: ++msgId, role: "assistant", content: "", structured: { type: "welcome" } }]);
              if (sessionId) clearSession.mutate(sessionId);
              setSessionId(undefined);
              toast.info("Conversation cleared");
            }}
              className="text-[11px] text-[#5a5480] hover:text-[#9b94c4] border border-[#23203A] rounded-[6px] px-[10px] py-[5px] font-mono transition-colors">
              ✕ Clear
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={msg.role === "user" ? "flex justify-end" : "flex gap-[9px]"}
                >
                  {msg.role === "assistant" && (
                    <div className="w-[30px] h-[30px] rounded-[9px] bg-gradient-to-br from-purple-700 to-blue-700 flex items-center justify-center text-[14px] flex-shrink-0 mt-[2px]">
                      🤖
                    </div>
                  )}
                  <div className={msg.role === "user" ? "max-w-[460px]" : "flex-1 max-w-[620px]"}>
                    {msg.role === "user" ? (
                      <div className="bg-purple-700 text-white rounded-[12px] rounded-tr-[4px] px-4 py-[10px] text-[13px] leading-[1.5]">
                        {msg.content}
                      </div>
                    ) : (
                      <>
                        {msg.structured && (
                          <div className="mb-2">
                            <div className="text-[10px] text-[#5a5480] font-mono mb-[7px] flex items-center gap-2">
                              <span className="bg-purple-500/10 text-violet-300 border border-purple-500/20 rounded-[4px] px-[6px] py-[2px] text-[9px]">
                                TYPE: {msg.structured.type}
                              </span>
                              <span>intent: {msg.structured.type.replace(/_/g, " ")}</span>
                            </div>
                            <StructuredResponse ui={msg.structured} onSuggest={handleSuggest} />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing indicator */}
            <AnimatePresence>
              {typing && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex gap-[9px]"
                >
                  <div className="w-[30px] h-[30px] rounded-[9px] bg-gradient-to-br from-purple-700 to-blue-700 flex items-center justify-center text-[14px]">🤖</div>
                  <div className="flex items-center gap-[4px] py-2">
                    {[0,1,2].map((i) => (
                      <span key={i} className="w-[5px] h-[5px] rounded-full bg-[#5a5480]"
                        style={{ animation: `bounce 0.8s ease-in-out ${i * 0.15}s infinite` }} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          <div className="px-5 py-4 border-t border-[#23203A] bg-[#07060C]/60 backdrop-blur-[10px]">
            <div className="flex items-center gap-[9px] bg-[#161422] border border-[#332F52] rounded-[11px] px-3 py-2 focus-within:border-purple-500/40 transition-colors">
              <span className="text-[16px]">🤖</span>
              <input
                className="flex-1 bg-transparent border-0 outline-none text-[13px] text-[#ede9ff] placeholder:text-[#5a5480] font-sans"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send(input)}
                placeholder="Ask anything — get structured cards, not raw text…"
              />
              <span className="text-[12px] text-[#5a5480] font-mono">⌘K</span>
              <button
                onClick={() => send(input)}
                className="w-[30px] h-[30px] rounded-[8px] bg-purple-600 flex items-center justify-center text-white hover:bg-purple-700 transition-colors text-[14px]"
              >▶</button>
            </div>
            <p className="text-center text-[10px] text-[#5a5480] font-mono mt-2">
              Structured responses only · cards + action buttons · no plain text
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-4px); }
        }
      `}</style>
    </Layout>
  );
}
