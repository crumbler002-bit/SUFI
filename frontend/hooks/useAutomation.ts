"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAutomationStatus,
  fetchActiveAutomations,
  fetchPlannedActions,
  approveAllAutomations,
} from "@/lib/api";

const hasToken = () =>
  typeof window !== "undefined" && !!localStorage.getItem("sufi_token");

export function useAutomationStatus() {
  return useQuery({
    queryKey: ["automation", "status"],
    queryFn: fetchAutomationStatus,
    staleTime: 20_000,
    // status/active are public endpoints — always enabled
  });
}

export function useActiveAutomations() {
  return useQuery({
    queryKey: ["automation", "active"],
    queryFn: fetchActiveAutomations,
    refetchInterval: 30_000,
    // public endpoint
  });
}

export function usePlannedActions() {
  return useQuery({
    queryKey: ["automation", "planned"],
    queryFn: fetchPlannedActions,
    refetchInterval: 15_000,
    enabled: hasToken(),
  });
}

export function useApproveAll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: approveAllAutomations,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["automation"] }),
  });
}
