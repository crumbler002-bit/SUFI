import { motion } from "motion/react";
import { useState, useRef, useEffect } from "react";
import { Send, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { RestaurantCard } from "./RestaurantCard";
import { mockRestaurants } from "../lib/utils";
import { staggerContainer, staggerItem } from "../lib/motion";
import { chatWithConcierge } from "../services/ai";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  restaurants?: typeof mockRestaurants;
}

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", text: "Hi! I'm your AI concierge. I can help you find the perfect restaurant. What are you in the mood for?", sender: "ai" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), text: input, sender: "user" };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const history = messages.map((m) => ({ role: m.sender === "user" ? "user" : "assistant", content: m.text }));
      const res: any = await chatWithConcierge(input, history);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: res.response || res.message || "Here are some options I found:",
        sender: "ai",
        restaurants: res.restaurants?.length ? res.restaurants.slice(0, 3) : undefined,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      // Fallback to mock response
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        text: "Based on your preferences, here are some excellent options:",
        sender: "ai",
        restaurants: mockRestaurants.slice(0, 3),
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
          {messages.map((message) => (
            <motion.div key={message.id} variants={staggerItem} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div className="max-w-[80%]">
                <div className={`rounded-2xl px-5 py-3 ${message.sender === "user" ? "bg-[#F97316] text-white" : "bg-muted"}`}>
                  {message.sender === "ai" && (
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-[#F97316]" />
                      <span className="text-xs font-semibold text-[#F97316]">AI Concierge</span>
                    </div>
                  )}
                  <p className="text-sm">{message.text}</p>
                </div>
                {message.restaurants && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-4 grid gap-4">
                    {message.restaurants.map((r) => <RestaurantCard key={r.id} restaurant={r} />)}
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-muted-foreground">
              <Sparkles className="w-4 h-4 text-[#F97316]" />
              <div className="flex gap-1">
                {[0, 0.2, 0.4].map((delay, i) => (
                  <motion.div key={i} animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay }} className="w-2 h-2 bg-[#F97316] rounded-full" />
                ))}
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </motion.div>
      </div>
      <div className="p-4 border-t border-border bg-background/50">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask me anything..."
            className="flex-1"
          />
          <Button onClick={handleSend} className="px-6">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
