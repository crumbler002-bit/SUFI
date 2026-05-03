"use client";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { reservationApi } from "@/lib/api";
import { useAuth } from "@/store/appStore";
import SufiCard from "@/components/ui/SufiCard";

export default function CustomerDashboard() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["my-reservations"],
    queryFn: () => reservationApi.myReservations(),
    enabled: !!user,
  });

  const reservations = Array.isArray(data) ? data : [];
  const upcoming = reservations.filter((r) => r.status === "confirmed");
  const past = reservations.filter((r) => r.status !== "confirmed");

  const statusColor = (s: string) => {
    if (s === "confirmed") return "bg-green-500/15 text-green-400";
    if (s === "cancelled") return "bg-red-500/15 text-red-400";
    if (s === "completed") return "bg-blue-500/15 text-blue-400";
    return "bg-gray-500/15 text-gray-400";
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-4">Sign in to view your reservations.</p>
          <Link href="/app" className="text-accent text-sm hover:underline">← Back to explore</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white">
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-4">
          <Link href="/app" className="text-sm text-gray-400 hover:text-white transition-colors">← Explore</Link>
          <span className="text-sm font-medium">My Reservations</span>
        </div>
        <span className="text-xs text-gray-500">{user.name}</span>
      </header>

      <main className="px-6 py-8 max-w-3xl mx-auto">
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-white/[0.04] animate-pulse" />
            ))}
          </div>
        ) : reservations.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-sm mb-4">No reservations yet.</p>
            <Link href="/app" className="text-accent text-sm hover:underline">Find a restaurant →</Link>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {upcoming.length > 0 && (
              <section>
                <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-3">Upcoming</h3>
                <div className="flex flex-col gap-3">
                  {upcoming.map((r) => (
                    <SufiCard key={r.id} glow>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{r.restaurant_name || `Restaurant #${r.restaurant_id}`}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {r.reservation_time ? new Date(r.reservation_time).toLocaleString() : "—"} · {r.guests} guests
                          </p>
                        </div>
                        <span className={`text-xs px-3 py-1 rounded-full capitalize ${statusColor(r.status)}`}>
                          {r.status}
                        </span>
                      </div>
                    </SufiCard>
                  ))}
                </div>
              </section>
            )}

            {past.length > 0 && (
              <section>
                <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-3">Past</h3>
                <div className="flex flex-col gap-3">
                  {past.map((r) => (
                    <SufiCard key={r.id}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-300">{r.restaurant_name || `Restaurant #${r.restaurant_id}`}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {r.reservation_time ? new Date(r.reservation_time).toLocaleString() : "—"} · {r.guests} guests
                          </p>
                        </div>
                        <span className={`text-xs px-3 py-1 rounded-full capitalize ${statusColor(r.status)}`}>
                          {r.status}
                        </span>
                      </div>
                    </SufiCard>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
