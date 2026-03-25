"use client";

import GlassPanel from "@/components/ui/GlassPanel";

export default function DashboardPreview() {
  const mockBookings = [
    { time: "7:00 PM", name: "Table 4", guests: 2, status: "confirmed" },
    { time: "8:00 PM", name: "Table 7", guests: 4, status: "pending" },
    { time: "9:00 PM", name: "Table 2", guests: 6, status: "confirmed" },
  ];

  return (
    <section className="relative py-32 overflow-hidden bg-white/[0.01]">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="px-3 py-1 bg-white/5 text-white/60 text-sm rounded-full">
            OWNER SYSTEM
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-4">
            Two-sided <span className="gradient-text">intelligence</span>
          </h2>
          <p className="text-lg text-white/50 max-w-2xl mx-auto">
            Real-time analytics for restaurant owners. Same data engine, different perspective.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Revenue chart placeholder */}
          <GlassPanel className="p-6 md:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">Revenue</h3>
              <span className="text-xs text-green-400">+12.4%</span>
            </div>
            <div className="h-40 flex items-end gap-2">
              {[40, 65, 55, 80, 70, 95, 85, 78, 92, 88, 96, 100].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-primary/20 rounded-t"
                  style={{ height: `${h}%` }}
                >
                  <div
                    className="w-full bg-primary/40 rounded-t"
                    style={{ height: `${h * 0.6}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-white/30">
              <span>Jan</span>
              <span>Jun</span>
              <span>Dec</span>
            </div>
          </GlassPanel>

          {/* Booking feed */}
          <GlassPanel className="p-6">
            <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-4">
              Tonight
            </h3>
            <div className="space-y-3">
              {mockBookings.map((b) => (
                <div key={b.time} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{b.name}</p>
                    <p className="text-xs text-white/40">{b.time} • {b.guests} guests</p>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full ${
                      b.status === "confirmed"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>
      </div>
    </section>
  );
}
