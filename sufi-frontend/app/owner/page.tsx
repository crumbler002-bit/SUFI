"use client";
import { useQuery } from "@tanstack/react-query";
import { ownerApi } from "@/lib/api";
import { useAuth } from "@/store/appStore";
import SufiCard from "@/components/ui/SufiCard";
import NoiseCard from "@/components/ui/NoiseCard";
import { useState } from "react";

export default function OwnerDashboard() {
  const { user } = useAuth();
  const [selectedRestaurant, setSelectedRestaurant] = useState<number | null>(null);

  const { data: brands } = useQuery({
    queryKey: ["owner-restaurants"],
    queryFn: () => ownerApi.restaurants(),
    enabled: !!user,
  });

  const allLocations = (brands || []).flatMap((b) => b.locations);
  const activeId = selectedRestaurant ?? allLocations[0]?.id ?? null;

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ["owner-dashboard", activeId],
    queryFn: () => ownerApi.dashboard(activeId!),
    enabled: !!activeId,
    refetchInterval: 30_000,
  });

  const metrics = dashboard
    ? [
        { label: "Reservations Today", value: dashboard.total_reservations_today ?? "—" },
        { label: "Fill Ratio", value: dashboard.fill_ratio != null ? `${Math.round(dashboard.fill_ratio * 100)}%` : "—" },
        { label: "No-show Rate", value: dashboard.no_show_rate != null ? `${Math.round(dashboard.no_show_rate * 100)}%` : "—" },
        { label: "Demand", value: dashboard.demand_level ?? "—" },
        { label: "Predicted Revenue", value: dashboard.predicted_revenue != null ? `₹${Math.round(dashboard.predicted_revenue).toLocaleString()}` : "—" },
        { label: "Waitlist Depth", value: dashboard.waitlist_depth ?? "—" },
      ]
    : [
        { label: "Reservations Today", value: "—" },
        { label: "Fill Ratio", value: "—" },
        { label: "No-show Rate", value: "—" },
        { label: "Demand", value: "—" },
        { label: "Predicted Revenue", value: "—" },
        { label: "Waitlist Depth", value: "—" },
      ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
        {allLocations.length > 1 && (
          <select
            value={activeId ?? ""}
            onChange={(e) => setSelectedRestaurant(Number(e.target.value))}
            className="bg-white/5 border border-white/[0.08] rounded-lg px-3 py-1.5 text-sm focus:outline-none"
          >
            {allLocations.map((loc) => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {metrics.map((m) => (
          <SufiCard key={m.label} className="text-center">
            <p className="text-xs text-gray-500 mb-1">{m.label}</p>
            <p className={`text-xl font-semibold ${isLoading ? "animate-pulse text-gray-600" : "text-white"}`}>
              {m.value}
            </p>
          </SufiCard>
        ))}
      </div>

      {/* AI Insights */}
      {dashboard?.insights && dashboard.insights.length > 0 && (
        <NoiseCard className="p-5" noiseOpacity={0.05}>
          <h3 className="text-sm font-medium mb-3 text-accent">AI Insights</h3>
          <ul className="flex flex-col gap-2">
            {dashboard.insights.map((insight, i) => (
              <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                <span className="text-accent mt-0.5">·</span>
                {insight}
              </li>
            ))}
          </ul>
        </NoiseCard>
      )}

      {/* Locations overview */}
      {allLocations.length > 0 && (
        <div>
          <h3 className="text-sm text-gray-500 uppercase tracking-wider mb-3">Your Locations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {allLocations.map((loc) => (
              <SufiCard
                key={loc.id}
                className={`cursor-pointer ${activeId === loc.id ? "border-accent/30" : ""}`}
                onClick={() => setSelectedRestaurant(loc.id)}
              >
                <p className="font-medium">{loc.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{loc.city}</p>
                {loc.rating && (
                  <p className="text-xs text-yellow-400 mt-2">★ {loc.rating}</p>
                )}
              </SufiCard>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
