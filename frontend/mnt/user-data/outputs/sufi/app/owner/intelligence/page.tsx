"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  Tooltip, LineChart, Line, CartesianGrid,
} from "recharts";
import { useQuery } from "@tanstack/react-query";

import { Layout }       from "@/components/Layout";
import { Card }         from "@/components/ui/Card";
import { MetricCard }   from "@/components/ui/MetricCard";
import { InsightCard }  from "@/components/ui/InsightCard";
import { Button }       from "@/components/ui/Button";
import { Badge }        from "@/components/ui/Badge";
import { Panel }        from "@/components/ui/Panel";
import { MetricCardSkeleton, CardSkeleton } from "@/components/ui/Skeleton";
import { useSocket }    from "@/hooks/useSocket";
import { fetchIntelligence } from "@/lib/api";

// ── Mock data returned when real API is unavailable ───────────────────────────
const MOCK = {
  revenue: 48200, predicted_revenue: 56400,
  demand: [35, 58, 92, 100, 78, 45],
  risk: ["High no-show probability at 7:30 PM", "Overcapacity expected at 8:00 PM", "Waitlist insufficient"],
  recommendations: [
    "3 reservations at high no-show risk at 7:30 PM",
    "Overbooking recommended +3 tables to maximize cover",
    "2 bookings can be rescheduled to fill 3 PM gap",
    "Revenue dip expected at 3 PM — activate promotions",
  ],
  explanation:
    "Historical no-show rate of 34% on rainy Thursday evenings, combined with 3 unconfirmed reservations at 7:30 PM. AI cross-referenced weather data, SMS confirmation status, and booking lead time. Overbooking +3 yields predicted revenue increase of ₹8,200 with 91% confidence.",
  no_show_risk: 22,
  efficiency: 82,
};

const HOURS = ["5 PM", "6 PM", "7 PM", "8 PM", "9 PM", "10 PM"];

const REC_META = [
  { badge: "danger" as const, icon: "⚠️" },
  { badge: "ok"     as const, icon: "➕" },
  { badge: "info"   as const, icon: "⇄" },
  { badge: "warn"   as const, icon: "📉" },
];

// ── Custom tooltip for Recharts ───────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#161422] border border-[#332F52] rounded-[8px] px-3 py-2 text-[11px]">
      <p className="text-[#5a5480] mb-1 font-mono">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>{p.name}: {p.value}{p.name === "demand" ? "%" : ""}</p>
      ))}
    </div>
  );
};

