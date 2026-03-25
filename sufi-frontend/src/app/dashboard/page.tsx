"use client";

import Navbar from "@/components/core/Navbar";
import GlassPanel from "@/components/ui/GlassPanel";

const mockBookings = [
  { id: 1, time: "6:30 PM", name: "Table 3", guests: 2, status: "confirmed" },
  { id: 2, time: "7:00 PM", name: "Table 7", guests: 4, status: "confirmed" },
  { id: 3, time: "7:30 PM", name: "Table 1", guests: 6, status: "pending" },
  { id: 4, time: "8:00 PM", name: "Table 5", guests: 2, status: "confirmed" },
  { id: 5, time: "8:30 PM", name: "Table 2", guests: 4, status: "pending" },
];

const automations = [
  { label: "Increase price when demand is high", enabled: true },
  { label: "Offer 10% discount after 9 PM", enabled: true },
  { label: "Auto-confirm VIP reservations", enabled: false },
  { label: "Push waitlist when tables full", enabled: true },
];

export default function DashboardPage() {
  return (
    <>
      <Navbar />
      <div className="pt-14 min-h-screen p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="pt-4">
            <h1 className="text-2xl font-bold">
              Owner <span className="gradient-text">Dashboard</span>
            </h1>
            <p className="text-sm text-white/40 mt-1">Real-time intelligence for your restaurant</p>
          </div>

          {/* Top Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Bookings Today", value: "128", change: "+12%" },
              { label: "Revenue", value: "₹45,200", change: "+8.3%" },
              { label: "Trend Score", value: "92", change: "+5" },
              { label: "Avg Wait", value: "4 min", change: "-15%" },
            ].map((m) => (
              <GlassPanel key={m.label} className="p-5">
                <p className="text-xs text-white/40 uppercase tracking-wider">{m.label}</p>
                <p className="text-2xl font-bold mt-1">{m.value}</p>
                <p className="text-xs text-green-400 mt-1">{m.change}</p>
              </GlassPanel>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Revenue Chart */}
            <GlassPanel className="p-6 md:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">Revenue (12 months)</h3>
                <span className="text-xs text-green-400">+12.4% YoY</span>
              </div>
              <div className="h-44 flex items-end gap-1.5">
                {[40, 65, 55, 80, 70, 95, 85, 78, 92, 88, 96, 100].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col justify-end">
                    <div className="bg-primary/30 rounded-t transition-all hover:bg-primary/50" style={{ height: `${h}%` }} />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-white/20">
                <span>Jan</span><span>Mar</span><span>Jun</span><span>Sep</span><span>Dec</span>
              </div>
            </GlassPanel>

            {/* Live Feed */}
            <GlassPanel className="p-6">
              <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-4">Tonight&apos;s Bookings</h3>
              <div className="space-y-3">
                {mockBookings.map((b) => (
                  <div key={b.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <div>
                      <p className="text-sm font-medium">{b.name}</p>
                      <p className="text-xs text-white/40">{b.time} • {b.guests} guests</p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      b.status === "confirmed" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
                    }`}>
                      {b.status}
                    </span>
                  </div>
                ))}
              </div>
            </GlassPanel>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* AI Insights */}
            <GlassPanel className="p-6">
              <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-4">AI Insights</h3>
              <div className="space-y-3">
                {[
                  { icon: "📈", text: "Demand spike expected Friday 7-9 PM. Consider adding staff." },
                  { icon: "💡", text: "Italian dishes trending +23% this week. Feature them prominently." },
                  { icon: "⚠️", text: "Saturday occupancy projected at 40%. Consider a promotion." },
                ].map((insight, i) => (
                  <div key={i} className="flex gap-3 p-3 bg-white/[0.03] rounded-lg">
                    <span className="text-lg">{insight.icon}</span>
                    <p className="text-sm text-white/60 leading-relaxed">{insight.text}</p>
                  </div>
                ))}
              </div>
            </GlassPanel>

            {/* Automations */}
            <GlassPanel className="p-6">
              <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-4">Automations</h3>
              <div className="space-y-3">
                {automations.map((a) => (
                  <div key={a.label} className="flex items-center justify-between p-3 bg-white/[0.03] rounded-lg">
                    <p className="text-sm text-white/60">{a.label}</p>
                    <div className={`w-9 h-5 rounded-full flex items-center px-0.5 cursor-pointer transition-all ${
                      a.enabled ? "bg-primary/60 justify-end" : "bg-white/10 justify-start"
                    }`}>
                      <div className="w-4 h-4 bg-white rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </GlassPanel>
          </div>

          {/* Notifications */}
          <GlassPanel className="p-6">
            <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-4">Notifications</h3>
            <div className="grid md:grid-cols-3 gap-3">
              {[
                { icon: "🔥", text: "Demand spike detected for tonight", time: "2 min ago" },
                { icon: "⚠", text: "Low bookings projected for Tuesday", time: "15 min ago" },
                { icon: "✅", text: "Weekend staffing confirmed", time: "1 hour ago" },
              ].map((n, i) => (
                <div key={i} className="flex gap-3 p-3 bg-white/[0.02] rounded-lg">
                  <span>{n.icon}</span>
                  <div>
                    <p className="text-sm text-white/60">{n.text}</p>
                    <p className="text-xs text-white/20 mt-1">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>
      </div>
    </>
  );
}
