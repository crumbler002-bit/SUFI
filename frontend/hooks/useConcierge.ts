"use client";

import { useMutation } from "@tanstack/react-query";
import { conciergeChat, clearConciergeSession } from "@/lib/api";
import type { ConciergeResponse } from "@/types/concierge";

export function useConciergeChat() {
  return useMutation<ConciergeResponse, Error, { query: string; sessionId?: string }>({
    mutationFn: ({ query, sessionId }) => conciergeChat(query, sessionId),
  });
}

export function useClearSession() {
  return useMutation<unknown, Error, string>({
    mutationFn: clearConciergeSession,
  });
}