export default function IntelligencePage() {
  const [applying, setApplying]   = useState(false);
  const [captureAnim, setCaptureAnim] = useState(false);

  // ── Data ─────────────────────────────────────────────────────────────────────
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["intelligence", 1],
    queryFn: () => fetchIntelligence(1).catch(() => MOCK),
    initialData: MOCK,
  });

  // ── WebSocket ─────────────────────────────────────────────────────────────────
  useSocket(
    `${process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8000"}/ws/dashboard/1`,
    {
      enabled: false, // set true when backend is live
      onMessage: useCallback((msg: any) => {
        if (msg.type === "ai_action") {
          toast.info(`AI: ${msg.data.message}`);
          refetch();
        }
      }, [refetch]),
    },
  );

  // ── Chart data ────────────────────────────────────────────────────────────────
  const demandChartData = (data?.demand ?? MOCK.demand).map((v, i) => ({
    time: HOURS[i],
    demand: v,
  }));

  // ── Actions ───────────────────────────────────────────────────────────────────
  const handleApplyAll = async () => {
    setApplying(true);
    try {
      await fetch("/automation/apply", { method: "POST" }).catch(() => null);
      toast.success("All AI recommendations applied! Revenue optimized.");
    } finally {
      setApplying(false);
    }
  };

  const handleCapture = () => {
    setCaptureAnim(true);
    toast.success("Opportunity captured! Projected revenue: ₹56,400");
    setTimeout(() => setCaptureAnim(false), 2000);
  };

  return (
    <Layout
      title="Intelligence Center"
      subtitle={`Restaurant Rangoli · AI Engine v2.4 · ${new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}`}
      topbarRight={
        <Button variant="ghost" size="sm" onClick={() => refetch()}>↻ Refresh</Button>
      }
    >
      {/* ── HEADER ── */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-[20px] font-semibold text-[#ede9ff]">Intelligence</h1>
          <p className="text-[11px] text-[#5a5480] font-mono mt-1">
            Live AI decision engine · Confidence 91% · Next scan in 4m 17s
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => { /* export */ toast.info("Exporting report…"); }}>
          Export
        </Button>
      </div>

      {/* ── HERO METRICS ── */}
      <motion.div
        className="grid grid-cols-4 gap-[10px] mb-[18px]"
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
      >
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <MetricCardSkeleton key={i} />)
        ) : (
          <>
            <MetricCard label="Revenue Today"   value="₹48,200" sub="↑ +14% vs yesterday" subColor="green"  barWidth={72} barColor="bg-gradient-to-r from-emerald-700 to-emerald-400" badge={<Badge variant="live">LIVE</Badge>} />
            <MetricCard label="Demand Index"    value="86%"     sub="Peak 8PM"             subColor="amber"  barWidth={86} barColor="bg-gradient-to-r from-amber-700 to-amber-400"   badge={<Badge variant="warn">HIGH</Badge>} />
            <MetricCard label="No-show Risk"    value={`${data?.no_show_risk ?? 22}%`} sub="3 slots at 7:30PM" subColor="amber" barWidth={22} barColor="bg-gradient-to-r from-amber-700 to-amber-400" badge={<Badge variant="warn">MED</Badge>} />
            <MetricCard label="Table Efficiency" value={`${data?.efficiency ?? 82}%`} sub="↑ Optimizable" subColor="blue" barWidth={82} barColor="bg-gradient-to-r from-blue-700 to-blue-500" badge={<Badge variant="info">GOOD</Badge>} />
          </>
        )}
      </motion.div>

      {/* ── AI DECISION CENTER ── */}
      {isLoading ? (
        <CardSkeleton rows={4} />
      ) : (
        <div className="relative bg-gradient-to-br from-purple-900/10 to-blue-900/5 border border-purple-500/35 rounded-[14px] p-5 mb-[18px] overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-[10px] text-violet-400 font-mono uppercase tracking-[.1em] mb-[5px]">● AI Decision Center</div>
              <div className="text-[16px] font-semibold text-[#ede9ff]">4 active recommendations — 1 critical action required</div>
              <div className="text-[11px] text-[#5a5480] mt-1">Updated 43s ago · Confidence 91% · Next scan 4m 17s</div>
            </div>
            <div className="flex gap-2 flex-shrink-0 ml-5">
              <Button loading={applying} onClick={handleApplyAll}>⚡ Apply All</Button>
              <Button variant="secondary" onClick={() => toast.info("Opening review panel…")}>Review</Button>
            </div>
          </div>

          {/* Recommendations grid */}
          <div className="grid grid-cols-4 gap-[10px] mb-4">
            {(data?.recommendations ?? MOCK.recommendations).map((rec, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="bg-white/[0.025] border border-[#23203A] rounded-[10px] p-3 hover:border-purple-500/40 hover:bg-purple-500/5 transition-all cursor-pointer"
                onClick={() => toast.info(`Action: ${rec}`)}
              >
                <div className="text-[15px] mb-2">{REC_META[i].icon}</div>
                <p className="text-[12px] text-[#ede9ff] leading-[1.45] mb-2">{rec}</p>
                <Badge variant={REC_META[i].badge}>
                  {["URGENT", "+₹6,200", "OPTIMIZE", "FORECAST"][i]}
                </Badge>
              </motion.div>
            ))}
          </div>

          {/* Why this recommendation */}
          <div className="border-t border-[#23203A] pt-4 flex gap-3 items-start">
            <div className="flex-1 bg-purple-500/[0.04] border border-purple-500/15 rounded-[8px] px-4 py-[10px]">
              <div className="text-[10px] text-[#5a5480] font-mono uppercase tracking-[.08em] mb-[5px]">Why this recommendation?</div>
              <p className="text-[12px] text-[#9b94c4] leading-[1.65]">{data?.explanation ?? MOCK.explanation}</p>
            </div>
            {/* Confidence ring */}
            <div className="flex flex-col items-center min-w-[80px]">
              <div className="text-[10px] text-[#5a5480] font-mono mb-2">AI Confidence</div>
              <div className="relative w-[52px] h-[52px]">
                <svg className="-rotate-90" width="52" height="52" viewBox="0 0 52 52">
                  <circle cx="26" cy="26" r="20" fill="none" stroke="rgba(167,139,250,0.15)" strokeWidth="3" />
                  <circle cx="26" cy="26" r="20" fill="none" stroke="#a78bfa" strokeWidth="3"
                    strokeLinecap="round" strokeDasharray="125.6" strokeDashoffset="11.3" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-[13px] font-semibold text-violet-400">91%</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── DEMAND + REVENUE ── */}
      <div className="grid grid-cols-[1.1fr_.9fr] gap-4 mb-[18px]">
        {/* Demand chart */}
        <Card>
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-[12px] font-medium text-[#ede9ff]">Demand Forecast · Tonight</div>
              <div className="text-[10px] text-[#5a5480] font-mono mt-[2px]">Predicted covers by hour</div>
            </div>
            <div className="flex gap-3 text-[10px] text-[#5a5480]">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-[2px] bg-purple-500 inline-block" />Predicted</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={demandChartData} barSize={28}>
              <XAxis dataKey="time" tick={{ fill: "#5a5480", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(124,58,237,0.08)" }} />
              <Bar dataKey="demand" name="demand" fill="#7C3AED" radius={[4, 4, 0, 0]}
                label={{ position: "top", fill: "#5a5480", fontSize: 9, formatter: (v: number) => `${v}%` }}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Revenue impact */}
        <Card>
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-[12px] font-medium text-[#ede9ff]">Revenue Impact</div>
              <div className="text-[10px] text-[#5a5480] font-mono mt-[2px]">Current vs AI-optimized</div>
            </div>
            <Badge variant="ok">+17% uplift</Badge>
          </div>
          <div className="text-[11px] text-[#5a5480] font-mono mb-1">Current trajectory</div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[22px] font-semibold text-[#ede9ff]">₹{(data?.revenue ?? 48200).toLocaleString("en-IN")}</span>
            <span className="text-[#9b94c4]">→</span>
            <span className="text-[22px] font-semibold text-emerald-400">₹{(data?.predicted_revenue ?? 56400).toLocaleString("en-IN")}</span>
          </div>
          <div className="text-[13px] text-emerald-400 font-medium mb-4">
            + ₹{((data?.predicted_revenue ?? 56400) - (data?.revenue ?? 48200)).toLocaleString("en-IN")} potential uplift tonight
          </div>
          <div className="h-[6px] bg-[#1E1B2E] rounded-full overflow-hidden mb-1">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: captureAnim ? "100%" : "75%" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-emerald-700 to-emerald-400"
            />
          </div>
          <div className="flex justify-between text-[10px] text-[#5a5480] font-mono mb-4">
            <span>Current ₹48K</span><span>75% to goal</span><span>Target ₹56K</span>
          </div>
          <Button variant="green" className="w-full" onClick={handleCapture}>Capture Opportunity</Button>
        </Card>
      </div>

      {/* ── BOTTOM: RISK + TABLE OPT + INSIGHTS ── */}
      <div className="grid grid-cols-3 gap-4">
        {/* Risk Panel */}
        <Panel
          title="⚠ Risk Analysis"
          subtitle="3 active risks"
          actions={<Button variant="secondary" size="sm" onClick={() => toast.success("SMS alerts sent to 3 at-risk guests!")}>Send Alerts</Button>}
        >
          {(data?.risk ?? MOCK.risk).map((r, i) => (
            <div key={i} className="flex items-start gap-[9px] py-[9px] border-b border-[#23203A] last:border-0">
              <div className={`w-[6px] h-[6px] rounded-full mt-[4px] flex-shrink-0 ${i === 0 ? "bg-red-500" : "bg-amber-500"}`} />
              <div className="flex-1">
                <div className="text-[12px] text-[#ede9ff]">{r}</div>
                <div className="text-[10px] text-[#5a5480] font-mono mt-[2px]">
                  {["7:30 PM · 78% probability", "8:00 PM · 52% probability", "Only 2 of 8 needed"][i]}
                </div>
              </div>
              <span className={`text-[10px] font-mono px-[6px] py-[2px] rounded-[4px] ${i === 0 ? "bg-red-500/10 text-red-400" : "bg-amber-500/10 text-amber-400"}`}>
                {["78%", "52%", "41%"][i]}
              </span>
            </div>
          ))}
        </Panel>

        {/* Table Optimization */}
        <Panel
          title="Table Optimization"
          subtitle="AI layout analysis"
        >
          <div className="flex justify-center mb-4 relative">
            <svg className="-rotate-90" width="88" height="88" viewBox="0 0 88 88">
              <circle cx="44" cy="44" r="35" fill="none" stroke="rgba(59,130,246,0.15)" strokeWidth="5" />
              <motion.circle
                cx="44" cy="44" r="35" fill="none" stroke="#3b82f6" strokeWidth="5"
                strokeLinecap="round" strokeDasharray="219.9"
                initial={{ strokeDashoffset: 219.9 }}
                animate={{ strokeDashoffset: 39.6 }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-[18px] font-semibold text-[#ede9ff]">
              {data?.efficiency ?? 82}%
            </div>
          </div>
          <div className="text-[12px] text-[#9b94c4] bg-purple-500/[0.04] border border-purple-500/10 rounded-[8px] p-[9px] leading-[1.55] mb-4">
            Convert 3x four-seat tables → 2-seat near window. Expected gain:{" "}
            <strong className="text-blue-400">+11%</strong> with no revenue loss.
          </div>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {[{ v: "18", l: "Tables active" }, { v: "+11%", l: "Gain possible", c: "text-blue-400" }].map(({ v, l, c }) => (
              <div key={l} className="bg-[#161422] border border-[#23203A] rounded-[8px] p-2 text-center">
                <div className={`text-[16px] font-semibold ${c ?? "text-[#ede9ff]"}`}>{v}</div>
                <div className="text-[10px] text-[#5a5480]">{l}</div>
              </div>
            ))}
          </div>
          <Button variant="outline-purple" className="w-full" onClick={() => toast.success("Table optimization applied! +11% efficiency")}>
            Apply Optimization
          </Button>
        </Panel>

        {/* Secondary Insights */}
        <div className="flex flex-col gap-3">
          <InsightCard
            icon="📩" priority="HIGH ROI"
            message="Notify 8PM waitlist — 6 guests ready to fill cancellation slots. Est. ₹3,200 recovered."
            actionLabel="Notify Waitlist →"
            onAction={() => toast.success("Waitlist notified for 8PM slot!")}
          />
          <InsightCard
            icon="📈" priority="PRICING"
            message="Increase pricing +12% during 7–9PM peak. High demand supports premium tier activation."
            actionLabel="Activate Dynamic Pricing →"
            onAction={() => toast.success("Dynamic pricing activated for 7–9PM!")}
          />
          <InsightCard
            icon="📱" priority="FILL GAP"
            message="SMS loyalty customers for 3PM slot. 68% historical conversion rate on targeted campaigns."
            actionLabel="Launch Campaign →"
            onAction={() => toast.info("SMS campaign launched to loyalty segment!")}
          />
        </div>
      </div>
    </Layout>
  );
}
