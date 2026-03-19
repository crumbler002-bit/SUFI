"use client";

import { useState } from "react";
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

import { Layout }     from "@/components/Layout";
import { Card }       from "@/components/ui/Card";
import { MetricCard } from "@/components/ui/MetricCard";
import { Badge }      from "@/components/ui/Badge";
import { Loading }    from "@/components/shared/Loading";
import { useAnalyticsSummary, useAnalyticsTimeline, usePopularHours, useReviewAnalytics } from "@/hooks/useAnalytics";
import { useAuth } from "@/hooks/useAuth";

const RESTAURANT_ID = 1;

// ── Inner component — all hooks live here, no early returns before hooks ──────
function AnalyticsContent() {
  const [days, setDays] = useState(30);

  const { data: summary, isLoading: loadingSummary } = useAnalyticsSummary(RESTAURANT_ID);
  const { data: timeline = [], isLoading: loadingTimeline } = useAnalyticsTimeline(RESTAURANT_ID, days);
  const { data: popularHours } = usePopularHours(RESTAURANT_ID);
  const { data: reviews } = useReviewAnalytics(RESTAURANT_ID);

  const popularHoursData = popularHours
    ? Object.entries(popularHours).map(([h, v]) => ({ hour: `${h}:00`, count: v }))
    : [];

  return (
    <Layout
      title="Analytics"
      subtitle="Revenue & performance insights"
      topbarRight={
        <div className="flex gap-1">
          {[7, 30, 90].map((d) => (
            <button key={d} onClick={() => setDays(d)}
              className={`px-3 py-[5px] text-[11px] rounded-[6px] font-mono transition-colors ${
                days === d ? "bg-purple-500/20 text-violet-300 border border-purple-500/30" : "text-[#5a5480] hover:text-[#9b94c4]"
              }`}>
              {d}d
            </button>
          ))}
        </div>
      }
    >
      {loadingSummary ? <Loading message="Loading analytics…" /> : summary && (
        <>
          <div className="grid grid-cols-4 gap-[10px] mb-[18px]">
            <MetricCard label="Profile Views"    value={String(summary.views)}        sub="Total views"          subColor="blue"  barWidth={Math.min(summary.views / 10, 100)} barColor="bg-gradient-to-r from-blue-700 to-blue-400" />
            <MetricCard label="Click-Through"    value={`${(summary.ctr * 100).toFixed(1)}%`} sub="Search → Profile" subColor="green" barWidth={summary.ctr * 100} barColor="bg-gradient-to-r from-emerald-700 to-emerald-400" />
            <MetricCard label="Reservations"     value={String(summary.reservations)} sub="From analytics"       subColor="amber" barWidth={Math.min(summary.reservations * 2, 100)} barColor="bg-gradient-to-r from-amber-700 to-amber-400" badge={<Badge variant="ok">TRACKED</Badge>} />
            <MetricCard label="Perf. Score"      value={summary.performance_score.toFixed(0)} sub="AI-computed"  subColor="blue"  barWidth={Math.min(summary.performance_score, 100)} barColor="bg-gradient-to-r from-violet-700 to-violet-400" />
          </div>

          <div className="grid grid-cols-[1fr_300px] gap-4 mb-4">
            <Card>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-[12px] font-medium text-[#ede9ff]">Performance Timeline · {days} days</div>
                  <div className="text-[10px] text-[#5a5480] font-mono mt-[2px]">Views, clicks, reservations</div>
                </div>
              </div>
              {loadingTimeline ? <Loading message="Loading timeline…" /> : (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={timeline}>
                    <XAxis dataKey="date" tick={{ fill: "#5a5480", fontSize: 9 }} axisLine={false} tickLine={false}
                      tickFormatter={(v) => v.slice(5)} />
                    <YAxis tick={{ fill: "#5a5480", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
                    <Tooltip contentStyle={{ background: "#161422", border: "0.5px solid #332F52", borderRadius: 8, fontSize: 11 }}
                      labelStyle={{ color: "#5a5480" }} itemStyle={{ color: "#ede9ff" }} />
                    <Line type="monotone" dataKey="views"        stroke="#7C3AED" strokeWidth={1.5} dot={false} name="Views" />
                    <Line type="monotone" dataKey="clicks"       stroke="#3b82f6" strokeWidth={1.5} dot={false} name="Clicks" />
                    <Line type="monotone" dataKey="reservations" stroke="#10b981" strokeWidth={1.5} dot={false} name="Reservations" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Card>

            {reviews && (
              <Card>
                <div className="text-[12px] font-medium text-[#ede9ff] mb-4">Review Analytics</div>
                <div className="text-center mb-4">
                  <div className="text-[32px] font-semibold text-[#ede9ff]">{reviews.average_rating.toFixed(1)}</div>
                  <div className="text-[10px] text-[#5a5480] font-mono">{reviews.total_reviews} reviews</div>
                </div>
                {Object.entries(reviews.distribution).sort((a, b) => Number(b[0]) - Number(a[0])).map(([star, count]) => (
                  <div key={star} className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] text-[#5a5480] w-4">{star}★</span>
                    <div className="flex-1 h-[4px] bg-[#1E1B2E] rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${reviews.total_reviews ? (count / reviews.total_reviews) * 100 : 0}%` }} />
                    </div>
                    <span className="text-[10px] text-[#5a5480] w-5 text-right">{count}</span>
                  </div>
                ))}
              </Card>
            )}
          </div>

          {popularHoursData.length > 0 && (
            <Card>
              <div className="text-[12px] font-medium text-[#ede9ff] mb-4">Popular Hours</div>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={popularHoursData} barSize={20}>
                  <XAxis dataKey="hour" tick={{ fill: "#5a5480", fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
                  <Tooltip contentStyle={{ background: "#161422", border: "0.5px solid #332F52", borderRadius: 8, fontSize: 11 }}
                    labelStyle={{ color: "#5a5480" }} itemStyle={{ color: "#ede9ff" }} />
                  <Bar dataKey="count" fill="#7C3AED" radius={[4, 4, 0, 0]} name="Reservations" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}
        </>
      )}
    </Layout>
  );
}

// ── Shell — handles auth check, renders content only when authenticated ───────
export default function AnalyticsPage() {
  const { ready, isAuthenticated } = useAuth();
  if (!ready || !isAuthenticated) return null;
  return <AnalyticsContent />;
}
