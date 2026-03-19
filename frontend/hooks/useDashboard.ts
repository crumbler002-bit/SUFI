"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAutomationStatus } from "@/hooks/useAutomation";
import { connectDashboardWS, connectOwnerWS } from "@/lib/websocket";
import type { DashboardUpdate } from "@/lib/websocket";

const RESTAURANT_ID = 1;

export function useDashboard() {
  const qc = useQueryClient();
  const { data: autoStatus } = useAutomationStatus();
  const [liveData, setLiveData] = useState<DashboardUpdate | null>(null);
  const [wsConnected, setWsConnected] = useState(false);

  useEffect(() => {
    // Only connect WebSocket when authenticated
    const token =
      typeof window !== "undefined" ? localStorage.getItem("sufi_token") : null;
    if (!token) return;

    const disconnect = connectDashboardWS(
      RESTAURANT_ID,
      (msg) => {
        setLiveData(msg);
        setWsConnected(true);
        qc.invalidateQueries({ queryKey: ["intelligence", "dashboard", RESTAURANT_ID] });
      },
      () => setWsConnected(false),
    );
    return disconnect;
  }, [qc]);

  return { autoStatus, liveData, wsConnected };
}

export function useOwnerNotifications(restaurantId: number) {
  const [notifications, setNotifications] = useState<{ message: string; type: string; ts: number }[]>([]);

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("sufi_token") : null;
    if (!token) return;

    const disconnect = connectOwnerWS(restaurantId, (msg) => {
      if ("message" in msg) {
        setNotifications((prev) => [
          { message: msg.message, type: msg.type, ts: Date.now() },
          ...prev.slice(0, 19),
        ]);
      }
    });
    return disconnect;
  }, [restaurantId]);

  return notifications;
}
