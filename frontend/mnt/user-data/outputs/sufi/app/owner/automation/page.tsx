"use client";

import { useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

import { Layout }  from "@/components/Layout";
import { Card }    from "@/components/ui/Card";
import { Button }  from "@/components/ui/Button";
import { Badge }   from "@/components/ui/Badge";
import { Toggle }  from "@/components/ui/Toggle";
import { Panel }   from "@/components/ui/Panel";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Rule {
  id: string;
  name: string;
  desc: string;
  trigger: string;
  action: string;
  revenue: string;
  runs: number;
  pct: number;
  enabled: boolean;
  color: string;
}

interface PlannedAction {
  id: string;
  action: string;
  time: string;
  impact: string;
  dotColor: string;
}

// ── Static data (replace with useActiveAutomations() / usePlannedActions()) ──
const INIT_RULES: Rule[] = [
  { id:"r1", name:"Auto Overbooking",  desc:"Add +3 buffer tables when demand exceeds 80%",          trigger:"demand > 80%",      action:"Add +3 tables",    revenue:"+₹6,200 avg", runs:18, pct:85, enabled:true,  color:"#7C3AED" },
  { id:"r2", name:"No-Show SMS Alert", desc:"Send confirmation SMS 2h before if booking unconfirmed",trigger:"unconfirmed & t-2h",action:"Send SMS",          revenue:"₹3,400 saved",runs:34, pct:92, enabled:true,  color:"#3b82f6" },
  { id:"r3", name:"Auto Reschedule",   desc:"Move bookings to fill detected demand gaps",             trigger:"gap detected",      action:"Reschedule",        revenue:"+₹2,100 avg", runs:12, pct:60, enabled:true,  color:"#10b981" },
  { id:"r4", name:"Dynamic Pricing",   desc:"Increase price +12% during peak 7–9 PM window",         trigger:"peak window",       action:"Price +12%",        revenue:"+₹4,800 avg", runs:7,  pct:35, enabled:true,  color:"#f59e0b" },
  { id:"r5", name:"Waitlist Auto-fill",desc:"Notify waitlist guests when a cancellation occurs",      trigger:"cancellation event",action:"Notify waitlist",   revenue:"₹1,900 saved",runs:9,  pct:45, enabled:true,  color:"#14b8a6" },
  { id:"r6", name:"Low-demand Promo",  desc:"Launch targeted SMS campaign when covers drop below 40%",trigger:"covers < 40%",     action:"Send campaign",     revenue:"+₹1,200 avg", runs:3,  pct:15, enabled:false, color:"#ef4444" },
];

const INIT_PLANNED: PlannedAction[] = [
  { id:"p1", action:"Overbook +3 tables for 8 PM slot",        time:"Triggered now · 7:42 PM",   impact:"+₹6,200",    dotColor:"#7C3AED" },
  { id:"p2", action:"Send no-show SMS to Table 5, 8, 12",      time:"Scheduled · T-2h = 5:30 PM",impact:"₹3,400 saved",dotColor:"#3b82f6" },
  { id:"p3", action:"Notify waitlist for 9 PM cancellation",   time:"On standby · pending cancel",impact:"+₹2,100",    dotColor:"#10b981" },
];

const HISTORY = [
  { icon:"⚡", bg:"bg-purple-500/10", text:"Overbooking rule fired · +3 tables added",     meta:"7:30 PM today",  result:"SUCCESS", rc:"ok"   as const },
  { icon:"📩", bg:"bg-blue-500/10",   text:"No-show SMS batch sent to 3 guests",           meta:"5:30 PM today",  result:"SUCCESS", rc:"ok"   as const },
  { icon:"⇄",  bg:"bg-emerald-500/10",text:"Auto-rescheduled booking to 3:30 PM",          meta:"4:15 PM today",  result:"SUCCESS", rc:"ok"   as const },
  { icon:"📈", bg:"bg-amber-500/10",  text:"Dynamic pricing activated for peak window",    meta:"7:00 PM today",  result:"SUCCESS", rc:"ok"   as const },
  { icon:"📩", bg:"bg-blue-500/10",   text:"Waitlist notify skipped — no cancellations",   meta:"3:45 PM today",  result:"SKIPPED", rc:"info" as const },
  { icon:"⚡", bg:"bg-purple-500/10", text:"Demand threshold reached · rule triggered",    meta:"2:00 PM today",  result:"SUCCESS", rc:"ok"   as const },
];

const PERF_DATA = INIT_RULES.map((r) => ({ name: r.name.split(" ")[1] ?? r.name, runs: r.runs, color: r.color }));

const TIMELINE = [
  { title:"Overbooking triggered · +3 tables",    time:"7:30 PM", dotColor:"#7C3AED" },
  { title:"Dynamic pricing activated",            time:"7:00 PM", dotColor:"#f59e0b" },
  { title:"No-show SMS sent to 3 guests",         time:"5:30 PM", dotColor:"#3b82f6" },
  { title:"Auto-reschedule filled 3 PM gap",      time:"4:15 PM", dotColor:"#10b981" },
  { title:"Demand forecast scan completed",       time:"2:00 PM", dotColor:"#5a5480" },
];

export default function AutomationPage() {
  const [masterOn, setMasterOn]       = useState(true);
  const [rules, setRules]             = useState<Rule[]>(INIT_RULES);
  const [planned, setPlanned]         = useState<PlannedAction[]>(INIT_PLANNED);
  const [aiCount, setAiCount]         = useState(7);
  const [approvingAll, setApprovingAll] = useState(false);

  const activeRulesCount = rules.filter((r) => r.enabled).length;

  const toggleMaster = (on: boolean) => {
    setMasterOn(on);
    toast[on ? "success" : "info"](on ? "Automation engine activated — autonomous mode ON" : "Automation paused — manual mode only");
  };

  const toggleRule = (id: string, on: boolean) => {
    setRules((prev) => prev.map((r) => r.id === id ? { ...r, enabled: on } : r));
    const rule = rules.find((r) => r.id === id);
    toast[on ? "success" : "info"](`${on ? "Enabled" : "Disabled"}: ${rule?.name}`);
  };

  const approveOne = (id: string) => {
    setPlanned((prev) => prev.filter((p) => p.id !== id));
    setAiCount((c) => c + 1);
    toast.success("Action approved and queued for execution!");
  };

  const skipOne = (id: string) => {
    setPlanned((prev) => prev.filter((p) => p.id !== id));
    toast.info("Action skipped");
  };

  const approveAll = async () => {
    setApprovingAll(true);
    await new Promise((r) => setTimeout(r, 500));
    const count = planned.length;
    setAiCount((c) => c + count);
    setPlanned([]);
    setApprovingAll(false);
    toast.success(`All ${count} planned actions approved! POST /automation/approve`);
  };

  return (
    <Layout
      title="Automation Control"
      subtitle="Autonomous rules engine · real-time execution"
      topbarRight={
        <div className={`flex items-center gap-[5px] text-[11px] px-[10px] py-[4px] rounded-[20px] border ${
          masterOn ? "text-emerald-400 bg-emerald-500/7 border-emerald-500/18"
                   : "text-red-400 bg-red-500/7 border-red-500/18"}`}
        >
          <span className={`w-[5px] h-[5px] rounded-full ${masterOn ? "bg-emerald-400 dot-green" : "bg-red-400"}`} />
          {masterOn ? "Autonomous Mode" : "System Paused"}
        </div>
      }
    >
      {/* ── HEADER ── */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-[20px] font-semibold text-[#ede9ff]">Automation</h1>
          <p className="text-[11px] text-[#5a5480] font-mono mt-1">AI-driven execution · real-time rules engine · planned actions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => toast.info("Opening rule builder…")}>+ New Rule</Button>
          <Button size="sm" loading={approvingAll} onClick={approveAll}>✓ Approve All</Button>
        </div>
      </div>

      {/* ── MASTER SWITCH ── */}
      <div className="relative bg-gradient-to-br from-purple-900/10 to-blue-900/5 border border-purple-500/30 rounded-[14px] px-6 py-[18px] mb-[18px] flex items-center justify-between overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
        <div className="flex items-center gap-4">
          <div className="w-[42px] h-[42px] rounded-[11px] bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-[18px]">⚡</div>
          <div>
            <div className="text-[15px] font-semibold text-[#ede9ff]">SUFI Automation Engine</div>
            <div className="text-[11px] text-[#5a5480] font-mono mt-[2px]">
              {masterOn ? "AUTONOMOUS — All rules running" : "PAUSED — Manual mode only"} · {aiCount} actions today
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex gap-6">
            {[
              { v: aiCount, l: "Actions Today", c: "text-emerald-400" },
              { v: "₹14.2K",l: "Revenue Saved", c: "text-violet-400"  },
              { v: activeRulesCount, l: "Rules Active", c: "text-[#ede9ff]" },
            ].map(({ v, l, c }) => (
              <div key={l} className="text-center">
                <div className={`text-[18px] font-semibold ${c}`}>{v}</div>
                <div className="text-[9px] text-[#5a5480] font-mono">{l}</div>
              </div>
            ))}
          </div>
          <Toggle checked={masterOn} onChange={toggleMaster} size="lg" />
        </div>
      </div>

      {/* ── METRICS ── */}
      <div className="grid grid-cols-5 gap-[10px] mb-[18px]">
        {[
          { l: "Rules Active",    v: `${activeRulesCount}`,  sub: "of 8 total",      c: "text-emerald-400" },
          { l: "Actions Today",   v: `${aiCount}`,           sub: "+3 pending",      c: "text-violet-400"  },
          { l: "Revenue Saved",   v: "₹14.2K",              sub: "this week",       c: "text-emerald-400" },
          { l: "Success Rate",    v: "96%",                  sub: "last 30 days",    c: "text-teal-400"    },
          { l: "Avg Response",    v: "1.2s",                 sub: "execution time",  c: "text-[#ede9ff]"   },
        ].map(({ l, v, sub, c }) => (
          <div key={l} className="bg-[#0F0D18] border border-[#23203A] rounded-[11px] p-[14px] hover:border-[#332F52] transition-colors">
            <div className="text-[9px] text-[#5a5480] font-mono uppercase tracking-[.08em] mb-2">{l}</div>
            <div className={`text-[22px] font-semibold leading-none mb-1 ${c}`}>{v}</div>
            <div className="text-[10px] text-[#5a5480]">{sub}</div>
          </div>
        ))}
      </div>

      {/* ── MAIN GRID ── */}
      <div className="grid grid-cols-[1fr_1fr_300px] gap-4 mb-4">
        {/* Active Rules */}
        <Panel title="Active Rules" subtitle="GET /automation/active"
          actions={<Button variant="ghost" size="sm" onClick={() => toast.info("Opening rules editor…")}>Edit Rules</Button>}>
          <div className="space-y-2">
            {rules.map((r) => (
              <motion.div
                key={r.id}
                layout
                className="bg-[#161422] border border-[#23203A] rounded-[10px] p-3 hover:border-[#332F52] transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 mr-3">
                    <div className="text-[12px] font-medium text-[#ede9ff] mb-[2px]">{r.name}</div>
                    <div className="text-[11px] text-[#5a5480] leading-[1.4]">{r.desc}</div>
                  </div>
                  <Toggle checked={r.enabled} onChange={(on) => toggleRule(r.id, on)} />
                </div>
                <div className="flex flex-wrap gap-[5px] mb-2">
                  <span className="text-[9px] px-[6px] py-[2px] rounded-[4px] bg-blue-500/10 text-blue-300 border border-blue-500/20 font-mono">IF: {r.trigger}</span>
                  <span className="text-[9px] px-[6px] py-[2px] rounded-[4px] bg-purple-500/10 text-violet-300 border border-purple-500/20 font-mono">THEN: {r.action}</span>
                  <span className="text-[9px] px-[6px] py-[2px] rounded-[4px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">{r.revenue}</span>
                </div>
                <div className="text-[10px] text-[#5a5480] font-mono mb-[6px]">{r.runs} executions this week</div>
                <div className="h-[2px] bg-[#1E1B2E] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${r.pct}%` }}
                    transition={{ duration: 0.8 }}
                    style={{ background: r.color }}
                    className="h-full rounded-full"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </Panel>

        {/* Planned Actions */}
        <Panel title="AI Planned Actions" subtitle="GET /automation/planned"
          actions={
            <Badge variant={planned.length > 0 ? "warn" : "ok"}>
              {planned.length > 0 ? `${planned.length} PENDING` : "ALL APPROVED"}
            </Badge>
          }
        >
          <AnimatePresence>
            {planned.length === 0 ? (
              <div className="text-center py-5 text-[12px] text-[#5a5480]">All actions approved ✓</div>
            ) : (
              planned.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: 6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6, height: 0, marginBottom: 0, paddingBottom: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-start gap-[10px] pb-[10px] mb-[10px] border-b border-[#23203A] last:border-0 last:mb-0 last:pb-0"
                >
                  <div className="w-[8px] h-[8px] rounded-full mt-[4px] flex-shrink-0" style={{ background: p.dotColor }} />
                  <div className="flex-1">
                    <div className="text-[12px] text-[#ede9ff] mb-[2px]">{p.action}</div>
                    <div className="text-[10px] text-[#5a5480] font-mono mb-[6px]">{p.time}</div>
                    <div className="flex gap-[6px]">
                      <button onClick={() => approveOne(p.id)}
                        className="px-[10px] py-[4px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 rounded-[5px] text-[10px] hover:bg-emerald-500/20 transition font-sans">
                        ✓ Approve
                      </button>
                      <button onClick={() => skipOne(p.id)}
                        className="px-[10px] py-[4px] bg-transparent text-[#5a5480] border border-[#23203A] rounded-[5px] text-[10px] hover:bg-[#161422] hover:text-[#9b94c4] transition font-sans">
                        Skip
                      </button>
                    </div>
                  </div>
                  <div className="text-[10px] text-emerald-400 font-mono whitespace-nowrap">{p.impact}</div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
          <Button variant="green" className="w-full mt-3" loading={approvingAll} onClick={approveAll}>
            ✓ Approve All · POST /automation/approve
          </Button>
        </Panel>

        {/* Execution History */}
        <Panel title="Execution History" subtitle="Last 24 hours">
          {HISTORY.map((h, i) => (
            <div key={i} className="flex items-center gap-[10px] py-[9px] border-b border-[#23203A] last:border-0 text-[12px]">
              <div className={`w-[26px] h-[26px] rounded-[7px] flex items-center justify-center text-[12px] flex-shrink-0 ${h.bg}`}>{h.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="text-[#ede9ff] truncate">{h.text}</div>
                <div className="text-[10px] text-[#5a5480] font-mono mt-[1px]">{h.meta}</div>
              </div>
              <Badge variant={h.rc}>{h.result}</Badge>
            </div>
          ))}
        </Panel>
      </div>

      {/* ── BOTTOM: Timeline + Performance ── */}
      <div className="grid grid-cols-2 gap-4">
        {/* Timeline */}
        <Card>
          <div className="text-[12px] font-medium text-[#ede9ff] mb-4">Today's Automation Timeline</div>
          <div className="flex flex-col">
            {TIMELINE.map((t, i) => (
              <div key={i} className="flex gap-3 pb-[14px] last:pb-0">
                <div className="flex flex-col items-center">
                  <div className="w-[8px] h-[8px] rounded-full mt-[3px] flex-shrink-0" style={{ background: t.dotColor }} />
                  {i < TIMELINE.length - 1 && (
                    <div className="w-px flex-1 mt-[4px]" style={{ background: t.dotColor, opacity: 0.2 }} />
                  )}
                </div>
                <div>
                  <div className="text-[12px] text-[#ede9ff] mb-[2px]">{t.title}</div>
                  <div className="text-[10px] text-[#5a5480] font-mono">{t.time}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Performance chart */}
        <Card>
          <div className="text-[12px] font-medium text-[#ede9ff] mb-4">Rule Execution Count · This Week</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={PERF_DATA} barSize={24}>
              <XAxis dataKey="name" tick={{ fill: "#5a5480", fontSize: 9 }} axisLine={false} tickLine={false} angle={-30} textAnchor="end" height={40} />
              <YAxis tick={{ fill: "#5a5480", fontSize: 10 }} axisLine={false} tickLine={false} />
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
              <Tooltip
                contentStyle={{ background: "#161422", border: "0.5px solid #332F52", borderRadius: 8, fontSize: 11 }}
                labelStyle={{ color: "#5a5480" }} itemStyle={{ color: "#ede9ff" }}
              />
              <Bar dataKey="runs" name="Executions" radius={[4, 4, 0, 0]}
                fill="#7C3AED"
                label={{ position: "top", fill: "#5a5480", fontSize: 9 }}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </Layout>
  );
}
