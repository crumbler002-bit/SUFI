"use client";

import { useEffect, useRef, useCallback } from "react";
import type { WSMessage } from "@/lib/websocket";

export type SocketMessage = WSMessage;

interface UseSocketOptions {
  onMessage: (msg: SocketMessage) => void;
  reconnectDelay?: number;
  enabled?: boolean;
}

export function useSocket(url: string, options: UseSocketOptions) {
  const { onMessage, reconnectDelay = 3000, enabled = true } = options;
  const socketRef   = useRef<WebSocket | null>(null);
  const timerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onMessageCb = useRef(onMessage);

  useEffect(() => { onMessageCb.current = onMessage; }, [onMessage]);

  const connect = useCallback(() => {
    if (!enabled) return;
    const ws = new WebSocket(url);
    socketRef.current = ws;
    ws.onopen  = () => console.log(`[SUFI WS] connected → ${url}`);
    ws.onmessage = (event) => {
      try { onMessageCb.current(JSON.parse(event.data)); }
      catch { console.warn("[SUFI WS] failed to parse message", event.data); }
    };
    ws.onclose = () => {
      console.log(`[SUFI WS] closed — reconnecting in ${reconnectDelay}ms`);
      timerRef.current = setTimeout(connect, reconnectDelay);
    };
    ws.onerror = (err) => { console.warn("[SUFI WS] error", err); ws.close(); };
  }, [url, reconnectDelay, enabled]);

  useEffect(() => {
    connect();
    return () => {
      socketRef.current?.close();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [connect]);

  const send = useCallback((data: unknown) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(data));
    }
  }, []);

  return { send };
}
