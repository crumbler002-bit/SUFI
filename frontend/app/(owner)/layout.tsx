"use client";

import { useAuth } from "@/hooks/useAuth";

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const { ready, isAuthenticated } = useAuth();

  // While hydrating localStorage, render nothing to avoid flash
  if (!ready) return null;

  // useAuth already redirects to /login if not authenticated
  if (!isAuthenticated) return null;

  return <>{children}</>;
}
