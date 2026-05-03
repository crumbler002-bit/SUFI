"use client";
import { useAuth } from "@/store/appStore";

export default function Topbar() {
  const { user, logout } = useAuth();

  return (
    <header className="h-14 border-b border-white/[0.06] flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-2 text-sm text-gray-300">
        <span className="font-medium">
          {user?.name || "Owner"}
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        <span className="text-xs text-gray-500">Live</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xs text-gray-600">{user?.email}</span>
        <button
          onClick={logout}
          className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
