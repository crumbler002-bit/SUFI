"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line } from "recharts";

import { Layout }     from "@/components/Layout";
import { Card }       from "@/components/ui/Card";
import { MetricCard } from "@/components/ui/MetricCard";
import { Button }     from "@/components/ui/Button";
import { Badge }      from "@/components/ui/Badge";
import { Toggle }     from "@/components/ui/Toggle";
import { useSocket }  from "@/hooks/useSocket";
import { fetchAutomationStatus } from "@/lib/api";

// ── Types ─────────────────────────────────────────────────────────────────────
interface FeedItem {
  id: number;
  icon: string;
  iconBg: string;
  text: string;
  meta: string;
  badge: "ok" | "danger" | "info" | "purple" | "warn";
  badgeText: string;
}

// ── Floor data ────────────────────────────────────────────────────────────────
const FLOOR_TABLES: { id: string; status: "occupied" | "free" | "reserved" | "risk" }[] = [
  { id: "T1",  status: "occupied" }, { id: "T2",  status: "reserved" }, { id: "T3",  status: "occupied" },
  { id: "T4",  status: "free"     }, { id: "T5",  status: "risk"     }, { id: "T6",  status: "occupied" },
  { id: "T7",  status: "occupied" }, { id: "T8",  status: "free"     }, { id: "T9",  status: "reserved" },
  { id: "T10", status: "occupied" }, { id: "T11", status: "occupied" }, { id: "T12", status: "risk"     },
  { id: "T13", status: "free"     }, { id: "T14", status: "occupied" }, { id: "T15", status: "reserved" },
  { id: "T16", status: "occupied" }, { id: "T17", status: "occupied" }, { id: "T18", status: "free"     },
];

const TABLE_CLASS: Record<string, string> = {
  occupied: "bg-purple-500/14 border-purple-500/35 text-violet-200",
  free:     "bg-emerald-500/8 border-emerald-500/20 text-emerald-200",
  reserved: "bg-amber-500/9  border-amber-500/22  text-amber-200",
  risk:     "bg-red-500/9    border-red-500/28    text-red-200 animate-pulse",
};

const SEED_FEED: FeedItem[] = [
  { id: 1,  icon: "👤", iconBg: "bg-emerald-500/10", text: "Table 9 booked · 8:00 PM · 4 guests", meta: "Priya Sharma",           badge: "ok",     badgeText: "NEW"    },
  { id: 2,  icon: "✕",  iconBg: "bg-red-500/10",     text: "Cancellation: Table 5 · 7:30 PM",   meta: "Slot opened",              badge: "danger", badgeText: "CANCEL" },
  { id: 3,  icon: "⚡", iconBg: "bg-purple-500/10",  text: "AI auto-reschedule · 3 PM slot",    meta: "Revenue protected +₹2,400", badge: "purple", badgeText: "AI"     },
  { id: 4,  icon: "📩", iconBg: "bg-blue-500/10",    text: "Waitlist guest notified · 8 PM",    meta: "Auto-filled by SUFI",       badge: "info",   badgeText: "INFO"   },
  { id: 5,  icon: "📈", iconBg: "bg-amber-500/10",   text: "Dynamic pricing 7–9 PM activated",  meta: "+12% price adjustment",     badge: "purple", badgeText: "AI"     },
  { id: 6,  icon: "👤", iconBg: "bg-emerald-500/10", text: "Walk-in seated · Table 4 · now",    meta: "2 guests · est. 45 min",    badge: "ok",     badgeText: "NEW"    },
  { id: 7,  icon: "⚠",  iconBg: "bg-red-500/10",     text: "No-show risk: Table 12 unconfirmed",meta: "7:30 PM · 78% probability",  badge: "danger", badgeText: "RISK"   },
];

const CHART_DATA = [
  { h: "5PM",  rev: 4.2, covers: 12 },
  { h: "6PM",  rev: 7.8, covers: 22 },
  { h: "7PM",  rev: 12.4, covers: 38 },
  { h: "8PM",  rev: 14.1, covers: 42 },
  { h: "9PM",  rev: 8.6,  covers: 28 },
  { h: "10PM", rev: 5.2,  covers: 16 },
  { h: "11PM", rev: 2.8,  covers: 8  },
];

