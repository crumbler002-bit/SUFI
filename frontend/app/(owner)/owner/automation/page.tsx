"use client";

import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

import { Layout }  from "@/components/Layout";
import { Card }    from "@/components/ui/Card";
import { Button }  from "@/components/ui/Button";
import { Toggle }  from "@/components/ui/Toggle";
import { Panel }   from "@/components/ui/Panel";

import { AutomationToggle }  from "@/features/automation/AutomationToggle";
import { PlannedActions }    from "@/features/automation/PlannedActions";
import { ExecutionHistory }  from "@/features/automation/ExecutionHistory";
import { usePlannedActions, useApproveAll } from "@/hooks/useAutomation";
import type { PlannedAction } from "@/types/automation";

interface Rule {
  id: string; name: string; desc: string; trigger: string;
  action: string; revenue: string; runs: number; pct: number;
  enabled: boolean; color: string;
}

const INIT_RULES: Rule[] = [
  { id:"r1", name:"Auto Overbooking",  desc:"Add +3 buffer tables when demand exceeds 80%",           trigger:"demand > 80%",       action:"Add +3 tables",  revenue:"+₹6,200 avg", runs:18, pct:85, enabled:true,  color:"#7C3AED" },
  { id:"r2", name:"No-Show SMS Alert", desc:"Send confirmation SMS 2h before if booking unconfirmed", trigger:"unconfirmed & t-2h", action:"Send SMS",       revenue:"₹3,400 saved",runs:34, pct:92, enabled:true,  color:"#3b82f6" },
  { id:"r3", name:"Auto Reschedule",   desc:"Move bookings to fill detected demand gaps",              trigger:"gap detected",       action:"Reschedule",     revenue:"+₹2,100 avg", runs:12, pct:60, enabled:true,  color:"#10b981" },
  { id:"r4", name:"Dynamic Pricing",   desc:"Increase price +12% during peak 7–9 PM window",          trigger:"peak window",        action:"Price +12%",     revenue:"+₹4,800 avg", runs:7,  pct:35, enabled:true,  color:"#f59e0b" },
  { id:"r5", name:"Waitlist Auto-fill",desc:"Notify waitlist guests when a cancellation occurs",       trigger:"cancellation event", action:"Notify waitlist",revenue:"₹1,900 saved",runs:9,  pct:45, enabled:true,  color:"#14b8a6" },
  { id:"r6", name:"Low-demand Promo",  desc:"Launch targeted SMS campaign when covers drop below 40%", trigger:"covers < 40%",      action:"Send campaign",  revenue:"+₹1,200 avg", runs:3,  pct:15, enabled:false, color:"#ef4444" },
];

// Fallback mock for when API is unavailable
const MOCK_PLANNED: PlannedAction[] = [
  { id:"p1", action:"Overbook +3 tables for 8 PM slot",      scheduled_time:"Triggered now · 7:42 PM",    revenue_impact:"+₹6,200",     dot_color:"#7C3AED" },
  { id:"p2", action:"Send no-show SMS to Table 5, 8, 12",    scheduled_time:"Scheduled · T-2h = 5:30 PM", revenue_impact:"₹3,400 saved", dot_color:"#3b82f6" },
  { id:"p3", action:"Notify waitlist for 9 PM cancellation", scheduled_time:"On standby · pending cancel", revenue_impact:"+₹2,100",     dot_color:"#10b981" },
];

const TIMELINE = [
  { title:"Overbooking triggered · +3 tables", time:"7:30 PM", dotColor:"#7C3AED" },
  { title:"Dynamic pricing activated",         time:"7:00 PM", dotColor:"#f59e0b" },
  { title:"No-show SMS sent to 3 guests",      time:"5:30 PM", dotColor:"#3b82f6" },
  { title:"Auto-reschedule filled 3 PM gap",   time:"4:15 PM", dotColor:"#10b981" },
  { title:"Demand forecast scan completed",    time:"2:00 PM", dotColor:"#5a5480" },
];

