"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchIntelligenceDashboard,
  fetchAutomationHistory,
  fetchReservationPriority,
  fetchReschedulePreview,
  triggerAutomation,
  trainAllModels,
  getMLRecommendation,
  applyAllAutomation,
} from "@/lib/api";
import type { IntelligenceDashboard } from "@/types/intelligence";

export type { IntelligenceDashboard } from "@/types/intelligence";

// ── Mock fallback for when backend is unavailable ─────────────────────────────
export const INTELLIGENCE_MOCK: IntelligenceDashboard = {
  date: new Date().toISOString().split("T")[0],
  metrics: {
    total_reservations: 42,
    total_tables: 18,
    noshow_rate: 0.22,
    fill_ratio: 0.86,
    demand_level: "high",
  },
  analytics: { profile_views: 340, clicks: 128, search_appearances: 890 },
  predictions: {
    expected_demand: 48,
    predicted_revenue: 56400,
    recommended_overbooking: 3,
    revenue_at_risk: 8200,
    waitlist_fill_potential: 2,
    hourly_demand: { "17": 4, "18": 8, "19": 14, "20": 16, "21": 10, "22": 6 },
    predicted_hourly_demand: { "19": 17, "20": 19, "21": 12, "22": 7 },
  },
  optimization: {
    efficiency_score: 82,
    active_tables: 14,
    idle_tables: 4,
    avg_utilization_pct: 78,
    best_fit_score: 91,
    table_suggestion: "Merge T4 and T5 for large parties",
    layout_suggestion: "Rotate 2 tables to window area for peak hours",
  },
  waitlist: { waiting: 3, assigned_today: 5, conversion_rate: 0.62, recommended_to_notify: 2 },
  priority: {
    ranked: [],
    at_risk_count: 3,
    protected_count: 5,
  },
  insights: [
    "⚠️ High no-show rate — consider overbooking or deposit policy",
    "💡 3 users on waitlist — 2 can likely be filled by no-show slots",
    "🔥 High demand — consider disabling discounts and enabling waitlist",
  ],
};

export const INTELLIGENCE_KEY = (id: number) => ["intelligence", "dashboard", id];

export function useIntelligence(restaurantId: number) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("sufi_token") : null;
  return useQuery({
    queryKey: INTELLIGENCE_KEY(restaurantId),
    queryFn: () =>
      fetchIntelligenceDashboard(restaurantId).catch(() => INTELLIGENCE_MOCK),
    staleTime: 60_000,
    refetchInterval: token ? 60_000 : false,
    refetchOnWindowFocus: false,
    retry: 1,
    placeholderData: INTELLIGENCE_MOCK,
    enabled: !!token,
  });
}

export function useAutomationHistory(restaurantId: number) {
  return useQuery({
    queryKey: ["intelligence", "automation-history", restaurantId],
    queryFn: () => fetchAutomationHistory(restaurantId).catch(() => []),
    staleTime: 30_000,
  });
}

export function useReservationPriority(restaurantId: number) {
  return useQuery({
    queryKey: ["intelligence", "priority", restaurantId],
    queryFn: () => fetchReservationPriority(restaurantId).catch(() => null),
    staleTime: 60_000,
  });
}

export function useReschedulePreview(restaurantId: number) {
  return useQuery({
    queryKey: ["intelligence", "reschedule-preview", restaurantId],
    queryFn: () => fetchReschedulePreview(restaurantId).catch(() => null),
    staleTime: 60_000,
  });
}

export function useMLRecommendation(
  restaurantId: number,
  params: { hour: number; day_of_week: number; party_size: number }
) {
  return useQuery({
    queryKey: ["intelligence", "ml-recommend", restaurantId, params],
    queryFn: () => getMLRecommendation(restaurantId, params).catch(() => null),
    staleTime: 120_000,
    enabled: !!restaurantId,
  });
}

export function useTriggerAutomation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: triggerAutomation,
    onSuccess: (_, restaurantId) => {
      qc.invalidateQueries({ queryKey: ["intelligence", "dashboard", restaurantId] });
      qc.invalidateQueries({ queryKey: ["intelligence", "automation-history", restaurantId] });
    },
  });
}

export function useTrainModels() {
  return useMutation({ mutationFn: trainAllModels });
}

export function useApplyAll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: applyAllAutomation,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["intelligence"] }),
  });
}
