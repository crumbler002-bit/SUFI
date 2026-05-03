"use client";
import { useQuery } from "@tanstack/react-query";
import { ownerApi } from "@/lib/api";
import { useAuth } from "@/store/appStore";
import SufiCard from "@/components/ui/SufiCard";

export default function AnalyticsPage() {
  const { user } = useAuth();

  const { data: brands } = useQuery({
    queryKey: ["owner-restaurants"],
    queryFn: () => ownerApi.restaurants(),
    enabled: !!user,
  });

  const firstId = (brands || []).flatMap((b) => b.locations)[0]?.id;

  const { data: analytics, isLoading } = useQuery({
    queryKey: ["owner-analytics", firstId],
    queryFn: () => ownerApi.analytics(firstId!),
    enabled: !!firstId,
  });

  const metrics = analytics
    ? [
        { label: "Profile Views", value: analytics.profile_views ?? 0 },
        { label: "Search Impressions", value: analytics.search_impressions ?? 0 },
        { label: "Reservations", value: analytics.reservation_count ?? 0 },
      ]
    : null;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold tracking-tight">Analytics</h2>

      {/* Key metrics */}
      {isLoading ? (
        <div className="grid grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-white/[0.04] animate-pulse" />
          ))}
        </div>
      ) : metrics ? (
        <div className="grid grid-cols-3 gap-3">
          {metrics.map((m) => (
            <SufiCard key={m.label}>
              <p className="text-xs text-gray-500">{m.label}</p>
              <p className="text-3xl font-semibold mt-1">{m.value.toLocaleString()}</p>
            </SufiCard>
          ))}
        </div>
      ) : null}

      {/* Chart placeholders */}
      <div className="grid md:grid-cols-2 gap-4">
        <SufiCard>
          <h3 className="text-sm font-medium mb-4">Revenue Trend — Last 7 Days</h3>
          <div className="h-40 flex items-end gap-2 px-2">
            {[40, 65, 50, 80, 70, 90, 75].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-accent/40 hover:bg-accent/60 transition-colors"
                  style={{ height: `${h}%` }}
                />
                <span className="text-xs text-gray-600">
                  {["M", "T", "W", "T", "F", "S", "S"][i]}
                </span>
              </div>
            ))}
          </div>
        </SufiCard>

        <SufiCard>
          <h3 className="text-sm font-medium mb-4">Occupancy by Hour</h3>
          <div className="h-40 flex items-end gap-1 px-2">
            {[10, 20, 35, 60, 80, 95, 90, 70, 50, 30].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-purple-500/40 hover:bg-purple-500/60 transition-colors"
                  style={{ height: `${h}%` }}
                />
                <span className="text-xs text-gray-600">{12 + i}</span>
              </div>
            ))}
          </div>
        </SufiCard>
      </div>
    </div>
  );
}