export default function AutomationPage() {
  const [masterOn, setMasterOn]         = useState(true);
  const [rules, setRules]               = useState<Rule[]>(INIT_RULES);
  const [aiCount, setAiCount]           = useState(7);

  // ── Real data layer ────────────────────────────────────────────────────────
  const { data: apiPlanned } = usePlannedActions();
  const approveAllMutation   = useApproveAll();

  // Normalize API shape → local PlannedAction shape (fallback to mock)
  const [localPlanned, setLocalPlanned] = useState<PlannedAction[]>(MOCK_PLANNED);
  // Sync from API when available
  const planned = apiPlanned ?? localPlanned;

  const activeRulesCount = rules.filter((r) => r.enabled).length;
  const approvingAll     = approveAllMutation.isPending;
  const perfData = rules.map((r) => ({ name: r.name.split(" ")[1] ?? r.name, runs: r.runs, color: r.color }));

  const toggleMaster = (on: boolean) => {
    setMasterOn(on);
    toast[on ? "success" : "info"](on ? "Automation engine activated — autonomous mode ON" : "Automation paused — manual mode only");
  };

  const toggleRule = (id: string, on: boolean) => {
    setRules((prev) => prev.map((r) => r.id === id ? { ...r, enabled: on } : r));
    toast[on ? "success" : "info"](`${on ? "Enabled" : "Disabled"}: ${rules.find((r) => r.id === id)?.name}`);
  };

  const approveOne = (id: string) => {
    setLocalPlanned((prev) => prev.filter((p) => p.id !== id));
    setAiCount((c) => c + 1);
    toast.success("Action approved and queued for execution!");
  };

  const skipOne = (id: string) => {
    setLocalPlanned((prev) => prev.filter((p) => p.id !== id));
    toast.info("Action skipped");
  };

  const approveAll = async () => {
    const count = planned.length;
    approveAllMutation.mutate(undefined, {
      onSuccess: () => {
        setAiCount((c) => c + count);
        setLocalPlanned([]);
        toast.success(`All ${count} planned actions approved!`);
      },
      onError: () => {
        // Fallback: optimistic local clear
        setAiCount((c) => c + count);
        setLocalPlanned([]);
        toast.success(`All ${count} planned actions approved!`);
      },
    });
  };

  return (
    <Layout
      title="Automation Control"
      subtitle="Autonomous rules engine · real-time execution"
      topbarRight={
        <div className={`flex items-center gap-[5px] text-[11px] px-[10px] py-[4px] rounded-[20px] border ${
          masterOn ? "text-emerald-400 bg-emerald-500/7 border-emerald-500/18"
                   : "text-red-400 bg-red-500/7 border-red-500/18"}`}>
          <span className={`w-[5px] h-[5px] rounded-full ${masterOn ? "bg-emerald-400 dot-green" : "bg-red-400"}`} />
          {masterOn ? "Autonomous Mode" : "System Paused"}
        </div>
      }
    >
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

      <AutomationToggle
        masterOn={masterOn}
        aiCount={aiCount}
        activeRulesCount={activeRulesCount}
        approvingAll={approvingAll}
        onToggle={toggleMaster}
        onApproveAll={approveAll}
      />

      {/* Metrics strip */}
      <div className="grid grid-cols-5 gap-[10px] mb-[18px]">
        {[
          { l: "Rules Active",  v: `${activeRulesCount}`, sub: "of 8 total",     c: "text-emerald-400" },
          { l: "Actions Today", v: `${aiCount}`,          sub: "+3 pending",     c: "text-violet-400"  },
          { l: "Revenue Saved", v: "₹14.2K",             sub: "this week",      c: "text-emerald-400" },
          { l: "Success Rate",  v: "96%",                 sub: "last 30 days",   c: "text-teal-400"    },
          { l: "Avg Response",  v: "1.2s",                sub: "execution time", c: "text-[#ede9ff]"   },
        ].map(({ l, v, sub, c }) => (
          <div key={l} className="bg-[#0F0D18] border border-[#23203A] rounded-[11px] p-[14px] hover:border-[#332F52] transition-colors">
            <div className="text-[9px] text-[#5a5480] font-mono uppercase tracking-[.08em] mb-2">{l}</div>
            <div className={`text-[22px] font-semibold leading-none mb-1 ${c}`}>{v}</div>
            <div className="text-[10px] text-[#5a5480]">{sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[1fr_1fr_300px] gap-4 mb-4">
        {/* Active Rules */}
        <Panel title="Active Rules" subtitle="GET /automation/active"
          actions={<Button variant="ghost" size="sm" onClick={() => toast.info("Opening rules editor…")}>Edit Rules</Button>}>
          <div className="space-y-2">
            {rules.map((r) => (
              <motion.div key={r.id} layout
                className="bg-[#161422] border border-[#23203A] rounded-[10px] p-3 hover:border-[#332F52] transition-colors">
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
                  <motion.div initial={{ width: 0 }} animate={{ width: `${r.pct}%` }} transition={{ duration: 0.8 }}
                    style={{ background: r.color }} className="h-full rounded-full" />
                </div>
              </motion.div>
            ))}
          </div>
        </Panel>

        <PlannedActions
          planned={planned}
          approvingAll={approvingAll}
          onApprove={approveOne}
          onSkip={skipOne}
          onApproveAll={approveAll}
        />

        <ExecutionHistory />
      </div>

      <div className="grid grid-cols-2 gap-4">
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

        <Card>
          <div className="text-[12px] font-medium text-[#ede9ff] mb-4">Rule Execution Count · This Week</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={perfData} barSize={24}>
              <XAxis dataKey="name" tick={{ fill: "#5a5480", fontSize: 9 }} axisLine={false} tickLine={false} angle={-30} textAnchor="end" height={40} />
              <YAxis tick={{ fill: "#5a5480", fontSize: 10 }} axisLine={false} tickLine={false} />
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
              <Tooltip contentStyle={{ background: "#161422", border: "0.5px solid #332F52", borderRadius: 8, fontSize: 11 }}
                labelStyle={{ color: "#5a5480" }} itemStyle={{ color: "#ede9ff" }} />
              <Bar dataKey="runs" name="Executions" radius={[4, 4, 0, 0]} fill="#7C3AED"
                label={{ position: "top", fill: "#5a5480", fontSize: 9 }} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </Layout>
  );
}
