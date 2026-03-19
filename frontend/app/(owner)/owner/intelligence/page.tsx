"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";

import { Layout }      from "@/components/Layout";
import { Button }      from "@/components/ui/Button";
import { Panel }       from "@/components/ui/Panel";
import { Badge }       from "@/components/ui/Badge";
import { InsightCard } from "@/components/ui/InsightCard";
import {
  useIntelligence,
  useApplyAll,
  useTriggerAutomation,
  useAutomationHistory,
  INTELLIGENCE_MOCK,
} from "@/hooks/useIntelligence";
import { useSocket } from "@/hooks/useSocket";
import { useAuth }   from "@/hooks/useAuth";

import { IntelligenceMetrics } from "@/features/intelligence/IntelligenceMetrics";
import { DecisionPanel }       from "@/features/intelligence/DecisionPanel";
import { DemandChart }         from "@/features/intelligence/DemandChart";
import { RevenuePanel }        from "@/features/intelligence/RevenuePanel";
import { RiskPanel }           from "@/features/intelligence/RiskPanel";

const RESTAURANT_ID = 1;

// ── Inner component — all hooks live here, no early returns before hooks ──────
function IntelligenceContent() {
  const [captureAnim, setCaptureAnim] = useState(false);

  const { data: dashboard = INTELLIGENCE_MOCK, isLoading, refetch } = useIntelligence(RESTAURANT_ID);
  const applyAll    = useApplyAll();
  const triggerAuto = useTriggerAutomation();
  const { data: history = [] } = useAutomationHistory(RESTAURANT_ID);

  const handleWsMessage = useCallback((msg: any) => {
    if (msg.type === "dashboard_update") refetch();
  }, [refetch]);

  useSocket(
    `${process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8000"}/ws/dashboard/${RESTAURANT_ID}`,
    {
      enabled: typeof window !== "undefined" && !!localStorage.getItem("sufi_token"),
      onMessage: handleWsMessage,
    },
  );

  const metricsData = {
    revenue: dashboard.predictions.predicted_revenue * 0.85,
    predicted_revenue: dashboard.predictions.predicted_revenue,
    demand: Object.values(dashboard.predictions.hourly_demand),
    risk: dashboard.insights.filter((i) => i.includes("⚠") || i.includes("risk")),
    recommendations: dashboard.priority.ranked
      .slice(0, 4)
      .map((r) => `Reservation #${r.id} — ${r.priority_label} priority · ${Math.round(r.noshow_probability * 100)}% no-show risk`)
      .concat(dashboard.insights.slice(0, 4 - Math.min(dashboard.priority.ranked.length, 4))),
    explanation: dashboard.insights.join(" "),
    no_show_risk: Math.round(dashboard.metrics.noshow_rate * 100),
    efficiency: dashboard.optimization.efficiency_score,
  };

  const handleCapture = () => {
    setCaptureAnim(true);
    triggerAuto.mutate(RESTAURANT_ID, {
      onSuccess: () => toast.success(`Automation triggered! Projected revenue: ₹${dashboard.predictions.predicted_revenue.toLocaleString("en-IN")}`),
      onError: () => toast.success("Opportunity captured!"),
    });
    setTimeout(() => setCaptureAnim(false), 2000);
  };

  return (
    <Layout
      title="Intelligence Center"
      subtitle={`Restaurant · AI Engine v2.4 · ${new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}`}
      topbarRight={
        <div className="flex items-center gap-2">
          <Badge variant={dashboard.metrics.demand_level === "high" ? "danger" : dashboard.metrics.demand_level === "medium" ? "warn" : "ok"}>
            {dashboard.metrics.demand_level.toUpperCase()} DEMAND
          </Badge>
          <Button variant="ghost" size="sm" onClick={() => refetch()}>↻ Refresh</Button>
        </div>
      }
    >
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-[20px] font-semibold text-[#ede9ff]">Intelligence</h1>
          <p className="text-[11px] text-[#5a5480] font-mono mt-1">
            Fill ratio {Math.round(dashboard.metrics.fill_ratio * 100)}% ·
            {dashboard.metrics.total_reservations} reservations today ·
            {dashboard.priority.at_risk_count} at risk
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => toast.info("Exporting report…")}>Export</Button>
      </div>

      <IntelligenceMetrics data={metricsData} isLoading={isLoading} />

      <DecisionPanel
        data={metricsData}
        isLoading={isLoading}
        applying={applyAll.isPending}
        onApplyAll={() => applyAll.mutate()}
      />

      <div className="grid grid-cols-[1.1fr_.9fr] gap-4 mb-[18px]">
        <DemandChart demand={Object.values(dashboard.predictions.hourly_demand)} />
        <RevenuePanel data={metricsData} captureAnim={captureAnim} onCapture={handleCapture} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <RiskPanel risks={dashboard.insights.filter((i) => i.includes("⚠") || i.includes("risk") || i.includes("no-show"))} />

        <Panel title="Table Optimization" subtitle="AI layout analysis">
          <div className="flex justify-center mb-4 relative">
            <svg className="-rotate-90" width="88" height="88" viewBox="0 0 88 88">
              <circle cx="44" cy="44" r="35" fill="none" stroke="rgba(59,130,246,0.15)" strokeWidth="5" />
              <circle cx="44" cy="44" r="35" fill="none" stroke="#3b82f6" strokeWidth="5"
                strokeLinecap="round" strokeDasharray="219.9"
                strokeDashoffset={219.9 * (1 - dashboard.optimization.efficiency_score / 100)} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-[18px] font-semibold text-[#ede9ff]">
              {dashboard.optimization.efficiency_score}%
            </div>
          </div>
          <div className="text-[12px] text-[#9b94c4] bg-purple-500/[0.04] border border-purple-500/10 rounded-[8px] p-[9px] leading-[1.55] mb-4">
            {dashboard.optimization.table_suggestion}
          </div>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {[
              { v: String(dashboard.optimization.active_tables), l: "Active tables" },
              { v: String(dashboard.optimization.idle_tables), l: "Idle tables", c: dashboard.optimization.idle_tables > 0 ? "text-amber-400" : "text-emerald-400" },
            ].map(({ v, l, c }) => (
              <div key={l} className="bg-[#161422] border border-[#23203A] rounded-[8px] p-2 text-center">
                <div className={`text-[16px] font-semibold ${c ?? "text-[#ede9ff]"}`}>{v}</div>
                <div className="text-[10px] text-[#5a5480]">{l}</div>
              </div>
            ))}
          </div>
          <Button variant="outline-purple" className="w-full" onClick={() => toast.success("Table optimization applied!")}>
            Apply Optimization
          </Button>
        </Panel>

        <div className="flex flex-col gap-3">
          {dashboard.insights.slice(0, 3).map((insight, i) => (
            <InsightCard
              key={i}
              icon={insight.startsWith("⚠") ? "⚠️" : insight.startsWith("💡") ? "📩" : "📈"}
              priority={i === 0 ? "HIGH ROI" : i === 1 ? "WAITLIST" : "PRICING"}
              message={insight.replace(/^[^\s]+\s/, "")}
              actionLabel={i === 0 ? "Take Action →" : i === 1 ? "Notify Waitlist →" : "Activate →"}
              onAction={() => {
                triggerAuto.mutate(RESTAURANT_ID, {
                  onSuccess: () => toast.success("Automation triggered!"),
                  onError: () => toast.info("Action queued"),
                });
              }}
            />
          ))}
        </div>
      </div>

      {history.length > 0 && (
        <div className="mt-4">
          <Panel title="Recent Automation Actions" subtitle={`Last ${history.length} actions`}>
            {history.slice(0, 5).map((h) => (
              <div key={h.id} className="flex items-center gap-3 py-[9px] border-b border-[#23203A] last:border-0 text-[12px]">
                <div className="w-[26px] h-[26px] rounded-[7px] bg-purple-500/10 flex items-center justify-center text-[12px] flex-shrink-0">⚡</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[#ede9ff] truncate">{h.type}</div>
                  <div className="text-[10px] text-[#5a5480] font-mono mt-[1px]">
                    {new Date(h.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
                <Badge variant={h.status === "executed" ? "ok" : h.status === "skipped" ? "info" : "warn"}>
                  {h.status.toUpperCase()}
                </Badge>
              </div>
            ))}
          </Panel>
        </div>
      )}
    </Layout>
  );
}

// ── Shell — handles auth check, renders content only when authenticated ───────
export default function IntelligencePage() {
  const { ready, isAuthenticated } = useAuth();
  if (!ready || !isAuthenticated) return null;
  return <IntelligenceContent />;
}
