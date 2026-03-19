"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchAnalyticsSummary,
  fetchAnalyticsTimeline,
  fetchPopularHours,
  fetchReviewAnalytics,
  fetchNotifications,
  fetchUnreadCount,
} from "@/lib/api";

const hasToken = () =>
  typeof window !== "undefined" && !!localStorage.getItem("sufi_token");

export function useAnalyticsSummary(restaurantId: number) {
  return useQuery({
    queryKey: ["analytics", "summary", restaurantId],
    queryFn: () => fetchAnalyticsSummary(restaurantId),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    enabled: !!restaurantId && hasToken(),
  });
}

export function useAnalyticsTimeline(restaurantId: number, days = 30) {
  return useQuery({
    queryKey: ["analytics", "timeline", restaurantId, days],
    queryFn: () => fetchAnalyticsTimeline(restaurantId, days),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    enabled: !!restaurantId && hasToken(),
  });
}

export function usePopularHours(restaurantId: number) {
  return useQuery({
    queryKey: ["analytics", "popular-hours", restaurantId],
    queryFn: () => fetchPopularHours(restaurantId),
    staleTime: 300_000,
    refetchOnWindowFocus: false,
    enabled: !!restaurantId && hasToken(),
  });
}

export function useReviewAnalytics(restaurantId: number) {
  return useQuery({
    queryKey: ["analytics", "reviews", restaurantId],
    queryFn: () => fetchReviewAnalytics(restaurantId),
    staleTime: 120_000,
    refetchOnWindowFocus: false,
    enabled: !!restaurantId && hasToken(),
  });
}

export function useNotifications(restaurantId: number) {
  return useQuery({
    queryKey: ["notifications", restaurantId],
    queryFn: () => fetchNotifications(restaurantId),
    refetchInterval: 30_000,
    enabled: !!restaurantId && hasToken(),
  });
}

export function useUnreadCount(restaurantId: number) {
  return useQuery({
    queryKey: ["notifications", "unread", restaurantId],
    queryFn: () => fetchUnreadCount(restaurantId),
    refetchInterval: 15_000,
    enabled: !!restaurantId && hasToken(),
  });
}