export default function DashboardPage() {
  const [alertVisible, setAlertVisible] = useState(true);
  const [feed, setFeed]   = useState<FeedItem[]>(SEED_FEED);
  const [aiCount, setAiCount] = useState(7);
  const nextId = useRef(100);

  // ── Automation status ─────────────────────────────────────────────────────
  const { data: autoStatus } = useQuery({
    queryKey: ["automation", "status"],
    queryFn: () => fetchAutomationStatus().catch(() => ({ auto_overbooking: true, auto_reschedule: true, auto_cancel: false })),
    initialData: { auto_overbooking: true, auto_reschedule: true, auto_cancel: false },
  });
  const [overbook,  setOverbook]  = useState(true);
  const [reschedule, setReschedule] = useState(true);
  const [autoCancel, setAutoCancel] = useState(false);

  // ── WebSocket ─────────────────────────────────────────────────────────────
  useSocket(
    `${process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8000"}/ws/dashboard/1`,
    {
      enabled: false,
      onMessage: useCallback((msg: any) => {
        if (msg.type === "booking_created") {
          addFeedItem({ icon: "👤", iconBg: "bg-emerald-500/10", text: `New booking: ${msg.data.name} · ${msg.data.people} guests`, meta: msg.data.time, badge: "ok", badgeText: "NEW" });
          setAiCount((c) => c + 1);
        }
      }, []),
    },
  );

  // ── Simulated live feed ───────────────────────────────────────────────────
  useEffect(() => {
    const timer = setInterval(() => {
      const pool = SEED_FEED;
      addFeedItem({ ...pool[Math.floor(Math.random() * pool.length)], id: nextId.current++ });
      setAiCount((c) => c + 1);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const addFeedItem = (item: Omit<FeedItem, "id"> & { id?: number }) => {
    setFeed((prev) => [
      { ...item, id: item.id ?? nextId.current++ },
      ...prev.slice(0, 11),
    ]);
  };

  const toggleAuto = (name: string, on: boolean) => {
    toast[on ? "success" : "info"](`${on ? "Enabled" : "Disabled"}: ${name}`);
  };

  return (
    <Layout
      title="Operations Dashboard"
      subtitle={`Restaurant Rangoli · Live · ${new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`}
      alertStrip={
        alertVisible ? (
          <div className="relative flex items-center gap-3 px-6 py-2 bg-gradient-to-r from-red-900/10 to-amber-900/5 border-b border-red-500/20 overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-red-500" />
            <span className="text-[10px] text-red-400 font-mono uppercase tracking-[.08em] whitespace-nowrap">⚠ AI Alert</span>
            <span className="text-[12px] text-[#9b94c4] flex-1">
              3 reservations at high no-show risk at 7:30 PM · Overbooking +3 recommended ·{" "}
              <strong className="text-amber-300">+₹8,200 impact</strong>
            </span>
            <Button variant="ghost" size="sm" onClick={() => { toast.success("Alert action applied!"); setAlertVisible(false); }}
              className="border-red-500/30 text-red-400 hover:bg-red-500/10">Take Action</Button>
            <button onClick={() => setAlertVisible(false)} className="text-[#5a5480] hover:text-[#9b94c4] text-[16px] ml-1">✕</button>
          </div>
        ) : null
      }
      topbarRight={
        <Button variant="ghost" size="sm" onClick={() => toast.info("Syncing live data…")}>⟳ Sync</Button>
      }
    >
      {/* ── PAGE HEADER ── */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-[20px] font-semibold text-[#ede9ff]">Dashboard</h1>
          <p className="text-[11px] text-[#5a5480] font-mono mt-1">WebSocket Active · Real-time ops</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => toast.info("Exporting shift report…")}>Export</Button>
      </div>

      {/* ── METRICS ── */}
      <div className="grid grid-cols-5 gap-[10px] mb-[18px]">
        <MetricCard label="Tonight's Revenue" value="₹48.2K" sub="↑ +14% vs yesterday" subColor="green"  barWidth={72} barColor="bg-gradient-to-r from-emerald-700 to-emerald-400" badge={<Badge variant="live">LIVE</Badge>} />
        <MetricCard label="Covers Tonight"    value="134"    sub="12 more booked"       subColor="green"  barWidth={82} barColor="bg-gradient-to-r from-blue-700 to-blue-500" />
        <MetricCard label="Tables Active"     value="14/18"  sub="4 free now"           subColor="amber"  barWidth={78} barColor="bg-gradient-to-r from-purple-700 to-purple-500" />
        <MetricCard label="Avg Wait"          value="8 min"  sub="↓ 3 min faster"       subColor="green"  barWidth={40} barColor="bg-gradient-to-r from-teal-700 to-teal-400" />
        <MetricCard label="AI Actions"        value={String(aiCount)} sub="3 pending" subColor="blue" barWidth={58} barColor="bg-gradient-to-r from-purple-700 to-violet-400" />
      </div>

      {/* ── MAIN GRID ── */}
      <div className="grid grid-cols-[1fr_320px] gap-4">
        {/* Left column */}
        <div className="flex flex-col gap-4">
          {/* Revenue chart */}
          <Card>
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-[12px] font-medium text-[#ede9ff]">Revenue & Covers · Tonight</div>
                <div className="text-[10px] text-[#5a5480] font-mono mt-[2px]">Hourly breakdown · WebSocket live</div>
              </div>
              <div className="flex gap-3 text-[10px] text-[#5a5480]">
                <span className="flex items-center gap-1"><span className="w-2 h-[3px] rounded-[1px] bg-purple-500 inline-block" />Revenue</span>
                <span className="flex items-center gap-1"><span className="w-2 h-[3px] rounded-[1px] bg-blue-500 inline-block" />Covers</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={CHART_DATA} barSize={20} barGap={4}>
                <XAxis dataKey="h" tick={{ fill: "#5a5480", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left"  tick={{ fill: "#5a5480", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}K`} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: "#5a5480", fontSize: 10 }} axisLine={false} tickLine={false} />
                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
                <Tooltip
                  contentStyle={{ background: "#161422", border: "0.5px solid #332F52", borderRadius: 8, fontSize: 11 }}
                  labelStyle={{ color: "#5a5480" }} itemStyle={{ color: "#ede9ff" }}
                />
                <Bar yAxisId="left"  dataKey="rev"    fill="rgba(124,58,237,0.55)" radius={[3, 3, 0, 0]} name="Revenue (₹K)" />
                <Line yAxisId="right" type="monotone" dataKey="covers" stroke="#3b82f6" strokeWidth={1.5} dot={{ r: 3, fill: "#3b82f6" }} name="Covers" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Floor map */}
          <Card>
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-[12px] font-medium text-[#ede9ff]">Floor Status</div>
                <div className="text-[10px] text-[#5a5480] font-mono mt-[2px]">Real-time · click to manage</div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => toast.info("Opening floor editor…")}>Edit Layout</Button>
            </div>
            <div className="grid grid-cols-6 gap-[6px]">
              {FLOOR_TABLES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => toast.info(`${t.id} — ${t.status.charAt(0).toUpperCase() + t.status.slice(1)}`)}
                  className={`rounded-[7px] py-2 px-1 text-center text-[10px] font-medium font-mono border transition-transform hover:scale-105 ${TABLE_CLASS[t.status]}`}
                >
                  <div>{t.id}</div>
                  <div className="text-[8px] mt-[2px] opacity-70 capitalize">{t.status.slice(0, 3)}</div>
                </button>
              ))}
            </div>
            <div className="flex gap-3 mt-3">
              {[{ l: "Occupied", c: "bg-purple-500/50" }, { l: "Free", c: "bg-emerald-500/50" }, { l: "Reserved", c: "bg-amber-500/50" }, { l: "Risk", c: "bg-red-500/50" }].map(({ l, c }) => (
                <div key={l} className="flex items-center gap-[4px] text-[10px] text-[#5a5480]">
                  <div className={`w-[7px] h-[7px] rounded-[2px] ${c}`} />{l}
                </div>
              ))}
            </div>
          </Card>

          {/* Ops grid + Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
            {/* Automation toggles */}
            <Card>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-[12px] font-medium text-[#ede9ff]">Automation</div>
                  <div className="text-[10px] text-[#5a5480] font-mono mt-[2px]">3 rules active</div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => toast.info("Opening automation…")}>Manage</Button>
              </div>
              {[
                { label: "Auto Overbooking",  desc: "demand > 80%",  val: overbook,   set: setOverbook   },
                { label: "Auto Reschedule",   desc: "fill gaps",      val: reschedule, set: setReschedule },
                { label: "Auto Cancel SMS",   desc: "risk > 60%",    val: autoCancel, set: setAutoCancel },
              ].map(({ label, desc, val, set }) => (
                <div key={label} className="flex items-center gap-3 py-[11px] border-b border-[#23203A] last:border-0">
                  <div className="flex-1">
                    <div className="text-[12px] text-[#ede9ff]">{label}</div>
                    <div className="text-[10px] text-[#5a5480] font-mono">{desc}</div>
                  </div>
                  <span className={`text-[10px] font-mono ${val ? "text-emerald-400" : "text-[#5a5480]"}`}>{val ? "ON" : "OFF"}</span>
                  <Toggle checked={val} onChange={(on) => { set(on); toggleAuto(label, on); }} />
                </div>
              ))}
            </Card>

            {/* Quick actions */}
            <Card>
              <div className="text-[12px] font-medium text-[#ede9ff] mb-4">Quick Actions</div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: "➕", label: "New Booking",  bg: "bg-emerald-500/10", action: () => toast.success("New booking flow opened!") },
                  { icon: "📩", label: "Notify List",  bg: "bg-blue-500/10",    action: () => toast.info("Notifying waitlist…") },
                  { icon: "⚡", label: "Run AI Opt.",  bg: "bg-purple-500/10",  action: () => toast.success("AI optimization running…") },
                  { icon: "⚙", label: "Edit Tables",  bg: "bg-amber-500/10",   action: () => toast.info("Opening table manager…") },
                  { icon: "📊", label: "Shift Report", bg: "bg-teal-500/10",    action: () => toast.success("Shift report generated!") },
                  { icon: "🌟", label: "Promotions",  bg: "bg-red-500/10",     action: () => toast.info("Opening promotions…") },
                ].map(({ icon, label, bg, action }) => (
                  <button
                    key={label}
                    onClick={action}
                    className="flex items-center gap-2 px-3 py-[10px] bg-[#161422] border border-[#23203A] rounded-[9px] text-[11px] text-[#9b94c4] hover:bg-[#1E1B2E] hover:border-[#332F52] hover:text-[#ede9ff] transition-all text-left"
                  >
                    <div className={`w-6 h-6 rounded-[6px] flex items-center justify-center text-[13px] flex-shrink-0 ${bg}`}>{icon}</div>
                    {label}
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Right column — Live feed */}
        <Card className="h-fit sticky top-[52px]">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="text-[12px] font-medium text-[#ede9ff]">Live Activity</div>
              <span className="w-[5px] h-[5px] rounded-full bg-emerald-400 dot-green inline-block" />
            </div>
            <button
              onClick={() => { setFeed([]); toast.info("Feed cleared"); }}
              className="text-[10px] text-[#5a5480] hover:text-[#9b94c4] font-mono"
            >
              Clear
            </button>
          </div>
          <div className="max-h-[520px] overflow-y-auto space-y-0">
            <AnimatePresence initial={false}>
              {feed.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-[9px] py-[9px] border-b border-[#23203A] last:border-0"
                >
                  <div className={`w-7 h-7 rounded-[8px] flex items-center justify-center text-[13px] flex-shrink-0 ${item.iconBg}`}>
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] text-[#ede9ff] truncate">{item.text}</div>
                    <div className="text-[10px] text-[#5a5480] font-mono mt-[2px]">{item.meta}</div>
                  </div>
                  <Badge variant={item.badge}>{item.badgeText}</Badge>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
