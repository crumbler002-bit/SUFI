"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () => new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60_000,          // matches Redis TTL
          retry: 1,                   // don't hammer failing auth-gated routes
          refetchOnWindowFocus: false, // no surprise refetches on tab switch
          refetchOnReconnect: true,   // but do refresh after network drop
        },
      },
    }),
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
