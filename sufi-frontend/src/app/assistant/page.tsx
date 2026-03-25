"use client";

import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { useSufiStore } from "@/lib/state/sufiStore";
import Navbar from "@/components/core/Navbar";
import Card from "@/components/ui/Card";
import GlassPanel from "@/components/ui/GlassPanel";

export default function AssistantPage() {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const msgRefs = useRef<(HTMLDivElement | null)[]>([]);

  const { aiMessages, askAI, results, systemStatus } = useSufiStore();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    const last = msgRefs.current[aiMessages.length - 1];
    if (last) {
      gsap.fromTo(last, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.3 });
    }
  }, [aiMessages]);

  const send = () => {
    if (!input.trim()) return;
    askAI(input.trim());
    setInput("");
  };

  const recommended = (ids?: string[]) =>
    ids?.length ? results.filter((r) => ids.includes(r.id)).slice(0, 3) : [];

  return (
    <>
      <Navbar />
      <div className="pt-14 min-h-screen flex flex-col">
        <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col p-6">
          {/* Header */}
          <div className="text-center mb-8 pt-6">
            <h1 className="text-3xl font-bold mb-2">
              SUFI <span className="gradient-text">Assistant</span>
            </h1>
            <p className="text-sm text-white/40">
              AI-powered recommendations grounded in real data
            </p>
          </div>

          {/* Chat area */}
          <GlassPanel className="flex-1 flex flex-col p-5 min-h-[400px]">
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {aiMessages.length === 0 && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-3">
                    <p className="text-white/20 text-sm">Try asking:</p>
                    {["Find me a quiet Italian place for a date", "Best rooftop restaurants near me", "Where should I go for a business lunch?"].map((q) => (
                      <button
                        key={q}
                        onClick={() => { setInput(q); askAI(q); }}
                        className="block mx-auto text-sm text-white/40 hover:text-white/70
                                 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl transition-all"
                      >
                        &ldquo;{q}&rdquo;
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {aiMessages.map((msg, i) => (
                <div
                  key={i}
                  ref={(el) => { msgRefs.current[i] = el; }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-primary/20 text-white"
                      : "bg-white/5 text-white/80"
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    {msg.recommended_ids && msg.recommended_ids.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {recommended(msg.recommended_ids).map((r) => (
                          <div key={r.id} className="scale-[0.92] origin-left">
                            <Card data={r} state="normal" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="relative">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
                placeholder="Ask anything about dining..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3
                         text-white placeholder:text-white/30 text-sm focus:outline-none
                         focus:border-primary/40 transition-all"
              />
              <button
                onClick={send}
                disabled={systemStatus === "searching"}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5
                         bg-primary text-black rounded-lg text-xs font-medium
                         hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                {systemStatus === "searching" ? "…" : "Send"}
              </button>
            </div>
          </GlassPanel>
        </div>
      </div>
    </>
  );
}
