"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, clearToken } from "@/lib/api";

export function useAuth(redirectIfMissing = true) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = getToken();
    setToken(t);
    setReady(true);
    if (!t && redirectIfMissing) {
      router.replace("/login");
    }
  }, [redirectIfMissing, router]);

  const logout = () => {
    clearToken();
    router.replace("/login");
  };

  return { token, ready, isAuthenticated: !!token, logout };
}
