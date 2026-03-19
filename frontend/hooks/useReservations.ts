"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchUserDashboard,
  cancelUserReservation,
  rescheduleReservation,
  createReservation,
  fetchWaitlist,
  joinWaitlist,
} from "@/lib/api";
import type { ReservationPayload } from "@/types/reservation";

export function useUserDashboard() {
  return useQuery({
    queryKey: ["user", "dashboard"],
    queryFn: fetchUserDashboard,
    staleTime: 30_000,
  });
}

export function useCancelReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: cancelUserReservation,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user", "dashboard"] }),
  });
}

export function useRescheduleReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, newTime, guests }: { id: number; newTime: string; guests?: number }) =>
      rescheduleReservation(id, newTime, guests),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user", "dashboard"] }),
  });
}

export function useCreateReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ReservationPayload) => createReservation(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user", "dashboard"] });
      qc.invalidateQueries({ queryKey: ["owner", "reservations"] });
    },
  });
}

export function useWaitlist(restaurantId: number) {
  return useQuery({
    queryKey: ["waitlist", restaurantId],
    queryFn: () => fetchWaitlist(restaurantId),
    refetchInterval: 30_000,
    enabled: !!restaurantId,
  });
}

export function useJoinWaitlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: joinWaitlist,
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ["waitlist", vars.restaurant_id] }),
  });
}
